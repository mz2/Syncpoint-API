// This module exports one function: start()
// 
// start() binds the changes listeners for a few different functionalities:
// 
// * On the users db, when we see a user has a control database, we trigger the listener on that user's control database
// * On the handshake database, we listen for requests for new sessions, and connect them to the correct per-user control channel. Currently we only bind one listener to the handshake database (the Facebook listner) but we plan to add more (Twitter, email, enterprise SSO, etc).

var pairViaFacebook = require('../plugins/pairViaFacebook'),
  pairViaAdminConsole = require('../plugins/pairViaAdminConsole'),
  userChannelControl = require('./userChannelControl'),
  syncpointHelpers = require('./syncpointHelpers'),
  coux = require('coux'),
  couchapp = require('couchapp'),
  docstate = require("docstate"),
  e = require('errLog').e;

function Syncpoint(config) {
    if (!(config.host && config.admin_db && config.users_db)) {
        throw("config file must include host, admin_db, and users_db")
    }
    
    function bindUserDb() {
      // todo this binds to the user db and looks for user docs with
      // the expect properties
      var control = docstate.control();
        //todo sessionFromEmail.bind(control, config);
        // todo make sessionFrom* into a plugin pattern
        control._getState = function(doc, cb) {
          if (doc.pairing_state) cb(doc.pairing_state);
        };
        control._getType = function(doc, cb) {
          if (doc.pairing_type) cb(doc.pairing_type);
        };
        pairViaFacebook.bind(control, config);
        pairViaAdminConsole.bind(control, config);
        control.start();
        console.log("listening for pairing users at ", config.host + "/" + config.users_db);
        coux.subscribeDb(config.host + "/" + config.users_db, function(change) {
          // console.log("bindUserDb", change.doc._id, change.doc.pairing_type, change.doc.pairing_state)
          control.handle(change.doc);
        });
    }

    function bindToExistingControlDatabases(cb) {
      coux([config.host, config.users_db, "_design/syncpoint", "_view", "by_app", {reduce : false}],
      e(function(err, view) {
        view.rows.forEach(function(row) {
          userChannelControl.bindToControlDb(row.value.control_database, row.key, config)
          syncpointHelpers.replicateToGlobalControl(row.value.control_database, config)
        })
        cb()
      }))
    }


    // ensure the users database exists
    function setupUserDb(cb) {
      coux.put([config.host, config.users_db], function() {
        couchapp.createApp(require('./design/user'), 
          [config.host, config.users_db].join('/'), function(app) {
            app.push(cb)
        })
      })
    }

    function setupGlobalControl(cb) {
      coux.put([config.host, config.admin_db], function() {
        couchapp.createApp(require('./design/control'), 
          [config.host, config.admin_db].join('/'), function(app) {
            app.push(cb)
        })
      })
    }

    function createConfigDDoc(cb) {
      couchapp.createApp(syncpointHelpers.configDDoc(config),
        [config.host, config.admin_db].join('/'), function(app) {
          app.push(cb)
      })
    }

    // ensure the config database exists
    function setupConfigDb(cb) {
        coux.put([config.host, config.admin_db], function(err) {
          if (err && err.error != "file_exists") {
            console.error(err)
          } else {
            createConfigDDoc(cb)            
          }
        })
    }
    
    function validateServerConfig(cb) {
      coux.put([config.host, "_config","couch_httpd_oauth","use_users_db"], "true", function(err) {
        if (err) {
          console.log("can't validateServerConfig, am I an admin? You can check at " +
            config.host + "_session");
        } else {
          cb();
        }
      });
    }    
    
    this.start = function(startedCb) {
      validateServerConfig(function() {
        setupConfigDb(function() {
          setupGlobalControl(function() {
            setupUserDb(function() {
              console.log("Syncpoint API listeners starting");
              bindToExistingControlDatabases(function() {
                bindUserDb();
                if (startedCb) {startedCb()}
              });
            });
          });
        });
      });
    }
}

module.exports = Syncpoint;
