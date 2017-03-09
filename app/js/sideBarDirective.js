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

        scope.addContactResponse = function(requester, acceptedRequest) {
          chatService.addContactResponse(requester, acceptedRequest);
        };

        scope.addContact = function() {
          chatService.addContactRequest(scope.contactEmail);
          scope.contactEmail = '';
          manageSentMessage();
        };

        // Get the name of the other person in the chat if there
        // is no name for the chat (only occurs if the chat has 2 people)
        scope.findChatName = function(chat) {
          var i,
              myID = authService.getUserID(),
              contactIDs = _.map(scope.contacts, function(contact) {
                return contact.id;
              });
          for (i = 0; i < chat.users.length; i++) {
            if (chat.users[i] !== myID) {
              return scope.contacts[contactIDs.indexOf(chat.users[i])].info.name;
            }
          }
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