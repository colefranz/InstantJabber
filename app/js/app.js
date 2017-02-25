(function(angular, io) {
  'use strict';

  angular.module('jabber', ['ngRoute', 'ngTouch'])

  .run(['$location', '$rootScope', function($location, $rootScope) {
    $rootScope.$on('$routeChangeStart', function(event) {
      // if not logged in
      $location.path('/');
    });
  }])

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

  .controller('mainController', ['$scope', '$http', 'chatService', function($scope, $http, chatService) {
    $scope.sidebarState = 'chats';
    $scope.sidebarStates = ['chats', 'contacts'];
    $scope.chats = [];
    $scope.contacts = [];

    $scope.openChat = function(id) {

    };

    $scope.addContact = function() {
      chatService.addContact('test1');
    };

    $scope.gitResetHard = function() {
      chatService.gitResetHard();
    };

    $scope.setSidebar = function(state) {
      $scope.sidebarState = state;
    };

    // immediately get contacts and chats
    chatService.subscribeToActiveInformation(handleInformation);

    function handleInformation(information) {
      // $scope.chats = information.chats;
      $scope.chats = [{id: '1', name: '1'}];
      $scope.contacts = information.contacts;
      console.log('new information ', information);
    }
    
  }])

  .controller('homeController', ['$scope', '$http', function($scope, $http) {
    // Depending on how we move forward this would be the main entry point for the application.
    
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