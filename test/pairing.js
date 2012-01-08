var controller = require('../controller'),
    coux = require('coux').coux,
    assert = require("assert")
    docstate = require("docstate"),
    e = require('errLog').e;

// tests should also be capable of testing an erlang implementation
// eg: integration tests

function smallRand() {
    return Math.random().toString().substr(2,4);
};

var db = "http://localhost:5984/test-control";
// setup the database
coux.del(db, function() {
    coux.put(db, e(function() {
        // launch the controller engine
        controller.start({control:db, server : "http://localhost:5984"});
        console.log("started controller")
        // save doc for new device
        coux.post(db, {
            // _id : device_id,
            owner : "email@example.com",
            type : "device",
            state : "new",
            device_code : smallRand(),
            oauth_creds : { // we need better entropy
              consumer_key: smallRand(),
              consumer_secret: smallRand(),
              token_secret: smallRand(),
              token: smallRand()
            }
        }, e(function(err, ok) {
            console.log("created new device", ok.id)
            coux.post({url:db+"/_changes?filter=_doc_ids&since=1&include_docs=true&feed=longpoll", agent:false}, {"doc_ids": [ok.id]}, e(function(err, resp) {
                var doc = resp.results[0].doc;
                assert.equal(doc.state, "confirming")
                console.log("confirming device")
                // create a doc like we clicked confirm
                coux.post(db, {
                    type : "confirm",
                    state : "clicked",
                    device_code : doc.device_code, 
                    confirm_code : doc.confirm_code
                }, e(function(err, ok) {
                    console.log("confirmed device")
                    coux.post({url:db+"/_changes?filter=_doc_ids&since=3&include_docs=true&feed=longpoll", agent:false}, {"doc_ids": [ok.id]}, e(function(err, resp) {
                        var conf = resp.results[0].doc;
                        assert.equal(conf.state, "used")
                        console.log("confirm used")
                        coux.post({url:db+"/_changes?filter=_doc_ids&since=5&include_docs=true&feed=longpoll", agent:false}, {"doc_ids": [doc._id]}, e(function(err, resp) {
                            var doc = resp.results[0].doc;
                            console.log("device active")
                            assert.equal(doc.state, "active")
                            // check that the oauth creds work for replication...
                                // check the users database for the document for this user
                                var server = db.split('/');
                                server.pop(); server = server.join('/');
                                coux([server, '_users', "org.couchdb.user:"+doc.owner], e(function(err, info) {
                                    console.log(info)
                                }))
                                // create a private database and document for the user
                                // check to see that we can read it into a public 
                                // database via replication as the user
                        }));
                    }));     
                }))
            }))
        }));
    }))
});



// stub sending an email

// write validation doc

// ensure device can connect as user

// find patches that we need

