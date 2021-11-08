const _ = require('lodash');
const Mongoose = require("mongoose");
const User = require("../Model/User");
const Doctor = require("../Model/Doctor");
const DoctorType = require("../Model/DoctorType");
const UserBooking = require("../Model/UserBooking");
const UserConstant = require("../Constants/UserConstant");

const Time = require('../Helpers/timeHelper');
const { 
        comparePassword, 
        accessToken, 
        hashPassword } = require('../Middleware/Helpers/authHelper');

const HIDDEN_DOCTOR_DATA = {
    token: false,
    password: false
};

const Signin = async (req, res) => {
    const {email, password} = req.body;
    userData = await User.findOne({email}).exec();
    if(!_.isEmpty(userData)) {
        data = await accessToken({id: userData._id, email});
        isValid = await comparePassword(password, userData.password);
        if (isValid) {
            await User.findByIdAndUpdate(userData._id, {token: data});
            const {code, message} = UserConstant.USER_SIGNIN_SUCCESS;
            return res.status(code).json({ data, code, message });
        } else {
            const {code} = UserConstant.USER_SIGNIN_ERROR;
            return res.status(code).json(UserConstant.USER_SIGNIN_ERROR);
        }
    } else {
        const {code} = UserConstant.USER_SIGNIN_ERROR;
        return res.status(code).json(UserConstant.USER_SIGNIN_ERROR);
    }
}

const Signup = async (req, res) => {
    const user = new User;
    const {name, email, password, phone} = req.body;
    user.name = name;
    user.phone = phone;
    user.email = email;
    user.address.state = req.body?.state;
    user.address.street = req.body?.street;
    user.address.door_no = req.body?.door_no;
    user.address.country = req.body?.country;
    user.address.district = req.body?.district;
    user.password = await hashPassword(password);
    await user.save(error => {
        if (error) {
            const {code, message} = UserConstant.USER_SIGNUP_ERROR;
            return res.status(code).json({code, message, error: error.message});
        } else {
            const {code, message} = UserConstant.USER_SIGNUP_SUCCESS;
            return res.status(code).json({ code, message });
        }
    });
}

const getDoctorByCategory = async (req, res) => {
    const {category} = req.body;
    await DoctorType.find({category_name: { $regex: '.*' + category + '.*' }}).then(async (doctorTypesRes) => {
        if(doctorTypesRes.length) {
            await Doctor.find({category: { $regex: '.*' + category + '.*' }}).select({
                name: 1, phone: 1, email: 1
            }).then(doctorCategoies => {
                if(doctorCategoies.length) {
                    return res.status(200).json({ code: 200, message: "Listing Doctors", data: doctorCategoies});
                } else {
                    return res.status(406).json({ code: 406, message: "No Doctor with that category avaiable"});
                }
            });
        } else {
            return res.status(406).json({ code: 406, message: "Invalid category provided"});
        }
    }).catch(error => {
        return res.status(406).json({ code: 406, message: "Invalid category provided", error});
    })
}

const getAppoinmentDataByDate = async (req, res) => {
    const user_id = req.user_id;
    const {date, doctor_id} = req.body;
    const _project = {
        "name": true,
        "slot": true,
        "email": true,
        "phone": true,
    };
    try {
        let doctorAvailability = _.head(await getDoctorDataForAvailabilty(doctor_id, date, _project));
        if(doctorAvailability) {
            let morning_starttime = Time.UnixToTime(doctorAvailability.slot.morning_starttime);
            let morning_endtime = Time.UnixToTime(doctorAvailability.slot.morning_endtime);
            let evening_endtime = Time.UnixToTime(doctorAvailability.slot.evening_endtime);
            let evening_starttime = Time.UnixToTime(doctorAvailability.slot.evening_starttime);
            doctorAvailability.slot.morning_starttime = Time.UnixToTime(doctorAvailability.slot.morning_starttime);
            doctorAvailability.slot.morning_endtime = Time.UnixToTime(doctorAvailability.slot.morning_endtime);
            doctorAvailability.slot.evening_endtime = Time.UnixToTime(doctorAvailability.slot.evening_endtime);
            doctorAvailability.slot.evening_starttime = Time.UnixToTime(doctorAvailability.slot.evening_starttime);
            const _morningSlot = Time.generateTime(morning_starttime, morning_endtime);
            const _eveningSlot = Time.generateTime(evening_starttime, evening_endtime);
            const data = {...doctorAvailability, morning: _morningSlot, evening: _eveningSlot};
            return res.status(200).json({ code: 200, message: "Done", data: data});
        } else {
            throw new Error("Doctor not Availble..");
        }
    } catch(error) {
        return res.status(406).json({ code: 406, message: error.message});
    }
}

