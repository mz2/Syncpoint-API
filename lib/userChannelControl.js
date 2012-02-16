var coux = require('coux').coux,
    e = require('errLog').e,
    syncpointHelpers = require('./syncpointHelpers'),
    config, controlDb;

exports.bind = function(control, conf, ctrlDb) {
    config = conf;
    controlDb = ctrlDb;
    control.safe("channel","new", setupChannelDb);
};

function setupChannelDb(doc) {
    coux([config.host,"_uuids"], e(function(err, data) {
        doc.cloud_database = "channel-"+data.uuids[0];
        coux.put([config.host, doc.cloud_database], function(err, ok) {
            if (err && err.code != 412) {
                doc.error = err;
                doc.state == "error";
            } else {
                doc.state = "ready";
            }
            syncpointHelpers.addMemberToDatabase(doc.owner_id, [config.host, doc.cloud_database], e(function() {
                // todo nice way to have the "me" db encapuslated in these binders
                // eg like it was on the doc...
                coux.put([config.host, controlDb, doc._id], doc, e());
            }));
        });
    }));
}
