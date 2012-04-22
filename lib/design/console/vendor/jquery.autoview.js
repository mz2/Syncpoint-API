(function($) {
  $.autoview = $.autoview || {listenedIds : {}};
  $.fn.autoview = function(options, callback) {
    var el = this,
      node = el.id;
    
    function setupChangesListenerForNode(query, cb) {
      var db = query.join('/').split('/')[0];
      if ($.autoview.listenedIds[node]) {
        $.autoview.listenedIds[node].cb = cb;
      } else {
        $.autoview.listenedIds[node] = {cb:cb}; 
        // these should be removed when removed from the dom
        // currently we don't suport more than one active on the screen at a time
        // create listener for this db;
        coux.changes(db, function() {
          $.autoview.listenedIds[node].cb();
        });
      }
    }

    function runQueryAndDraw() {
      coux(options.query, function(err, data) {
        var k;
        if (options.data) {
          $.extend(data, options.data);
        }
        if (!err) {
          $(el).html(options.template.call(this, data));
        }
        if (callback) {
          callback.apply(el, [err, data])
        }
      });
    }
    
    runQueryAndDraw();
    if (options.changes) {
      setupChangesListenerForNode(options.query, runQueryAndDraw);      
    }

    return this;
  };
})($); // use $ here so we work with jQuery or Zepto
