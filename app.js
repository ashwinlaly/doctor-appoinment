// Default Modules
const express = require("express");
const app = express();
const ws = require('ws');
const cors = require("cors");

// Custom Modules
const constant = require("./constant");
const routes = require("./Route/route")();

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

module.exports ={
    app,
    wsServer
};