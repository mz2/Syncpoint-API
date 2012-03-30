var testConfig = require('./testConfig');

var coux = require('coux').coux
    , SyncpointAPI = require('../lib/syncpoint-api')
    ;

exports.bootstrap = {
  setUp : function(done) {
    // delete test databases so we can ensure they are created
    var syncpoint = new SyncpointAPI(testConfig);
    coux.del([testConfig.host, testConfig.config_db], function() {
        coux.del([testConfig.host, testConfig.handshake_db], function() {
          syncpoint.start(done);
        })
    })
  },
  'create the config database': function(t) {
    coux([testConfig.host, testConfig.config_db], function(err, ok) {
      t.expect(1)
        t.ok(ok.db_name, "config db exists")
        t.done()
    })
  },
  "create the config db design doc" : function(t) {
    coux([testConfig.host, testConfig.config_db, "_design/config"], function(err, doc) {
        t.ok(doc.views, "config ddoc exists")
        t.done()
    })
  },
  "create the users_db design doc" : function(t) {
    coux([testConfig.host, testConfig.users_db, "_design/syncpoint"], function(err, doc) {
        t.ok(doc.views, "users ddoc exists")
        t.done()
    })
  },
  'create the handshake database' : function(t) {
    coux([testConfig.host, testConfig.handshake_db], function(err, ok) {
        t.ok(ok.db_name, "handshake db exists")
        t.done()
    })
  }
}
