var testConfig = require('./testConfig');

var tap = require("tap")
    , coux = require('coux').coux
    , test = tap.test
    , plan = tap.plan
    , SyncpointAPI = require('../lib/syncpoint-api')
    ;

var syncpoint = new SyncpointAPI(testConfig);

// so nodeunit will run us
exports.awesome = function(test) {
  setTimeout(function() {
    console.log("timeout node tap for grunt");
    test.done()
  },1 * 1000);
};

console.log(test)

// delete test databases so we can ensure they are created
console.log("setup bootstrap test")
coux.del([testConfig.host, testConfig.config_db], function() {
    coux.del([testConfig.host, testConfig.handshake_db], function() {
      console.log("start")
        syncpoint.start(function(err) {
            test('create the config database', function(t) {
                coux([testConfig.host, testConfig.config_db], function(err, ok) {
                    t.ok(ok.db_name, "config db exists")
                    t.end()
                })
            })
            test("create the config db design doc", function(t) {
                coux([testConfig.host, testConfig.config_db, "_design/config"], function(err, doc) {
                    t.ok(doc.views, "config ddoc exists")
                    t.end()
                })
            })
            test('create the handshake database', function(t) {
                coux([testConfig.host, testConfig.handshake_db], function(err, ok) {
                    t.ok(ok.db_name, "handshake db exists")
                    t.end()
                })
            })
        });
    });
});


