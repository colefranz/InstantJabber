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

        const errorMessages = {
          missingEmail: 'Enter your email address.',
          missingPassword: 'Enter your password.',
          incorrectPassword: 'The email or password is incorrect.'
        };

        scope.existingUserForm = {
          email: 'test@test.com',
          pass: 'test'
        };

        scope.loginType = loginTypes.none;
        scope.loginTypes = loginTypes;
        
        scope.errors = {
          email: false,
          password: false
        };

        authService.registerLoginStateObserver(function(isLoggedIn) {
          resetErrors();

          if (!isLoggedIn) {
            scope.errors.email = Error('');
            scope.errors.password = Error(errorMessages.incorrectPassword);
            $('#passwordTextBox').focus();
          }
        });

        scope.switchLogin = function(type) {
          scope.loginType = type;
          resetErrors();
        };

        scope.handleLoginAttempt = function() {
          var controlToFocus = '';
          resetErrors();

          if (!scope.existingUserForm.email.trim()) {
            scope.errors.email = Error(errorMessages.missingEmail);
            controlToFocus = '#emailTextBox';
          }
          
          if (!scope.existingUserForm.pass) {
            scope.errors.password = Error(errorMessages.missingPassword);
            if (!controlToFocus)
              controlToFocus = '#passwordTextBox';
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

        scope.handleCreateAttempt = function() {
          authService.create({
            id: scope.existingUserForm.email,
            pass: scope.existingUserForm.pass,
            name: scope.existingUserForm.name
          });
        };

        // Use false to clear current error.
        function Error(message) {
          return {
            cssClass: 'has-error',
            message: message
          };
        }

        function resetErrors() {
          scope.errors.email = false;
          scope.errors.password = false;
        }
      }
    }
  }]);
})(angular);