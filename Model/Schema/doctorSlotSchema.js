const Mongoose = require("mongoose");
const moment = require("moment");

const doctorSlotSchema = new Mongoose.Schema({
    date : {
        type: Date,
        required: true,
        min: moment().format("YYYY-MM-DD")
    },
    morning_starttime : {
        type: String,
        trim: true,
        required: true
    },
    morning_endtime : {
        type: String,
        trim: true,
        required: true
    },
    evening_starttime : {
        type: String,
        trim: true,
        required: true
    },
    evening_endtime : {
        type: String,
        trim: true,
        required: true
    },
    is_active: {
        type: Boolean,
        default: true
    },
    reason: {
        type: String,
        trim: true
    }
});

module.exports = doctorSlotSchema;