var coux = require('coux').coux,
    e = require('errLog').e,
    oauthUsers = require('./oauthUsers'),
    config;

exports.bind = function(control, conf) {
    config = conf;
    control.safe("session-fb","new", newSessionRequested);
};

function newSessionRequested(newSessionRequestedDoc) {
    coux("https://graph.facebook.com/me?access_token="+newSessionRequestedDoc.fb_access_token, e(function(err, resp) {
        if (resp.id && resp.name) {
            function withSecurity(fb_user) {
                // update the user doc with the oauth credentials
                oauthUsers.appplyOauth(fb_user, newSessionRequestedDoc)
                coux.put([config.host, "_users", fb_user._id], fb_user, e(function() {
                    // update the session doc to be active
                    newSessionRequestedDoc.state = "active";
                    coux.put([config.host, config['session-db'], newSessionRequestedDoc._id],
                        newSessionRequestedDoc, e());
                }));
            };
            function withControlDb(fb_user) {
                // that only they can access.
                coux([config.host, fb_user.control_database, "_security"], e(function(err, secObj) {
                    if (secObj.members.indexOf(fb_user._id) == -1) {
                        secObj.members.push(fb_user._id);
                            coux([config.host, fb_user.control_database, "_security"],
                                e(withSecurity,[fb_user]));
                    } else {
                        withSecurity(fb_user);
                    }
                }))

            };
            function withControlDBName(fb_user) {
                newSessionRequestedDoc.session = {
                    control_database : fb_user.control_database,
                    request_id : newSessionRequestedDoc._id,
                    user_id : fb_user._id
                }
                // create a control database
                coux([config.host, fb_user.control_database], function(err, ok) {
                    console.log("create control");
                    if (err) {
                        coux.put([config.host, fb_user.control_database], 
                            e(withControlDb, [fb_user]));
                    } else {
                        withControlDb(fb_user);
                    }
                })
            }
            
            
            function withUser(fb_user) {
                // update the request doc with the session info:
                // link to the user-control-database on the session doc

                
                if (!fb_user.control_database) {
                    coux([config.host,"_uuids"], e(function(err, data) {
                        fb_user.control_database = "db-"+data.uuids[0];
                        withControlDBName(fb_user)
                    }))
                    
                } else {
                    withControlDBName(fb_user)
                }
            };
            // find a user that has this facebook_id
            coux([config.host, "_users","sp_fp:"+resp.id], function(err, fb_user) {
                if (!err) {
                    console.log("user found: "+fb_user);
                    withUser(fb_user)
                } else { // make one
                    fb_user = {
                       _id : "sp_fp:"+resp.id,
                       fb_id : resp.id,
                      name : resp.name,
                      type : "user",
                      roles : []
                    };
                    console.log("made user: "+fb_user);
                    withUser(fb_user);
                }
            });
        }
    }));
}
