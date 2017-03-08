(function(angular, io) {
  'use strict';

  angular.module('jabber', ['ngRoute', 'ngTouch'])

  .run(['$location',
    '$rootScope',
    'authService',
    function(
      $location,
      $rootScope,
      authService
    ) {
      $rootScope.$on('$routeChangeStart', function(event) {
        if (!authService.isLoggedIn()){
          $location.path('/');
        }
      });
    }
  ])

  // create somewhere for all services to get access to our websocket.
  .factory('socket', [function() {
    return io();
  }])

  // serve up a different page and controller depending on
  // the path.
  .config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
      $routeProvider.when('/', {
        templateUrl: 'templates/home.html',
        controller: 'homeController'
      }).when('/chat-:id', {
        templateUrl: 'templates/chat.html',
        controller: 'chatController'
      }).otherwise({
        templateUrl: 'templates/home.html',
        controller: 'homeController'
      });

      $locationProvider.html5Mode(true);
    }
  ])

  .controller('mainController', [
    '$scope',
    '$timeout',
    'authService',
    'chatService',
    function(
      $scope,
      $timeout,
      authService,
      chatService
    ) {
      $scope.chats = [];
      $scope.contacts = [];
      $scope.isLoggedIn = false;

      $scope.openChat = function(id) {

      };

      $scope.gitResetHard = function() {
        chatService.gitResetHard();
      };

      function handleInformation(information) {
        $timeout(function() {
          $scope.chats = information.chats;
          $scope.contacts = information.contacts;
          $scope.requests = information.requests;
          console.log('new information ', information);
        }, 0);
      }

      function handleLoginStateChange(isLoggedIn) {
        $timeout(function() {
          $scope.isLoggedIn = isLoggedIn;
          
          if (!isLoggedIn) {
            // handle failure
          }
        }, 0);
      }

      //initialize
      (function initialize() {
        authService.registerLoginStateObserver(handleLoginStateChange);
        chatService.subscribeToActiveInformation(handleInformation);
      })();
    }
  ])

  .controller('homeController', ['$scope', '$http', function($scope, $http) {
    
  }])

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

      function messageCallback(message) {
        $scope.messages.push(message);
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

})(angular, io);