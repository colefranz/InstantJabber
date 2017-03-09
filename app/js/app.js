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

  // main controller should be the main talking point for the whole application
  // in order to prevent coupling between services and such.
  .controller('mainController', [
    '$location',
    '$scope',
    '$timeout',
    'authService',
    'chatService',
    function(
      $location,
      $scope,
      $timeout,
      authService,
      chatService
    ) {
      $scope.chats = [];
      $scope.contacts = [];
      $scope.isLoggedIn = false;

      $scope.openChat = function(id) {
        chatService.getChatForID(id).then(function(chatID) {
          $location.path('/chat-' + chatID);
        });
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

  }]);

})(angular, io);