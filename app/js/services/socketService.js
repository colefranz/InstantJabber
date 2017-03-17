(function(io) {
  'use strict';

  angular.module('jabber')

  .factory('socketService', [function() {
    var socket = io.connect();

    function authenticate(token) {
      socket.emit('authenticate', {token: token});
    }

    function get() {
      return socket;
    }

    return {
      authenticate: authenticate,
      get: get
    };
  }]);
})(io);