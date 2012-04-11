// stuff we need for this script

var SyncpointAPI = require('../lib/syncpoint-api'),
    coux = require('coux'),
    tap = require("tap"), test = tap.test,
    e = require('errLog').e;

// tests should also be capable of testing other implementations
// eg: integration tests

var testConfig = require('./testConfig');



var handshakeId, handshakeDoc, userControlDb;
coux.del([testConfig.host, testConfig.users_db], function() {
  var syncpoint = new SyncpointAPI(testConfig);
  syncpoint.start(function(err) {
    test("creating an approved admin session", function(t) {
      t.plan(9)
      var sessionDoc = {
         "oauth_creds": {
             "consumer_key": "x80ecfdafbaac07ad7c1f4d2f40b9883e8ddb1bff30",
             "consumer_secret": "xdeb36f325b8d6d0c7aad60a11bc105a7",
             "token_secret": "x47a30736ae27274bf2073f",
             "token": "x62c18b0cf5383c17d324d7e26377be43"
         },
         "type": "session-admin",
         "state": "approved",
         "app_id": "demo-app",
         "session_token": "583300807",
         "user_full_name": "Chris"
      };
      coux.post([testConfig.host, testConfig.users_db], sessionDoc, function(err, ok) {
        t.notOk(err, 'saved the session')
        coux.waitForDoc([testConfig.host, testConfig.users_db], ok.id, 2, function(err, doc) {
          t.is(ok.id, doc._id, "loaded the doc")
          t.is("active", doc.state, "session is active")
          t.ok(doc.user_id, "has a user_id")
          // t.is
          coux([testConfig.host, testConfig.users_db, doc.user_id], function(err, user) {
            t.notOk(err, "user doc exists");
            t.is(user.oauth.consumer_keys[sessionDoc.oauth_creds.consumer_key], sessionDoc.oauth_creds.consumer_secret, "set oauth")
            t.ok(user.control_database, "has control database")
            // activating a session sets up replication from the new control database to the global control database
            coux.post([testConfig.host, user.control_database], {"fizz":"buzz"}, function(err, fizz) {
              t.notOk(err, "test doc saved to users control database");
              setTimeout(function() {
                coux([testConfig.host, testConfig.global_control_db, fizz.id], function(err, doc) {
                  t.notOk(err, "fizz doc saved to global control database")
                })
              },500);
            });
          })
        })
      })
    })
    test("quit", process.exit)
  })
})

