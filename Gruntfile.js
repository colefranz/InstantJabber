module.exports = function(grunt) {

  grunt.initConfig({
    clean: ['app/dev'],

    uglify: {
      dev: {
        options: {
          beautify: true,
          mangle: false
        },
        files: {
          'app/dev/jabber.min.js': [
            'app/js/**/*.js'
          ]
        }
      }
    },

    less: {
      dev: {
        options: {
          compress: true,
          yuicompress: true,
          optimization: 2
        },
        files: {
          'app/dev/css/main.css': 'app/less/main.less',
          'app/dev/css/login.css': 'app/less/login.less',
          'app/dev/css/bootstrap.css': 'app/bower_components/bootstrap/less/bootstrap.less'
        }
      }
    },

    autoprefixer: {
      dev: {
        src: 'app/dev/css/main.css'
      }
    },

    shell: {
      mongodb: {
        command: 'mongod --dbpath=./data --port 27017',
        options: {
          async: true,
          stdout: false,
          stderr: true,
          failOnError: true
        }
      }
    },

    express: {
      dev: {
        options: {
          script: 'index.js'
        }
      }
    },

    watch: {
      options: {
        livereload: true
      },
      client: {
        files: ['app/**/*.js', 'app/**/*.html', '!app/dev/jabber.min.js'],
        tasks:  ['uglify']
      },
      express: {
        files:  ['server/**/*.js', '*.js'],
        tasks:  ['express:dev'],
        options: {
          spawn: false
        }
      },
      styles: {
        files: ['app/less/**/*.less'],
        tasks: ['less', 'autoprefixer'],
        options: {
          livereload: true
        }
      }
    }
  });

  // load plugins
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-shell-spawn');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // register tasks
  grunt.registerTask('serve', ['clean', 'uglify', 'less', 'autoprefixer', 'shell', 'express:dev', 'watch']);
  grunt.registerTask('cleanup', ['clean']);
};