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
    e = require('errLog').e;

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
coux.del(db, function() {
    coux.put(db, e(function() {
        // launch the Syncpoint API engine
        var syncpoint = new SyncpointAPI(testConfig);
        syncpoint.start();
        console.log("started API listeners")
        // save hanshake doc for new session
        var handshakeDoc = {
            oauth_creds : { // we need better entropy
              consumer_key: smallRand(),
              consumer_secret: smallRand(),
              token_secret: smallRand(),
              token: smallRand()
            },
           "type": "session-fb",
           "fb_access_token": "stubbed-token",
           "state": "new"
        };
        
        coux.post(db, handshakeDoc, e(function(err, ok) {
            console.log("created new handshake document", ok.id, "listening for changes on it");
            coux.log == ["post"];
            coux.post({url:db+"/_changes?filter=_doc_ids&since=1&include_docs=true&feed=longpoll", agent:false}, 
                {"doc_ids": [ok.id]}, e(function(err, resp) {
                    console.log(resp)
                var doc = resp.results[0].doc;
                assert.equal(doc.state, "active")
                console.log("active handshake")
                // check that the oauth creds work for replication...
                // check the users database for the document for this user
                var server = testConfig.apps['test-app'].host;
                coux([server, '_users', doc.session.user_id], e(function(err, user) {
                    console.log("user",user.full_name)
                    assert.equal(user.state, 'has-control')
                    assert.equal(user.oauth.consumer_keys[handshakeDoc.oauth_creds.consumer_key],
                        handshakeDoc.oauth_creds.consumer_secret)
                    coux([server, user.control_database], function(err, ok) {
                        assert(!err)
                        console.log('test successful')
                        process.exit()
                    })
                }))
            }))
        }));
    }))
});


