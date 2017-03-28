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
          missingName: 'Enter your name.',
          missingEmail: 'Enter your email address.',
          missingPassword: 'Enter your password.',
          missingPasswordNewAccount: 'Enter a password.',
          missingConfirmPassword: 'Confirm your password by typing it again.',
          incorrectPassword: 'The email or password is incorrect.',
          passwordMismatch: 'The passwords do not match.',
          passwordComplexity: 'Passwords must be at least 8 characters long and contain at least one capital letter, one lowercase letter and one number or symbol.',
          emailTaken: 'An account with this email address already exists.'
        };

        scope.existingUserForm = {
          email: '',
          pass: ''
        };

        scope.newUserForm = {
          name: '',
          email: '',
          pass: '',
          confirmPass: ''
        };

        scope.loginType = loginTypes.none;
        scope.loginTypes = loginTypes;
        
        scope.errors = {
          name: false,
          email: false,
          password: false,
          confirmPassword: false
        };

        authService.registerLoginStateObserver(function(isLoggedIn) {
          resetErrors();

          if (!isLoggedIn) {
            if (scope.loginType === scope.loginTypes.user) {
              scope.errors.email = Error('');
              scope.errors.password = Error(errorMessages.incorrectPassword);
              $('#passwordTextBox').focus();
            } else {
              scope.errors.email = Error(errorMessages.emailTaken);
              $('#regEmailTextBox').focus();
            }
          }
        });

        scope.switchLogin = function(type) {
          scope.loginType = type;
          resetErrors();
          scope.newUserForm.pass = '';
          scope.newUserForm.confirmPass = '';
          scope.existingUserForm.pass = '';
        };

        scope.handleLoginAttempt = function() {
          var controlToFocus = '';
          resetErrors();
          scope.existingUserForm.email = scope.existingUserForm.email.trim();

          if (!scope.existingUserForm.email) {
            scope.errors.email = Error(errorMessages.missingEmail);
            controlToFocus = '#emailTextBox';
          }
          
          if (!scope.existingUserForm.pass) {
            scope.errors.password = Error(errorMessages.missingPassword);
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

        scope.handleCreateAttempt = function() {
          var controlToFocus = '';
          resetErrors();
          
          scope.newUserForm.name = scope.newUserForm.name.trim();
          scope.newUserForm.email = scope.newUserForm.email.trim();

          if (!scope.newUserForm.name) {
            scope.errors.name = Error(errorMessages.missingName);
            controlToFocus = '#regNameTextBox';
          }

          if (!scope.newUserForm.email) {
            scope.errors.email = Error(errorMessages.missingEmail);
            if (!controlToFocus) controlToFocus = '#regEmailTextBox';
          }

          if (!scope.newUserForm.pass) {
            scope.errors.password = Error(errorMessages.missingPasswordNewAccount);
            if (!controlToFocus) controlToFocus = '#regPasswordTextBox';
          }

          if (scope.newUserForm.pass && !authService.passwordMeetsComplexityRequirements(scope.newUserForm.pass)) {
            scope.errors.password = Error(errorMessages.passwordComplexity);
            if (!controlToFocus) controlToFocus = '#regPasswordTextBox';
          }

          if (scope.newUserForm.pass && !scope.newUserForm.confirmPass) {
            scope.errors.confirmPassword = Error(errorMessages.missingConfirmPassword);
            if (!controlToFocus) controlToFocus = '#regConfirmPasswordTextBox';
          }

          if ((scope.newUserForm.pass !== '' ||
            scope.newUserForm.confirmPass !== '') &&
            scope.newUserForm.pass !== scope.newUserForm.confirmPass) {
            scope.errors.confirmPassword = Error(errorMessages.passwordMismatch);
            if (!scope.errors.password) scope.errors.password = Error('');
            if (!controlToFocus) controlToFocus = '#regConfirmPasswordTextBox';
          }

          if (controlToFocus !== '') {
            $(controlToFocus).focus();
            return;
          }

          authService.create({
            id: scope.newUserForm.email,
            pass: scope.newUserForm.pass,
            name: scope.newUserForm.name
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
          scope.errors.name = false;
          scope.errors.email = false;
          scope.errors.password = false;
          scope.errors.confirmPassword = false;
        }
      }
    }
  }]);
})(angular);