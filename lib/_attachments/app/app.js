$(function() {
  // /sp_config/_design/config/pages/index.html
  var p = document.location.pathname.split('/')
    , design = [p[1], p[2], p[3]]
    , usersByAppView = ['_users', '_design/syncpoint', '_view', 'by_app']
    ;

  var SyncpointRouter = Backbone.Router.extend({
      routes : {
        "" : "appsWithUserCount"
        , "apps" : "appsWithUserCount"
        , "users" : "allUsersWithApp"
        , "users/by-app/:id" : "usersByApp"
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
  });

  var app = new SyncpointRouter();
  Backbone.history.start();
});
