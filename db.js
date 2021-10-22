require("dotenv").config()
const {DB_CONNECTION} = process.env

const mongoose = require("mongoose"),
    config = require('./config'),
    constant = require("./constant");

module.exports = {
    connect : callback => {
        const url = config[DB_CONNECTION].database.db_url;
        const mongoose_config = config[DB_CONNECTION].database.mongoose_config;

        mongoose.connect(url, mongoose_config, (err, conn) => {
            if(err) {
                console.log("Database Error...", err);
                callback(constant.CONNETION_ERROR);
            } else {
                _db = conn
                console.log("Database connection sucess...");
                callback(constant.CONNETION_SUCCESS);
            }
            return;
        })
    },
    close : () => {
        mongoose.disconnect();
    }
}