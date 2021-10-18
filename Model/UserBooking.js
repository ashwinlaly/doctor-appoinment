const Mongoose = require("mongoose");

const userBookingSchema = new Mongoose.Schema({
    user_id : {
        type: Mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    doctor_id : {
        type: Mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Doctor"
    },
    date : {
        type: Date,
        required: true
    },
    starttime : {
        type: String,
        trim: true,
        required: true
    },
    endtime : {
        type: String,
        trim: true,
        required: true
    },
    doctor_perscription: {
        type: String,
        trim: true
    },
    review: {
        type: Number,
        trim: true
    },
    comments: {
        type: String,
        trim: true
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const UserBooking = Mongoose.model("user_booking", userBookingSchema);
module.exports = UserBooking;