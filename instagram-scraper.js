var Client = require('instagram-private-api').V1;

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

const getAccountMedia = function(sessionId, callback) {
    getSession(sessionId, function(session) {
        getCurrentAccount(sessionId, function(account) {
            var feed = new Client.Feed.UserMedia(session, account.params.id, 100);
            feed.get().then(function(media) {
                const mediaList = media
                    .map(function(mediaItem) { return mediaItem.getParams(); })
                    .map(reduceMediaObject)
                callback(mediaList);
            });
        })
    });
}

const reduceMediaObject = function(media) {
    var image = media.images.filter(function(pic) { return pic.width < 400 })[0] || media.images[0];
    return {
        id: media.id,
        caption: media.caption,
        image: image,
        username: media.user.username
    }
}

const like = function(sessionId, mediaId) {
    getSession(sessionId, function(session) {
        Client.Like.create(session, mediaId);
    })
}

getCurrentSessionAccount('5zuzqhobp35', function(sessionAccount) {
    const sessionId = sessionAccount.sessionId;
    console.log(sessionAccount);
    getAccountMedia(sessionId, function(media) {
        like(sessionId, media[0].id);
    })
})

module.exports = { login, getCurrentSessionAccount, getAccountMedia };