module.exports = function(grunt) {

  grunt.initConfig({
    express: {
      dev: {
        options: {
          script: 'index.js'
        }
      }
    },

    uglify: {
      dev: {
        files: {
          'app/jabber.min.js': [
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
          'app/css/styles.css': 'app/less/main.less',
          'app/css/bootstrap.css': 'app/bower_components/bootstrap/less/bootstrap.less',
        }
      }
    },

    autoprefixer: {
      dev: {
        src: 'app/css/main.css'
      }
    },

    watch: {
      options: {
        livereload: true
      },
      express: {
        files:  ['app/**/*.js'],
        tasks:  ['uglify', 'express:dev'],
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

  // register tasks
  grunt.registerTask('serve', ['uglify', 'less', 'autoprefixer', 'express:dev', 'watch']);
};