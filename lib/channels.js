
exports.bind = function(control){
    control.safe("channel", "new", newChannel);
    return control;
};

function findServerUrl(config) {
    var cloudControl = config['cloud-control']
        , cloudDesign = config['cloud-design']
        , d = cloudControl.split('/');
    d.pop();
    return d.join('/');
};


function newChannel(doc) {
    var db_name = "db-"+doc._id;
    if (doc["public"]) {
        console.log("PDI","please implement public databases")
    } else {
        coux.put([serverUrl, db_name], function(err, resp) {
            if (err) {
                // 412 means the db already exists
                doc.state = "error";
                doc.error = err;
                coux.put([cloudControl, doc._id], doc, function(err, ok) {
                    if (err) console.error(err);
                })
                console.log(err, resp);
            } else {
                // only set up creds the first time
                coux([serverUrl, db_name, "_security"],function(err, sec) {
                    if (err) {sec = {members:{names:[],roles:[]}}}
                    if (sec.members.names.indexOf(doc.owner) == -1) {
                        sec.members.names.push(doc.owner);
                        coux.put([serverUrl, db_name, "_security"], sec, e(function(err, sec) {
                            // replicate the design docs to the new db
                            coux.post([serverUrl, "_replicate"], {
                                source : cloudDesign,
                                target : db_name
                            }, e(function(err, ok) {
                                doc.state = "ready";
                                doc.syncpoint = serverUrl + '/' + db_name;
                                coux.put([cloudControl, doc._id], doc, function(err, ok) {
                                    if (err) console.error(err);
                                })
                            }))
                        }));
                    }
                });
            }
        });
    }
}