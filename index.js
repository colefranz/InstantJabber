(function() {
  'use strict';

  let express = require('express'),
      bodyParser = require('body-parser'),
      path = require('path'),
      dbUtils = require('./server/database'),
      Message = require('./server/message').Message,
      Q = require('q'),
      jwt = require('jsonwebtoken'),
      iojwt  = require('socketio-jwt'),
      secret = 'topsecretserversecretsuperspookysecretfromsecretsvillesecretsecret',

      app = express(),
      server = require('http').createServer(app),
      io = require('socket.io')(server);

  // io.use(iojwt.authorize({
  //   secret: secret,
  //   handshake: true
  // }));

  io.sockets
  .on('connection', iojwt.authorize({
    secret: secret,
    timeout: 9999999
  }))
  .on('authenticated', function(socket) {
    var userID,
        auth,
        handleLoginOrCreationAttempt,
        manageLoggedInListeners;

    if (!socket.decoded_token) {
      socket.disconnect();
    }
    
    userID = socket.decoded_token.id;

    try {
      dbUtils.setSocket(userID, socket.id);

      dbUtils.getUser(userID).then(function(user) {
        console.log('INFO:', user.info);
        socket.emit('user-info', user);
      });

      dbUtils.getContacts(userID).then(function(contacts) {
        console.log('CONTACTS:', contacts);
        socket.emit('your-contacts', contacts);
      });

      dbUtils.getRequests(userID).then(function(userIds) {
        console.log('REQUESTS:', userIds);
        socket.emit('new-requests', userIds);
      });
      
      dbUtils.getUser(userID).then(function(user) {
        socket.broadcast.emit('user-online', user.id);
      });

      dbUtils.getChats(userID).then(function(chats) {
        socket.emit('your-chats', chats);
      });

      socket.on('get-chat', function(chatID) {
        dbUtils.getChat(chatID).then(function(chat) {
          socket.emit('get-chat', chat);
        });
      });

      socket.on('get-or-create-chat', function(idArray) {
        idArray.push(userID);
        dbUtils.getOrCreateChat(idArray).then(function(chat) {
          socket.emit('get-or-create-chat', chat._id);
        });
      });

      socket.on('add-contact-request', function(id) {
        dbUtils.addContactRequest(userID, id).then(function() {
          getUserSocket(id).then(function(userSocket) {
            dbUtils.getRequests(id).then(function(usersIds) {
              userSocket.emit('new-requests', usersIds);
            });
          });
        });
      });

      socket.on('add-contact-response', function(requester, acceptedRequest) {
        dbUtils.addContactResponse(userID, requester, acceptedRequest)
        .then(function(info) {
          console.log('FINISHED ADD-CONTACT-RESPONSE FOR: ', userID);
          if (info.contacts !== undefined) {
            socket.emit('your-contacts', info.contacts);
            getUserSocket(requester).then(function(userSocket) {
              dbUtils.getContacts(requester).then(function(contacts) {
                userSocket.emit('your-contacts', contacts);
              });
            });
          }
          if (info.requests !== undefined) {
            socket.emit('new-requests', info.requests);
          }
        });
      });

      socket.on('message', function(chatID, message) {
        var formattedMessage = new Message(userID, message);
        dbUtils.saveNewChatMessage(chatID, formattedMessage).then(function(chat) {
          notifyAffectedUsers(chat.users, 'chat-updated', chat);
        });
      });

      socket.on('update-chat-name', function(chatID, name) {
        dbUtils.updateChatName(chatID, name).then(function(chat) {
          notifyAffectedUsers(chat.users, 'chat-updated', chat);
        });
      });

      socket.on('add-users-to-chat', function(chatID, idArray) {
        dbUtils.addUsersToChat(chatID, idArray).then(function(chat) {
          notifyAffectedUsers(chat.users, 'chat-updated', chat);
        });
      });

      socket.on('save-requests-visibility', function(userID, visible) {
        dbUtils.changeRequestsVisibility(userID, visible);
      });

      socket.on('save-chats-visibility', function(userID, visible) {
        dbUtils.changeChatsVisibility(userID, visible);
      });

      socket.on('save-contacts-visibility', function(userID, visible) {
        dbUtils.changeContactsVisibility(userID, visible);
      });

      let logout = function(userID) {
        dbUtils.getUser(userID).then(function(user) {
          socket.broadcast.emit('user-offline', user.id);
          dbUtils.logout(userID);
          delete io.sockets.connected[socket.id];
        });
      };

      socket.on('logout', logout);
      socket.on('disconnect', logout);
    } catch(e) {
      console.log(e);
    }
  });

  function getUserSocket(id) {
    let deferred = Q.defer();

    dbUtils.getUser(id).then(function(user) {
      let userSocket = io.sockets.connected[user.socket];

      if (userSocket) {
        deferred.resolve(userSocket);
      } else {
        deferred.reject();
      }
    });

    return deferred.promise;
  }

  function notifyAffectedUsers(users, message, data) {
    users.forEach(function(user) {
      getUserSocket(user.id).then(function(userSocket) {
        userSocket.emit(message, data);
      });
    });
  }

  // if asked for a file, look for it in app
  app.use(express.static(path.join(__dirname, 'app')));
  app.use(bodyParser.json());

  // if that file isn't found serve up the html as we want
  // the app the handle every other route
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'app', 'index.html'));
  });

  function getAuthenticationFunction(callback) {
    return function(req, res) {
      if (req.body.id === undefined || req.body.pass === undefined) {
        res.send(400);
      }

      let token = jwt.sign(
        req.body,
        secret,
        {expiresIn: 60*60*24*7} // expires in one week
      );

      callback(req.body, token).then(function() {
        res.json({status: true, token: token});
      }, function(err) {
        if (err)
          res.json({status: false, message: err});
        else
         res.send(400);
      });
    };
  }

  app.post('/user-login', getAuthenticationFunction(dbUtils.login));
  app.post('/create', getAuthenticationFunction(dbUtils.createAccount));

  // begin listening for connections
  server.listen(3000, function() {
    console.log('Server on port 3000');
  });

})();