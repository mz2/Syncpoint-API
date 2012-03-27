$(function() {
  // "/sp_config/_design/config/pages/index.html"
  var p = document.location.pathname.split('/')
    , design = [p[1], p[2], p[3]]
    ;

  var SyncpointRouter = Backbone.Router.extend({
      routes : {
        "" : "allApps"
        , "apps" : "allApps"
        , "apps/count-users" : "appsWithUserCount"
        , "users/by-app/:id" : "usersByApp"
      }
      , allApps : function () {
        console.log("apps!");
        $('#main-content').draw({
          query : design.concat("_view", "apps", {limit : 100}),
          template : Mustache.compile($('#app-list').html())
        })
      }
      , usersByApp : function (id) {
        console.log("usersByApp", id)
        $('#main-content').draw({
          query : [
            '_users', '_design/syncpoint'
            , '_view', 'by_app', {
                limit : 100
              , reduce : false
            }]
          , template : Mustache.compile($('#user-list').html())
        })
      }
      , appsWithUserCount : function (id) {
        console.log("usersByApp", id)
        $('#main-content').draw({
          query : [
            '_users', '_design/syncpoint'
            , '_view', 'by_app', {
                limit : 100
              , group : true
            }]
          , template : Mustache.compile($('#app-list-with-count').html())
        })
      }
  });

  var app = new AppRouter();
  Backbone.history.start();
});
