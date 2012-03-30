module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    test: {
      files: ['test/**/*.js']
    },
    lint: {
      files: ['grunt.js', 'lib/*.js', 'test/**/*.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'default'
    },
    jshint: {
      options: {
        curly : false,
        laxcomma : true,
        laxbreak : true,
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
        exports: true,
        $ : true,
        document : true,
        coux : true,
        Mustache : true,
        Backbone : true
      }
    }
  });

  // Default task.
  grunt.registerTask('default', 'lint test');

};