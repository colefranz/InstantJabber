(function(angular) {
  'use strict';

  angular.module('jabber')

  .factory('chatController', [
    '$route',
    '$timeout',
    'chatService',
    function(
      $route,
      $timeout,
      chatService
    ) {
      return function($scope) {
        $scope.id = $route.current.params.id;
        $scope.chatBoxText = '';
        $scope.addToChatVisible = false;
        $scope.contacts = [];

        $scope.sendChat = function() {
          if ($scope.chatBoxText !== '') {
            chatService.sendChat($scope.id, $scope.chatBoxText);
            $scope.chatBoxText = '';
          }
        };

        $scope.updateChatName = function() {
          chatService.updateChatName($scope.id, $scope.chat.name);
        };

        $scope.openAddToChat = function() {
          if ($scope.addToChatVisible === true) {
            
            return;
          }

          // find all contacts that aren't a part of the chat already
          $scope.contacts = _.filter(chatService.getContacts(), function(contact) {
            var index = _.findIndex($scope.chat.users, function(user) {
              return user.id === contact.id;
            });

            return index === -1;
          });

          _.forEach($scope.contacts, function(contact) {
            contact.selected = false;
          });

          $scope.addToChatVisible = true;
        };

        $scope.addSelectedToChat = function() {
          var usersToAdd = _.filter($scope.contacts, function(user) {
            return user.selected;
          });

          if (usersToAdd.length > 0) {
            usersToAdd = _.map(usersToAdd, function(user) {
              return user.id;
            });
            chatService.addUsersToChat($scope.id, usersToAdd);
            $scope.addToChatVisible = false;
          }
        };

        function chatUpdatedCallback(chat) {
          $timeout(function() {
            $scope.chat = chat;
          }, 0);
        }

        function getUsersObjectFromChat(chat) {
          var usersObj = {};

          _.forEach(chat.users, function(user) {
            usersObj[user.id] = user.info.name;
          });

          return usersObj;
        }

        chatService.subcribeToChatUpdates(chatUpdatedCallback, $scope.id);

        chatService.getChat($scope.id).then(function(chat) {
          $scope.chat = chat;
          $scope.users = getUsersObjectFromChat(chat);
        });

        $scope.$on('$destroy', function() {
          chatService.deregisterFromChatUpdates(chatUpdatedCallback, $scope.id);
        });
      };
    }
  ]);
})(angular);
