// This module exports one function: start()
// 
// start() binds the changes listeners for a few different functionalities:
// 
// * On the users db, when we see a user has a control database, we trigger the listener on that user's control database
// * On the handshake database, we listen for requests for new sessions, and connect them to the correct per-user control channel. Currently we only bind one listener to the handshake database (the Facebook listner) but we plan to add more (Twitter, email, enterprise SSO, etc).

var sessionFromFacebook = require('./sessionFromFacebook')
  , sessionViaAdminConsole = require('./sessionViaAdminConsole')
    userChannelControl = require('./userChannelControl'),
    coux = require('coux').coux,
    docstate = require("docstate"),
    e = require('errLog').e;

function Syncpoint(config) {
    if (!(config.host && config.config_db && config.handshake_db && config.users_db)) {
        throw("config file must include host, config_db, handshake_db, and users_db")
    }
    
    function bindHandshakeDb() {
        var control = docstate.control();
        sessionFromFacebook.bind(control, config);
        //todo sessionFromEmail.bind(control, config);
        // todo make sessionFrom* into a plugin pattern
        control.start();
        console.log("listening for session handshakes");
        coux.subscribeDb(config.host + "/" + config.handshake_db, function(change) {
            control.handle(change.doc);
        });
    };
    
    function replicateToGlobalControl(db_name) {
      // todo use replicator db
      coux.put([config.host, '_replicator', 'global-'+db_name], {
        source : db_name
        , target : config.global_control_db
        , continuous : true
      }, function(err, ok) {
        
      });
    }
    
    function bindToExistingControlDatabases(cb) {
        coux([config.host, config.users_db, "_design/syncpoint", "_view", "by_app", {reduce : false}],
            e(function(err, view) {
            view.rows.forEach(function(row) {
                userChannelControl.bindToControlDb(row.value.control_database, row.key, config)
                replicateToGlobalControl(row.value.control_database)
            })
            cb(false)
        }))
    };

    function createUserDDoc(cb) {
        var ddoc = require('./design/user');
        coux.put([config.host, config.users_db, ddoc._id], ddoc, function(err, ok) {
            if (err && err.code != 409) {
                cb(err)
            } else {
                cb(false)
            }
        })
    }

    // ensure the users database exists
    function setupUserDb(cb) {
        coux.put([config.host, config.users_db], function() {
            createUserDDoc(cb);
        });
    }
    
    // ensure the handshake database exists
    function setupHandshakeDb(cb) {
        coux.put([config.host, config.handshake_db], function() {
            cb(false)
        });
    }

    function setupGlobalControl(cb) {
      coux.put([config.host, config.global_control_db], function() {
        var control_ddoc = require('./design/control');
        coux.put([config.host, config.global_control_db, control_ddoc._id], control_ddoc, function(err, ok) {
            if (err && err.code != 409) {
                cb(err)
            } else {
                cb(false)
            }
        })
      })
    }

    function createConfigDDoc(cb) {
      // todo use node-couchapp to push this, get attachments and stuff
        var ddoc = require('./design/config');
        coux.put([config.host, config.config_db, ddoc._id], ddoc, function(err, ok) {
            if (err && err.code != 409) {
                cb(err)
            } else {
                cb(false)
            }
        })
    }

    // ensure the config database exists
    function setupConfigDb(cb) {
        coux.put([config.host, config.config_db], function() {
            createConfigDDoc(cb)
        })
    };
    
    this.start = function(startedCb) {
      console.log("Syncpoint API listeners starting");
      setupConfigDb(function() {
        setupGlobalControl(function() {
          setupUserDb(function() {
            setupHandshakeDb(function() {
              bindToExistingControlDatabases(function() {
                bindHandshakeDb();
                if (startedCb) startedCb();
              });
            }); 
          });
        });
      });
    };
};

module.exports = Syncpoint;
