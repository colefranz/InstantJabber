module.exports = (function() {
  'use strict';
  
  let MongoClient = require('mongodb').MongoClient;
  let database;
  let exportable = {};

  /* schema

  database: {
    COLLECTION chats: { // UUIDS
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
    },
    COLLECTION users: { // emails
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
    },
    COLLECTION contact-requests: {
      {
        // id1 wants to befriend id2
        requester: id1
        requestee: id2
      },
      {
        // id2 wants to befriend id3
        id: id2
        contact: id3
      }
      ...
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

  exportable.login = function(creds, callback) {
    let users = database.collection('users');

    users.findOne({id: creds.id}, {}).then(function(docs) {
      console.log(docs);
      callback(docs !== null);
    });
  }

  exportable.create = function(creds, callback) {
    let users = database.collection('users');

    users.findOne({id: creds.id}, {}).then(function(docs) {
      if (docs === null) {
        users.insertOne({
          id: creds.id,
          contacts: [],
          info: {
            name: creds.name
          },
          private: {
            password: creds.pass
          }
        }, function(err) {
          callback(err === null);
        });
      } else {
        // the user ID is taken
        
      }

    });
  };

  exportable.getChat = function() {

  };

  exportable.setChat = function() {

  };

  exportable.getContacts = function(user, callback) {
    let users = database.collection('users');

    // find user and get contacts from it
    // use those id's to get the names of all the contacts
    return users.findOne({id: user}, {contacts: 1}).then(function(docs) {
      users.find({
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

  exportable.addContactRequest = function(requester, requestee) {
    let users = database.collection('users');
    
    if (requester === requestee) {
      console.log('You cant add yourself!');
      return false;
    }

    users.findOne({id: requestee}).then(function(doc) {
      if (doc === undefined) {
        console.log('That person doesn\'t exist!');
        return false;
      }

      users.findOne({id: requester}).then(function(doc) {
        if (doc !== undefined && doc.contacts.indexOf(requestee) === -1) {
          let contactRequests = database.collection('contact-requests');
        
          contactRequests.insertOne({
            requester: requester,
            requestee: requestee
          }, function(err, doc) {
            console.log(doc.insertedCount);
          });
        } else {
          console.log('that aint in here || already friends');
        }
      });
    });
  };

  exportable.findRequests = function(id, callback) {
    let contactRequests = database.collection('contact-requests'),
        users = database.collection('users');

    contactRequests.find(
      { requestee: id },
      { requester: 1 }
    ).toArray().then(function(docs) {
      let ids = [];

      docs.forEach(function(user) {
        ids.push(user.requester);
      });

      users.find({
        id: {
          $in: ids
        }
      }, {
        id: 1,
        info: 1
      }).toArray().then(function(doc) {
        callback(doc);
      });
    });
  };

  exportable.addContactResponse = function(requestee, requester, acceptedRequest) {
    let users = database.collection('users'),
        contactRequests = database.collection('contact-requests');

    if (acceptedRequest) {
      users.findOneAndUpdate(
        {id: requestee},
        {$push: {contacts: requester}}
      ).then(function(doc) {
        console.log('updated requestee');
      });

      users.findOneAndUpdate(
        {id: requester},
        {$push: {contacts: requestee}}
      ).then(function(doc) {
        console.log('updated requester');
      });
    }
    
    contactRequests.deleteOne({
      requester: requester,
      requestee: requestee
    }).then(function() {
      console.log('request deleted');
    });
  };

  exportable.gitResetHard = function gitResetHard() {
    let users = database.collection('users');

    users.remove({}, function() {
    // add a couple back in so we have something to work with
      users.findOne({id: 'test1'}, {}).then(function(docs) {
        if (docs === null) {
          users.insertMany([
            {
              id: 'test1@test.com',
              contacts: [],
              info: {
                name: 'Cole',
              },
              private: {
                password: 'test1'
              }
            },
            {
              id: 'test2@test.com',
              contacts: [],
              info: {
                name: 'Silas',
              },
              private: {
                password: 'test2'
              }
            },
            {
              id: 'test3@test.com',
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