// not currently used
// keeping it around because it has some code for email pairing we might want

var coux = require('coux').coux,
    e = require('errLog').e,
    config;

exports.bind = function(control, conf) {
    config = conf;
    control.safe("confirm","clicked", confirmClicked);
    control.safe("device", "confirmed", deviceConfirmed);
    // sends an email, not safe to run twice
    control.unsafe("device", "new", deviceNew);
};

function deviceNew(doc) {
    var confirm_code = Math.random().toString().split('.').pop(); // todo better entropy
    var link = config.control + "/_design/channels/verify.html#" + confirm_code;
    sendEmail(doc.owner, link, e(function() {
        doc.state = "confirming";
        doc.link = link;
        doc.confirm_code = confirm_code;
        coux.put([config.control, doc._id], doc, e());          
    }));
}

function confirmClicked(doc) {
    console.log("confirmClicked")
    var confirm_code = doc.confirm_code;
    var device_code = doc.device_code;
    // load the device doc with confirm_code == code
    // TODO use a real view
    coux([config.control, "_all_docs", {include_docs : true}], e(function(err, view) {
        var deviceDoc;
        view.rows.forEach(function(row) {
           if (row.doc.confirm_code && row.doc.confirm_code == confirm_code &&
               row.doc.device_code && row.doc.device_code == device_code &&
               row.doc.type && row.doc.type == "device") {
               deviceDoc = row.doc;
           }
        });
        if (deviceDoc && deviceDoc.state == "confirming") {
            deviceDoc.state = "confirmed";
            coux.put([config.control, deviceDoc._id], deviceDoc, e(function(err, ok) {
                doc.state = "used";
                coux.put([config.control, doc._id], doc, e());
            }));
        } else {
            doc.state = "error";
            doc.error = "no matching device";
            coux.put([config.control, doc._id], doc, e());
        }
    }));
}


function deviceConfirmed(deviceDoc) {
    var serverUrl = config.server;
   // ensure the user exists and make sure the device has a delegate on it
   // move device_creds to user document, so the device can use them to auth as the user
   ensureUserDoc(serverUrl, deviceDoc.owner, function(err, userDoc) {
       console.log("ensuredUserDoc")
       applyOAuth(userDoc, deviceDoc, serverUrl, e(function(err, userDoc) {
           if (err && err.error != 'modification_not_allowed') { // iris couch oauth workaround
               deviceDoc.state = "error";
               deviceDoc.error = err;
               coux.put([config.control, deviceDoc._id], deviceDoc, e());
           } else {
               if (userDoc) {
                   coux.put([serverUrl, "_users", userDoc._id], userDoc, e(function(err) {
                       deviceDoc.state = "active";
                       coux.put([config.control, deviceDoc._id], deviceDoc, e());
                   }))                    
               } else {
                   console.log("activateDeviceDoc")
                   deviceDoc.state = "active"; // security if it allows trival reuse of discarded deviceDocs to access accounts...?
                   coux.put([config.control, deviceDoc._id], deviceDoc, e());
               } // else we are done, applyOAuth had no work to do
           }
       }));
   });
}




function sendEmail(address, link, cb) {
    var email = {
        to : address,
        from : "jchris@couchbase.com",
        subject : 'Confirm Sync',
        body : 'To sync your phone with the sharing server, click this link:\n\n' 
        + link
    };
    console.log("sendEmail", email)
// how do we get an ack that that email was delivered?
    cb(false);
}


function ensureUserDoc(serverUrl, name, fun) {
    var user_doc_id = "org.couchdb.user:"+name;
    coux([serverUrl, "_users", user_doc_id], function(err, userDoc) {
        if (err && err.error == 'not_found') {
            fun(false, {
                _id : user_doc_id,
                type : "user",
                name : name,
                roles : []
            });
        } else if (err) {
            console.log("ensureUserDoc Err", err.stack)
        } else {
            fun(false, userDoc);
        }
    });
}
