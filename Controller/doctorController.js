const _ = require('lodash');
const moment = require("moment");
const Mongoose = require("mongoose");
const Time = require("../Helpers/timeHelper");
const Doctor = require("../Model/Doctor");
const UserBooking = require("../Model/UserBooking");
const DoctorConstant = require("../Constants/DoctorContant");

const { 
        accessToken, 
        hashPassword,
        comparePassword
    } = require('../Middleware/Helpers/authHelper');

const Signin = async (req, res) => {
    const {email, password} = req.body;
    doctorData = await Doctor.findOne({email}).exec();
    if(!_.isEmpty(doctorData)) {
        data = await accessToken({id: doctorData._id, email});
        isValid = await comparePassword(password, doctorData.password);
        if (isValid) {
            await Doctor.findByIdAndUpdate(doctorData._id, {token: data});
            const {code, message} = DoctorConstant.DOCTOR_SIGNIN_SUCCESS;
            return res.status(code).json({ data, code, message });
        } else {
            const {code} = DoctorConstant.DOCTOR_SIGNIN_ERROR;
            return res.status(code).json(DoctorConstant.DOCTOR_SIGNIN_ERROR);
        }
    } else {
        const {code} = DoctorConstant.DOCTOR_SIGNIN_ERROR;
        return res.status(code).json(DoctorConstant.DOCTOR_SIGNIN_ERROR);
    }
}

const Signup = async (req, res) => {
    const doctor = new Doctor;
    const {name, email, password, phone, category} = req.body;
    doctor.name = name;
    doctor.email = email;
    doctor.phone = phone;
    doctor.category = category;
    doctor.address.state = req.body?.state;
    doctor.address.street = req.body?.street;
    doctor.address.country = req.body?.country;
    doctor.address.district = req.body?.district;
    doctor.password = await hashPassword(password);
    await doctor.save(error => {
        if (error) {
            const {code, message} = DoctorConstant.DOCTOR_SIGNUP_ERROR;
            return res.status(code).json({code, message, error: [
                {msg: error.message}
            ]});
        } else {
            const {code, message} = DoctorConstant.DOCTOR_SIGNUP_SUCCESS;
            return res.status(code).json({ code, message });
        }
    });
}

const getDoctorSlot = async (req, res) => {
    const doctor_id = req.user_id;
    const doctorSlots = await Doctor.findById(Mongoose.Types.ObjectId(doctor_id)).exec();
    if(_.isArray(doctorSlots.slot)) {
        return res.status(200).json({ code: 200, message: "Slot Information", data: doctorSlots.slot });
    }
    return res.status(206).json({ code: 206, message: "No slot exists", data: [] });
}

const addDoctorSlot = async (req, res) => {
    try {
        const doctor_id = req.user_id;
        const { date, 
            morning_starttime, 
            morning_endtime, 
            evening_starttime,
            evening_endtime} = req.body;

        const data = {
            date,
            morning_starttime: Time.dateTimeToUnix(date, morning_starttime),
            morning_endtime: Time.dateTimeToUnix(date, morning_endtime),
            evening_starttime: Time.dateTimeToUnix(date, evening_starttime),
            evening_endtime: Time.dateTimeToUnix(date, evening_endtime)
        };
        await Doctor.find({_id: doctor_id, "slot.date": date}).then(async (response) => {
            if(response.length) {
                await Doctor.updateOne({_id: doctor_id, "slot.date": date}, {$set: {
                    "slot.$.date": date,
                    "slot.$.morning_starttime": data.morning_starttime,
                    "slot.$.morning_endtime": data.morning_endtime,
                    "slot.$.evening_starttime": data.evening_starttime,
                    "slot.$.evening_endtime": data.evening_endtime
                }}).exec();
                return res.status(201).json({ code: 201, message: "Slot updated successfully" });
            } else {
                await Doctor.updateOne({_id: doctor_id}, {$push: {slot: data}}).exec();
                return res.status(200).json({ code: 200, message: "Slot created successfully" });
            }
        });
    } catch(error) {
        console.log("Slot operation Error", error);
        return res.status(406).json({ code: 406, message: "Slot operation Error", error });
    }
}

const updateDoctorSlotStatus = async (req, res) => {
    const doctor_id = req.user_id;
    try {
        const { date, is_active, reason } = req.body;
        await Doctor.find({_id: doctor_id, "slot.date": date}).then(async (response) => {
            if(response.length != 0) {
                await Doctor.updateOne({_id: doctor_id, "slot.date": date}, {$set: {
                    "slot.$.is_active": is_active,
                    "slot.$.reason": reason
                }}).exec();
                return res.status(201).json({ code: 201, message: "Slot updated successfully" });
            }
        });
    } catch(error) {
        return res.status(406).json({ code: 406, message: "Slot operation Error", error });
    }
}

const updateDoctorAppoinmentStatus = async (req, res) => {
    try {
        const { appointment_id, is_active, prescription } = req.body;
        await UserBooking.updateOne({_id: appointment_id}, {$set: {
            "is_active": is_active,
            "doctor_prescription": prescription
        }}).exec();
        return res.status(201).json({ code: 201, message: "Appointment updated successfully" });
    } catch(error) {
        return res.status(406).json({ code: 406, message: "Appointment operation Error", error });
    }
}


const getAppoinmentDataByDate = async (req, res) => {
    const doctor_id = req.user_id;
    const {date} = req.body;
    try {
        let doctorAppoinments = await UserBooking.find({
            doctor_id: Mongoose.Types.ObjectId(doctor_id),
            date: new Date(date)
        })
        .populate("user_id", "-_id name email phone address")
        .exec();
        if(doctorAppoinments) {
            doctorAppoinments.starttime = Time.UnixToTime(doctorAppoinments.starttime);
            doctorAppoinments.endtime = Time.UnixToTime(doctorAppoinments.endtime);
            return res.status(200).json({ code: 200, message: "Get User Appoinments", data: doctorAppoinments});
        } else {
            throw new Error("No appoiments");
        }
    } catch(error) {
        return res.status(406).json({ code: 406, message: error.message});
    }
}

module.exports = {
    Signin,
    Signup,
    addDoctorSlot,
    getDoctorSlot,
    updateDoctorSlotStatus,
    getAppoinmentDataByDate,
    updateDoctorAppoinmentStatus
}