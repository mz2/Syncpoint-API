// this module listens to the user control database and provisions channel databases
// remote mobile devices (or local administrators) create documents of type `channel` and state `new`.
// This module then creates the cloud database for the Syncpoint Channel and sets up security, then it updates the channel documents state to "ready".
// Once it is ready, remote clients can start syncing with it

var coux = require('coux').coux,
    docstate = require("docstate"),
    e = require('errLog').e,
    syncpointHelpers = require('./syncpointHelpers');

exports.bindToControlDb = function(controlDb, app_id, config) {
  console.log("bindToControlDb: "+controlDb+" for app_id: "+app_id);
    function saveChannel(doc) {
        coux.put([config.host, controlDb, doc._id], doc, e());
    }
    
    function validateChannelRequest(doc, cb) {
      if (!(doc.owner_id && doc.name)) {
        doc.state = "error";
        doc.error = {"reason" : "channel must have owner_id and name"};
        saveChannel(doc);
        e()(doc.error);
      } else {
        // first check that name and owner_id is unique.
        coux([config.host, controlDb, "_design", "control", "_view", "channelsByUserAndName",{key : [doc.owner_id, doc.name]}], e(function(err, view) {
          var i, row;
          for (i=0; i < view.rows.length; i++) {
            row = view.rows[i];
            if (row.id !== doc._id) {
              doc.state = "error";
              doc.error = {"reason" : "channel with name "+doc.name+" and owner_id "+doc.owner_id+" already exists"};
              saveChannel(doc);
              e()(doc.error);
              return;
            } 
          }
          cb(); // OK
        }));
      }
    }
    
    function setupChannelDb(doc) {
      validateChannelRequest(doc, function() {
        coux([config.host,"_uuids"], e(function(err, data) {
            doc.cloud_database = "channel-"+data.uuids[0];
            doc.app_id = app_id;
            // create the database
            console.log("create channel",doc.cloud_database,"for user",doc.owner_id);
            coux.put([config.host, doc.cloud_database], function(err, ok) {
                if (err && err.code != 412) {
                    doc.error = err;
                    doc.state = "error";
                    saveChannel(doc)
                } else {
                    doc.state = "ready";
                    // ensure security settings
                    syncpointHelpers.addMemberToDatabase(doc.owner_id, 
                        [config.host, doc.cloud_database], e(function() {
                        // TODO channel templates (eg for design docs)
                        // TODO this needs app level config
                        if (false) {
                            // replicate the database template to the new db
                            coux.post([config.host, "_replicate"], {
                                source : config.channelTemplate,
                                target : doc.cloud_database
                            }, e(saveChannel, [doc]));            
                        } else {
                            saveChannel(doc);
                        }
                    }));
                }
            });
        }));
      });
    } // setupChannelDb
    
    var control = docstate.control();
    control.safe("channel","new", setupChannelDb);
    control.start();
    coux.subscribeDb(config.host + "/" + controlDb, function(change) {
        control.handle(change.doc);
    });
}


