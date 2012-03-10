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

var SyncpointAPI = require('../lib/syncpoint-api'),
    coux = require('coux').coux,
    assert = require("assert")
    docstate = require("docstate"),
    e = require('errLog').e,
    testHelper = require('./testHelper')
    ;

// tests should also be capable of testing other implementations
// eg: integration tests

var testConfig = {
    "apps" : {
        "test-app" : {
            "host" : "http://localhost:5984",
            "handshake-db" : "test-handshake"
        }
    }
}

function smallRand() {
    return Math.random().toString().substr(2,4);
};

var db = testConfig.apps['test-app'].host + '/' + testConfig.apps['test-app']["handshake-db"];
// setup the database
var server = testConfig.apps['test-app'].host;

describe("pairing with facebook", function() {
    var handshakeId, handshakeDoc, userControlDb;
    it("with a handshake db", function() {
        coux.del(db, function() {
            coux.put(db, function(err, ok) {
                expect(err).toEqual(false)
                expect(ok.ok).toEqual(true)
                var syncpoint = new SyncpointAPI(testConfig);
                syncpoint.start();
                console.log("syncpoint started")
                asyncSpecDone()
            })
        })
        asyncSpecWait()
    })
    it("and a handshake doc", function() {
        var handshakeDoc = {
            oauth_creds : {
              consumer_key: smallRand(),
              consumer_secret: smallRand(),
              token_secret: smallRand(),
              token: smallRand()
            },
           "type": "session-fb",
           "fb_access_token": "stubbed-token",
           "state": "new"
        };
        coux.post(db, handshakeDoc, function(err, ok) {
            expect(err).toEqual(false)
            handshakeId = ok.id;
            asyncSpecDone()
        })
        asyncSpecWait()
    })
    it("when the doc is active", function() {
        testHelper.waitForDoc(db, handshakeId, 1, function(err, doc) {
            expect(err).toEqual(false)
            expect(doc.state).toEqual("active")
            handshakeDoc = doc
            asyncSpecDone()
        })
        asyncSpecWait()
    })
    it("should update the user doc", function() {
        coux([server, '_users', handshakeDoc.user_id], e(function(err, user) {
            console.log("user",user.full_name)
            expect(user.state).toEqual('has-control')
            expect(user.oauth.consumer_keys[handshakeDoc.oauth_creds.consumer_key])
                .toEqual(handshakeDoc.oauth_creds.consumer_secret);
            expect(user.control_database).toBeDefined()
            userControlDb = user.control_database;
            asyncSpecDone()
        }))
        asyncSpecWait()
    })
    it("should create the control database", function() {
        coux([server, userControlDb], function(err, ok) {
            expect(err).toEqual(false)
            asyncSpecDone()
        })
        asyncSpecWait()
    })
    
})

