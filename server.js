require('dotenv').config();
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/static'));
app.use(cookieParser());
app.use(require('./routes'));

app.listen(process.env.PORT , function () {
  console.log('BetYourDignity running on port ' + process.env.PORT);
});
