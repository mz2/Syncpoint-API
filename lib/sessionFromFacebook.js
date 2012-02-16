var coux = require('coux').coux,
    e = require('errLog').e,
    syncpointHelpers = require('./syncpointHelpers'),
    config;

exports.bind = function(control, conf) {
    config = conf;
    control.safe("session-fb","new", newSessionRequested);
};

function newSessionRequested(newSessionRequestedDoc) {
    coux("https://graph.facebook.com/me?access_token="+newSessionRequestedDoc.fb_access_token, function(err, resp) {
        if (err) {
            newSessionRequestedDoc.state = 'error';
            newSessionRequestedDoc.error = err;
            console.error("facebook error logged to session doc", err, newSessionRequestedDoc._id);
            coux.put([config.host, config['session-db'], newSessionRequestedDoc._id],
                newSessionRequestedDoc, e());            
            return; // the client has enough info to retry
        }
        if (resp.id && resp.name) {
            function withSecurity(fb_user) {
                console.log("withSecurity");
                // update the user doc with the oauth credentials
                syncpointHelpers.applyOauthCredsToUserDoc(fb_user, newSessionRequestedDoc);
                coux.put([config.host, "_users", fb_user._id], fb_user, e(function() {
                    // update the session doc to be active
                    newSessionRequestedDoc.state = "active";
                    coux.put([config.host, config['session-db'], newSessionRequestedDoc._id],
                        newSessionRequestedDoc, e());
                }));
            };
            function withControlDb(fb_user) {
                // ensure security settings
                syncpointHelpers.addMemberToDatabase(fb_user._id, 
                    [config.host, fb_user.control_database], e(withSecurity,[fb_user]));
            };
            function withControlDBName(fb_user) {
                newSessionRequestedDoc.session = {
                    control_database : fb_user.control_database,
                    request_id : newSessionRequestedDoc._id,
                    user_id : fb_user._id
                }
                // find or create a control database
                coux([config.host, fb_user.control_database], function(err, ok) {
                    if (err) {
                        console.log("create control", fb_user.control_database);
                        coux.put([config.host, fb_user.control_database], 
                            e(withControlDb, [fb_user]));
                    } else {
                        withControlDb(fb_user);
                    }
                })
            }
            function withUser(fb_user) {
                // find or create the control database name for the user
                if (!fb_user.control_database) {
                    coux([config.host,"_uuids"], e(function(err, data) {
                        fb_user.control_database = "control-"+data.uuids[0];
                        fb_user.state = "has-control";
                        withControlDBName(fb_user)
                    }))
                } else {
                    withControlDBName(fb_user)
                }
            };
            // find or create a user that has this facebook_id
            var userDocId = "org.couchdb.user:sp_fp_"+resp.id;
            coux([config.host, "_users",userDocId], function(err, fb_user) {
                if (!err) {
                    console.log("user found", fb_user);
                    withUser(fb_user); // and go
                } else { // make one
                    fb_user = {
                       _id : userDocId,
                       fb_id : resp.id,
                       name : "sp_fp_"+resp.id,
                      full_name : resp.name,
                      type : "user",
                      state : "new",
                      roles : []
                    };
                    console.log("made user: "+fb_user);
                    withUser(fb_user); // and go
                }
            });
        }
    });
}
