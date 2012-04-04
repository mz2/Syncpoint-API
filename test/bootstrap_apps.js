var testConfig = require('./testConfig'),
  tap = require("tap"), 
  coux = require('coux').coux,
  test = tap.test, plan = tap.plan,
  SyncpointAPI = require('../lib/syncpoint-api'),
  syncpoint = new SyncpointAPI(testConfig);

// so nodeunit will run us
exports.awesome = function(test) {
  setTimeout(function() {
    console.log("timeout node tap for grunt");
    test.done()
  },1 * 1000);
};

test("bootstrap", function(t) {
  t.plan(3)
  // delete test databases so we can ensure they are created
  coux.del([testConfig.host, testConfig.config_db], function() {
    coux.del([testConfig.host, testConfig.handshake_db], function() {
      syncpoint.start(function(err) {
        coux([testConfig.host, testConfig.config_db], function(err, ok) {
          t.ok(ok.db_name, "config db exists")
        })
        coux([testConfig.host, testConfig.config_db, "_design/config"], function(err, doc) {
          t.ok(doc.views, "config ddoc exists")
        })
        coux([testConfig.host, testConfig.handshake_db], function(err, ok) {
          t.ok(ok.db_name, "handshake db exists")
        })
      });
    });
  });
});

test("quit", process.exit)
