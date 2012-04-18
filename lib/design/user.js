module.exports = {
  _id : '_design/syncpoint',
  views : {
    by_app : {
      map : function(doc) {
        if (doc.app_id && doc.control_database) {
          emit(doc.app_id, {
            name : (doc.full_name || doc.name), 
            control_database : doc.control_database
          })
        }
      }.toString(),
      reduce : '_count'
    },
    webUsersToPair : {
      map : function(doc) {
        if ((doc.password || doc.password_sha || doc.oauth) &&
          !doc.control_database) {
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
