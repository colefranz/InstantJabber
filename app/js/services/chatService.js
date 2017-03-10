(function(io) {
  'use strict';

  angular.module('jabber')

  .factory('chatService', ['$q', 'socket',
    function($q, socket) {
      function ChatService() {
        var self = this,
            chatSubscriptions = {
              all: []
            },
            contacts = [],
            chats = [],
            requests = [],
            activeInformationCallbacks = [];

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

        self.getChats = function() {
          return chats;
        };

        self.getContacts = function() {
          return contacts;
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

        /**
         * handler for recieving a new message
         * send to all watchers
         */
        socket.on('chat-updated', function(chat) {
          var index;

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

        self.getChatForID = function(userID) {
          var deferred = $q.defer(),
              responseHandler = function(chatID) {
                deferred.resolve(chatID);
                socket.removeListener('get-or-create-chat', responseHandler);
              };

          socket.emit('get-or-create-chat', [userID]);
          socket.on('get-or-create-chat', responseHandler);

          return deferred.promise;
        };

        self.updateChatName = function(chatID, name) {
          socket.emit('update-chat-name', chatID, name);
        };

        self.addUsersToChat = function(chatID, idArray) {
          socket.emit('add-users-to-chat', chatID, idArray);
        };

        socket.on('add-users-to-chat', function(chatID, users) {
          var index = _.findIndex(chats, function(chat) {
            return chat._id === chatID;
          });

          chats[index].users = users;
          notifySubscribers();
        });

        //TODO REMOVE
        // for development purposes to delete entire database.
        self.gitResetHard = function() {
          socket.emit('gitResetHard');
        };

        return self;
      }

      return new ChatService();
    }
  ]);
})(io);