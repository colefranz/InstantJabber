(function(angular) {
  'use strict';

  angular.module('jabber')

  .factory('loginUtils', [function() {
    const errorMessages = {
      missingName: 'Enter your name.',
      missingEmail: 'Enter your email address.',
      missingPassword: 'Enter your password.',
      missingPasswordNewAccount: 'Enter a password.',
      missingConfirmPassword: 'Confirm your password by typing it again.',
      passwordMismatch: 'The passwords do not match.',
      passwordComplexity: 'Passwords must be at least 8 characters long and contain at least one capital letter, one lowercase letter and one number or symbol.',
      emailTaken: 'An account with this email address already exists.'
    };

    function error(message) {
      return {
        cssClass: 'has-error',
        message: message
      };
    }

    function getCleanErrors() {
      return {
        name: false,
        email: false,
        password: false,
        confirmPassword: false
      };
    }

    return {
      errorMessages: errorMessages,
      error: error,
      getCleanErrors: getCleanErrors
    };
  }]);
})(angular);