const createAppoinment = async (req, res) => {
    const user_id = req.user_id;
    const {doctor_id, date, starttime, endtime} = req.body;

    try {
        let _match = {"slot.date": new Date(date), "slot.is_active": true};
        let _starttime = Time.dateTimeToUnix(date, starttime);
        let _endtime = Time.dateTimeToUnix(date, endtime);
        let isValidDateProvided = false;
        const doctorAvailability = _.head(await getDoctorTimeForAvailabilty(doctor_id, _match));

        if(doctorAvailability) {
            if(Time.checkIsAM(starttime)) {
                $morning_endtime = doctorAvailability.slot.morning_endtime;
                $morning_starttime = doctorAvailability.slot.morning_starttime;

                if( _.inRange(_starttime, $morning_starttime, $morning_endtime +1) &&
                    _.inRange(_endtime, $morning_starttime, $morning_endtime +1)) {
                        isValidDateProvided = true;
                    }
            } else {
                $evening_endtime = doctorAvailability.slot.evening_endtime;
                $evening_starttime = doctorAvailability.slot.evening_starttime;
                
                console.log("e", $evening_endtime, $evening_starttime);
                if( _.inRange(_starttime, $evening_starttime, $evening_endtime +1) &&
                    _.inRange(_endtime, $evening_starttime, $evening_endtime +1)) {
                    isValidDateProvided = true;
                }
            }   
        }
        if(isValidDateProvided) {
            let isAlreadyBooked = await UserBooking.aggregate([
                {
                    $match: {
                        doctor_id: Mongoose.Types.ObjectId(doctor_id),
                        date: new Date(date),
                        starttime: _starttime,
                        endtime: _endtime
                    }
                }
            ]).exec();
            if(!_.isEmpty(isAlreadyBooked)) {
                return res.status(201).json({ code: 201, message: "Slot Already occupaid."});
            } else {
                let userAlreadyBooked = _.head(await getUserAppoinments(user_id, date, doctor_id));
                if(userAlreadyBooked) {
                    let from_time = Time.UnixToTime(userAlreadyBooked.starttime);
                    let to_time = Time.UnixToTime(userAlreadyBooked.endtime);
                    return res.status(201).json({ 
                        code: 201, 
                        message: `Slot already booked between ${from_time} - ${to_time}.`
                    });
                } else {
                    let userBookingSlot = new UserBooking;
                    userBookingSlot.date = date;
                    userBookingSlot.user_id = user_id;
                    userBookingSlot.doctor_id = doctor_id;
                    userBookingSlot.starttime = _starttime;
                    userBookingSlot.endtime = _endtime;
                    userBookingSlot.save();
                    return res.status(201).json({ code: 201, message: "Slot created sucessfully."});
                }
            }
        } else {
            return res.status(202).json({ code: 202, message: "Doctor is not Available"});
        }
    } catch(error) {
        console.log(error);
        return res.status(406).json({ code: 406, message: error.message});
    }
}

// const createAppoinment = async (req, res) => {
//     const user_id = req.user_id;
//     const {doctor_id, date, starttime, endtime} = req.body;

