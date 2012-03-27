// this module listens to the user control database and provisions channel databases
// remote mobile devices (or local administrators) create documents of type `channel` and state `new`.
// This module then creates the cloud database for the Syncpoint Channel and sets up security, then it updates the channel documents state to "ready".
// Once it is ready, remote clients can start syncing with it

var coux = require('coux').coux,
    docstate = require("docstate"),
    e = require('errLog').e,
    syncpointHelpers = require('./syncpointHelpers');

exports.bindToControlDb = function(controlDb, app_id, config) {
    function channelIsReady(doc) {
        coux.put([config.host, controlDb, doc._id], doc, e());
    };

    function setupChannelDb(doc) {
        coux([config.host,"_uuids"], e(function(err, data) {
            doc.cloud_database = "channel-"+data.uuids[0];
            doc.app_id = app_id;
            // create the database
            coux.put([config.host, doc.cloud_database], function(err, ok) {
                if (err && err.code != 412) {
                    doc.error = err;
                    doc.state == "error";
                } else {
                    doc.state = "ready";
                }
                // ensure security settings
                syncpointHelpers.addMemberToDatabase(doc.owner_id, 
                    [config.host, doc.cloud_database], e(function() {
                    // channel templates (eg for design docs)
                    if (config.channelTemplate) {
                        // replicate the database template to the new db
                        coux.post([config.host, "_replicate"], {
                            source : config.channelTemplate,
                            target : doc.cloud_database
                        }, e(channelIsReady, [doc]));            
                    } else {
                        channelIsReady(doc);
                    }
                }));
            });
        }));
    }
    
    var control = docstate.control();
    control.safe("channel","new", setupChannelDb);
    control.start();
    coux.subscribeDb(config.host + "/" + controlDb, function(change) {
        control.handle(change.doc);
    });
}


