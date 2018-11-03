var Client = require('instagram-private-api').V1;
var Media = Client.Media;
var Request = Client.Request;

const getMidPicture = function(pictures, def) {
    const defaultPic = { url: def, height: 150, width: 150 };
    return pictures.filter(function(pic) { return pic.width != 640 })[0] || defaultPic;
}

const makeSessionId = function() {
    return Math.random().toString(36).substring(2, 18);
}

const getSessionAccount = function(sessionId, params) {
    picture = getMidPicture(params.hdProfilePicVersions, params.profilePicUrl);
    return {
        sessionId: sessionId,
        account: {
            id: params.id,
            mediaCount: params.mediaCount,
            profilePicture: picture,
            username: params.username,
            fullname: params.fullName
        }
    };
}

const login = function(username, password, callback) {
    const sessionId = makeSessionId(username);
    var device = new Client.Device(sessionId);
    var storage = new Client.CookieFileStorage(__dirname + '/.cookies/' + sessionId + '.json');
    Client.Session.create(device, storage, username, password)
        .then(function(session) {
            session.getAccount().then(function(account) {
                const params = account.params;
                callback(getSessionAccount(sessionId, params));
            });
        });
}

const getSession = function(sessionId, callback, error) {
    var device = new Client.Device(sessionId);
    var storage = new Client.CookieFileStorage(__dirname + '/.cookies/' + sessionId + '.json');
    var session = new Client.Session(device, storage);
    if (Object.keys(session._cookiesStore.storage.idx).length == 0) { 
        error("No active session, need to login");
    } else {
        callback(session);
    }
}

const getCurrentSessionAccount = function(sessionId, callback, error) {
    getCurrentAccount(sessionId, function(account) {
        callback(getSessionAccount(sessionId, account.params))
    }, error);
}

const getCurrentAccount = function(sessionId, callback, error) {
    getSession(sessionId, function(session) {
        session.getAccount().then(function(account) {
            callback(account);
        });
    }, error);
}

const getAccountMedia = function(sessionId) {
    getSession(sessionId, function(session) {
        getCurrentAccount(sessionId, function(account) {
            var feed = new Client.Feed.UserMedia(session, account.params.id, 100);
            feed.get().then(function(media) {
                console.log(media);
            });
        })
    });
}

// Media.getAll = function (session) {
//     return new Request(session)
//         .setMethod('GET')
//         .setResource('mediaInfo', {mediaId: ''})
//         .send()
//         .then(function(json) {
//             return json;
//             // return new Media(session, json)
//         });
// }

getAccountMedia('5zuzqhobp35')


module.exports = { login, getCurrentSessionAccount };