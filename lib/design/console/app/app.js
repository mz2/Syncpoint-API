$(function() {
  // /sp_admin/_design/console/index.html
  var p = document.location.pathname.split('/'), 
    design = [p[1], p[2], p[3]];

    function activateMenu(section) {
      $("ul.nav li").removeClass("active");
      $("ul.nav li").has('[href=#'+section+']').addClass('active');
    }

    function checkIsAdmin(cb) {
      coux(["_session"], function(err, session) {
        if (err) {
          console.error(err)
        } else {
          if (session.userCtx.roles.indexOf("_admin") == -1) {
            // not an admin, need to login
            cb("please login as an admin", session)
          } else {
            // an admin, let's rock
            cb(false, session);
          }
        }
      })
    }
    
    function bootstrapApp() {
      bootstrapBackbone(function(err, config) {
        pairingQueue(config)
      });
    }
    
    function pairingQueue(config) {
      var consolePairingDiv = $("<div/>"),
      webPairingDiv = $("<div/>");
      consolePairingDiv.autoview({
        changes : true,
        query : [
          config.users_db, "_design","syncpoint", "_view", "byPairingTypeAndState", 
          {key : ["console","new"], include_docs : true}
        ],
        data : {view : "console"},
        template : Mustache.compile($('#newConsolePairing').html())
      });
      webPairingDiv.autoview({
        changes : true,
        query : [
          config.users_db, "_design","syncpoint", "_view", "webUsersToPair", 
          {include_docs : true}
        ],
        data : config,
        template : Mustache.compile($('#newWebUser').html())
      });
      $('#pairing-queue').empty().append(consolePairingDiv).append(webPairingDiv);
    }
    
    function bootstrapBackbone(cb) {
      coux(design, function(err, doc) {
        cb(err, doc.sp_config);
        var config = doc.sp_config,
          usersByAppView = [config.users_db, '_design','syncpoint', '_view', 'by_app'],
          SyncpointRouter = Backbone.Router.extend({
            routes : {
              "" : "allUsersWithApp",
              "users" : "allUsersWithApp",
              "users/by-app/:id" : "usersByApp",
              "apps" : "appsWithUserCount",
              "sessions/verify/:id" : "verifySession",
              "channels" : "allChannels",
              "channels/by-app/:id" : "channelsByApp",
              "channels/by-user/:id" : "channelsByUser",
              "devices/for-user/:id" : "devicesForUser",
              "pairing/web/:id" : "approveWebUser"
            },
            devicesForUser : function(id) {
              activateMenu("users");
              $('#main-content').autoview({
                query : [config.users_db, id],
                data : config,
                template : function(doc) {
                  var k, devices = [], source = doc.oauth && doc.oauth.devices;
                  if (source) {
                    for (k in source) {
                      if (source.hasOwnProperty(k)){
                        devices.push({name : k, key : source[k][0], token : source[k][1]})
                      }
                    }
                    var data = $.extend({},{
                      devices : devices
                    }, doc, config);
                    return Mustache.render($('#devicesForUser').html(), data);
                  } else {
                    return "<h3>no devices</h3>"
                  }
                }
              });
            },
            appsWithUserCount : function() {
              activateMenu("apps");
              $('#main-content').autoview({
                query : usersByAppView.concat({limit : 100, group : true}),
                template : function(data) {
                  data.rows.forEach(function(row) {
                    row.users = row.value == 1 ? "user" : "users";
                  });
                  return Mustache.render($('#appsWithUserCount').html(), data);
                }
              })
            },
            allUsersWithApp : function() {
              activateMenu("users");
              $('#main-content').autoview({
                query : usersByAppView.concat({limit : 100, reduce : false, include_docs : true}),
                template : Mustache.compile($('#allUsersWithApp').html())
              })
            },
            approveWebUser : function(id) {
              activateMenu("users");
              $("#main-content").autoview({
                query : [config.users_db, id],
                template : Mustache.compile($('#approveWebUser').html())
              }, function(err, doc) {
                var el = $(this);
                el.find('form').submit(function() {
                  doc.pairing_type = "web";
                  doc.pairing_state = "approved";
                  coux.put([config.users_db, id], doc, function(err, ok) {
                    if (!err) {
                      // console.log("approved session")
                      app.navigate("users", {trigger : true})
                    }
                  })
                  return false;
                });
              })
            },
            verifySession : function(id) {
              activateMenu("users");
              $('#main-content').autoview({
                query : [config.users_db, id],
                template : Mustache.compile($('#verifySession').html())
              }, function(err, doc) {
                var el = $(this);
                el.find("button.yes").click(function() {
                  el.find(".pair-user").show();
                })
                el.find('a[href=#pick]').click(function() {
                  el.find(".create-user").hide();
                  el.find(".pick-user").show();
                  // get user list
                  coux([config.users_db, "_design","syncpoint", "_view", "by_app", {reduce : false}], function(err, resp) {
                    var list = Mustache.compile($('#usersForPairing').html())(resp);
                    el.find(".pick-user").append(list);
                    el.find(".pick-user ul a").click(function() {
                      el.find(".pick-user form input").val(this.href);
                      return false;
                    });
                  });
                  return false;
                })
                el.find('a[href=#create]').click(function() {
                  el.find(".pick-user").hide();
                  el.find(".create-user").show();
                  return false;
                })
                el.find(".create-user form").submit(function() {
                  var name = $(this).find('input').val();
                  // add user's real name
                  doc.pairing_full_name = name;
                  doc.pairing_state = "approved";
                  console.log("doc", doc)
                  coux.post([config.users_db], doc, function(err, ok) {
                    if (!err) {
                      app.navigate("users", {trigger : true})
                    }
                  });
                  // on the backend when we see the user_id is null, we create a user with the name
                  return false;
                })
                el.find(".pick-user form").submit(function() {
                  var user_id = $(this).find('input').val();
                  // add user's real name
                  doc.owner_id = user_id;
                  doc.pairing_state = "approved";
                  coux.post([config.users_db], doc, function(err, ok) {
                    if (!err) {
                      // console.log("approved session")
                      app.navigate("users", {trigger : true})
                    }
                  });
                  // add user's id, update doc state to approved
                  // on the backend we provision the control database if needed, etc
                  return false;
                })
              })
            },
            usersByApp : function(id) {
              activateMenu("users");
              $('#main-content').autoview({
                query : usersByAppView.concat({limit : 100, reduce : false, key : id}),
                template : Mustache.compile($('#usersByApp').html()),
                data : {app_id : id, users_db : config.users_db}
              })
            },
            allChannels : function() {
              activateMenu("channels");
              $('#main-content').autoview({
                query : [config.admin_db, "_design","control", "_view", "by_type", {key : "channel", include_docs : true}],
                data : config,
                template : Mustache.compile($('#allChannels').html())
              })
            },
            channelsByApp : function(id) {
              activateMenu("channels");
              $('#main-content').autoview({
                query : [config.admin_db, "_design","control", "_view", "channelsByApp", {key : id, include_docs : true}],
                template : Mustache.compile($('#channelByApp').html()),
                data : $.extend({}, {app_id : id}, config)
              });
            },
            channelsByUser : function(id) {
              activateMenu("channels");
              $('#main-content').autoview({
                query : [config.admin_db, "_design","control", "_view", "channelsByOwnerAndState", {key : [id, "ready"], include_docs : true}],
                template : Mustache.compile($('#channelByUser').html()),
                data : $.extend({}, {user_id : id}, config)
              })
            }
        });
        var app = new SyncpointRouter();
        Backbone.history.start();
      });
    }

    checkIsAdmin(function(err, userCtx) {
      if (err) {
        $('#main-content').html('<h1>Please <a href="/_utils/index.html" target="_new">log in as an admin</a> to use the console</h1>');
      } else {
        bootstrapApp()
      }
    });
    
});
