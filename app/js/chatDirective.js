(function(angular) {
  'use strict';

  angular.module('jabber')

  .directive('chat', ['chatController', function(chatController) {
    return {
      controller: ['$scope', chatController],
      link: function(scope, element) {
        element.on('mouseenter', function() {
          // say that we read the chat.
          console.log('focused!');
        });
      },
      templateUrl: 'templates/chat.html',
    };
  }]);
})(angular);