const { check, validationResult } = require('express-validator');
const DoctorConstant = require("../../../Constants/DoctorContant");
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
    check("morning_starttime")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Morning start time Cannot be Empty")
        .bail(),
    check("morning_endtime")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Morning End time Cannot be Empty")
        .bail(),
    check("evening_starttime")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Evening start time Cannot be Empty")
        .bail(),
    check("evening_endtime")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Evening end time Cannot be Empty")
        .bail(),
    (req, res, next) => {
        let errors = validationResult(req).formatWith(errorFormatter)
        if(!errors.isEmpty()){
            const {code, message} = DoctorConstant.DOCTOR_SLOT_ERROR;
            return res.status(code).json({code, message, error: errors.array()});
        }
        next()
    }
];