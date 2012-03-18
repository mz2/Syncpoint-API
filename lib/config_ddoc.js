exports.ddoc = {
    _id : '_design/config',
    views : {
        apps : function(doc) {
            if (doc.type == "application") {
                emit(doc.name)
            }
        }.toString()
    }
}