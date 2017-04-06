(function(angular) {
  'use strict';

  angular.module('jabber')

  .directive('sideBar', ['$timeout', 'chatService', 'authService', 'socketService',
    function($timeout, chatService, authService, socketService) {
    return {
      replace: true,
      templateUrl: 'templates/directives/sideBar.html',
      link: function(scope) {
        const errorMessages = {
          missingEmail: 'Enter an email address.',
        };

        var socket = socketService.get(),
          userInfo = chatService.getUserInfo(),
          userOptions = chatService.getUserOptions(),
          userID = chatService.getUserID();

        scope.accountDropdownVisible = false;
        scope.accountDropdownClass = 'dropdown';
        scope.addContactVisible = false;
        scope.contactEmail = '';
        scope.userName = userInfo.name;

        scope.sidebar = {
          requests: {
            visible: userOptions.requestsVisible,
            cssClass: getDropdownClass(userOptions.requestsVisible)
          },
          chats: {
            visible: userOptions.chatsVisible,
            cssClass: getDropdownClass(userOptions.chatsVisible)
          },
          contacts: {
            visible: userOptions.contactsVisible,
            cssClass: getDropdownClass(userOptions.contactsVisible)
          }
        };

        scope.errors = {
          contact: false
        };

        scope.toggleAccountDropdownVisibility = function() {
          scope.accountDropdownVisible = !scope.accountDropdownVisible;
          scope.addContactVisible = false;
          scope.accountDropdownClass = getDropdownClass(scope.accountDropdownVisible);
        };

        scope.toggleAddContactVisibility = function() {
          scope.addContactVisible = !scope.addContactVisible;
        };

        scope.showAddContacts = function() {
          if (!scope.sidebar.contacts.visible)
            scope.toggleContactsVisibility();

          scope.addContactVisible = true;
        };

        scope.toggleRequestVisibility = function() {
          scope.sidebar.requests.visible = !scope.sidebar.requests.visible;
          scope.sidebar.requests.cssClass = getDropdownClass(scope.sidebar.requests.visible);

          // Save.
          socket.emit('save-requests-visibility', userID, scope.sidebar.requests.visible);
        };

        scope.toggleChatsVisibility = function() {
          scope.sidebar.chats.visible = !scope.sidebar.chats.visible;
          scope.sidebar.chats.cssClass = getDropdownClass(scope.sidebar.chats.visible);

          // Save.
          socket.emit('save-chats-visibility', userID, scope.sidebar.chats.visible);
        };

        scope.toggleContactsVisibility = function() {
          scope.sidebar.contacts.visible = !scope.sidebar.contacts.visible;
          scope.sidebar.contacts.cssClass = getDropdownClass(scope.sidebar.contacts.visible);

          // Save.
          socket.emit('save-contacts-visibility', userID, scope.sidebar.contacts.visible);
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

        function getDropdownClass(visible) {
          if (visible)
            return "dropup";
          
          return "dropdown";
        }

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