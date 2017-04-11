(function(angular) {
  'use strict';

  angular.module('jabber')

  .directive('newAccountForm', [ 'authService', 'loginUtils',
    function(authService, loginUtils) {
    return {
      attribute: 'E',
      replace: false,
      templateUrl: 'templates/directives/newAccountForm.html',
      scope: {
        onCancel: '&',
        accountAction: '@'
      },
      link: function(scope) {
        scope.visibility = {
          upgradeFromGuest: false
        };

        scope.fields = {
          name: '',
          email: '',
          pass: '',
          confirmPass: ''
        };

        scope.errors = loginUtils.getCleanErrors();

        authService.registerLoginStateObserver(function(isLoggedIn, data) {
          loginUtils.getCleanErrors();

          if (!isLoggedIn) {
            scope.errors.email = loginUtils.error(loginUtils.errorMessages.emailTaken);
            $('#regEmailTextBox').focus();
          }
        });

        scope.handleCreateAttempt = function() {
          var controlToFocus = '';
          loginUtils.getCleanErrors();

          scope.fields.name = scope.fields.name.trim();
          scope.fields.email = scope.fields.email.trim();

          if (!scope.fields.name) {
            scope.errors.name = loginUtils.error(loginUtils.errorMessages.missingName);
            controlToFocus = '#regNameTextBox';
          }

          if (!scope.fields.email) {
            scope.errors.email = loginUtils.error(loginUtils.errorMessages.missingEmail);
            if (!controlToFocus) controlToFocus = '#regEmailTextBox';
          }

          if (!scope.fields.pass) {
            scope.errors.password = loginUtils.error(loginUtils.errorMessages.missingPasswordNewAccount);
            if (!controlToFocus) controlToFocus = '#regPasswordTextBox';
          }

          if (scope.fields.pass && !authService.passwordMeetsComplexityRequirements(scope.fields.pass)) {
            scope.errors.password = loginUtils.error(loginUtils.errorMessages.passwordComplexity);
            if (!controlToFocus) controlToFocus = '#regPasswordTextBox';
          }

          if (scope.fields.pass && !scope.fields.confirmPass) {
            scope.errors.confirmPassword = loginUtils.error(loginUtils.errorMessages.missingConfirmPassword);
            if (!controlToFocus) controlToFocus = '#regConfirmPasswordTextBox';
          }

          if ((scope.fields.pass !== '' ||
            scope.fields.confirmPass !== '') &&
            scope.fields.pass !== scope.fields.confirmPass) {
            scope.errors.confirmPassword = loginUtils.error(loginUtils.errorMessages.passwordMismatch);
            if (!scope.errors.password) scope.errors.password = loginUtils.error('');
            if (!controlToFocus) controlToFocus = '#regConfirmPasswordTextBox';
          }

          if (controlToFocus !== '') {
            $(controlToFocus).focus();
            return;
          }

          authService.handleAccountAction(scope.accountAction, {
            id: scope.fields.email,
            pass: scope.fields.pass,
            name: scope.fields.name,
            guestID: authService.getUserID()
          });
        };

      }
    };
  }]);
})(angular);