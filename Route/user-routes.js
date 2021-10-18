const express = require("express"),
      router = express.Router();

// VALIDATOR
const userSigninValidator = require("../Middleware/Validators/user/signinValidator");
const userSignupValidator = require("../Middleware/Validators/user/signupValidator");

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
    router.post("/slot", userController.createAppoinment);
    return router;
});