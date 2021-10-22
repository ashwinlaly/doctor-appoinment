const express = require("express"),
      router = express.Router();

// VALIDATOR
const userSigninValidator = require("../Middleware/Validators/user/signinValidator");
const userSignupValidator = require("../Middleware/Validators/user/signupValidator");
const createSlotValidator = require("../Middleware/Validators/user/createSlotValidator")

// // HELPER
const { verifyToken, 
        verifyUser } = require("../Middleware/Helpers/authHelper");

// // CONTROLLER
const userController = require("../Controller/userController");

// // Routes
module.exports = (function() {
    router.post("/signin", [userSigninValidator], userController.Signin);
    router.post("/signup", [userSignupValidator], userController.Signup);

    router.use("*", [verifyToken, verifyUser]);
    router.post("/slot", [createSlotValidator], userController.createAppoinment);
    
    router.post("/doctor", userController.getDoctorByCategory);
    router.post("/doctor/booking", userController.getAppoinmentDataByDate);
    return router;
});