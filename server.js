var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
require('dotenv').config();

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/static'));
app.use(cookieParser());

var Instagram = require('node-instagram').default;
var cookie = require('cookie');

const redirectUri = 'http://localhost:' + process.env.PORT + '/auth/instagram/callback';

const instagram = new Instagram({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
});

var status = {
    EMPTY: 0,
    WAITING: 1,
    FULL: 2
};

var game = {
    status: status.EMPTY
};

io.on('connection', function (socket) {
    var token = cookie.parse(socket.handshake.headers.cookie).acces_token;
    var playerNum = game[token];
    // var playerLoc;
    // action player dir
    socket.on('move', function (data) {
        if (data.action == 'horizontal') {
            if (playerNum == 1) socket.broadcast.emit('move', { action: 'horizontal', player: playerNum, dir: data.dir });
            else if (playerNum == 2) socket.broadcast.emit('move', { action: 'horizontal', player: playerNum, dir: data.dir });
        } else if (data.action == 'vertical') {
            if (playerNum == 1) socket.broadcast.emit('move', { action: 'vertical', player: playerNum, dir: data.dir });
            else if (playerNum == 2) socket.broadcast.emit('move', { action: 'vertical', player: playerNum, dir: data.dir });
        }
        
    });

    // socket.on('currPosition', function (location) {
    //     playerLoc = location;
    // });
});

app.get('/play', function (req, res) {
    res.render('play');
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
        console.log("Token " + game[token]);
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

// Redirect user to instagram oauth
app.get('/auth/instagram', (req, res) => {
    res.redirect(instagram.getAuthorizationUrl(redirectUri, { scope: ['basic'] }));
});

// Handle auth code and get access_token for user
app.get('/auth/instagram/callback', async (req, res) => {
    try {
        const data = await instagram.authorizeUser(req.query.code, redirectUri);
        // access_token in data.access_token
        res.cookie("acces_token", data.access_token, { expire: new Date() + 9999 });
        res.json(data);
        console.log(data.access_token);
    } catch (err) {
        res.json(err);
    }
});



http.listen(process.env.PORT , function () {
  console.log('BetYourDignity running on port ' + process.env.PORT);
});