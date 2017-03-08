(function() {
  'use strict';

  let express = require('express'),
      path = require('path'),
      dbUtils = require('./server/database'),
      Message = require('./server/message').Message,
      Q = require('q'),
      
      app = express(),
      server = require('http').createServer(app),
      io = require('socket.io')(server);

  io.sockets.on('connection', function(socket) {
    var userID,
        handleLoginOrCreationAttempt,
        manageLoggedInListeners;

    try {
      socket.on('login', function(creds) {
        userID = creds.id;
        dbUtils.login(creds).then(handleLoginOrCreationAttempt);
      });

      socket.on('create-account', function(creds) {
        userID = creds.id;
        dbUtils.createAccount(creds).then(handleLoginOrCreationAttempt);
      });

      handleLoginOrCreationAttempt = function(wasLoggedIn) {
        socket.emit('login-result', wasLoggedIn);

        if (wasLoggedIn) {
          manageLoggedInListeners();
        }
      };

      manageLoggedInListeners = function() {
        // once we have logged in we can stop listening
        socket.removeAllListeners('login');
        socket.removeAllListeners('create-account');
        
        // socket.emit('new-messages', database.getNewMessages(userID));

        // get contacts
        // TODO get chats
        dbUtils.getContacts(userID).then(function(contacts) {
          console.log('CONTACTS:', contacts);
          socket.emit('your-contacts', contacts);
        });

        dbUtils.getRequests(userID).then(function(userIds) {
          console.log('REQUESTS:', userIds);
          socket.emit('new-requests', userIds);
        });

        dbUtils.getChats(userID).then(function(chats) {
          socket.emit('your-chats', chats);
        });

        socket.on('get-chat', function(chatID) {
          dbUtils.getChat(chatID).then(function(chat) {
            socket.emit('get-chat', chat);
          });
        });

        socket.on('add-contact-request', function(id) {
          dbUtils.addContactRequest(userID, id);
        });

        socket.on('add-contact-response', function(requester, acceptedRequest) {
          dbUtils.addContactResponse(userID, requester, acceptedRequest)
          .then(function(info) {
            console.log('FINISHED ADD-CONTACT-RESPONSE FOR: ', userID);
            if (info.contacts !== undefined) {
              socket.emit('your-contacts', info.contacts);
            }
            if (info.requests !== undefined) {
              socket.emit('new-requests', info.requests);
            }
          });
        });

        //TODO REMOVE
        // for development purposes to delete entire database.
        socket.on('gitResetHard', function() {
          dbUtils.gitResetHard();
        });

        socket.on('message-from-user', function(chatID, message) {
          var formattedMessage = new Message(userID, message);
          dbUtils.saveNewChatMessage(chatID, formattedMessage);
          // ADD MESSAGE TO DATABASE
          // NOTIFY SOCKETS THAT CARE SOMEHOW
          //    maybe just send to everyone??? io.sockets.emit('message-to-user')
          //    maybe dynamically subscribe to chats?? and then io.sockets.emit('message' + id)
          //      I kind of prefer the second one, but it's more work for the client.
        });
      };
    } catch(e) {
      console.log(e);
    }
  });

// honestly everything in here could just be converted
// to a socket message. I don't know if that's better or worse,
// but it sounds better to me.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // if asked for a file, look for it in app
  app.use(express.static(path.join(__dirname, 'app')));

  // if that file isn't found serve up the html as we want
  // the app the handle every other route
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'app', 'index.html'));
  });
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  // begin listening for connections
  server.listen(3000, function() {
    console.log('Server on port 3000');
  });
  
})();