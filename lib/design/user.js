exports.ddoc = {
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
            }.toString()
            , reduce : '_count'
        }
    }
}
