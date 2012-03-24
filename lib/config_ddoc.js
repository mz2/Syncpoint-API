var couchapp = require('couchapp')
    , path = require('path')
    , ddoc
    ;

exports.app = ddoc;

ddoc = {
    _id: '_design/config'
  , views: {}
  , lists: {}
  , shows: {} 
}

module.exports = ddoc;

ddoc.views.byType = {
  map: function(doc) {
      if (doc.type) emit([doc.type, doc.state])
  },
  reduce: '_count'
}

ddoc.views.apps = {
  map: function(doc) {
    if(doc.type == 'application') {
      emit(doc.name);
    }
  }
}


// ddoc.validate_doc_update = function (newDoc, oldDoc, userCtx) {}

couchapp.loadAttachments(ddoc, path.join(__dirname, '_attachments'));
