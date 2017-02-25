(function(angular) {
  'use strict';

  angular.module('jabber')

  .factory('authService', ['socket', function(socket) {
    function AuthService() {
      var self = this,
          loginStateChangedHandlers = [];

      self.loggedIn = false;
      

      /*
      * initial handshake with server for it to start
      * listening and sending events to the user
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
          self.loggedIn = wasLoggedIn;
          socket.removeAllListeners('login-result');
          loginStateChanged(wasLoggedIn);
        });
      };

      self.registerLoginStateObserver = function(callback) {
        loginStateChangedHandlers.push(callback);
        callback(self.loggedInState)
      }

      function loginStateChanged(isLoggedIn) {
        _.forEach(loginStateChangedHandlers, function(handler) {
          handler(isLoggedIn);
        });
      }

      socket.on('login-failed', function() {
        //tell the user that login failed
      });

      // connect to chat would be called by the maincontroller when the user
      // is logged in, or using cookies (if that's required?)
      // for now we will just pass in some dummy data
      // self.login({id: 'test', pass: 'test'});
      
      return self;
    }

    return new AuthService();
  }]);
})(angular);