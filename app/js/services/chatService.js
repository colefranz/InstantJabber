(function(io) {
  'use strict';

  angular.module('jabber')

  .factory('chatService', ['$q', 'socketService', '$timeout', '$route', '$location',
    function($q, socketService, $timeout, $route, $location) {
      function ChatService() {
        var self = this,
            chatSubscriptions = {
              all: []
            },
            infoSubscriptions = [],
            socket = socketService.get(),
            contacts = [],
            chats = [],
            requests = [],
            activeInformationCallbacks = [],
            userInfo,
            userOptions,
            userID,
            isGuest = false;

        socket.on('user-info', function(user) {
          userInfo = user.info;
          userOptions = user.options;
          userID = user.id;
          isGuest = user.isGuest;
          notifyUserInfoSubscribers();
        });

        socket.on('your-contacts', function(dbContacts) {
          contacts = dbContacts;
          notifySubscribers();
        });

        socket.on('new-requests', function(dbRequests) {
          requests = dbRequests;
          notifySubscribers();
        });

        socket.on('your-chats', function(dbChats) {
          chats = dbChats;
          notifySubscribers();
        });

        socket.on('add-users-to-chat', function(chatID, users) {
          var index = _.findIndex(chats, function(chat) {
            return chat._id === chatID;
          });

          chats[index].users = users;
          notifySubscribers();
        });

        socket.on('chat-updated', function(chat) {
          var index;
          console.log('updated');
          if (chat._id === undefined) {
            return;
          }

          index = _.findIndex(chats, function(ch) {
            return ch._id === chat._id;
          });

          // if the chat is new add it to the lists
          if (index === -1) {
            chats.push(chat);
          } else {
            chats[index] = chat;
          }
          
          notifySubscribers();
          notifyChatSubscribers(chat);
        });

        socket.on('user-online', function(id) {
          // Update contacts.
          var i;
          for (i = 0; i < contacts.length; ++i) {
            if (contacts[i].id === id) {
              contacts[i].info.online = true;
              console.log('online: ', id);
            }
          }

          notifySubscribers();
        });

        socket.on('user-offline', function(id) {
          // Update contacts.
          var i;
          for (i = 0; i < contacts.length; ++i) {
            if (contacts[i].id === id) {
              contacts[i].info.online = false;
              console.log('offline: ', id);
            }
          }

          notifySubscribers();
        });

        socket.on('leave-chat', function(chatID) {
          // Stop displaying the chat that was left.
          if ($route.current.params.id === chatID)
            $location.path('/');
        });

        self.getUserID = function() {
          return userID;
        };

        self.getIsGuest = function() {
          return isGuest;
        };

        self.getChats = function() {
          return chats;
        };

        self.getContacts = function() {
          return contacts;
        };

        self.leaveChat = function(chatID, userID) {
          socket.emit('leave-chat', chatID, userID);
        };

        function notifySubscribers() {
          _.forEach(activeInformationCallbacks, activeInformationCallback);
        }

        function notifyChatSubscribers(chat) {
          _.forEach(chatSubscriptions[chat._id], function(callback) {
            callback(chat);
          });

          _.forEach(chatSubscriptions.all, function(callback) {
            callback(chat);
          });
        }

        function notifyUserInfoSubscribers() {
          _.forEach(infoSubscriptions, function(infoSubscription) {
            infoSubscription(userInfo, userOptions)
          });
        }

        function activeInformationCallback(callback) {
          callback({
            contacts: contacts,
            chats: chats,
            requests: requests
          });
        }


        self.subscribeToActiveInformation = function(callback) {
          activeInformationCallback(callback);
          activeInformationCallbacks.push(callback);
        };

        /**
         * get a chat from the server
         *
         * expects
         * id: id of the chat
         */
        self.getChat = function(id) {
          var deferred = $q.defer(),
              chatHandler = function(chat) {
                deferred.resolve(chat);
                socket.removeListener('get-chat', chatHandler);
              };

          socket.emit('get-chat', id);
          socket.on('get-chat', chatHandler);

          return deferred.promise;
        };

        /**
         * sends chat to the server
         *
         * expects
         * id: chat of id
         * message: message to be sent
         */
        self.sendChat = function(chatID, message) {
          socket.emit('message', chatID, message);
        };

        /**
         * register a callback to be called when a message
         * is recieved from the server
         *
         * expects
         * callback: the function to be called when the
         *           chatID recieves a new message
         * OPTIONAL
         * chatID: the chatID to subscribe to, if blank subscribes
         *         to all messages
         */
        self.subcribeToChatUpdates = function(callback, id) {
          if (id === undefined) {
            chatSubscriptions.all.push(callback);
          } else {
            if (chatSubscriptions[id] === undefined) {
              chatSubscriptions[id] = [];
            }

            chatSubscriptions[id].push(callback);
          }
        };

        self.subcribeToUserInfoUpdates = function(callback) {
          infoSubscriptions.push(callback);
          notifyUserInfoSubscribers();
        };

        /**
         * deregister a callback to from being called when a message
         * is recieved from the server
         *
         * expects
         * callback: the function that was registered
         *
         * chatID: the chatID to unsubscribe from
         */
        self.deregisterFromChatUpdates = function(callback, id) {
          if (chatSubscriptions[id] !== undefined) {
            _.forEach(chatSubscriptions[id], function(item, i) {
              if (item === callback) {
                chatSubscriptions[id].splice(i, 1);
              }
              return true;
            });
          }
        };

        /**
         * Send request to add a contact to your list.
         *
         * expects
         * id: id of the user to add
         */
        self.addContactRequest = function(id) {
          socket.emit('add-contact-request', id);
        };

        /**
         * Respond to a users contact request
         *
         * expects
         * requester: id of the user who sent the request
         * acceptedRequest: boolean value if they accept or not
         */
        self.addContactResponse = function(requester, acceptedRequest) {
          socket.emit('add-contact-response', requester, acceptedRequest);
        };

        self.createChatForUser = function(userID) {
          var deferred = $q.defer(),
              responseHandler = function(chatID) {
                deferred.resolve(chatID);
                socket.removeListener('create-chat', responseHandler);
              };

          socket.emit('create-chat', [userID]);
          socket.on('create-chat', responseHandler);

          return deferred.promise;
        };

        self.updateChatName = function(chatID, name) {
          socket.emit('update-chat-name', chatID, name);
        };

        self.addUsersToChat = function(chatID, idArray) {
          socket.emit('add-users-to-chat', chatID, idArray);
        };

        return self;
      }

      return new ChatService();
    }
  ]);
})(io);