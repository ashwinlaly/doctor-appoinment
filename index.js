require("dotenv").config()

// Default Modules
const express = require("express");
const app = express();
const ws = require('ws');
const cors = require("cors");

// Custom Modules
const db = require("./db");
const constant = require("./constant");
const routes = require("./Route/route")();

// Streams

// Middleware 
app.use(cors({
    origin: "*"
}));
app.use(express.json());
app.use("/api/", routes);
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});
app.all("*", (request, response) => {
    console.log(request.path, request.method)
    response.status(405).json({message: constant.INVALID_URL, code : 405})
});

const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', socket => {
  socket.on('message', message => console.log(message));
});

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
})

module.exports = app