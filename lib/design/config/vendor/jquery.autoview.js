(function($) {
  $.autoview = $.autoview || {listenedDbs : {}};
  $.fn.autoview = function(options, callback) {
    var el = this;
    
    function setupChangesListenerForDatabase(query, cb) {
      var db = query.join('/').split('/')[0];
      if ($.autoview.listenedDbs[db]) {
        $.autoview.listenedDbs[db].cb = cb
      } else {
        $.autoview.listenedDbs[db] = {cb:cb}; 
        // these should be removed when removed from the dom
        // currently we don't suport more than one active on the screen at a time
        // create listener for this db;
        coux.changes(db, function() {
          $.autoview.listenedDbs[db].cb();
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
          $(el).html(options.template(data));
        }
        if (callback) {
          callback.apply(el, [err, data])
        }
      });
    }
    
    runQueryAndDraw();
    setupChangesListenerForDatabase(options.query, runQueryAndDraw);

    return this;
  };
})($); // use $ here so we work with jQuery or Zepto
