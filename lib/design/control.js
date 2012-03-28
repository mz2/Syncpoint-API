exports.ddoc = {
    _id : '_design/control',
    views : {
        by_type : {
            map : function(doc) {
                if (doc.type) emit(doc.type, doc.state)
            }.toString()
        },
        channelsByApp : {
          map : function(doc) {
            if (doc.type == 'channel' && doc.app_id) {
              emit(doc.app_id)
            }
          }.toString()
        },
        channelsByUser : {
          map : function(doc) {
            if (doc.type == 'channel' && doc.owner_id) {
              emit(doc.owner_id)
            }
          }.toString()
        }
    }
}