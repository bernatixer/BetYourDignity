var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var { login, getCurrentSessionAccount, getAccountMedia, like, getFollowers, follow } = require('./instagram-scraper');
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
    var playing = false;
    var sessionInfo;
    var socketCookie = socket.handshake.headers.cookie;
    var playerNum;
    io.emit('setRooms', getRooms());

    if (socketCookie != null) {
        var cookieInfo = cookie.parse(socketCookie).sessionId;
        playerNum = cookie.parse(socketCookie).playerNum;
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

    socket.on('fire', function () {
        socket.broadcast.emit('fire');
    })

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
        game.sessionId1 = sessionInfo.sessionId;
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
            game.sessionId2 = sessionInfo.sessionId;
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

    socket.on('hit', function(mediaId) {
        like(sessionInfo.sessionId, mediaId);
    });

});

app.get('/development', function (req, res) {
    res.render('play', { currPlayer: "player1", hostBiene: 'andreu', visitorBiene: 'bernat', hostName: 'andreu', visitorName: 'bernat', hostMedia: 'https://scontent-frx5-1.cdninstagram.com/vp/888c05e40d49f6db2e5a7c7786358a22/5C6E29A4/t51.2885-15/e35/s240x240/43914840_259986014707285_7552744139318422425_n.jpg?ig_cache_key=MTkwNDc5NDQzNjkzNDQ4MjU1Mg%3D%3D.2', visitorMedia: 'https://scontent-frx5-1.cdninstagram.com/vp/888c05e40d49f6db2e5a7c7786358a22/5C6E29A4/t51.2885-15/e35/s240x240/43914840_259986014707285_7552744139318422425_n.jpg?ig_cache_key=MTkwNDc5NDQzNjkzNDQ4MjU1Mg%3D%3D.2' });
});

app.get('/play', function (req, res) {
    var playerNum = req.cookies.playerNum;
    if (playerNum != null) {
        getAccountMedia(game.sessionId1, function (hostMedia) {
            getAccountMedia(game.sessionId2, function (visitorMedia) {
                hostMedia = hostMedia[0].image.url;
                visitorMedia = visitorMedia[0].image.url;
                if (playerNum == 1) res.render('play', { currPlayer: "player1", hostBiene: hostBiene, visitorBiene: visitorBiene, hostName: game.host, visitorName: game.visitor, hostMedia: hostMedia, visitorMedia: visitorMedia });
                else if (playerNum == 2) res.render('play', { currPlayer: "player2", hostBiene: hostBiene, visitorBiene: visitorBiene, hostName: game.host, visitorName: game.visitor, hostMedia: hostMedia, visitorMedia: visitorMedia });
            });
        });
    } else res.redirect('/');
});

app.get('/', function (req, res) {
    res.render('start');
});

http.listen(process.env.PORT, function () {
    console.log('BetYourDignity running on port ' + process.env.PORT);
});