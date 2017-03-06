(function(angular) {
  'use strict';

  angular.module('jabber')

  .directive('login', ['authService',
    function(authService) {
    return {
      replace: true,
      templateUrl: 'templates/login.html',
      link: function(scope, element) {
        const loginTypes = {
          user: 'user',
          guest: 'guest',
          create: 'create'
        };

        scope.form = {
          email: 'test@test.com',
          pass: 'test'
        };

        scope.loginType = 'none';
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