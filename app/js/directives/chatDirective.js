(function(angular) {
  'use strict';

  angular.module('jabber')

  .directive('chat', ['chatController', function(chatController) {
    return {
      replace: true,
      controller: ['$scope', chatController],
      link: function(scope, element) {
        var inputs = element.find('input'),
            chatName = angular.element(inputs[0]),
            messageInput = inputs[1];

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

        scope.addText = function(text) {
          var currentSelection,
              newText;

          messageInput.focus();

          currentSelection = messageInput.selectionStart || scope.chatBoxText.length;
          newText = [
            scope.chatBoxText.slice(0, currentSelection),
            text,
            scope.chatBoxText.slice(currentSelection)
          ].join('');

          scope.chatBoxText = newText;
        };

        scope.formatMessage = function(user, message) {
          if (user)
            return user + ': ' + message;
          else
            return message;
        };

        element.on('mouseenter', function() {
          // say that we read the chat.
        });
      },
      templateUrl: 'templates/chat.html'
    };
  }]);
})(angular);