// This module exports one function: start()
// 
// start() binds the changes listeners for a few different functionalities:
// 
// * On the users db, when we see a user has a control database, we trigger the listener on that user's control database
// * On the handshake database, we listen for requests for new sessions, and connect them to the correct per-user control channel. Currently we only bind one listener to the handshake database (the Facebook listner) but we plan to add more (Twitter, email, enterprise SSO, etc).

var sessionFromFacebook = require('./sessionFromFacebook')
  , sessionViaAdminConsole = require('./sessionViaAdminConsole')
  , userChannelControl = require('./userChannelControl'),
    coux = require('coux').coux,
    couchapp = require('couchapp'),
    docstate = require("docstate"),
    e = require('errLog').e;

function Syncpoint(config) {
    if (!(config.host && config.config_db && config.handshake_db && config.users_db)) {
        throw("config file must include host, config_db, handshake_db, and users_db")
    }
    
    function bindHandshakeDb() {
        var control = docstate.control();
        sessionFromFacebook.bind(control, config);
        sessionViaAdminConsole.bind(control, config);
        //todo sessionFromEmail.bind(control, config);
        // todo make sessionFrom* into a plugin pattern
        control.start();
        console.log("listening for session handshakes");
        coux.subscribeDb(config.host + "/" + config.handshake_db, function(change) {
            control.handle(change.doc);
        });
    }
    
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
        cb()
      }))
    }


    // ensure the users database exists
    function setupUserDb(cb) {
      couchapp.createApp(require('./design/user'), 
        [config.host, config.users_db].join('/'), function(app) {
          app.push(cb) // deploy map reduce etc
      })
    }
    
    // ensure the handshake database exists
    function setupHandshakeDb(cb) {
        coux.put([config.host, config.handshake_db], function() {
          var handshake = require('./design/handshake');
          coux.put([config.host, config.handshake_db, handshake._id], handshake, function(err, ok) {
            if (err && err.error !== "conflict") {
                  console.log(err)
                  console.trace("halting")
              } else {
                  cb()
              }
          })
        });
    }

    function setupGlobalControl(cb) {
      coux.put([config.host, config.global_control_db], function() {
        var control_ddoc = require('./design/control');
        coux.put([config.host, config.global_control_db, control_ddoc._id], control_ddoc, function(err, ok) {
          if (err && err.error !== "conflict") {
              console.log(err)
              console.trace("halting")
            } else {
                cb()
            }
        })
      })
    }

    function createConfigDDoc(cb) {
      couchapp.createApp(require('./design/config')
        , [config.host, config.config_db].join('/')
        , function(app) {
          app.push(cb)
      })
    }

    // ensure the config database exists
    function setupConfigDb(cb) {
        coux.put([config.host, config.config_db], function(err) {
          if (err) {
            console.log(err)
            return
          }
            createConfigDDoc(cb)
        })
    }
    
    this.start = function(startedCb) {
      console.log("Syncpoint API listeners starting");
      setupConfigDb(function() {
        setupGlobalControl(function() {
          setupUserDb(function() {
            setupHandshakeDb(function() {
              bindToExistingControlDatabases(function() {
                bindHandshakeDb();
                if (startedCb) {startedCb()}
              });
            }); 
          });
        });
      });
    }
}

module.exports = Syncpoint;
