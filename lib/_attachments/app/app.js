$(function() {
  // /sp_config/_design/config/pages/index.html
  var p = document.location.pathname.split('/')
    , design = [p[1], p[2], p[3]]
    ;

    coux(design, function(err, doc) {
      var config = doc.sp_config
        , usersByAppView = [config.users_db, '_design/syncpoint', '_view', 'by_app']
        , SyncpointRouter = Backbone.Router.extend({
          routes : {
            "" : "appsWithUserCount"
            , "apps" : "appsWithUserCount"
            , "users" : "allUsersWithApp"
            , "users/by-app/:id" : "usersByApp"
            , "channels" : "allChannels"
            , "channels/by-app/:id" : "channelsByApp"
            , "channels/by-user/:id" : "channelsByUser"
          }
          , appsWithUserCount : function() {
            $('#main-content').autoview({
              query : usersByAppView.concat({limit : 100, group : true})
              , template : function(data) {
                data.rows.forEach(function(row) {
                  row.users = row.value == 1 ? "user" : "users";
                });
                return Mustache.render($('#appsWithUserCount').html(), data);
              }
            })
          }
          , allUsersWithApp : function() {
            $('#main-content').autoview({
              query : usersByAppView.concat({limit : 100, reduce : false})
              , template : Mustache.compile($('#allUsersWithApp').html())
            })
          }
          , usersByApp : function(id) {
            $('#main-content').autoview({
              query : usersByAppView.concat({limit : 100, reduce : false, key : id})
              , template : Mustache.compile($('#usersByApp').html())
              , data : {app_id : id}
            })
          }
          , allChannels : function() {
            $('#main-content').autoview({
              query : [config.global_control_db, "_design/control", "_view", "by_type", {key : "channel", include_docs : true}]
              , template : Mustache.compile($('#allChannels').html())
            })
          }
          , channelsByApp : function(id) {
            $('#main-content').autoview({
              query : [config.global_control_db, "_design/control", "_view", "channelsByApp", {key : id, include_docs : true}]
              , template : Mustache.compile($('#channelByApp').html())
              , data : {app_id : id}
            })
          }
          , channelsByUser : function(id) {
            $('#main-content').autoview({
              query : [config.global_control_db, "_design/control", "_view", "channelsByUser", {key : id, include_docs : true}]
              , template : Mustache.compile($('#channelByUser').html())
              , data : {user_id : id}
            })
          }
      });
      var app = new SyncpointRouter();
      Backbone.history.start();
    });
});
