(function(angular) {
  'use strict';

  angular.module('jabber')
  
  .controller('chatController', [
    '$scope',
    '$http',
    '$route',
    'chatService',
    function(
      $scope,
      $http,
      $route,
      chatService
    ) {
      $scope.messages = [];
      $scope.id = $route.current.params.id;
      $scope.chatBoxText = '';

      $scope.sendChat = function() {
        if ($scope.chatBoxText !== '') {
          chatService.sendChat($scope.id, $scope.chatBoxText);
          $scope.chatBoxText = '';
        }
      };

      function messageCallback(message) {
        $scope.chat.log.push(message);
        $scope.$apply();
      }
      
      function getUsersObjectFromChat(chat) {
        var usersObj = {};

        _.forEach(chat.users, function(user) {
          usersObj[user.id] = user.info.name;
        });

        return usersObj;
      }
      
      chatService.subcribeToMessages(messageCallback, $scope.id);

      chatService.getChat($scope.id).then(function(chat) {
        $scope.chat = chat;
        $scope.users = getUsersObjectFromChat(chat);
      });

      $scope.$on('$destroy', function() {
        chatService.deregisterFromMessages(messageCallback, $scope.id);
    });
  }]);
})(angular);