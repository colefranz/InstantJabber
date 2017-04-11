(function(angular) {
  'use strict';

  angular.module('jabber')

  .directive('login', ['authService', 'loginUtils',
    function(authService, loginUtils) {
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

        authService.registerLoginStateObserver(function(isLoggedIn, data) {
          loginUtils.getCleanErrors();

          if (!isLoggedIn) {
            scope.errors.email = loginUtils.error('');

            if (data && data.message)
              scope.errors.password = loginUtils.error(data.message);

            $('#passwordTextBox').focus();
          }
        });

        scope.existingUserForm = {
          email: '',
          pass: ''
        };

        scope.loginType = loginTypes.none;
        scope.loginTypes = loginTypes;
        scope.errors = loginUtils.getCleanErrors();

        scope.resetLogin = function() {
          scope.switchLogin(scope.loginTypes.none);
        };

        scope.switchLogin = function(type) {
          scope.loginType = type;
          scope.errors = loginUtils.getCleanErrors();
          scope.existingUserForm.pass = '';
        };

        scope.handleLoginAttempt = function() {
          var controlToFocus = '';
          scope.errors = loginUtils.getCleanErrors();
          scope.existingUserForm.email = scope.existingUserForm.email.trim();

          if (!scope.existingUserForm.email) {
            scope.errors.email = loginUtils.error(loginUtils.errorMessages.missingEmail);
            controlToFocus = '#emailTextBox';
          }

          if (!scope.existingUserForm.pass) {
            scope.errors.password = loginUtils.error(loginUtils.errorMessages.missingPassword);
            if (!controlToFocus) controlToFocus = '#passwordTextBox';
          }

          if (controlToFocus)
          {
            $(controlToFocus).focus();
            return;
          }

          authService.login({
            id: scope.existingUserForm.email,
            pass: scope.existingUserForm.pass
          });
        };

        scope.createGuest = function() {
          authService.createGuest();
        };
      }
    }
  }]);
})(angular);