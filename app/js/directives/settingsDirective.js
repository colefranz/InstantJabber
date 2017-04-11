(function(angular) {
  'use strict';

  angular.module('jabber')

  .directive('settings', [
    function() {
    return {
      attribute: 'E',
      replace: true,
      templateUrl: 'templates/directives/settings.html',
      link: function(scope) {
        scope.visibility = {
          upgradeFromGuest: false
        };

        scope.toggleUpgradeVisibility = function() {
          scope.visibility.upgradeFromGuest = !scope.visibility.upgradeFromGuest;
        };
      }
    };
  }]);
})(angular);