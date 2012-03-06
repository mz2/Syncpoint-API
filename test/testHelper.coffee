coux = require('coux').coux

exports.waitForDoc = (db, id, seq, cb) ->
  couxOpts = 
    url : db+"/_changes?filter=_doc_ids&since="+seq+"&include_docs=true&feed=longpoll"
    agent : false
  coux.post couxOpts, {"doc_ids": [ id]}, (err, resp) ->
    cb(err, resp.results[0].doc)
