(function(io) {
  'use strict';

  angular.module('jabber')

  .factory('chatService', ['$q', 'socket', function($q, socket) {
    function ChatService() {
      var self = this,
          subscriptions = {
            all: []
          },
          contacts = [],
          chats = [],
          requests = [],
          activeInformationCallbacks = [];

      socket.on('your-contacts', function(dbContacts) {
        contacts = dbContacts;
        _.forEach(activeInformationCallbacks, activeInformationCallback);
      });

      socket.on('new-requests', function(dbRequests) {
        requests = dbRequests;
        _.forEach(activeInformationCallbacks, activeInformationCallback);
      });

      socket.on('your-chats', function(dbChats) {
        chats = dbChats;
        _.forEach(activeInformationCallbacks, activeInformationCallback);
      });

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
      self.sendChat = function(id, message) {
        socket.emit('message-from-user', message);
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
      self.subcribeToMessages = function(callback, id) {
        if (id === undefined) {
          subscriptions.all.push(callback);
        } else {
          if (subscriptions[id] === undefined) {
            subscriptions[id] = [];
          }

          subscriptions[id].push(callback);
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
      self.deregisterFromMessages = function(callback, id) {
        if (subscriptions[id] !== undefined) {
          _.forEach(subscriptions[id], function(item, i) {
            if (item === callback) {
              subscriptions[id].splice(i, 1);
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
      socket.on('message-to-user', function(message) {
        if (!(message.id !== undefined && subscriptions[message.id] !== undefined)) {
          return;
        }
        
        _.forEach(subscriptions[message.id], function(callback) {
          callback(message);
        });

        _.forEach(subscriptions.all, function(callback) {
          callback(message);
        });
      });

      //TODO REMOVE
      // for development purposes to delete entire database.
      self.gitResetHard = function() {
        socket.emit('gitResetHard');
      };

      return self;
    }

    return new ChatService();
  }]);
})(io);