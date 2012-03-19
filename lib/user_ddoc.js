exports.ddoc = {
    _id : '_design/syncpoint',
    views : {
        control_dbs : {
            map : function(doc) {
                if (doc.control_database) emit(null, doc.control_database)
            }.toString()
        }
    }
}