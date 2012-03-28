module.exports = {
    _id : '_design/handshake',
    views : {
        by_type : {
            map : function(doc) {
                if (doc.type) emit(doc.type, doc.state)
            }.toString()
        }
    }
}