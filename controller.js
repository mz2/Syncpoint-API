var pairDevice = require('./lib/pairDevice'),
    coux = require('coux').coux,
    docstate = require("docstate"),
    e = require('errLog').e;

// connect to changes feed
function subscribeDb(db, fun) {
    function getChanges(since) {
        coux({url:db + 
            "/_changes?include_docs=true&feed=longpoll&since="
            + since, agent:false}, 
        e(function(err, changes) {
            changes.results.forEach(fun)
            getChanges(changes.last_seq);
        }))
    }
    getChanges(0);
};

exports.start = function(config) {
    var control = docstate.control();
    pairDevice.bind(control, config);
    // provisionDatabases.bind(control, config);
    control.start();
    subscribeDb(config.control,function(change) {
        control.handle(change.doc)
    });
};
