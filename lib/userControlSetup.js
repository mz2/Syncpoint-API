// this module activates the per-user control channels when they are created by the pairing agent
// it is bound to the _users database
// it binds the per user control channel listeners for all Syncpoint users
// currently there is only one listener, the channel provisioner
// in the future there may be more listeners as we add features

var coux = require('coux').coux,
    e = require('errLog').e,
    docstate = require("docstate"),
    userChannelControl = require('./userChannelControl'),
    config;

exports.bind = function(control, conf) {
    config = conf;
    control.safe("user","has-control", bindControlDb);
};

function bindControlDb(doc) {
    var control = docstate.control(),
        controlDb = doc.control_database;
        // todo bring app_id in scope (simplify config handling)
        // controlDb = doc.control_dbs[app_id]
    userChannelControl.bind(control, config, controlDb);
    control.start();
    coux.subscribeDb(config["host"] + "/" + controlDb,function(change) {
        control.handle(change.doc);
    });
};

