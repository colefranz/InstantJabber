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
          online: true,
          others: ???
        },
        options: {
          requestsVisible: true,
          chatsVisible: true,
          contactsVisible: true
        },
        private: {
          password: xxxx
          failedLogins: 0
          failedLoginTime: time_in_ms
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

  exports.setSocket = function(userID, socket) {
    let users = database.collection('users');

    users.findOneAndUpdate(
      {id: userID},
      { $set: {socket: socket}}
    );
  };

  exports.login = function(creds, token) {
    let users = database.collection('users'),
        deferred = Q.defer();

    exports.isAccountLockedOut(creds).then(function() {
      deferred.reject('This account is locked out. Please try again later.');
    }, function() {
      users.findOne({id: creds.id}).then(function(doc) {
        if (doc === null) {
          deferred.reject('The email or password is incorrect.');
          return;
        }
      
        // Log in.
        if (doc.private.password === creds.pass) {
          users.update({id: creds.id}, {$set: {'private.failedLogins': 0, 'info.online': true}}).then(function() {
            deferred.resolve();
          });
        } else {
          users.update({id: creds.id}, {
            $inc: {'private.failedLogins': 1},
            $set: {'private.failedLoginTime': new Date().getTime()}
          }).then(function() {
            deferred.reject('The email or password is incorrect.');
          });
        }
      });
    });
    
    return deferred.promise;
  };

  exports.isAccountLockedOut = function(creds) {
    const LOCKOUT_TIME_MS = 60 * 1000; // One minute.
    const MAX_RETRIES = 5;
    let users = database.collection('users'),
        deferred = Q.defer();

    users.findOne({id: creds.id}).then(function(doc) {
      if (doc === null) {
        deferred.reject(); // Doesn't exist, so cannot be locked out.
        return;
      }

      if (doc.private.failedLogins > 0 &&
        new Date().getTime() - doc.private.failedLoginTime > LOCKOUT_TIME_MS) {
        // Reset lockout timer.
        users.update({id: creds.id}, {$set: {"private.failedLogins": 0}}).then(function() {
          deferred.reject();
        });
      } else if (doc.private.failedLogins >= MAX_RETRIES)
        deferred.resolve();
      else
        deferred.reject();
    });

    return deferred.promise;
  };
  
  exports.logout = function(userID) {
    let users = database.collection('users');

    users.findOneAndUpdate(
      {id: userID},
      {$unset: {socket: ''}, $set: {'info.online': false}},
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
            name: creds.name,
            online: true
          },
          options: {
            requestsVisible: true,
            chatsVisible: true,
            contactsVisible: true
          },
          private: {
            password: creds.pass,
            failedLogins: 0,
            failedLoginTime: new Date().getTime()
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

  exports.changeRequestsVisibility = function(userID, visible) {
    let users = database.collection('users');

    users.findOneAndUpdate(
      {id: userID},
      {$set: {'options.requestsVisible': visible}}
    ).then(function(docs) {
      console.log('User ' + userID + ': ' + 'Changed requests visibility to ' + visible + '.');
    });
  };

  exports.changeChatsVisibility = function(userID, visible) {
    let users = database.collection('users');

    users.findOneAndUpdate(
      {id: userID},
      {$set: {'options.chatsVisible': visible}}
    ).then(function(docs) {
      console.log('User ' + userID + ': ' + 'Changed chats visibility to ' + visible + '.');
    });
  };

  exports.changeContactsVisibility = function(userID, visible) {
    let users = database.collection('users');

    users.findOneAndUpdate(
      {id: userID},
      {$set: {'options.contactsVisible': visible}}
    ).then(function(docs) {
      console.log('User ' + userID + ': ' + 'Changed contacts visibility to ' + visible + '.');
    });
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
      {returnOriginal: false}
    ).then(function(doc) {
      createUserArrayFromIdArray(doc.value.users).then(function(users) {
        doc.value.users = users;
        deferred.resolve(doc.value);
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
      {returnOriginal: false}
    ).then(function(doc) {
      createUserArrayFromIdArray(doc.value.users).then(function(users) {
        doc.value.users = users;
        deferred.resolve(doc.value);
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
      exports.getRequests(requestee).then(requestDefer.resolve);
    });

    return deferred.spread(function(contacts, requests) {
      return {
        contacts: contacts,
        requests: requests
      };
    });
  };

  /**
   * add an array of users to an existing chat
   */
  exports.addUsersToChat = function(chatID, idArray) {
    let chats = database.collection('chats'),
        deferred = Q.defer();

    chats.findOneAndUpdate(
      {_id: ObjectID(chatID)},
      {$pushAll: {users: idArray}},
      {
        returnOriginal: false
      }
    ).then(function(doc) {
      deferred.resolve(doc.value);
    });

    return deferred.promise;
  };
})(exports);