module.exports = (function() {
  'use strict';
  
  let MongoClient = require('mongodb').MongoClient;
  let database;

  /* schema

  database: {
    chats: { // UUIDS
      xxx: {
        users: [ id1, id2, id3 ],
        name: 'SENG 513 Group',
        log: [
          {
            msg: asdas
            timestamp: '12:01 Feb 23'
            user: id1
          },
          {
            ...
          },
          {
            ....
          }
        ]

      },
      xxy: {
        ...
      },
    }
    users: { // emails
      {
        id: id1
        chats: [xxx, xxy],
        contacts: [id2, id3],
        info: { // basically only the public information goes here
          name: 'Cole',
          others: ???
        },
        private: {
          password: xxxx
        }
      },
      {
        id: id2
        ...
      },
      {
        id: id3
        ...
      }
    }
  }
  */

  // connect to the database
  MongoClient.connect("mongodb://localhost:27017/instantjabber", function(err, db) {
    if (err) {
      return console.dir(err);
    }

    database = db;
  });

  function login(creds) {
    var collection = database.collection('users');
    collection.insertOne({
      id: creds.email,
      private: {
        password: creds.pass
      }
    }, function(err, r) {

    });

  }

  function getChat() {

  }

  function setChat() {

  }

  function getContacts(user) {
    var collection = database.collection('users');

    return collection.findOne({id: user}).then(function(doc) {
      console.log(doc);
      return doc;
    });
  }

  function addContact(id) {

  }

  return {
    login: login,
    getChat: getChat,
    setChat: setChat,
    getInformation: getInformation,
    addContact: addContact
  };
})();