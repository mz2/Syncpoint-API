// "/sp_config/_design/config/pages/starter-template.html"
var p = document.location.pathname.split('/')
  , design = [p[1], p[2], p[3]]
  ;

// Router
var AppRouter = Backbone.Router.extend({

    routes:{
        "":"apps",
        "apps":"apps",
        "users/by-app/:id":"usersByApp"
    },

    apps:function () {
      console.log("apps!")
      coux.get(design.concat("_view", "apps"), function(err, view) {
        console.log(view)
        var list = $("ul.view"), template = $('<li><span class="name">Name</span> - View <a href="#app-users">users</a> or <a href="#app-channels">channels</a>.</li>');
        list.empty();
        view.rows.forEach(function(row) {
          var fragment = template.clone();
          fragment.find(".name").text(row.key);//.data("id", row.id);
          fragment.find("[href=#app-users]").attr('href','#users/by-app/'+encodeURIComponent(row.id));
          fragment.appendTo(list);
        });
      });
    },

    usersByApp:function (id) {
      console.log("usersByApp", id)
      // get a view of the _users db, by apps
      coux.get(['_users', '_design/syncpoint', '_view', 'by_app'], function(err, view) {
        var list = $("ul.view")
          , template = $('<li><span class="name"></span> - view channels or devices</li>');
        list.empty();
        view.rows.forEach(function(row) {
          var fragment = template.clone();
          fragment.find(".name").text(row.value);//.data("id", row.id);
          // fragment.find("[href=#app-users]").attr('href','#users/by-app/'+encodeURIComponent(row.id));
          list.append(fragment)
        });
      })
      // group = true, count of users with external_id
    }
});

var app = new AppRouter();
Backbone.history.start();

