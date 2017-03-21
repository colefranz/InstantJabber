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
            name: 'Existing user',
            description: 'Already have an account? Sign in here using your email and password.',
            button: 'Sign in'
          },
          guest: {
            type: 'guest',
            name: 'Guest',
            description: 'Join a chat without creating an account. Your discussions will not be saved.',
            button: 'Sign in as a guest'
          },
          create: {
            type: 'create',
            name: 'New user',
            description: 'Don\'t have an account? Creating a new account is quick and simple.',
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