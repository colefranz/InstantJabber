module.exports = (function() {
  'use strict';
  
  let MongoClient = require('mongodb').MongoClient;
  let database;

  // connect to the database
  MongoClient.connect("mongodb://localhost:27017/instantjabber", function(err, db) {
    if (err) {
      return console.dir(err);
    }

    database = db;
  });

  function getChat() {

  }

  function setChat() {

  }

  return {
    getChat: getChat,
    setChat: setChat
  };
})();