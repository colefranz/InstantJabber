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
          userID = chatService.getUserID();

        scope.accountDropdownVisible = false;
        scope.accountDropdownClass = 'dropdown';
        scope.addContactVisible = false;
        scope.contactEmail = '';
        scope.userName = '';
        scope.sidebar = {
          requests: {
            visible: true,
            cssClass: getDropdownClass(true)
          },
          chats: {
            visible: true,
            cssClass: getDropdownClass(true)
          },
          contacts: {
            visible: true,
            cssClass: getDropdownClass(true)
          }
        };

        scope.errors = {
          contact: false
        };
        
        chatService.subcribeToUserInfoUpdates(function(info, options) {
          scope.userName = info.name;
          scope.sidebar = {
            requests: {
              visible: options.requestsVisible,
              cssClass: getDropdownClass(options.requestsVisible)
            },
            chats: {
              visible: options.chatsVisible,
              cssClass: getDropdownClass(options.chatsVisible)
            },
            contacts: {
              visible: options.contactsVisible,
              cssClass: getDropdownClass(options.contactsVisible)
            }
          };
        });

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
          scope.addContactVisible = false;
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

        scope.getOnlineClass = function(isOnline) {
          if (isOnline)
            return 'online';
          else
            return 'offline';
        }

        scope.logout = function() {
          authService.logout();
          socket.emit('logout', userID);
        };

        scope.toggleIsLeaving = function(chat) {
          chat.isLeaving = !chat.isLeaving;
        }

        scope.leaveChat = function(chat) {
          scope.toggleIsLeaving(chat);
          chatService.leaveChat(chat._id, userID);
        };

        scope.deleteContact = function(contactID) {
          chatService.deleteContact(contactID, userID);
        }

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