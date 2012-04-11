// MOCK the Facebook API

var sessionFromFacebook = require('../lib/sessionFromFacebook');
sessionFromFacebook._dependencies.getMeFromFB = function(code, cb) {
    console.log('getMeFromFB stubbed');
    assert.equal(code, "stubbed-token")
    var fixtureResponse = {
        name : "Mr. Miyagi",
        id : 123456789
    };
    cb(false, fixtureResponse);
};

// stuff we need for this script

var SyncpointAPI = require('../lib/syncpoint-api'),
    coux = require('coux').coux,
    assert = require("assert"),
    docstate = require("docstate"),
    tap = require("tap"), test = tap.test, plan = tap.plan,
    e = require('errLog').e;

// tests should also be capable of testing other implementations
// eg: integration tests

var testConfig = require('./testConfig');


function smallRand() {
    return Math.random().toString().substr(2,4);
}

var users_db = testConfig.host + '/' + testConfig.users_db;
// setup the database
var server = testConfig.host;

var handshakeId, pairingUserDoc, userControlDb;
coux.del(users_db, function() {
  var syncpoint = new SyncpointAPI(testConfig);
  syncpoint.start(function(err) {
    console.log("syncpoint started")
    test("should create the handshake db on the server", function(test) {
      coux(users_db, function(err, info) {
        console.log("handshake db info", info)
        test.ok(err === false)
        test.ok(info.db_name == testConfig.users_db)
        test.end()
      });
    });
    
    test("and a pairing user doc", function(test) {
        console.log("testing pairing user");
        var username = "test-fb-pairing", pairingUserDoc = {
          "_id": "org.couchdb.user:" + username,
          "name": username,
          "type": "user",
          "sp_oauth": {
            consumer_key: smallRand(),
            consumer_secret: smallRand(),
            token_secret: smallRand(),
            token: smallRand()
          },
          "pairing_state": "new", // only admin can write this
          "pairing_type": "session-fb",
          "pairing_token": "stubbed-token",
          "pairing_app_id": "test-app",
          "roles": [],
          "password": "Wax on"
        };
        coux.post(users_db, pairingUserDoc, function(err, ok) {
            test.ok(err===false)
            console.log("did handshake", ok._id);
            handshakeId = ok.id;
            test.end()
        })
    })
    test("when the doc is active", function(test) {
      console.log("wait for doc", handshakeId);
        coux.waitForDoc(users_db, handshakeId, 0, function(err, doc) {
          if (doc.pairing_state != "active") {
            console.log("skip doc", doc.pairing_state);
            return true;
          }
          console.log("got doc", doc._id);
            test.ok(err===false)
            test.is(doc.state,"active")
            pairingUserDoc = doc
            test.end()
        })
    })
    test("should update the user doc", function(test) {
        coux([server, testConfig.users_db, pairingUserDoc.user_id], e(function(err, user) {
            test.is(user.oauth.consumer_keys[pairingUserDoc.oauth_creds.consumer_key], pairingUserDoc.oauth_creds.consumer_secret, "installed oauth creds");
            test.ok(user.control_database, "user has control database")
            userControlDb = user.control_database;
            test.end()
        }))
    })
    test("should create the control database", function(test) {
        coux([server, userControlDb], function(err, ok) {
            test.ok(err===false)
            test.end()
        })
    })
    test("should install the control design doc", function(test) {
        coux([server, userControlDb, "_design/control"], function(err, doc) {
            test.ok(err===false)
            test.ok(doc.views)
            test.end()
        })
    })

    test("quit", process.exit)
    
  })
})

