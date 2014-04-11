/*global module:false*/
module.exports = function(grunt) {

  var os = require('os').platform(),
      cfg = {},
      path = require('path'),
      fs = require('fs'),
      rr = require('rimraf'),
      dist = path.join(__dirname,'..','dist',os),
      banner = '/**\\n * <%= pkg.name %> v<%= pkg.version %>\\n * Author: <%= pkg.author%>\\n * Built on <%= grunt.template.today("mm-dd-yyyy") %>\\n * Copyright (c) <%= grunt.template.today("yyyy") %>, Ecor Ventures, LLC. All Rights Reserved.\\n * http://ecorventures.com\\n */\\n';

  // Get list of minimatch patterns that should be excluded
  // from JSHint.
  var _jshint = {
    ignore: function() {
      var ignores = grunt.file.read('.jshintignore');
      console.log(ignores);
      if (ignores) {
        ignores = ignores.split( '\\n' )
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
    blah: function(){
      console.log('test');
    },
    pkg: require('./package.json'),
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    lint: {
      files: ['Gruntfile.js','bin/**/*.js', 'test/**/*.js']
    },
    jshint: {
      all: ['Gruntfile.js', 'test/**/*.js','/lib/**/*.js','/bin/**/*.js'],
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
    uglify: {},
    copy: {
      html: {
        expand: true,
        cwd: './',
        src: ['**.html','package.json'],
        dest: '../dist/'+os
      },
      extras: {
        expand: true,
        cwd: './lib/',
        src: ['css/fenix-embedded.css','css/font/**','icons/**'],
        dest: '../dist/'+os+'/lib'
      },
      resources: {
        expand: true,
        cwd: './lib/icons',
        src: ['fenix.png'],
        dest: '../dist/'+os+'/resources'
      }
    },
    concat: {},
    useminPrepare: {
      html: '../dist/'+os+'/*.html',
      options: {
        root: './',
        dest: '../dist/'+os
      }
    },
    usemin:{
      html: '../dist/'+os+'/*.html'
    },
    cssmin: {
      options: {
        dest: '../dist/'+os+'/lib/css/'
      }
    },
    nodewebkit: {
      options: {
        version: '0.9.2',
        build_dir: '../dist/'+os+'/build', // Where the build version of my node-webkit app is saved
        credits: './dist/'+os+'/credits.html',
        //mac_icns: './example/icon.icns', // Path to the Mac icon file
        mac: os === 'debian',
        win: os === 'win32',
        linux32: os === 'linux' && require('os').arch() === 'x32',
        linux64: os === 'linux' && require('os').arch() === 'x64',
      },
      src: ['../dist/'+os+'/**/*']
    }
  });

  grunt.task.registerTask('build-win32', 'Create a Windows distribution.', function(){
    grunt.log.writeln('Building Windows Installer'.cyan.bold);
  });

  grunt.task.registerTask('build-darwin', 'Create a Windows distribution.', function(){
    grunt.log.writeln('Building Mac OSX Installer'.cyan.bold);
  });

  grunt.task.registerTask('clean', 'Clean the build (remove).', function(){
    grunt.log.writeln(('\nRemoving '+os+' dist directory.').yellow.bold);
    if (fs.existsSync(dist)){
      rr.sync(dist);
    }
  });

  grunt.task.registerTask('dist-all', 'Create a Windows distribution.', function(){
    grunt.log.writeln('Create distribution directory.');
    fs.mkdirSync(dist);
//    fs.mkdirSync(path.join(dist,'resources'));
  });

  grunt.task.registerTask('removedev', 'Remove lingering development stuff.', function(){
    grunt.log.writeln('Remove development code.'.yellow.bold);
//    var async = this.asyn();
    grunt.log.writeln('Remove dev dependencies in package...'.yellow);
    var p = require('../dist/'+os+'/package.json');
    p.window.toolbar = false;
    p.hasOwnProperty('devDependencies') && delete p.devDependencies;
    fs.writeFileSync('../dist/'+os+'/package.json',JSON.stringify(p));
//    grunt.log.writeln('Remove .tmp directory...'.yellow);
//    if (fs.existsSync(path.join(__dirname,'.tmp'))){
//      rr.sync(path.join(__dirname,'.tmp'));
//    }
    if (os !== 'debian'){
      fs.unlinkSync(path.join(__dirname,'..','dist',os,'Credits.html'));
    }
  });

  grunt.task.registerTask('npminstall', 'Install dependencies.', function(){
    grunt.log.writeln('Installing node dependencies...'.yellow.bold);
    var async = this.async(), cwd = path.join(__dirname,'..','dist',os),
        exec = require('child_process').exec;
    exec('npm install --production',{cwd:cwd},function(){
      grunt.log.writeln('Compressing Dependencies...'.yellow);
      exec('npm dedupe',{cwd:cwd},function(){
        grunt.log.writeln('Cleaning up...'.yellow);
        if (fs.existsSync(path.join(cwd,'node_modules','.bin'))){
          grunt.log.writeln('Removing unnecessary binaries...'.yellow);
          rr.sync(path.join(cwd,'node_modules','.bin'));
        }
        grunt.log.writeln('Done'.grey.bold);
        async();
      });
    });
  });

  // Register generic tasks
  grunt.loadNpmTasks('grunt-node-webkit-builder');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-usemin');

  // Default task.
  grunt.registerTask('default',[
    'clean',
    'dist-all',
    'copy:html',
    'useminPrepare',
    'usemin',
    'cssmin',
    'concat',
    'copy:extras',
    //'copy:resources',
    'uglify',
    'removedev',
    'npminstall',
    //'nodewebkit',
    'build-'+os
  ]);
};
