var coux = require('coux').coux,
    e = require('errLog').e,
    config;

exports.bind = function(control, conf) {
    config = conf;
    control.safe("session-fb","new", newSessionRequested);
};

function newSessionRequested(doc) {
    coux("https://graph.facebook.com/me?access_token="+doc.fb_access_token, e(function(err, resp) {
        if (resp.id && resp.name) {
            // find a user that has this facebook_id
            // put the oauth creds on their user document
            // OR create a user with this facebook_id and create 
            // a user-control-database that only they can access.
            // update the session doc to be active
            // link to the user-control-database on the session doc
        }
    }));
}
