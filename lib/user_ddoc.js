exports.ddoc = {
    _id : '_design/syncpoint',
    views : {
        control_dbs : {
            map : function(doc) {
                if (doc.control_database) emit(null, doc.control_database)
            }.toString()
        },
        by_app : {
            map : function(doc) {
                if (doc.app_id) emit(doc.app_id, doc.full_name || doc.name)
            }.toString()
            , reduce : '_count'
        }
    }
}
