(function() {
  'use strict';

  let express = require('express');
  let path = require('path');
  let MongoClient = require('mongodb').MongoClient;

  let app = express();
  let database;

  MongoClient.connect("mongodb://localhost:27017/instantjabber", function(err, db) {
    if (err) {
      return console.dir(err);
    }

    database = db;
});

  // if asked for a file, look for it in app
  app.use(express.static('app'));

  // no matter the path we redirect the user to the angular
  // application.
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'app', 'index.html'));
  });

  // begin listening for connections
  app.listen(3000, function() {
    console.log('Server on port 3000');
  });
  
})();