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
      files: ['test/**/*.js','test/**/*.coffee']
    },
    lint: {
      files: ['grunt.js', 'lib/*.js', 'lib/design/*.js', 'lib/design/console/app/*.js', 'test/**/*.js']
    },
    watch: {
      files: ['<config:lint.files>', '<config:tap.files>'],
      tasks: 'default'
    },
    jshint: {
      options: {
        // curly : false,
        asi : true,
        eqeqeq: false,
        immed: true,
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

  grunt.registerMultiTask('tap', 'Run unit tests with tap.', function() {
    var done = this.async(),
      filepaths = grunt.file.expandFiles(this.file.src),
      log = process.env.TAP,
      tap = cp.spawn(path.join(__dirname,"node_modules","tap","bin","tap.js"),[log ? "--tap" : "","--timeout",20].concat(filepaths));
    // console.log("tap", filepaths)
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
  
  grunt.registerTask('couchapp', "Sync the Syncpoint admin couchapp", function() {
    var done = this.async(),
      task = this;
    syncpointConfig.load(function(err, config) {
      console.log("couchapp config", config)
      couchapp.createApp(syncpointHelpers.configDDoc(config), 
      [config.host, config.admin_db].join('/'), function(app) {
        app.sync(done)
      })
    })
  })
};