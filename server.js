require('dotenv').config();
var express = require('express');
var app = express();
const Instagram = require('node-instagram').default;

// Create a new instance.
const instagram = new Instagram({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

const redirectUri = 'http://localhost:3000/auth/instagram/callback';

app.use(express.static(__dirname + '/client'));

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(process.env.PORT , function () {
  console.log('Example app listening on port ' + process.env.PORT);
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
    res.json(data);
  } catch (err) {
    res.json(err);
  }
});

app.listen(3000, function () {
  console.log('Example app listening on port ' + process.env.PORT);
});