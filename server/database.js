module.exports = (function() {
  'use strict';
  
  let MongoClient = require('mongodb').MongoClient,
      Q = require('q'),
      database,
      exportable = {};

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

  exportable.createAccount = function(creds, callback) {
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

  exportable.getContacts = function(user) {
    let users = database.collection('users'),
        deferred = Q.defer();
    
    // find user and get contacts from it
    // use those id's to get the names of all the contacts
    users.findOne({id: user}, {contacts: 1}).then(function(docs) {
      deferred.resolve(createNamesArrayFromContacts(docs.contacts));
    });

    return deferred.promise;
  };

  function createNamesArrayFromContacts(contacts) {
    let users = database.collection('users'),
        deferred = Q.defer();

    users.find({
      id: {
        $in: contacts
      }
    }, {
      id: 1,
      info: 1
    }).toArray().then(function(doc) {
      console.log(doc);
      deferred.resolve(doc);
    });

    return deferred.promise;
  }

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

  exportable.findRequests = function(id) {
    let contactRequests = database.collection('contact-requests'),
        users = database.collection('users'),
        deferred = Q.defer();

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
        deferred.resolve(doc);
      });
    });

    return deferred.promise;
  };

  exportable.addContactResponse = function(requestee, requester, acceptedRequest) {
    let users = database.collection('users'),
        contactRequests = database.collection('contact-requests'),
        deferred = Q.defer();

    if (acceptedRequest) {
      users.findOneAndUpdate(
        {id: requestee},
        {$push: {contacts: requester}},
        {
          returnOriginal: false,
          projection: {contacts: 1}
        }
      ).then(function(doc) {
        console.log('updated requestee: ', doc);
        deferred.resolve(createNamesArrayFromContacts(doc.value.contacts));
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

    return deferred.promise;
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