const constant = require("../constant"),
      User = require("../Model/User"),
      _ = require('lodash');

const { 
        comparePassword, 
        accessToken, 
        hashPassword } = require('../Middleware/Helpers/authHelper');

const Signin = async (req, res) => {
    const {email, password} = req.body;
    userData = await User.findOne({email}).exec();
    if(!_.isEmpty(userData)) {
        isValid = await comparePassword(password, userData.password)
        if (isValid) {
            data = await accessToken({id: userData._id, email})
            return res.status(200).json({message : constant.USER_LOGIN_SUCCESS, code : 200, data})
        } else {
            return res.status(206).json({message : constant.USER_LOGIN_ERROR, code : 206})
        }
    } else {
        return res.status(206).json({message : constant.USER_LOGIN_ERROR, code : 206})
    }
}

const Signup = async (req, res) => {
    const user = new User;
    const {name, email, password} = req.body
    user.password = await hashPassword(password)
    user.name = name
    user.email = email
    await user.save(err => {
        if(err){
            return res.status(206).json({message : constant.USER_SIGNUP_ERROR, code : 206, error : err.errors})
        } else {
            return res.status(200).json({message : constant.USER_SIGNUP_SUCCESS, code : 200})
        }
    });
}

module.exports = {
    Signin,
    Signup
}