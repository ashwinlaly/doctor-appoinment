require("dotenv").config()

// Custom Modules
const {app} = require("./app");
const db = require("./db");
const constant = require("./constant");

// Application Starter
const {PORT} = process.env || 5000
db.connect(STATUS => {
    console.log(STATUS)
    if(STATUS == constant.CONNETION_SUCCESS) {        
        app.listen(PORT, () => {
            console.log("Application Started", PORT)
        })
    } else {
        console.log("Application Start Error");
        db.close();
        process.exit();
    }
});