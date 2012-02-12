var pairDevice = require('./pairDevice'),
    sessionFromFacebook = require('./sessionFromFacebook'),
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
    sessionFromFacebook.bind(control, config);
    // pairDevice.bind(control, config);
    // provisionDatabases.bind(control, config);
};

function startApp(name, config) {
    console.log("starting "+name);
    var control = docstate.control();
    bindListeners(control, config)
    // sessionFromFacebook.start(config);
    
    // after this point no new callbacks can be added to the listeners. 
    // restart to add new callbacks.
    control.start();
    
    coux.subscribeDb(config["host"] + "/" + config['session-db'],function(change) {
        control.handle(change.doc)
    });
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


