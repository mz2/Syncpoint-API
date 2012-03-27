var couchapp = require('couchapp')
    , path = require('path')
    , fs = require('fs')
    , ddoc
    , config = JSON.parse(fs.readFileSync(path.join(__dirname, "..","config.json"), "utf8"))
    ;

// exports.app = ddoc;

ddoc = {
    _id: '_design/config'
  , views: {}
  , lists: {}
  , shows: {}
  , sp_config : {}
};

['config_db', 'handshake_db', 'users_db', 'global_control_db'].forEach(function(key) {
  ddoc.sp_config[key] = config[key];
})

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

couchapp.loadAttachments(ddoc, path.join(__dirname, '_attachments'));
