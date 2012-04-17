var SyncpointAPI = require('../lib/syncpoint-api'),
    coux = require('coux'),
    tap = require("tap"), test = tap.test,
    e = require('errLog').e,
    testConfig = require('./testConfig');

coux.del([testConfig.host, testConfig.users_db], function() {
  var syncpoint = new SyncpointAPI(testConfig);
  syncpoint.start(function(err) {
    test("creating a new web user", function(t) {
      t.plan(6)
      var username = "Ali Mills", pairingUserDoc = {
        "_id": "org.couchdb.user:" + username,
        "name": username,
        "type": "user",
        "pairing_state": "new",
        "pairing_type": "web",
        "roles": [],
        "password": "Cobra Kai"
      };
      
      coux.post([testConfig.host, testConfig.users_db], pairingUserDoc, function(err, ok) {
        t.notOk(err, 'saved the pairing-user')
        console.log("waiting for doc", ok.id)
        coux.waitForDoc([testConfig.host, testConfig.users_db], ok.id, 0, function(err, doc) {
          console.log("waited", doc._id)
          if (doc.pairing_state !== "paired") {
            console.log("return", doc.pairing_state);
            return true;
          } else {
            console.log("run", doc.pairing_state);
          }
          t.is(ok.id, doc._id, "loaded the doc")
          t.is("paired", doc.pairing_state, "web user is paired")
          t.ok(doc.control_database, "has control database")

          // activating a session sets up replication from the new control database to the global control database
          // you could package this as an assertion (can replicate)
          coux.post([testConfig.host, doc.control_database], 
            {"fizz":"buzz"}, function(err, fizz) {
            t.notOk(err, "test doc saved to users control database");
            setTimeout(function() {
              coux([testConfig.host, testConfig.admin_db, fizz.id], function(err, doc) {
                t.notOk(err, "fizz doc saved to global control database")
              })
            },500);
          });
        })
      })
    });
    
    test("quit", process.exit)
  })
})

