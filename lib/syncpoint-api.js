// This module exports one function: start()
// 
// start() binds the changes listeners for a few different functionalities:
// 
// * On the users db, when we see a user has a control database, we trigger the listener on that user's control database
// * On the handshake database, we listen for requests for new sessions, and connect them to the correct per-user control channel. Currently we only bind one listener to the handshake database (the Facebook listner) but we plan to add more (Twitter, email, enterprise SSO, etc).

var sessionFromFacebook = require('./sessionFromFacebook'),
    userControlSetup = require('./userControlSetup'),
    coux = require('coux').coux,
    docstate = require("docstate"),
    async = require("async"),
    e = require('errLog').e;

function bindSessionDb(config) {
    var control = docstate.control();
    sessionFromFacebook.bind(control, config);
    //todo sessionFromEmail.bind(control, config);
    // todo make sessionFrom* into a plugin pattern
    control.start();
    console.log("listening for session handshakes");
    coux.subscribeDb(config["host"] + "/" + config.handshake_db,function(change) {
        control.handle(change.doc);
    });
};

function bindUsersDb(config) {
    var control = docstate.control();
    userControlSetup.bind(control, config);
    control.start();
    console.log("listening for new user control databases");
    coux.subscribeDb(config["host"] + "/_users",function(change) {
        control.handle(change.doc);
    });
};

function startApp(name, config) {
    console.log("starting "+name);
    bindSessionDb(config);
    bindUsersDb(config);
};






function Syncpoint(config) {
    function bootstrapListeners(config, startedCb) {
        // coux.
        console.log("bootstrapListeners")
        // 
        throw("bb")
        startedCb()
    }
    
    // ensure the handshake database exists
    function setupHandshakeDb(cb) {
        coux.put([config.host, config.handshake_db], function() {
            cb(false)
        });
    }

    function createConfigDDoc(cb) {
        var ddoc = require('./config_ddoc').ddoc;
        coux.put([config.host, config.config_db, ddoc._id], ddoc, function(err, ok) {
            if (err && err.code != 409) {
                cb(err)
            } else {
                cb(false)
            }
        })
    }

    // ensure the config database exists
    function setupConfigDb(cb) {
        coux.put([config.host, config.config_db], function() {
            createConfigDDoc(cb)
        })
    };
    
    this.start = function(startedCb) {
        console.log("Syncpoint API listeners starting");
        setupConfigDb(function() {
            setupHandshakeDb(function() {
                bootstrapListeners(config, startedCb)
            });
        });
    };
};

module.exports = Syncpoint;
