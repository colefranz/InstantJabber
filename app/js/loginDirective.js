(function(angular) {
  'use strict';

  angular.module('jabber')

  .directive('login', ['$timeout', 'authService',
    function($timeout, authService) {
    return {
      replace: true,
      templateUrl: 'templates/login.html',
      link: function(scope, element) {
        const loginTypes = {
          user: 'user',
          guest: 'guest'
        };

        scope.loginType = 'none';
        scope.loginTypes = loginTypes;
        scope.isLoggedIn = false;

        scope.switchLogin = function(type) {
          scope.loginType = type;
        };

        scope.handleLoginAttempt = function() {
          authService.login({
            email: scope.email,
            pass: scope.pass
          });
        };

        function handleLoginStateChange(isLoggedIn) {
          $timeout(function() {
            scope.isLoggedIn = isLoggedIn;
            
            if (!isLoggedIn) {
              // handle failure
            }
          }, 0);

        }

        //initialize
        authService.registerLoginStateObserver(handleLoginStateChange);
      }
    }
  }]);
})(angular);