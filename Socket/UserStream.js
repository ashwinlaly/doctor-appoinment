const _db = require("../db");
// const collection = db.collection('collectionName');
// const changeStream = collection.watch();
// changeStream.on('change', next => {
    
// });

module.exports = function(io) {
    io.on('connection', function(socket) {
        console.log(123)
        socket.on('message', function(message) {
            socket.emit('ditConsumer',message.value);
        });
    });
};