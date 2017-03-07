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
      }).when('/chat', {
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

      $scope.addContact = function() {
        chatService.addContactRequest('test1@test.com');
      };

      $scope.gitResetHard = function() {
        chatService.gitResetHard();
      };

      function handleInformation(information) {
        $timeout(function() {
          // $scope.chats = information.chats;
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

      const messageCallback = function(message) {
        $scope.messages.push(message);
      };
      // Depending on how we move forward this would be the main entry point for the application.
      $scope.id = $route.current.params.id;

      chatService.subcribeToMessages(messageCallback, $scope.id);

      $scope.$on('$destroy', function() {
        chatService.deregisterFromMessages(messageCallback, $scope.id);
    });
  }]);

})(angular, io);