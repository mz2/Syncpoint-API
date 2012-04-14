var fs = require('fs'), path = require("path"), url = require("url"), 
  coux = require("coux").coux, e = require('errlog').e,
  configPath = path.join(__dirname, "..","config.json"),
  prompt = require('prompt');

function getConfig(config) {
  var uri = url.parse(config.host);
  uri.pathname = "/"+config.admin_db+"/_design/config/pages/index.html";
  delete uri.auth;
  config.console_url = url.format(uri);
  return config;
}


exports.load = function(cb) {
  var config, ok = false;
  fs.stat(configPath, function(err, ok) {
    if (err) { // lets prompt for the config
      promptForConfig(cb)
    } else {
      config = fs.readFileSync(configPath, "utf8");
      try {
        config = JSON.parse(config);
        ok = true;
      } catch (e) {
      }
      if (ok) {
        cb(false, getConfig(config));
      } else {
        cb(e, config);
      }
    }
  })
}

function writeConfigFile(config, cb) {
  fs.writeFile(configPath, JSON.stringify(config, null, 2), function (err) {
    if (err) {
      cb(err);
    } else {
      console.log('Config saved!');
      cb(false, getConfig(config));
    }    
  });
}

function ensureAdminCreds(basicURL, data, success) {
  coux([data.host, "_session"], function(err, sess) {
    if (err) {
      console.error(err)
      return;
    }
    if (sess.userCtx.name == null && sess.userCtx.roles[0] == "_admin") {
      console.log("Creating the adminstrator:"+ data.admin)
      coux.put([data.host, "_config", "admins", data.admin], data.password, function(err, ok) {
        if (!err) success()
      })
    } else { // not admin party, test the creds
      coux([basicURL, "_session"], function(err, sess) {
        if (err && err.error == "unauthorized") {
          console.log("Provided administrator credentials specified did not work. Please ensure they work and restart this process.")
        } else {
          success()
        }
      })
    }
  })
}

function promptForConfig(cb) {
  console.log("It looks like this is a fresh install of Syncpoint.")
  console.log("Help me fill out `config.json` by answering a few questions.")
  prompt.start();
  prompt.get([{
    "name" : "host",
    "message" : "The CouchDB host for Syncpoint (use https in production)",
    "default" : "http://localhost:5984"
  }, {
    "name" : "admin",
    "message" : "Syncpoint will create an admin if none exists, what name would you like to use",
    'default' : "Administrator"
  }, {
    "name" : "password",
    "hidden" : true,
    "empty" : false,
    "message" : "The password for the administrator. This will be stored in cleartext in `config.json`"
  }], function(err, data) {
    var basicURL = url.parse(data.host)
    basicURL.auth = [data.admin, data.password].join(':');
    basicURL = url.format(basicURL);
    
    ensureAdminCreds(basicURL, data, function() {
      coux([basicURL, "_config", "couch_httpd_auth","authentication_db"], e(function(err, authDb) {
        console.log("That's it for the hard stuff, feel free to hit <enter> for defaults on the rest.");
        prompt.get([{
          "name" : "admin_db",
          "message" : "Configuation database",
          "default" : "sp_config"
        },{
          "name" : "admin_db",
          "message" : "Aggregate database for control data",
          "default" : "sp_control"
        }], function(err, config) {
          config.host = basicURL;
          config.users_db = authDb;
          writeConfigFile(config, cb);
        })
      }))
    });
  })
}