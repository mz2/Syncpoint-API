// This is bound to the handshake database
// we listen for requests for new sessions, and connect them to the correct per-user control channel
// 

var coux = require('coux').coux,
    e = require('errLog').e,
    syncpointHelpers = require('./syncpointHelpers'),
    userChannelControl = require('./userChannelControl'),
    config;

exports.bind = function(control, conf) {
    config = conf;
    control.safe("session-admin","approved", newSessionRequested);
}

function newSessionRequested(sessionDoc) {
  // todo validate sessionDoc.app_id
  console.log('newSessionRequested', sessionDoc._id)
  if (sessionDoc.user_id) {
    // bind to this user
    coux([config.host, config.users_db, sessionDoc.user_id], function(err, userDoc) {
        if (err) {
            console.log("user not found, can't activate session", sessionDoc.user_id);
        } else { // make one
          syncpointHelpers.activateSessionForUser(sessionDoc, userDoc, config);
        }
    });
  } else if (sessionDoc.user_full_name) {
    // create a user with this full name
    coux([config.host, "_uuids"], function(err, data) {
      var userId = data.uuids[0], userDoc = {
          _id : "org.couchdb.user:"+userId,
          app_id : sessionDoc.app_id,
          name : userId,
          full_name : sessionDoc.user_full_name,
          type : "user",
          state : "new",
          roles : []
        }
      ;
      console.log("making user: ", userDoc);
      syncpointHelpers.activateSessionForUser(sessionDoc, userDoc, config);      
    })
  }
}
