var test = require('tap').test,
  coux = require('coux').coux, 
  e = require('errLog').e,
  docstate = require('docstate'), 
  testConfig = require('./testConfig'), 
  userChannelControl = require('../lib/userChannelControl'),
  testDb = [testConfig.host, "test-control"],
  testTemplate = [testConfig.host, "test-template"];

function bindControlDb() {
  var control = docstate.control();
  userChannelControl.bindToControlDb("test-control", "test-app", testConfig);
  control.start();
  return coux.subscribeDb(testDb, function(change) {
    control.handle(change.doc);
  });
}

function createTemplate(cb) {
  coux.del(testTemplate, function() {
    coux.put(testTemplate, e(function() {
      coux.put(testTemplate.concat('test-doc'), {foobar: "ok"}, e(cb));
    }));
  });
}

function createDatabase(cb) {
  coux.del(testDb, function() {
    coux.put(testDb, e(cb));
  });
}



var changesPromise = false;
test('with a control database', function(test) {
  createDatabase(function() {
    coux(testDb, function(err, info) {
      test.ok(info.db_name == "test-control", "created control db");
      changesPromise = bindControlDb();
      test.end();
    });
  });
});
test('with a channel template', function(test) {
  createTemplate(function() {
    coux(testTemplate.concat('test-doc'), function(err, doc) {
      test.is(doc.foobar, "ok", "template should be synced");
      test.end();
    });
  });
});


var chId, cloudDb, newChannelDoc;
chId = false;
cloudDb = false;
newChannelDoc = {
  type: "channel",
  state: "new"
};
test("with a new channel document", function(test) {
  coux.post(testDb, newChannelDoc, function(err, ok) {
    chId = ok.id;
    test.ok(ok.id);
    test.end();
  });
});
test('should update the document', function(test) {
  coux.waitForDoc(testDb, chId, 1, function(err, doc) {
    test.is(doc.state, "ready");
    cloudDb = doc.cloud_database;
    test.end();
  });
});
test('should set up a cloud database', function(test) {
  coux([testConfig.host, cloudDb], function(err, info) {
    test.is(info.db_name, cloudDb, "cloud database");
    changesPromise.stop();
    test.end();
  });
});
// TODO
// test('should install the channel template', function(test) {
//   coux([testConfig.host, cloudDb, 'test-doc'], function(err, doc) {
//     test.is(doc.foobar, "ok", "template doc");
//     test.end();
//   });
// });
// TODO
// test('[pending] should add the user to the security object members list', function(test) {
//   coux([testConfig.host, cloudDb, '_security'], function(err, sec) {
//     test.ok(sec.members);
//     test.end();
//   });
// });
// todo test that replicating as the user works but replicating as someone else doesnt

test("quit", process.exit)
