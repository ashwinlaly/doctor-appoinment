const Mongoose = require("mongoose");

const doctorTypeSchema = new Mongoose.Schema({
    category_name : {
        trim: true,
        type: String,
        unique: true,
        required: true
    }
}, {
    timestamps: true
});

const doctorType = Mongoose.model("doctor_types", doctorTypeSchema);
module.exports = doctorType;