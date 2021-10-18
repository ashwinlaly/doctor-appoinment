const express = require("express"),
      router = express.Router();

const userRoutes = require("./user-routes")();
const doctorRoutes = require("./doctor-routes")();
const doctorTypeRoutes = require("./doctor-type-routes")();

// // Routes
module.exports = (function() {
    router.use("/user", userRoutes);
    router.use("/doctor", doctorRoutes);
    router.use("/doctortypes/", doctorTypeRoutes);
    return router;
});