(function(io) {
  'use strict';

  angular.module('jabber')

  .factory('chatService', [function() {
    function ChatService() {
      var self = this,
          subscriptions = {
            all: []
          },
          contacts = [],
          activeChatIds = [],
          socket = io(),
          activeInformationCallbacks = [];

      socket.on('your-contacts', function(contacts) {
        console.log(contacts);
        // contacts = information.contacts;
        // activeChatIds = information.chatIds;

        // _.forEach(activeInformationCallbacks, function(callback) {
        //   callback(contacts, activeChatIds);
        // });
      });


      self.subscribeToActiveInformation = function(callback) {
        callback(contacts, activeChatIds);
        activeInformationCallbacks.push(callback);
      };
      
      /*
      * initial handshake with server for it to start
      * listening and sending events to the user
      *
      * expects
      * creds: {
      *   id,
      *   pass
      * }
      */

      self.connectToChat = function(creds) {
        socket.emit('login', creds);
      };

      socket.on('login-failed', function() {
        //tell the user that login-failed
      });

      /*
      * sends chat to the server
      *
      * expects
      * id: chat of id
      * message: message to be sent
      */
      self.sendChat = function(id, message) {
        socket.emit('message-from-user', message);
      };

      /*
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

      /*
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

      /*
      * Add a contact to your list.
      * 
      * expects
      * id: id of the user to add
      */
      self.addContact = function(id) {
        socket.emit('add-contact', id);
      };

      /*
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

      // connect to chat would be called by the maincontroller when the user
      // is logged in, or using cookies (if that's required?)
      // for now we will just pass in some dummy data
      self.connectToChat({id: 'test', pass: 'test'});

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