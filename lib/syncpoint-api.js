var pairDevice = require('./pairDevice'),
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



module.exports = function(config) {
    console.log("syncpoint-api started")
    var control = docstate.control();
    function bindListeners() {
        pairDevice.bind(control, config);
        provisionDatabases.bind(control, config);   
    };
    this.start = function() {
        // bindListeners();
        // after this point no new callbacks can be added to the listeners. restart to add new ones.
        control.start();        
        subscribeDb(config["syncpoint-host"] + "/" + config.apps,function(change) {
            control.handle(change.doc)
        });
    };
};


