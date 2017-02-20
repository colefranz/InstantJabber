(function(angular, io) {
  'use strict';

  angular.module('jabber', ['ngRoute'])

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

  .controller('mainController', ['$scope', '$http', function($scope, $http) {
    // Depending on how we move forward this would be the main entry point for the application.

    // this would be a get from the server
    // $http.get('/api/chats/${userID}', ...);
    $scope.chats = [
      {
        id: 'chat1',
        name: 'billy'
      },
      {
        id: 'chat2',
        name: 'tommy'
      },
      {
        id: 'chat3',
        name: 'sally'
      }
    ];
  }])

  .controller('homeController', ['$scope', '$http', function($scope, $http) {
    // Depending on how we move forward this would be the main entry point for the application.
    $scope.test = 'hi';
  }])

  .controller('chatController', ['$scope', '$http', '$route', function($scope, $http, $route) {
    // Depending on how we move forward this would be the main entry point for the application.
    $scope.id = $route.current.params.id;
  }]);

})(angular, io);