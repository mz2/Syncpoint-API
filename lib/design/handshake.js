module.exports = {
    _id : '_design/handshake',
    views : {
        byTypeAndState : {
            map : function(doc) {
                if (doc.type) emit([doc.type, doc.state])
            }.toString()
        }
    }
}