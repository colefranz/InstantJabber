(function() {
  'use strict';

  let express = require('express'),
      path = require('path'),
      database = require('./server/database'),
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
        database.login(creds, handleLoginOrCreationAttempt);
      });

      socket.on('create-account', function(creds) {
        userID = creds.id;
        database.createAccount(creds, handleLoginOrCreationAttempt);
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
        database.getContacts(userID).then(function(contacts) {
          console.log('CONTACTS:', contacts);
          socket.emit('your-contacts', contacts);
        });

        database.getRequests(userID).then(function(userIds) {
          console.log('REQUESTS:', userIds);
          socket.emit('new-requests', userIds);
        });

        database.getChats(userID).then(function(chats) {
          
        });

        socket.on('add-contact-request', function(id) {
          database.addContactRequest(userID, id);
        });

        socket.on('add-contact-response', function(requester, acceptedRequest) {
          database.addContactResponse(userID, requester, acceptedRequest)
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
          database.gitResetHard();
        });

        socket.on('message-from-user', function(id, message) {
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

  // API REQUEST
  // find the chat id
  app.get('/api/chat/:id', function(req, res) {
    res.send(req.params.id);
    // database.getChat(req.params.id);
  });
  
  // API REQUEST
  // edit/create the chat id
  app.post('/api/chat/:id', function(req, res) {
    res.send(req.params.id);
    // database.setChat(req.params.id);
  });
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  // begin listening for connections
  server.listen(3000, function() {
    console.log('Server on port 3000');
  });
  
})();