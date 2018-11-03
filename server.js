var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
require('dotenv').config();
require('./sockets')(io);

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/static'));
app.use(cookieParser());
app.use(require('./routes'));

http.listen(process.env.PORT , function () {
  console.log('BetYourDignity running on port ' + process.env.PORT);
});
