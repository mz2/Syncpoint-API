// This module exports one function: start()
// 
// start() binds the changes listeners for a few different functionalities:
// 
// * On the users db, when we see a user has a control database, we trigger the listener on that user's control database
// * On the handshake database, we listen for requests for new sessions, and connect them to the correct per-user control channel. Currently we only bind one listener to the handshake database (the Facebook listner) but we plan to add more (Twitter, email, enterprise SSO, etc).

var pairDevice = require('./pairDevice'),
    sessionFromFacebook = require('./sessionFromFacebook'),
    userControlSetup = require('./userControlSetup'),
    coux = require('coux').coux,
    docstate = require("docstate"),
    e = require('errLog').e;

// coux.log = true

function bindSessionDb(config) {
    var control = docstate.control();
    sessionFromFacebook.bind(control, config);
    control.start();
    console.log("listening for session handshakes");
    coux.subscribeDb(config["host"] + "/" + config['session-db'],function(change) {
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

// todo this is a little gnarly
module.exports = function(config) {
    this.start = function() {
        console.log("syncpoint-api starting");
        var app;
        for (app in config.apps) {
            if (config.apps.hasOwnProperty(app)) {
                startApp(app, config.apps[app])
            }
        }
    };
};


