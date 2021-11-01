const express = require("express"),
      router = express.Router();

// VALIDATOR
const doctorSlotValidator = require("../Middleware/Validators/doctor/slotValidator");
const docterSigninValidator = require("../Middleware/Validators/doctor/signinValidator");
const doctorSignupValidator = require("../Middleware/Validators/doctor/signupValidator");

// // HELPER
const { verifyToken,
        verifyDoctor } = require("../Middleware/Helpers/authHelper");

// // CONTROLLER
const doctorController = require("../Controller/doctorController");

// // Routes
module.exports = (function() {
    router.post("/signin", [docterSigninValidator], doctorController.Signin);
    router.post("/signup", [doctorSignupValidator], doctorController.Signup);

    router.use("*", [verifyToken, verifyDoctor]);
    router.post("/slot", [doctorSlotValidator],doctorController.addDoctorSlot);
    router.post("/slot/status", doctorController.updateDoctorSlotStatus);
    router.post("/appoinments", doctorController.getAppoinmentDataByDate);
    router.post("/appoinment/status", doctorController.updateDoctorAppoinmentStatus);
    return router;
});