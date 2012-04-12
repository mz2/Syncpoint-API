// This is bound to the handshake database
// we listen for requests for new sessions, and connect them to the correct per-user control channel
// 
// The use of the Facebook API is limited to getting the user's Facebook ID (and their full name, but that is only used to make it easier to administer the system later.)
// Once we have their Facebook ID, we find or create a Syncpoint user that matches it. We'll do something similar for Twitter etc.
// With the user document, we attach the device's credentials as a delegate, so it can sync on behalf of the user.


var coux = require('coux').coux,
    e = require('errLog').e,
    syncpointHelpers = require('./syncpointHelpers'),
    userChannelControl = require('./userChannelControl'),
    config;

exports.bind = function(control, conf) {
    config = conf;
    control.safe("facebook","new", pairViaFacebook);
};

// we only export these for testing / stubbing purposes
// todo is there a more idiomatic way to do this?

exports._dependencies = {
    getMeFromFB : function(pairing_token, cb) {
        var fbMeUrl = "https://graph.facebook.com/me?access_token="+pairing_token;
        coux(fbMeUrl, cb)
    }
}

function pairViaFacebook(pairingUserDoc) {
    // TODO first verify that pairingUserDoc.app_id matches an existing app
    // also verify the doc is signed with the apps public key or something
    console.log("pairViaFacebook",pairingUserDoc)
    exports._dependencies.getMeFromFB(pairingUserDoc.pairing_token, function(err, resp) {
        if (err) {
            pairingUserDoc.state = 'error';
            pairingUserDoc.error = err;
            console.error("facebook error logged to session doc", err, pairingUserDoc._id);
            coux.put([config.host, config.users_db, pairingUserDoc._id], pairingUserDoc, e());            
            return; // the client has enough info to retry
        }
        function findOrCreateUserDoc() {
            console.log('findOrCreateUserDoc')
            // find or create a user that has this facebook_id and this app_id
            var userId = "sp_fb_"+resp.id+"_app_"+pairingUserDoc.pairing_app_id,
              userDocId = "org.couchdb.user:"+userId;
            coux([config.host, config.users_db, userDocId], function(err, fb_user) {
                if (!err) {
                    console.log("user found", fb_user);
                } else { // make one
                    fb_user = {
                       _id : userDocId,
                       fb_id : resp.id,
                       app_id : pairingUserDoc.pairing_app_id,
                       name : userId,
                      full_name : resp.name,
                      type : "user",
                      state : "new",
                      roles : []
                    };
                    console.log("making user: ", fb_user._id);
                }
                syncpointHelpers.activatePairingUser(pairingUserDoc, fb_user, config);
            });
        }
        // kick off that long chain, if the 
        if (resp.id && resp.name) {
            findOrCreateUserDoc();
        }
    });
}
