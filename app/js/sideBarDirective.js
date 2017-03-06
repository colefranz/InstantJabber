(function(angular) {
  'use strict';

  angular.module('jabber')

  .directive('sideBar', ['chatService', function(chatService) {
    return {
      replace: true,
      templateUrl: 'templates/sideBar.html',
      link: function(scope) {
        scope.addContactResponse = function(requester, acceptedRequest) {
          chatService.addContactResponse(requester, acceptedRequest);
        };
      }
    };
  }]);
})(angular);