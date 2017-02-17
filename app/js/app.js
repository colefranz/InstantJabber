(function(angular, io) {
  'use strict';

  angular.module('jabber', ['ngRoute'])

  // serve up a different page and controller depending on
  // the path.
  .config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
      $routeProvider.when('/', {
        templateUrl: 'templates/main.html',
        controller: 'mainController'
      });

      $locationProvider.html5Mode(true);
    }
  ])

  .controller('mainController', [function() {
    // Depending on how we move forward this would be the main entry point for the application.
  }]);

})(angular, io);