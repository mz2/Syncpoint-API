exports.ddoc = {
    _id : '_design/control',
    views : {
        by_type : {
            map : function(doc) {
                if (doc.type) emit(doc.type, doc.state)
            }.toString()
        }
    }
}