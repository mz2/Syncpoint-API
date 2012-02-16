var pairDevice = require('./pairDevice'),
    sessionFromFacebook = require('./sessionFromFacebook'),
    userControlSetup = require('./userControlSetup'),
    coux = require('coux').coux,
    docstate = require("docstate"),
    e = require('errLog').e;

// // connect to changes feed
// function subscribeDb(db, fun, since) {
//     function getChanges(since) {
//         coux({url:db + 
//             "/_changes?include_docs=true&feed=longpoll&since="
//             + since, agent:false}, 
//         e(function(err, changes) {
//             changes.results.forEach(fun)
//             getChanges(changes.last_seq);
//         }))
//     }
//     getChanges(since || 0); // todo make it restartable
// };

function bindListeners(control, config) {
    // bind to session db
    
    userControl.bind()
    // todo bind userControl to the _users db so we can find all the control dbs
    // channelControl will then bind to each control db
    
    // pairDevice.bind(control, config);
    // provisionDatabases.bind(control, config);
};

function bindSessionDb(config) {
    var control = docstate.control();
    sessionFromFacebook.bind(control, config);
    control.start();
    coux.subscribeDb(config["host"] + "/" + config['session-db'],function(change) {
        control.handle(change.doc);
    });
};

function bindUsersDb(config) {
    var control = docstate.control();
    userControlSetup.bind(control, config);
    control.start();
    coux.subscribeDb(config["host"] + "/_users",function(change) {
        control.handle(change.doc);
    });
};

function startApp(name, config) {
    console.log("starting "+name);
    bindSessionDb(config);
    bindUsersDb(config);
    // sessionFromFacebook.start(config);
    
    // after this point no new callbacks can be added to the listeners. 
    // restart to add new callbacks.

};

module.exports = function(config) {
    this.start = function() {
        console.log("syncpoint-api starting")
        var app;
        for (app in config.apps) {
            if (config.apps.hasOwnProperty(app)) {
                startApp(app, config.apps[app])
            }
        }
    };
};


