var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var { login, getCurrentSessionAccount } = require('./instagram-scraper');
require('dotenv').config();

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/static'));
app.use(cookieParser());

var cookie = require('cookie');

var status = {
    EMPTY: 0,
    WAITING: 1,
    FULL: 2
};

var hostBiene;
var visitorBiene;

var game = {};

function getRooms() {
    return game;
}

io.on('connection', function (socket) {
    var sessionInfo;
    var playerNum;
    var playing = false;
    io.emit('setRooms', getRooms());

    var socketCookie = socket.handshake.headers.cookie;
    if (socketCookie != null) {
        var cookieInfo = cookie.parse(socketCookie).sessionId;
        if (cookieInfo != null) sessionInfo = JSON.parse(cookieInfo);
    }

    socket.on('move', function (data) {
        if (data.action == 'horizontal') {
            if (playerNum == 1) socket.broadcast.emit('move', { action: 'horizontal', player: playerNum, dir: data.dir });
            else if (playerNum == 2) socket.broadcast.emit('move', { action: 'horizontal', player: playerNum, dir: data.dir });
        } else if (data.action == 'vertical') {
            if (playerNum == 1) socket.broadcast.emit('move', { action: 'vertical', player: playerNum, dir: data.dir });
            else if (playerNum == 2) socket.broadcast.emit('move', { action: 'vertical', player: playerNum, dir: data.dir });
        }
    });

    socket.on('loggin', function (data) {
        login(data.username, data.password, function (sessionAccount) {
            sessionInfo = sessionAccount;
            socket.emit('loggin', { sessionId: sessionAccount, rooms: getRooms() });
        })
    });

    socket.on('newRoom', function (roomName) {
        game.name = roomName;
        game.img = sessionInfo.account.profilePicture.url;
        game.host = sessionInfo.account.username;
        game.status = status.WAITING;
        game[sessionInfo.sessionId] = 1;
        game.visitor = "";
        game.playerNum = 1;
        playerNum = 1;
        playing = true;
        socket.emit('setPlayerNum', playerNum);
        io.emit('setRooms', getRooms());
    });

    socket.on('joinRoom', function (roomName) {
        if (game.status == status.WAITING && !playing) {
            game.status = status.FULL;
            game[sessionInfo.sessionId] = 2;
            game.visitor = sessionInfo.account.username;
            game.playerNum = 2;
            playerNum = 2;
            playing = true;
            socket.emit('setPlayerNum', playerNum);
            io.emit('setRooms', getRooms());
            io.emit('selectBiene');
        }
    });

    socket.on('selectBiene', function (biene) {
        console.log('Biene: ' + biene);
        if (playerNum == 1) hostBiene = biene;
        else if (playerNum == 2) visitorBiene = biene;
        if (hostBiene != null && visitorBiene != null) io.emit('startGame');
    });

});

app.get('/development', function (req, res) {
    res.render('play', { currPlayer: "player1" });
});

app.get('/play', function (req, res) {
    var playerNum = req.cookies.playerNum;
    if (playerNum != null) {
        if (playerNum == 1) res.render('play', { currPlayer: "player1", hostBiene: hostBiene, visitorBiene: visitorBiene, hostName: game.host, visitorName: game.visitor });
        else if (playerNum == 2) res.render('play', { currPlayer: "player2", hostBiene: hostBiene, visitorBiene: visitorBiene, hostName: game.host, visitorName: game.visitor });
    } else res.redirect('/');
});

app.get('/', function (req, res) {
    res.render('start');
});

http.listen(process.env.PORT, function () {
    console.log('BetYourDignity running on port ' + process.env.PORT);
});