(function(angular) {
  'use strict';

  angular.module('jabber')

  .directive('sideBar', ['$timeout', 'chatService',
    function($timeout, chatService) {
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

        scope.addContactResponse = function(requester, acceptedRequest) {
          chatService.addContactResponse(requester, acceptedRequest);
        };

        scope.addContact = function() {
          chatService.addContactRequest(scope.contactEmail);
          scope.contactEmail = '';
          manageSentMessage();
        };

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