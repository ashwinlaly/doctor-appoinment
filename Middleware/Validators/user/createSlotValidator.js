const { check, validationResult } = require('express-validator');
const UserConstant = require("../../../Constants/UserConstant");
const { errorFormatter } = require('../../Helpers/responseHelper');

module.exports = [
    check('date')
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Date Cannot be Empty")
        .bail()
        .isDate()
        .withMessage("Enter a valid Date")
        .bail(),
    check('doctor_id')
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Doctor field is required")
        .bail(),
    check("starttime")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("start time Cannot be Empty")
        .bail(),
    check("endtime")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("End time Cannot be Empty")
        .bail(),
    (req, res, next) => {
        let errors = validationResult(req).formatWith(errorFormatter)
        if(!errors.isEmpty()){
            const {code, message} = UserConstant.DOCTOR_SLOT_ERROR;
            return res.status(code).json({code, message, error: errors.array()});
        }
        next()
    }
];