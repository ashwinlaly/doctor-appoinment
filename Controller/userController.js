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
    const doctorAvailability = await getDoctorDataForAvailabilty(doctor_id, date, _project);
    if(doctorAvailability.length) {
        const _morningSlot = Time.generateTime(doctorAvailability[0].slot.morning_starttime,  doctorAvailability[0].slot.morning_endtime);
        const _eveningSlot = Time.generateTime(doctorAvailability[0].slot.evening_starttime,  doctorAvailability[0].slot.evening_endtime);
        const data = {...doctorAvailability[0], morning: _morningSlot, evening: _eveningSlot};
        return res.status(200).json({ code: 200, message: "Done", data: data});
    } else {
        return res.status(406).json({ code: 406, message: "Doctor is not Avaliable"});
    }
}

const createAppoinment = async (req, res) => {
    const user_id = req.user_id;
    const {doctor_id, date, starttime, endtime} = req.body;

    const _defaultFilter = {"slot.date": new Date(date), "slot.is_active": true}
    let _match;
    if(Time.checkIsAM(starttime)) {
        _match = {
            ..._defaultFilter,       
            "slot.morning_starttime": {
                $gte: starttime
            },
            "slot.morning_endtime": {
                $lte: endtime
            }
        };
    } else {
        _match = {
            ..._defaultFilter,
            "slot.evening_starttime": {
                $gte: starttime
            },
            "slot.evening_endtime": {
                $lte: endtime
            }
        };
    }
    try {
        const doctorAvailability = await getDoctorDataForSlotAvailabilty(doctor_id, date, _match);
        console.log(doctorAvailability, _match);
        if(doctorAvailability.length) {
            await UserBooking.find({
                doctor_id: Mongoose.Types.ObjectId(doctor_id), 
                start: {"$gte":starttime},
                start: {"$lte": starttime}
            }).then(bookingSlotAlreadyExists => {
                console.log(1, bookingSlotAlreadyExists);
                if(bookingSlotAlreadyExists.length) {
                    return res.status(202).json({ code: 202, message: "Doctor is busy by that time"});
                } else {
                    let userBookingSlot = new UserBooking();
                    userBookingSlot.date = date;
                    userBookingSlot.user_id = user_id;
                    userBookingSlot.doctor_id = doctor_id;
                    userBookingSlot.starttime = starttime;
                    userBookingSlot.endtime = endtime;
                    userBookingSlot.save();
                    return res.status(201).json({ code: 201, message: "Slot created sucessfully."});
                }
            }).catch(error => {
                console.log(error);
                return res.status(406).json({ code: 406, message: "Doctor is not Avaliable..."});
            });
        } else {
            return res.status(406).json({ code: 406, message: "Doctor is not Avaliable.."});
        }
    } catch(error) {
        console.log(error);
        return res.status(406).json({ code: 406, message: "Doctor is not Avaliable."});
    }
}

const getDoctorDataForAvailabilty = async (doctor_id, date, _project = HIDDEN_DOCTOR_DATA) => {
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
}

const getDoctorDataForSlotAvailabilty = async (doctor_id, date, _match, _project = HIDDEN_DOCTOR_DATA) => {
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
}

module.exports = {
    Signin,
    Signup,
    createAppoinment,
    getDoctorByCategory,
    getAppoinmentDataByDate,
}