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

var game = {
    status: status.EMPTY
};

function getRooms() {
    return [
        game
    ];
}

io.on('connection', function (socket) {
    socket.emit('setRooms', getRooms());
    var token = cookie.parse(socket.handshake.headers.cookie).acces_token;
    var playerNum = game[token];
    var sessionInfo;
    
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
        login(data.username, data.password, function(sessionAccount) {
            sessionInfo = sessionAccount;
            socket.emit('loggin', { sessionId: sessionAccount.sessionId, rooms: getRooms() });
        })
    });

    socket.on('newRoom', function (roomName) {
        game.name = roomName;
        game.img = sessionInfo.account.profilePicture.url;
        game.username = sessionInfo.account.username;
        if (game.status == status.EMPTY) {
            game[token] = 1;
            game.status = status.WAITING;
        } else if (game.status == status.WAITING) {
            game[token] = 2;
            game.status = status.FULL;
        }
        socket.emit('setRooms', getRooms());
    });

});

app.get('/home', function (req, res) {
    res.render('index');
});

app.get('/development', function (req, res) {
    res.render('play', { currPlayer: "player1" });
});

app.get('/', function (req, res) {
    var token = req.cookies.acces_token;
    if (token != null) {
        if (game.status == status.EMPTY) {
            game[token] = 1;
            game.status = status.WAITING;
        } else if (game.status == status.WAITING) {
            game[token] = 2;
            game.status = status.FULL;
        }
        if (game[token] == 1) {
            res.render('play', { currPlayer: "player1" });
        } else if (game[token] == 2) {
            res.render('play', { currPlayer: "player2" });
        } else {
            res.render('start'); // Game full
        }
    } else {
        res.render('start');
    }
});

// res.cookie("acces_token", data.access_token, { expire: new Date() + 9999 });

http.listen(process.env.PORT , function () {
  console.log('BetYourDignity running on port ' + process.env.PORT);
});