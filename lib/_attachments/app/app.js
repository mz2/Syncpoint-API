$(function() {
  // "/sp_config/_design/config/pages/index.html"
  var p = document.location.pathname.split('/')
    , design = [p[1], p[2], p[3]]
    ;

  // mustache style
  _.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
  };

  var configDb = Backbone.couch.db(p[1]);

  var App = Backbone.couch.Model.extend({
    _db: configDb,
    parse : function(data) {
      data.name = data.key;
      return data;
    }
  });
  
  var AppList = Backbone.couch.Collection.extend({
    model: App,
    _db: configDb,
    couch: function() {
      return {
        view: 'config/apps'
      };
    }
  });

  var ViewList = Backbone.couch.Collection.extend({
    model: App,
    _db: configDb,
    initialize : function(opts) {
      this.opts = opts;
    },
    couch: function() {
      return {
        view: this.opts.view
      };
    }
  });

  var AppListItemView = Backbone.View.extend({
    tagName: "li",
    template: Mustache.compile($('#app-list-item').html()),
    render: function() {
      this.$el.html(this.template(this.model.toJSON()))
      return this;
    }
  });

  var AppListView = Backbone.View.extend({
    tagName : 'ul',
    initialize: function() {
      _.bindAll(this, 'render');
      this.collection.bind('reset', this.render);
    },
    render : function() {
      _.each(this.collection.models, function(app) {
        this.$el.append(new AppListItemView({model : app}).render().el)
      }, this)
      return this;
    }
  });

  // Router
  var AppRouter = Backbone.Router.extend({

      routes:{
        "":"apps",
        "apps":"apps",
        "users/by-app/:id":"usersByApp"
      },
      
      // initialize : function() {
      // 
      // },
      
      apps:function () {
        console.log("apps!");
        var appList = new ViewList({view : 'config/apps'})
          , appListView = new AppListView({collection : appList})
          ;
        appList.fetch();
        $('#main-content').html(appListView.el);
      },

      usersByApp:function (id) {
        console.log("usersByApp", id)
        // get a view of the _users db, by apps
        var userList = new UserListByApp()
          , userListView = new UserListByAppView()
          ;
        
        // coux.get(['_users', '_design/syncpoint', '_view', 'by_app'], function(err, view) {
        //   var list = $("ul.view")
        //     , template = $('<li><span class="name"></span> - view channels or devices</li>');
        //   list.empty();
        //   view.rows.forEach(function(row) {
        //     var fragment = template.clone();
        //     fragment.find(".name").text(row.value);//.data("id", row.id);
        //     // fragment.find("[href=#app-users]").attr('href','#users/by-app/'+encodeURIComponent(row.id));
        //     list.append(fragment)
        //   });
        // })
        // group = true, count of users with external_id
      }
  });

  var app = new AppRouter();
  Backbone.history.start();


  
});


