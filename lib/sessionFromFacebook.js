// This is bound to the handshake database
// we listen for requests for new sessions, and connect them to the correct per-user control channel
// 
// The use of the Facebook API is limited to getting the user's Facebook ID (and their full name, but that is only used to make it easier to administer the system later.)
// Once we have their Facebook ID, we find or create a Syncpoint user that matches it. We'll do something similar for Twitter etc.
// With the user document, we attach the device's credentials as a delegate, so it can sync on behalf of the user.
// Once we are all good to go, we update the user's document with the 'has-control' state, and then we update the session document with the 'active' state.


var coux = require('coux').coux,
    e = require('errLog').e,
    syncpointHelpers = require('./syncpointHelpers'),
    userChannelControl = require('./userChannelControl'),
    config;

exports.bind = function(control, conf) {
    config = conf;
    control.safe("session-fb","new", newSessionRequested);
};

// we only export these for testing / stubbing purposes
// todo is there a more idiomatic way to do this?

exports._dependencies = {
    getMeFromFB : function(fb_access_token, cb) {
        var fbMeUrl = "https://graph.facebook.com/me?access_token="+fb_access_token;
        coux(fbMeUrl, cb)
    }
}

function newSessionRequested(sessionDoc) {
    // TODO first verify that sessionDoc.app_id matches an existing app
    // also verify the doc is signed with the apps public key or something
    exports._dependencies.getMeFromFB(sessionDoc.fb_access_token, function(err, resp) {
        if (err) {
            sessionDoc.state = 'error';
            sessionDoc.error = err;
            console.error("facebook error logged to session doc", err, sessionDoc._id);
            coux.put([config.host, config.handshake_db, sessionDoc._id], sessionDoc, e());            
            return; // the client has enough info to retry
        }
        function findOrCreateUserDoc() {
            console.log('findOrCreateUserDoc')
            // find or create a user that has this facebook_id and this app_id
            var userId = "sp_fb_"+resp.id+"_app_"+sessionDoc.app_id,
              userDocId = "org.couchdb.user:"+userId;
            coux([config.host, config.users_db, userDocId], function(err, fb_user) {
                if (!err) {
                    console.log("user found", fb_user);
                } else { // make one
                    fb_user = {
                       _id : userDocId,
                       fb_id : resp.id,
                       app_id : sessionDoc.app_id,
                       name : userId,
                      full_name : resp.name,
                      type : "user",
                      state : "new",
                      roles : []
                    };
                    console.log("making user: ", fb_user);
                }
                syncpointHelpers.activateSessionForUser(sessionDoc, fb_user, config);
            });
        }
        // kick off that long chain, if the 
        if (resp.id && resp.name) {
            findOrCreateUserDoc();
        }
    });
}
