(function(angular) {
  'use strict';

  angular.module('jabber')

  .directive('sideBar', ['$timeout', 'chatService', 'authService',
    function($timeout, chatService, authService) {
    return {
      replace: true,
      templateUrl: 'templates/sideBar.html',
      link: function(scope) {
        scope.accountDropdownVisible = false;
        scope.addContactVisible = false;
        scope.contactEmail = 'test1@test.com';

        scope.toggleAccountDropdownVisibility = function() {
          scope.accountDropdownVisible = !scope.accountDropdownVisible;
          scope.addContactVisible = false;
        };

        scope.toggleAddContactVisibility = function() {
          scope.addContactVisible = !scope.addContactVisible;
        };

        scope.showAddContacts = function() {
          scope.accountDropdownVisible = true;
          scope.addContactVisible = true;
        };

        scope.addContactResponse = function(requester, acceptedRequest) {
          chatService.addContactResponse(requester, acceptedRequest);
        };

        scope.addContact = function() {
          chatService.addContactRequest(scope.contactEmail);
          scope.contactEmail = '';
          manageSentMessage();
        };

        chatService.subcribeToMessages(function(message, chatID) {
          // toast notification or something
        });

        function manageSentMessage() {
          scope.sentMessageVisible = true;
          $timeout(function() {
            scope.sentMessageVisible = false;
          }, 2000);
        }
      }
    };
  }]);
})(angular);