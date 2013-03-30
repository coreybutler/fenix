/*global module:false*/
module.exports = function(grunt) {

  var cfg = {},
      nodewebkit = '0.4.2';

  // Get list of minimatch patterns that should be excluded
  // from JSHint.
  var _jshint = {
    ignore: function() {
      var ignores = grunt.file.read('.jshintignore');
      console.log(ignores);
      if (ignores) {
        ignores = ignores.split( '\n' )
          .filter(function(_ignore) {
            return !!_ignore.trim();
          })
          .map(function(_ignore){
            if (_ignore.slice(-3) === '.js') {
              return '!' + _ignore;
            }
            if (_ignore.slice(-1) !== '/') {
              _ignore += '/';
            }
            return '!' + _ignore + '**/*.js';
          });

          _jshint.ignore = function () { return ignores; };
          return ignores;
      }
      return [];
    }
  };

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('./src/package.json'),
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    jshint: {
      all: ['Gruntfile.js', '/lib/**/*.js'],
      options: {
        "curly": true,
        "eqnull": true,
        "eqeqeq": true,
        "undef": true,
        "devel": true,
        "node": true,
        "nomen": false,
        "globalstrict": false,
        "strict": false,
        "globals": {}
      },
      globals: {}
    },
    clean: {
      stage: ["./_tmp/","./bin/*.nw"],
      release: ["./bin/win/", "./bin/mac/","./bin/linux/","./bin/*.nw"],
      mac: ["./bin/mac/","./bin/*.nw"],
      linux: ["./bin/linux/64","./bin/linux/32","./bin/*.nw"],
      win: ["./bin/linux/win","./bin/*.nw"]
    },
    uglify: {
      options: {
        mangle: true,
        compress: true,
        preserveComments: false
      },
      fenix: {
        files: {
          './_tmp/lib/servers.js': ['./_tmp/lib/servers.js'],
          './_tmp/lib/ui.js': ['./_tmp/lib/ui.js']
        }
      }
    },
    cssmin:{
      fenix: {
        files: {
          './_tmp/resources/css/main.css': ['./_tmp/resources/css/main.css']
        }
      }
    },
    copy: {
      fenix: {
        files: [
          {expand: true, cwd: './src/resources', src:['**'], dest: './_tmp/resources'},
          {expand: true, cwd: './src/lib', src:['*.*'], dest: './_tmp/lib'},
          {expand: true, cwd: './src/node_modules', src:['**'], dest: './_tmp/node_modules'},
          {expand: true, cwd: './src', src:['*.html','*.json','LICENSE'], dest: './_tmp/'}
        ]
      },
      mac: {
        files: [
          {expand: true, cwd: './_node-webkit/mac/'+nodewebkit+'/node-webkit.app/', src:['**'], dest: './bin/mac/fenix.app/'},
          {expand: true, cwd: './bin', src:['fenix.nw'], dest: './bin/mac/fenix.app/Contents/Resources/'}
        ]
      }
    },
    compress:{
      fenix: {
        options:{
          archive: './bin/fenix.nw',
          mode: 'tar'
        },
        files:[
          {expand: true, cwd: './_tmp', src:['**'], dest: '/'}
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-compress');

  // Default task.
  grunt.registerTask('default', 'copy');
  grunt.registerTask('shrink', 'uglify:fenix','cssmin:fenix');
  grunt.registerTask('build', 'Building Fenix', ['clean:stage', 'copy:fenix', 'uglify:fenix', 'cssmin:fenix', 'compress:fenix']);
  grunt.registerTask('mac', 'Building Mac OSX App', ['clean:mac','uglify:fenix','cssmin:fenix', 'compress:fenix', 'copy:mac']);
  //compress:fenix
};