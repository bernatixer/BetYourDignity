var express = require('express');
var router = express.Router();
var Instagram = require('node-instagram').default;

// //Middle ware that is specific to this router
// router.use(function timeLog(req, res, next) {
//   console.log('Time: ', Date.now());
//   next();
// });

const redirectUri = 'http://localhost:3000/auth/instagram/callback';

const instagram = new Instagram({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
});

router.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/start.html');
});

// Redirect user to instagram oauth
router.get('/auth/instagram', (req, res) => {
    res.redirect(instagram.getAuthorizationUrl(redirectUri, { scope: ['basic'] }));
});

// Handle auth code and get access_token for user
router.get('/auth/instagram/callback', async (req, res) => {
    try {
        const data = await instagram.authorizeUser(req.query.code, redirectUri);
        // access_token in data.access_token
        res.json(data);
    } catch (err) {
        res.json(err);
    }
});


module.exports = router;