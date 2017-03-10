(function(angular) {
  'use strict';

  angular.module('jabber')

  .directive('chat', ['chatController', function(chatController) {
    return {
      replace: true,
      controller: ['$scope', chatController],
      link: function(scope, element) {
        var chatName = angular.element(element.find('input')[0]);
        scope.chatNameSelected = false;

        chatName.on('focus', function() {
          scope.chatNameSelected = true;
          scope.$digest();
        });

        chatName.on('keydown', function(event) {
          if (event.keyCode === 13) {
            scope.updateChatName();
            chatName.blur();
          } else if (event.keyCode === 27) {
            chatName.blur();
          }
        });

        chatName.on('blur focusout', function() {
          scope.chatNameSelected = false;
          scope.$digest();
        });

        element.on('mouseenter', function() {
          // say that we read the chat.
        });
      },
      templateUrl: 'templates/chat.html',
    };
  }]);
})(angular);