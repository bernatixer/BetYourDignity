var Client = require('instagram-private-api').V1;

const getMidPicture = function(pictures, def) {
    const defaultPic = { url: def, height: 150, width: 150 };
    return pictures.filter(function(pic) { return pic.width != 640 })[0] || defaultPic;
}

const makeSessionId = function() {
    return Math.random().toString(36).substring(2, 18);
}

const buildSessionAccount = function(sessionId, params) {
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
                callback(buildSessionAccount(sessionId, params));
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
        callback(buildSessionAccount(sessionId, account.params))
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
    getSessionAccount(sessionId, function(session, account) {
        var feed = new Client.Feed.UserMedia(session, account.params.id, 100);
        feed.get().then(function(media) {
            const mediaList = media
                .map(function(mediaItem) { return mediaItem.getParams(); })
                .map(reduceMediaObject)
            callback(mediaList);
        });
    });
}

const reduceMediaObject = function(media) {
    var image = media.images.filter(function(pic) { return pic.width < 400 })[0] || media.images[0];
    return {
        id: media.id,
        description: media.caption,
        image: image,
        username: media.user.username
    }
}

const reduceFollowerObject = function(follower) {
    return {
        id: follower.id,
        description: follower.fullName,
        image: {
            height: 150,
            width: 150,
            url: follower.profilePicUrl
        },
        username: follower.username
    }
}

const like = function(sessionId, mediaId) {
    getSession(sessionId, function(session) {
        Client.Like.create(session, mediaId);
    });
}

const getSessionAccount = function(sessionId, callback) {
    getSession(sessionId, function(session) {
        getCurrentAccount(sessionId, function(account) {
            callback(session, account);
        });
    });
}


const getFollowers = function(sessionId, callback) {
    getSessionAccount(sessionId, function(session, account) {
        var accountFollowers = new Client.Feed.AccountFollowers(session, account.params.id, 100);
        accountFollowers.get().then(function(followers) {
            const followersList = followers
                .map(function(follower) { return follower.getParams(); })
                .map(reduceFollowerObject)
            callback(followersList);
        });
    });
}

const follow = function(sessionId, followerId) {
    getSession(sessionId, function(session) {
        Client.Relationship.create(session, followerId);
    });
}

module.exports = { login, getCurrentSessionAccount, getAccountMedia, like, getFollowers, follow };