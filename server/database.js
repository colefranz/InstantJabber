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

  exportable.login = function login(creds, callback) {
    let collection = database.collection('users');
    
    collection.findOne({id: creds.id}, {}).then(function(docs) {
      if (docs === null) {
        console.log('YOU NO EXIST');
      } else {
        console.log('YOU EXIST');
      }

      callback(docs !== null);
    });
  }

  exportable.create = function create(creds, callback) {
    let collection = database.collection('users');

    collection.findOne({id: creds.id}, {}).then(function(docs) {
      if (docs === null) {
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
    });
  };

  exportable.getChat = function getChat() {

  }

  exportable.setChat = function setChat() {

  }

  exportable.getContacts = function getContacts(user, callback) {
    let collection = database.collection('users');

    // find user and get contacts from it
    // use those id's to get the names of all the contacts
    return collection.findOne({id: user}, {contacts: 1}).then(function(docs) {
      collection = database.collection('users');
      collection.find({
          id: {
            $in: docs.contacts
          }
        }, {
          id: 1,
          info: 1
        }).toArray().then(function(doc) {
          callback(doc);
        // return doc;
      });
    });
  };

  exportable.addContact = function addContact(userId, id) {
    let collection = database.collection('users');
    
    if (userId === id) {
      console.log('You cant add yourself!');
    }
    // make sure the id exists in the list
    // then add it to the contacts of the userid.
    // TODO make sure it adds to the other person as well
    return collection.findOne({id: userId}).then(function(doc) {
      if (doc !== undefined) {
        collection.findOneAndUpdate(
          {id: userId},
          {$push: {contacts: id}}
        ).then(function(doc) {
          console.log(doc);
          return doc;
        });
      } else {
        console.log('that aint in here');
      }
    });
  }

  exportable.gitResetHard = function gitResetHard() {
    let collection = database.collection('users');

    collection.remove({}, function() {
    // add a couple back in so we have something to work with
      collection.findOne({id: 'test1'}, {}).then(function(docs) {
        if (docs === null) {
          collection.insertMany([
            {
              id: 'test1',
              contacts: [],
              info: {
                name: 'Cole',
              },
              private: {
                password: 'test1'
              }
            },
            {
              id: 'test2',
              contacts: [],
              info: {
                name: 'Silas',
              },
              private: {
                password: 'test2'
              }
            },
            {
              id: 'test3',
              contacts: [],
              info: {
                name: 'Jun',
              },
              private: {
                password: 'test3'
              }
            }
          ]);
        }
      });
    });
  };

  return exportable;
})();