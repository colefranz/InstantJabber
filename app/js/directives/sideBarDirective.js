(function(angular) {
  'use strict';

  angular.module('jabber')

  .directive('sideBar', ['$timeout', 'chatService', 'authService',
    function($timeout, chatService, authService) {
    return {
      replace: true,
      templateUrl: 'templates/directives/sideBar.html',
      link: function(scope) {
        scope.accountDropdownVisible = false;
        scope.accountDropdownClass = 'dropdown';
        scope.addContactVisible = false;
        scope.contactEmail = 'test1@test.com';
        scope.userName = chatService.getName();

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

        scope.logout = function() {
          authService.logout();
        };

        chatService.subcribeToChatUpdates(function(chat) {
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