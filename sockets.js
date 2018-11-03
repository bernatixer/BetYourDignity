var cookie = require('cookie');

var cookie = require('cookie');exports = module.exports = function (io) {
    io.sockets.on('connection', function (socket) {
        var token = cookie.parse(socket.handshake.headers.cookie).acces_token;
        console.log("User entered to the game with token: " + token);
        // socket.on('file2Event', function () {
        //     console.log('file2Event triggered');
        // });
    });
};
