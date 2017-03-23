(function(angular) {
  'use strict';

  angular.module('jabber')

  .factory('authService', ['$http',
    '$window',
    '$q',
    'socketService',
    function(
      $http,
      $window,
      $q,
      socketService
    ) {
      function AuthService() {
        var self = this,
            loginStateChangedHandlers = [],
            userIsLoggedIn = false,
            userID,
            socket = socketService.get();


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
          authenticate(creds, '/user-login');

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
          authenticate(creds, '/create');
        };

        self.registerLoginStateObserver = function(callback) {
          loginStateChangedHandlers.push(callback);
        };

        self.logout = function() {
          $window.localStorage.setItem('instant-jabber-token', undefined);
          loginStateChanged(false);
        }

        function authenticate(creds, path) {
          $http.post(path, JSON.stringify(creds)).then(
            function(res) {
              $window.localStorage.setItem('instant-jabber-token', res.data.token);
              userID = creds.id;
              loginStateChanged(true, res.data.token);
            }, function(res) {
              loginStateChanged(false);
            }
          );
        }


        function loginStateChanged(isLoggedIn, token) {
          userIsLoggedIn = isLoggedIn;

          _.forEach(loginStateChangedHandlers, function(handler) {
            handler(isLoggedIn, token);
          });
        }

        socket.on('authenticated', function() {
          loginStateChanged(true);
        });

        socket.on('unauthorized', function() {
          loginStateChanged(false);
        });

        socket.on('user-info', function(user) {
          userID = user.id;
        });

        return self;
      }

      return new AuthService();
    }
  ]);
})(angular);