var couchapp = require('couchapp'),
  path = require('path'),
  fs = require('fs'),
  ddoc;

ddoc = {
    _id: '_design/config', views: {}, lists: {}, shows: {}, sp_config : {}
};

module.exports = ddoc;

ddoc.views.byType = {
  map: function(doc) {
      if (doc.type) emit([doc.type, doc.state])
  },
  reduce: '_count'
}

ddoc.views.apps = {
  map: function(doc) {
    if(doc.type == 'app') {
      emit(doc.name);
    }
  }
}


// ddoc.validate_doc_update = function (newDoc, oldDoc, userCtx) {}

couchapp.loadAttachments(ddoc, path.join(__dirname, 'config'));
