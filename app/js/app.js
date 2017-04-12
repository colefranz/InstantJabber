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
          $location.path('/login');
        }
      });
    }
  ])

  // serve up a different page and controller depending on
  // the path.
  .config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
      $routeProvider.when('/login', {
        template: '<login></login>'
      }).when('/chat-:id', {
        template: '<chat></chat>'
      }).when('/settings', {
        template: '<settings></settings>'
      }).otherwise({
        templateUrl: 'templates/home.html'
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
    '$window',
    'authService',
    'chatService',
    'socketService',
    function(
      $location,
      $scope,
      $timeout,
      $window,
      authService,
      chatService,
      socketService
    ) {
      $scope.chats = [];
      $scope.contacts = [];
      $scope.isLoggedIn = false;

      $scope.openChat = function(id) {
        chatService.getChatForID(id).then(function(chatID) {
          $location.path('/chat-' + chatID);
        });
      };

      function handleInformation(information) {
        $timeout(function() {
          $scope.chats = information.chats;
          $scope.contacts = information.contacts;
          $scope.requests = information.requests;
          console.log('new information ', information);
        }, 0);
      }

      function handleLoginStateChange(isLoggedIn, token) {
        $timeout(function() {
          $scope.isLoggedIn = isLoggedIn;

          if (!isLoggedIn) {
            $location.path('/login');
          } else {
            $location.path('/');
          }
        }, 0);
      }


      //initialize
      (function initialize() {
        var token = $window.localStorage.getItem('instant-jabber-token');
        socketService.authenticate(token);
        authService.registerLoginStateObserver(handleLoginStateChange);
        chatService.subscribeToActiveInformation(handleInformation);
      })();
    }
  ])

  .controller('homeController', ['$scope', '$http', function($scope, $http) {

  }]);

})(angular, io);