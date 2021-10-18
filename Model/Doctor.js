const Mongoose = require("mongoose");
const doctorSlotSchema = require("./Schema/doctorSlotSchema");

const doctorSchema = new Mongoose.Schema({
    name : {
        type: String,
        trim: true,
        min: 4,
        max: 30,
        required: true
    },
    email : {
        type: String,
        trim: true,
        min: 6,
        max: 50,
        required: true
    },
    password: {
        type: String,
        trim: true,
        min: 6,
        max: 50,
        required: true
    },
    phone: {
        type: String,
        trim: true,
        min: 10,
        max: 15,
        required: true
    },
    location: { 
        type: {
            type: String
        }, 
        coordinates: [Number]
    },
    address: {
        street: {
            type: String,
            trim: true
        },
        district: {
            type: String,
            trim: true
        },
        state: {
            type: String,
            trim: true
        },
        country: {
            type: String,
            trim: true,
            default: "India"
        }
    },
    slot: [{
        type: doctorSlotSchema,
        default: {}
    }],
    is_active: {
        type: Boolean,
        default: true
    },
    token: {
        type: String
    }
}, {
    timestamps: true
});

doctorSchema.index({location: '2dsphere'});
doctorSchema.pre("save", async function(next){
    let alreadyExists = await Doctor.findOne({email: this.email}).exec();
    if(alreadyExists !== null) {
        next(new Error("Doctor exists!"));
    }
    next();
});

const Doctor = Mongoose.model("Doctor", doctorSchema);
module.exports = Doctor;