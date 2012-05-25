// stuff we need for this script

var SyncpointAPI = require('../lib/syncpoint-api'),
    coux = require('coux'),
    tap = require("tap"), test = tap.test,
    e = require('errLog').e;

coux.log = ["GET", "PUT", "POST", "DELETE"];

var testConfig = require('./testConfig');

var handshakeId, pairingUserDoc, userControlDb;
coux.del([testConfig.host, testConfig.users_db], function() {
  var syncpoint = new SyncpointAPI(testConfig);
  syncpoint.start(function(err) {
    test("creating an approved console single-channel session", function(t) {
      // t.plan(9)
      var username = "Miyagi-single-pairing", pairingUserDoc = {
        "_id": "org.couchdb.user:" + username,
        "name": username,
        "type": "user",
        "sp_oauth": {
             "consumer_key": "y80ecfdafbaac07ad7c1f4d2f40b9883e8ddb1bff30",
             "consumer_secret": "ydeb36f325b8d6d0c7aad60a11bc105a7",
             "token_secret": "y47a30736ae27274bf2073f",
             "token": "y62c18b0cf5383c17d324d7e26377be43"
         },
        "pairing_state": "approved", // only admin can write this
        "pairing_type": "console",
        "pairing_token": 953300807,
        "pairing_app_id": "test-app",
        "pairing_full_name" : "宮城健介",
        "pairing_mode" : "single-channel",
        "roles": [],
        "password": "Wax on"
      };
      coux.post([testConfig.host, testConfig.users_db], pairingUserDoc, function(err, ok) {
        t.notOk(err, 'saved the pairing-user')
        console.log("waiting for doc", ok.id)
        coux.waitForDoc([testConfig.host, testConfig.users_db], ok.id, 
          0, function(err, doc) {
            console.log("waited", doc._id)
            if (doc.pairing_state !== "paired") {
              console.log("return", doc.pairing_state);
              return true;
            } else {
              console.log("run", doc.pairing_state);
            }
          t.is(ok.id, doc._id, "loaded the doc")
          t.is("paired", doc.pairing_state, "pairing user is paired")
          t.ok(doc.owner_id, "has a owner_id")
          // t.is
          console.log("got doc", doc._id)
          coux([testConfig.host, testConfig.users_db, doc.owner_id], function(err, user) {
            t.notOk(err, "user doc exists");
            t.is(user.oauth.consumer_keys[pairingUserDoc.sp_oauth.consumer_key], pairingUserDoc.sp_oauth.consumer_secret, "set oauth")
            t.notOk(user.control_database, "should not have control database")
            t.ok(user.channel_database, "has channel_database")
            // activating a session sets up replication from the new control database to the global control database
            // you could package this as an assertion (can replicate)
            coux.post([testConfig.host, user.channel_database], {"fizz":"buzz"}, function(err, fizz) {
              t.notOk(err, "test doc saved to users channel database");
              t.end();
            });
          })
        })
      })
    })
    test("quit", process.exit)
  })
})
