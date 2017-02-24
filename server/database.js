module.exports = (function() {
  'use strict';
  
  let MongoClient = require('mongodb').MongoClient;
  let database;
  let exportable = {};

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

  exportable.login = function login(creds) {
    var collection = database.collection('users');
    collection.insertOne({
      id: creds.id,
      contacts: [],
      info: {
        name: undefined,
      },
      private: {
        password: creds.pass
      }
    });

  }

  exportable.getChat = function getChat() {

  }

  exportable.setChat = function setChat() {

  }

  exportable.getContacts = function getContacts(user) {
    var collection = database.collection('users');

    return collection.findOne({id: user}).then(function(doc) {
      console.log(doc);
      return doc;
    });
  }

  exportable.addContact = function addContact(userId, id) {
    var collection = database.collection('users');
    
    // make sure the id exists in the list
    // then add it to the contacts of the userid.
    return collection.findOne({id: userId}).then(function(doc) {
      if (doc !== undefined) {
        collection.findOneAndUpdate(
          {id: userId},
          {$push: {contacts: id}}).then(function(doc) {
          
          console.log(doc);
          return doc;
        });
      } else {
        console.log('that shit aint in here');
      }
    });
  }

  exportable.gitResetHard = function gitResetHard() {
    var collection = database.collection('users');

    collection.remove({}, function() {
      console.log('muahahah');
    });
  }

  return exportable;
})();