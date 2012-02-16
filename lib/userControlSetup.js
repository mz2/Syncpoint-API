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
    userChannelControl.bind(control, config, controlDb);
    control.start();
    coux.subscribeDb(config["host"] + "/" + controlDb,function(change) {
        control.handle(change.doc);
    });
};

