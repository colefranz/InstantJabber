(function(angular) {
  'use strict';

  angular.module('jabber')

  .directive('sideBar', [function() {
    return {
      replace: true,
      templateUrl: 'templates/sideBar.html'
    }
  }]);
})(angular);