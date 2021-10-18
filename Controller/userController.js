const _ = require('lodash');
const User = require("../Model/User");
const UserBooking = require("../Model/UserBooking");
const UserConstant = require("../Constants/UserConstant");

const { 
        comparePassword, 
        accessToken, 
        hashPassword } = require('../Middleware/Helpers/authHelper');

const Signin = async (req, res) => {
    let {email, password} = req.body;
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
    let user = new User;
    let {name, email, password, phone} = req.body;
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

const createAppoinment = async (req, res) => {
    let user_id = req.user_id;
    let {date, starttime} = req.body;
    await UserBooking.find({date, starttime, is_active: true}).then(data => {
        if(data.length != 0) { // Already booked for the same time
            return res.status(200).json({ code: 200, message: "Already booked for the same date."});
        } else { // When it's not been booked so far
            return res.status(200).json({ code: 200, message: "Already booked for the same date."});
        }
    });
}

module.exports = {
    Signin,
    Signup,
    createAppoinment
}