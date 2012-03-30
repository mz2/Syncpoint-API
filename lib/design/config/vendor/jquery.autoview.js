(function($) {
  $.fn.autoview = function(options, callback) {
    var el = this;
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
    return this;
  };
})($); // use $ here so we work with jQuery or Zepto
