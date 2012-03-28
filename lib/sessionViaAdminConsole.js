// This is bound to the handshake database
// we listen for requests for new sessions, and connect them to the correct per-user control channel
// 

var coux = require('coux').coux,
    e = require('errLog').e,
    syncpointHelpers = require('./syncpointHelpers'),
    userChannelControl = require('./userChannelControl'),
    control_ddoc = require('./control_ddoc').ddoc,
    config;

exports.bind = function(control, conf) {
    config = conf;
    control.safe("session-admin","accepted", newSessionRequested);
};

function newSessionRequested(sessionDoc) {
  console.log('newSessionRequested', sessionDoc._id)
  return;
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
            var userId = "sp_fb_"+resp.id+"_app_"+sessionDoc.app_id
                , userDocId = "org.couchdb.user:"+userId
                ;
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
                    console.log("made user: ", fb_user);
                }
                setControlDatabaseName(fb_user);
            });
            function setControlDatabaseName(fb_user) {
                if (!fb_user.control_database) {
                    coux([config.host,"_uuids"], e(function(err, data) {
                        fb_user.control_database = "control-"+data.uuids[0];
                        fb_user.state = "has-control";
                        ensureControlDatabaseExists(fb_user, true)
                    }))
                } else {
                    ensureControlDatabaseExists(fb_user)
                }
            };
            function ensureControlDatabaseExists(fb_user, isNew) {
                // find or create a control database
                coux([config.host, fb_user.control_database], function(err, ok) {
                    if (err) {
                        console.log("create control", fb_user.control_database);
                        coux.put([config.host, fb_user.control_database], 
                            e(secureControlDb, [fb_user, isNew]));
                    } else {
                        secureControlDb(fb_user, isNew);
                    }
                })
            }
            function secureControlDb(fb_user, isNew) {
                // once a database has a member, it is not public
                syncpointHelpers.addMemberToDatabase(fb_user._id, 
                    [config.host, fb_user.control_database],
                    e(addControlDesign,[fb_user, isNew]));
            };
            function addControlDesign(fb_user, isNew) {
                coux.put([config.host, fb_user.control_database, control_ddoc._id], 
                    control_ddoc, function(err, ok) {
                    if (err && err.error != "conflict") {
                        console.trace(JSON.stringify(err))
                    } else {
                        updateUserDocWithOauth(fb_user, isNew)
                    }
                })
            };
            function updateUserDocWithOauth(fb_user, isNew) {
                // console.log("updateUserDocWithOauth");
                // update the user doc with the oauth credentials
                syncpointHelpers.applyOauthCredsToUserDoc(fb_user, sessionDoc);
                coux.put([config.host, config.users_db, fb_user._id], 
                    fb_user, e(activateSession,[fb_user, isNew]));
            };
            function activateSession(fb_user, isNew) {
                console.log("activate session for ", fb_user._id, fb_user.full_name);
                // put the control database name and user_id on the session doc
                sessionDoc.control_database = fb_user.control_database;
                sessionDoc.user_id = fb_user._id;
                // update the session doc to be active
                // when the mobile device see this, it will switch the session
                // to the user's control database
                sessionDoc.state = "active";
                coux.put([config.host, config.handshake_db, sessionDoc._id],
                    sessionDoc, e(function() {
                        if (isNew) {
                            userChannelControl.bindToControlDb(fb_user.control_database, fb_user.app_id, config)
                        }
                    }));
            };
        };
        // kick off that long chain, if the 
        if (resp.id && resp.name) {
            findOrCreateUserDoc();
        }
    });
}
