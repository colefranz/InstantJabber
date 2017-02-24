(function() {
  'use strict';

  let express = require('express');
  let path = require('path');
  let database = require('./server/database');

  let app = express();
  let server = require('http').createServer(app);
  let io = require('socket.io')(server);

  io.sockets.on('connection', function(socket) {
    let userID;

    socket.on('login', function(creds) {
      // check if login is successful
      database.login(creds);
      // this whole workflow might be busted - not familiar with
      // how to do a secure login
      console.log(creds.user + ' connected!!');
      userID = creds;

      socket.emit('your-contacts', database.getContacts(creds.email));

      socket.on('message-from-user', function(id, message) {
        // ADD MESSAGE TO DATABASE
        // NOTIFY SOCKETS THAT CARE SOMEHOW
        //    maybe just send to everyone??? io.sockets.emit('message-to-user')
        //    maybe dynamically subscribe to chats?? and then io.sockets.emit('message' + id)
        //      I kind of prefer the second one, but it's more work for the client.
      });
    });
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