var cp = require("child_process"),
  syncpointHelpers = require('./lib/syncpointHelpers'),
  syncpointConfig = require("./lib/syncpointConfig"),
  couchapp = require('couchapp'),
  path = require('path');

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    tap: {
      files: ['test/**/*']
    },
    lint: {
      files: ['grunt.js', 'lib/*.js', 'plugins/*.js', 'lib/design/*.js', 'lib/design/console/app/*.js',
      'lib/design/console/vendor/jquery.autoview.js', 'lib/design/console/vendor/jquery.coux.js',  'test/**/*.js']
    },
    "push" : {
      files : ['lib/design/console/**/*']
    },
    watch: {
      files: ['<config:lint.files>', '<config:tap.files>', '<config:push.files>'],
      tasks: 'default_dev'
    },
    jshint: {
      options: {
        curly : false,
        asi : true,
        eqeqeq: false,
        immed: false,
        latedef: false,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        couch : true,
        eqnull: true,
        node: true
      },
      globals: {
        $ : true,
        document : true,
        coux : true,
        Mustache : true,
        Backbone : true
      }
    }
  });

  // Default task.
  
  grunt.registerTask('default', 'lint tap');
  grunt.registerTask('default_dev', 'lint couchapp tap');
  grunt.registerTask('cwatch', 'couchapp watch');


  grunt.registerMultiTask('tap', 'Run unit tests with tap.', function() {
    var done = this.async(),
      filepaths = grunt.file.expandFiles(this.file.src),
      tap,
      cmdargs = ["--timeout",20];
    if (process.env.TAP) cmdargs.push("--tap");
    tap = cp.spawn(path.join(__dirname,"node_modules","tap","bin","tap.js"),
      cmdargs.concat(filepaths));
    tap.stdout.on('data', function (data) {
      var string = ""+data;
        console.log(string.replace(/^\s*|\s*$/g, ''));
    });
    tap.stderr.on('data', function (data) {
      var log = data.replace ? data.replace(/^\s*|\s*$/g, '') : data;
      console.log("e: "+log);
    });

    tap.on('exit', function (code) {
      if (code !== 0) {
        console.error('tap exited with code ' + code)
      }
      done(code === 0)
    });
  });
  
  grunt.registerTask('couchapp', "Sync the Syncpoint Admin Console couchapp", function() {
    var done = this.async(),
      task = this;
    syncpointConfig.load(function(err, config) {
      console.log("couchapp config", config)
      couchapp.createApp(syncpointHelpers.configDDoc(config), 
      [config.host, config.admin_db].join('/'), function(app) {
        app.push(done)
      })
    })
  })
};