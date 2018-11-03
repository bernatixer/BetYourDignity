require('dotenv').config();
var express = require('express');
var app = express();

app.use(express.static(__dirname + '/client'));

app.use(require('./routes'));

app.listen(process.env.PORT , function () {
  console.log('BetYourDignity running on port ' + process.env.PORT);
});
