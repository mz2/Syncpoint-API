// This is bound to the handshake database
// we listen for requests for new sessions, and connect them to the correct per-user control channel
// 

var coux = require('coux').coux,
    e = require('errLog').e,
    syncpointHelpers = require('../lib/syncpointHelpers'), 
    userChannelControl = require('../lib/userChannelControl'),
    config;


// we want to run on any user in the user's db that has 
// pairing_type == "web"
// and pairing_state = "new"


exports.bind = function(control, conf) {
    config = conf;
    control.safe("web","approved", newWebUserDoc);
}

function newWebUserDoc(doc) {
  // we need to create the control database
  // assign the app_id, and update the documemt
  doc.app_id = doc.app_id || "none";
  syncpointHelpers.activateWebUser(doc, config); 
}
