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
  t.plan(4)
  // delete test databases so we can ensure they are created
  coux.del([testConfig.host, testConfig.config_db], function() {
    coux.del([testConfig.host, testConfig.handshake_db], function() {
      syncpoint.start(function(err) {
        coux([testConfig.host, testConfig.users_db], function(err, ok) {
          t.is(ok.db_name, testConfig.users_db, "users db exists")
        })
        coux([testConfig.host, testConfig.global_control_db], function(err, ok) {
          t.is(ok.db_name, testConfig.global_control_db, "global_control_db db exists")
        })
        coux([testConfig.host, testConfig.config_db], function(err, ok) {
          t.is(ok.db_name, testConfig.config_db, "config db exists")
        })
        coux([testConfig.host, testConfig.config_db, "_design/config"], function(err, doc) {
          t.ok(doc.views, "config ddoc exists")
        })
        coux([testConfig.host, testConfig.handshake_db], function(err, ok) {
          t.is(ok.db_name, testConfig.handshake_db, "handshake db exists")
        })
      });
    });
  });
});

test("quit", process.exit)
