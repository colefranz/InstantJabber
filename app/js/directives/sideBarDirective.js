(function(angular) {
  'use strict';

  angular.module('jabber')

  .directive('sideBar', ['$timeout', 'chatService', 'authService',
    function($timeout, chatService, authService) {
    return {
      replace: true,
      templateUrl: 'templates/directives/sideBar.html',
      link: function(scope) {
        const errorMessages = {
          missingEmail: 'Enter an email address.',
        };

        scope.accountDropdownVisible = false;
        scope.accountDropdownClass = 'dropdown';
        scope.addContactVisible = false;
        scope.contactEmail = '';
        scope.userName = chatService.getName();

        scope.errors = {
          contact: false
        };

        scope.toggleAccountDropdownVisibility = function() {
          scope.accountDropdownVisible = !scope.accountDropdownVisible;
          scope.addContactVisible = false;

          if (scope.accountDropdownVisible)
            scope.accountDropdownClass = 'dropup';
          else
            scope.accountDropdownClass = 'dropdown';
        };

        scope.toggleAddContactVisibility = function() {
          scope.addContactVisible = !scope.addContactVisible;
        };

        scope.showAddContacts = function() {
          scope.addContactVisible = true;
        };

        scope.addContactResponse = function(requester, acceptedRequest) {
          chatService.addContactResponse(requester, acceptedRequest);
        };

        scope.addContact = function() {
          resetErrors();
          scope.contactEmail = scope.contactEmail.trim();

          if (scope.contactEmail === '') {
            scope.errors.contact = Error(errorMessages.missingEmail);
            return;
          }

          chatService.addContactRequest(scope.contactEmail);
          scope.contactEmail = '';
          scope.toggleAddContactVisibility();
        };

        scope.logout = function() {
          authService.logout();
        };

        chatService.subcribeToChatUpdates(function(chat) {
          // toast notification or something
        });

        // Use false to clear current error.
        function Error(message) {
          return {
            cssClass: 'has-error',
            message: message
          };
        }

        function resetErrors() {
          scope.errors.contact = false;
        }
      }
    };
  }]);
})(angular);