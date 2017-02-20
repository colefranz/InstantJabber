(function() {
  'use strict';

  let express = require('express');
  let path = require('path');
  let database = require('./server/database');

  let app = express();

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

  // begin listening for connections
  app.listen(3000, function() {
    console.log('Server on port 3000');
  });
  
})();