
exports.appplyOauth = function(userDoc, credsDoc) {   
    var creds = credsDoc.oauth_creds, id = credsDoc._id;
    if (!userDoc.oauth) {
        userDoc.oauth = {
            consumer_keys : {},
            tokens : {}
        };        
    }
    if (!userDoc.oauth['devices']) {
        userDoc.oauth['devices'] =  {};
    }
    if (userDoc.oauth.consumer_keys[creds.consumer_key] || userDoc.oauth.tokens[creds.token]) {
        if (userDoc.oauth.consumer_keys[creds.consumer_key] == creds.consumer_secret &&
            userDoc.oauth.tokens[creds.token] == creds.token_secret &&
            userDoc.oauth.devices[id][0] == creds.consumer_key &&
            userDoc.oauth.devices[id][1] == creds.token) {
        // no op, no problem
        } else {
            return({error : "token_used", message : "device_id "+id});         
        }
    }
    userDoc.oauth.devices[id] = [creds.consumer_key, creds.token];
    userDoc.oauth.consumer_keys[creds.consumer_key] = creds.consumer_secret;
    userDoc.oauth.tokens[creds.token] = creds.token_secret;
};
