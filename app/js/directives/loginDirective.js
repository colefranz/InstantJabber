(function(angular) {
  'use strict';

  angular.module('jabber')

  .directive('login', ['authService',
    function(authService) {
    return {
      replace: true,
      templateUrl: 'templates/directives/login.html',
      link: function(scope, element) {
        const loginTypes = {
          user: {
            type: 'user',
            name: 'Existing users',
            description: 'Already have an account? Sign in here.',
            button: 'Sign in'
          },
          guest: {
            type: 'guest',
            name: 'Guests',
            description: 'Join a chat without creating an account.',
            button: 'Sign in as a guest'
          },
          create: {
            type: 'create',
            name: 'New users',
            description: 'Don\'t have an account? Create one here.',
            button: 'Sign up'
          },
          none: {
            type: 'none',
            name: '',
            description: '',
            button: ''
          }
        };

        scope.form = {
          email: 'test@test.com',
          pass: 'test'
        };

        scope.loginType = loginTypes.none;
        scope.loginTypes = loginTypes;
        
        scope.switchLogin = function(type) {
          scope.loginType = type;
        };

        scope.handleLoginAttempt = function() {
          authService.login({
            id: scope.form.email,
            pass: scope.form.pass
          });
        };

        scope.handleCreateAttempt = function() {
          authService.create({
            id: scope.form.email,
            pass: scope.form.pass,
            name: scope.form.name
          });
        };
      }
    }
  }]);
})(angular);