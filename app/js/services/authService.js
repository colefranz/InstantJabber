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
          authenticate('/user-login', creds);
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
          authenticate('/create', creds);
        };

        self.createGuest = function() {
          authenticate('/guest');
        };

        self.registerLoginStateObserver = function(callback) {
          loginStateChangedHandlers.push(callback);
        };

        self.logout = function() {
          socket.emit('logout');
          $window.localStorage.setItem('instant-jabber-token', undefined);
          loginStateChanged(false);
        };

        self.passwordMeetsComplexityRequirements = function(password) {
          var hasUppercase = false,
              hasLowercase = false,
              hasNumber = false,
              hasSymbol = false,
              i;

          if (password.length < 8)
            return false;

          for (i = 0; i < password.length; ++i) {
            if (password.charCodeAt(i) >= 65 && password.charCodeAt(i) <= 90)
              hasUppercase = true;
            else if (password.charCodeAt(i) >= 97 && password.charCodeAt(i) <= 122)
              hasLowercase = true;
            else if (password.charCodeAt(i) >= 48 && password.charCodeAt(i) <= 57)
              hasNumber = true;
            else
              hasSymbol = true;

            if (hasUppercase && hasLowercase && (hasNumber || hasSymbol))
              break;
          }

          return hasUppercase && hasLowercase && (hasNumber || hasSymbol);
        }

        function authenticate(path, creds) {
          $http.post(path, JSON.stringify(creds)).then(
            function(res) {
              if (res.data.status === true) {
                $window.localStorage.setItem('instant-jabber-token', res.data.token);
                userID = res.data.id;
                $window.location.reload(); // Ew.  Don't know a better way, though.
              }
              else
                loginStateChanged(false, res.data);
            }, function(res) {
              loginStateChanged(false);
            }
          );
        }


        function loginStateChanged(isLoggedIn, data) {
          userIsLoggedIn = isLoggedIn;

          _.forEach(loginStateChangedHandlers, function(handler) {
            handler(isLoggedIn, data);
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