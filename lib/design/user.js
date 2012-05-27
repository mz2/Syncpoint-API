module.exports = {
  _id : '_design/syncpoint',
  views : {
    by_app : {
      map : function(doc) {
        if (doc.app_id && doc.control_database) { // multi channel mode
          emit(doc.app_id, {
            name : (doc.full_name || doc.name), 
            control_database : doc.control_database
          })
        } else if (doc.app_id && doc.channel_database) { // single channel mode
          emit(doc.app_id, {
            name : (doc.full_name || doc.name), 
            channel_database : doc.channel_database
          })
        }
      }.toString(),
      reduce : '_count'
    },
    webUsersToPair : {
      map : function(doc) {
        if ((doc.password || doc.password_sha || doc.oauth) &&
          !(doc.control_database || doc.channel_database) && !doc.pairing_type) {
            emit(doc.name, doc.roles)
        }
      }.toString()
    },
    byPairingTypeAndState : {
        map : function(doc) {
            if (doc.pairing_type) {
              emit([doc.pairing_type, doc.pairing_state])              
            }
        }.toString()
    }
  }
}
