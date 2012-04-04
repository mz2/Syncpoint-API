var cp = require("child_process"),
  path = require('path');

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    tap: {
      files: ['test/**/*.js']
    },
    lint: {
      files: ['grunt.js', 'lib/*.js', 'lib/design/*.js', 'lib/design/config/app/*.js', 'test/**/*.js']
    },
    watch: {
      files: '<config:lint.files>',
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
      tap = cp.spawn(path.join(__dirname,"node_modules","tap","bin","tap.js"),["--timeout",2].concat(filepaths));
      
    tap.stdout.on('data', function (data) {
      console.log(""+data);
    });
    tap.stderr.on('data', function (data) {
      console.error('stderr: ' + data);
    });

    tap.on('exit', function (code) {
      if (code !== 0) {
        console.error('tap exited with code ' + code);        
      }
      done(code === 0)
    });
  });
};