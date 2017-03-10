(function(exports) {
  'use strict';

  let MongoClient = require('mongodb').MongoClient,
      ObjectID = require('mongodb').ObjectID,
      Q = require('q'),
      database;

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
        contacts: [id2, id3],
        socket: undefined or HSDADUICBN12387adas
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

  exports.login = function(creds, socketID) {
    let users = database.collection('users'),
        deferred = Q.defer();

    users.findOneAndUpdate(
      {id: creds.id},
      { $set: {socket: socketID}}
    ).then(function(docs) {
      deferred.resolve(docs.value !== null);
    });

    return deferred.promise;
  };

  // ******
  // we will want to add this again if we want to see who is
  // online at any given time, but I don't think we need to
  // do that for this project?
  // - whatever it's back in, we will see lol
  // ******
  exports.logout = function(userID) {
    let users = database.collection('users');

    users.findOneAndUpdate(
      {id: userID},
      {$unset: {socket: ''}},
      {returnOriginal: false}
    ).then(function(docs) {
      console.log('logged out');
    });
  };

  exports.createAccount = function(creds, socketID) {
    let users = database.collection('users'),
        deferred = Q.defer();

    users.findOne({id: creds.id}, {}).then(function(docs) {
      if (docs === null) {
        users.insertOne({
          id: creds.id,
          contacts: [],
          socket: socketID,
          info: {
            name: creds.name
          },
          private: {
            password: creds.pass
          }
        }, function(err) {
          deferred.resolve(err === null);
        });
      } else {
        deferred.reject();
      }
    });

    return deferred.promise;
  };

  exports.getUser = function(id) {
    let users = database.collection('users'),
        deferred = Q.defer();

    users.findOne(
      {id: id}
    ).then(function(doc) {
      deferred.resolve(doc);
    });

    return deferred.promise;

  };

  exports.getChat = function(id) {
    let chats = database.collection('chats'),
        deferred = Q.defer();

    chats.findOne({_id: ObjectID(id)}).then(function(doc) {
      createUserArrayFromIdArray(doc.users).then(function(users) {
        doc.users = users;
        deferred.resolve(doc);
      });
    });

    return deferred.promise;
  };

  exports.updateChatName = function(chatID, name) {
    let chats = database.collection('chats'),
        deferred = Q.defer();

    chats.findOneAndUpdate(
      {_id: ObjectID(chatID)},
      {$set: {name: name}},
      {projection: {users: 1}}
    ).then(function(doc) {
      createUserArrayFromIdArray(doc.value.users).then(function(users) {
        doc.users = users;
        deferred.resolve(doc);
      });
    });

    return deferred.promise;
  };

  exports.saveNewChatMessage = function(chatID, message) {
    let chats = database.collection('chats'),
        deferred = Q.defer();

    chats.findOneAndUpdate(
      {_id: ObjectID(chatID)},
      {$push: {log: message}},
      {projection: {users: 1}}
    ).then(function(doc) {
      createUserArrayFromIdArray(doc.value.users).then(function(users) {
        deferred.resolve(users);
      });
    });

    return deferred.promise;
  };

  exports.getContacts = function(user) {
    let users = database.collection('users'),
        deferred = Q.defer();

    // find user and get contacts from it
    // use those id's to get the names of all the contacts
    users.findOne({id: user}, {contacts: 1}).then(function(docs) {
      deferred.resolve(createUserArrayFromIdArray(docs.contacts));
    });

    return deferred.promise;
  };

  function createUserArrayFromIdArray(contacts) {
    let users = database.collection('users'),
        deferred = Q.defer();

    users.find({
      id: {
        $in: contacts
      }
    }, {
      id: 1,
      socket: 1,
      info: 1
    }).toArray().then(function(doc) {
      deferred.resolve(doc);
    });

    return deferred.promise;
  }

  exports.getChats = function(id) {
    let chats = database.collection('chats'),
        deferred = Q.defer();

    chats.find(
      {users: id}
    ).project({name: 1, users: 1}).toArray().then(function(doc) {
      console.log('CHATS: ', doc);
      deferred.resolve(doc);
    });

    return deferred.promise;
  };

  exports.getOrCreateChat = function(idArray) {
    var chats = database.collection('chats'),
        deferred = Q.defer();

    chats.findOne(
      {
        users: {
          $size: 2,
          $all: idArray
        }
      },
      {fields: {_id: 1}}
    ).then(function(doc) {
      if (doc === null) {
        createUserArrayFromIdArray(idArray).then(function(users) {
          var chatName = '';

          users.forEach(function(user, index) {
            if (index === 0) {
              chatName += user.info.name;
            } else {
              chatName += ', ' + user.info.name;
            }
          });

          chats.insertOne({
            users: idArray,
            name: chatName,
            log: []
          }).then(function(doc) {
            deferred.resolve(doc.ops[0]);
          });
        });
      } else {
        deferred.resolve(doc);
      }
    });

    return deferred.promise;
  };

  // should probably add support for if this is rejected
  // that there is some visual feedback to the user
  exports.addContactRequest = function(requester, requestee) {
    let users = database.collection('users'),
        deferred = Q.defer();

    if (requester === requestee) {
      console.log('You cant add yourself!');
      deferred.reject();
    } else {
      users.findOne({id: requestee}).then(function(doc) {
        if (doc === undefined) {
          console.log('That person doesn\'t exist!');
          deferred.reject();
        } else {
          users.findOne({id: requester}).then(function(doc) {
              console.log(doc);
            if (doc !== undefined && doc.contacts.indexOf(requestee) === -1) {
              let contactRequests = database.collection('contact-requests');
              // look for the document, if it doesn't exist make it so
              contactRequests.findOneAndReplace({
                requester: requester,
                requestee: requestee
              }, {
                requester: requester,
                requestee: requestee
              }, {upsert: true}, function(err, doc) {
                console.log('Added contact request');
                deferred.resolve();
              });
            } else {
              console.log('that aint in here || already friends');
              deferred.reject();
            }
          });
        }
      });
    }

    return deferred.promise;
  };

  exports.getRequests = function(id) {
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

  /**
   * Respond to a contact request
   *
   * Returns an object containing the new contact list and contact
   * requests for the requestee (user who is responding to the request).
   */
  exports.addContactResponse = function(requestee, requester, acceptedRequest) {
    var users = database.collection('users'),
        contactRequests = database.collection('contact-requests'),
        userDefer = Q.defer(),
        requestDefer = Q.defer(),
        deferred = Q.all([userDefer.promise, requestDefer.promise]);

    if (acceptedRequest) {
      users.findOneAndUpdate(
        {id: requestee},
        {$push: {contacts: requester}},
        {
          returnOriginal: false,
          projection: {contacts: 1}
        }
      ).then(function(doc) {
        userDefer.resolve(createUserArrayFromIdArray(doc.value.contacts));
      });

      users.findOneAndUpdate(
        {id: requester},
        {$push: {contacts: requestee}}
      ).then(function(doc) {
      });
    } else {
      userDefer.resolve();
    }

    contactRequests.deleteOne({
      requester: requester,
      requestee: requestee
    }).then(function(result) {
      exports.getRequests(requestee).then(function(requests) {
        requestDefer.resolve(requests);
      });
    });

    return deferred.spread(function(contacts, requests) {
      return {
        contacts: contacts,
        requests: requests
      };
    });
  };

  exports.gitResetHard = function gitResetHard() {
    let users = database.collection('users'),
        contactRequests = database.collection('contact-requests'),
        chats = database.collection('chats');

    contactRequests.remove({});
    chats.remove({}, function() {
      chats.insertMany([
        {
          users: ['test@test.com', 'test1@test.com', 'test2@test.com', 'test3@test.com'],
          name: 'SENG 513 Group',
          log: [
            {
              msg: 'Hi friends',
              timestamp: '12:01 Feb 23',
              user: 'test@test.com'
            },
            {
              msg: 'No',
              timestamp: '12:04 Feb 23',
              user: 'test1@test.com'
            }
          ]
        }
      ]);
    });

    users.remove({}, function() {
    // add a couple back in so we have something to work with
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
    });
  };
})(exports);