//     try {
//         let _match = {"slot.date": new Date(date), "slot.is_active": true};
//         let _starttime = Time.dateTimeToUnix(date, starttime);
//         let _endtime = Time.dateTimeToUnix(date, endtime);
//         if(Time.checkIsAM(starttime)) {
//             _match = {
//                 ..._match, 
//                 "slot.morning_starttime": {
//                     $gte: _starttime
//                 }, 
//                 "slot.morning_endtime": {
//                     $lte: _endtime
//                 } 
//             }; 
//         } else {
//             _match = {
//                 ..._match, 
//                 "slot.evening_starttime": {
//                     $gte: _starttime
//                 }, 
//                 "slot.evening_endtime": {
//                     $lte: _endtime
//                 }
//             };
//         }
//         const doctorAvailability = _.head(await getDoctorTimeForAvailabilty(doctor_id, _match));
//         if(!doctorAvailability) {
//             let isAlreadyBooked = await UserBooking.aggregate([
//                 {
//                     $match: {
//                         doctor_id: Mongoose.Types.ObjectId(doctor_id),
//                         date: new Date(date),  
//                         $or: [
//                             {starttime: {$gte:  _starttime , $lte:  _starttime} }, 
//                             {endtime: {$gte:   _endtime , $lte:   _endtime} }
//                         ]
//                     }
//                 }
//             ]).exec();
//             if(isAlreadyBooked) {
//                 return res.status(201).json({ code: 201, message: "Slot Already occupaid."});
//             } else {
//                 let userBookingSlot = new UserBooking;
//                 userBookingSlot.date = date;
//                 userBookingSlot.user_id = user_id;
//                 userBookingSlot.doctor_id = doctor_id;
//                 userBookingSlot.starttime = _starttime;
//                 userBookingSlot.endtime = _endtime;
//                 userBookingSlot.save();
//                 return res.status(201).json({ code: 201, message: "Slot created sucessfully."});
//             }
//         } else {
//             return res.status(202).json({ code: 202, message: "Doctor is not Available"});
//         }
//     } catch(error) {
//         console.log(error);
//         return res.status(406).json({ code: 406, message: error.message});
//     }
// }

const getDoctorDataForAvailabilty = async (doctor_id, date, _project = HIDDEN_DOCTOR_DATA) => {
    try {
        const doctorAvailability = await Doctor.aggregate([
            {
                $match: {
                    _id: Mongoose.Types.ObjectId(doctor_id)
                },
            }, {  $unwind: {
                    path: "$slot"
                }
            }, {  $match: {
                    "slot.date": new Date(date),
                    "slot.is_active": true
                }
            }, {
                $project: _project
            }
        ]).exec();
        return doctorAvailability;
    } catch(error) {
        throw new Error("Doctor not Availble.");
    }
}

const getUserAppoinments = async(user_id, date, doctor_id) => {
    let userAppoinments = await UserBooking.find({
        doctor_id: Mongoose.Types.ObjectId(doctor_id),
        date: new Date(date),
        user_id: user_id
    })
    .populate('user_id')
    .populate('doctor_id')
    .exec();
    return userAppoinments;
}

const getDoctorTimeForAvailabilty = async (doctor_id, _match, _project = HIDDEN_DOCTOR_DATA) => {
    try {
        const doctorAvailability = await Doctor.aggregate([
            {
                $match: {
                    _id: Mongoose.Types.ObjectId(doctor_id)
                },
            }, {  $unwind: {
                    path: "$slot"
                }
            }, {
                $match: _match
            }, {
                $project: _project
            }
        ]).exec();
        return doctorAvailability;
    } catch(error) {
        throw new Error("Doctor not Availble.");
    }
}

module.exports = {
    Signin,
    Signup,
    createAppoinment,
    getDoctorByCategory,
    getAppoinmentDataByDate,
}