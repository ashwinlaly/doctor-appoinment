const express = require("express"),
      router = express.Router();

// // HELPER
const { verifyToken, 
    verifyDoctor,
        validateObjectID } = require("../Middleware/Helpers/authHelper");

// // CONTROLLER
const doctorTypeController = require("../Controller/doctorTypeController");

// // Routes
module.exports = (function() {
    router.get("/", doctorTypeController.getAllDoctorTypes);
    router.use("*", [verifyToken, verifyDoctor]);
    router.post("/", doctorTypeController.createDoctorType);
    router.get("/:id", [validateObjectID] ,doctorTypeController.getOneDoctorType);
    router.patch("/:id", [validateObjectID], doctorTypeController.updateDoctorTypes);
    router.delete("/:id", [validateObjectID], doctorTypeController.deleteDoctorTypes);
    return router;
});