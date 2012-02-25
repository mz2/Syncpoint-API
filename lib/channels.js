// todo this is obsolete
var config;

exports.bind = function(control, conf){
    config = conf;
    control.safe("channel", "new", newChannel);
    return control;
};

function newChannel(doc) {
    var db_name = "channel-"+doc._id;
    
    function channelIsReady() {
        doc.state = "ready";
        doc.syncpoint = serverUrl + '/' + db_name;
        coux.put([cloudControl, doc._id], doc, function(err, ok) {
            if (err) console.error(err);
        })
    }

    function channelIsSecured() {
        if (config.channelTemplate) {
            // replicate the database template to the new db
            coux.post([config.host, "_replicate"], {
                source : config.channelTemplate,
                target : db_name
            }, e(channelIsReady));            
        } else {
            channelIsReady();
        }
    }

    if (doc["public"]) {
        console.log("PDI","please implement public databases")
    } else {
        // create database
        coux.put([config.host, db_name], function(err, resp) {
            if (err && err.code != 412) { // 412 means the db already exists
                doc.state = "error";
                doc.error = err;
                coux.put([cloudControl, doc._id], doc, function(err, ok) {
                    if (err) console.error(err);
                });
                console.log(err, resp);
            } else {
                // set up creds
                syncpointHelpers.addMemberToDatabase(doc.owner_id, 
                    [config.host, db_name], e(channelIsSecured));
            }
        });
    }
}