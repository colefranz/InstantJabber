(function(angular) {
  'use strict';

  angular.module('jabber')

  .factory('authService', ['socket', function(socket) {
    function AuthService() {
      var self = this,
          loginStateChangedHandlers = [],
          userIsLoggedIn = false,
          userID;

      
      self.isLoggedIn = function() {
        return userIsLoggedIn;
      };

      self.getUserID = function() {
        return userID;
      };

      /**
       * login to the server
       *
       * expects
       * creds: {
       *   id,
       *   pass
       * }
       */

      self.login = function(creds) {
        socket.emit('login', creds);

        socket.on('login-result', function(wasLoggedIn) {
          if (wasLoggedIn) {
            userID = creds.id;
          }
          
          userIsLoggedIn = wasLoggedIn;
          socket.removeAllListeners('login-result');
          loginStateChanged(wasLoggedIn);
        });
      };

      /**
       * attempt to create an account
       *
       * expects
       * creds: {
       *   id,
       *   pass,
       *   name
       * }
       */

      self.create = function(creds) {
        socket.emit('create-account', creds);

        socket.on('login-result', function(wasLoggedIn) {
          if (wasLoggedIn) {
            userID = creds.id;
          }

          userIsLoggedIn = wasLoggedIn;
          socket.removeAllListeners('login-result');
          loginStateChanged(wasLoggedIn);
        });
      };

      self.registerLoginStateObserver = function(callback) {
        loginStateChangedHandlers.push(callback);
        callback(userIsLoggedIn)
      };
      

      function loginStateChanged(isLoggedIn) {
        _.forEach(loginStateChangedHandlers, function(handler) {
          handler(isLoggedIn);
        });
      }
      
      return self;
    }

    return new AuthService();
  }]);
})(angular);