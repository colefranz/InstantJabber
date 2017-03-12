(function(angular) {
  'use strict';

  angular.module('jabber')

  .directive('emojiPicker', ['$document', function($document) {
    return {
      replace: true,
      restrict: 'E',
      link: {
        pre: function(scope, element) {
          scope.emojiDropdownVisible = false;
          scope.activeGroup = 'emoticon';
          scope.emojis = {
            emoticon: [],
            dingbats: [],
            transport: []
          };

          (function generateEmojis() {
            var index,
                unicodeString;

            // emoticon block
            for (index = parseInt('1F600', 16); index < parseInt('1F64F', 16) ; index++) {
              scope.emojis.emoticon.push(String.fromCodePoint(index));
            }

            // dingbat block
            for (index = parseInt('2702', 16); index < parseInt('27B0', 16) ; index++) {
              scope.emojis.dingbats.push(String.fromCodePoint(index));
            }

            // transport/map block
            for (index = parseInt('1F680', 16); index < parseInt('1F6C0', 16) ; index++) {
              scope.emojis.transport.push(String.fromCodePoint(index));
            }
          })();

          scope.setActiveGroup = function(groupName) {
            scope.activeGroup = groupName;
          };

          element.on('mousedown touchstart', function(event) {
            event.stopPropagation();
          });

          $document.on('mousedown touchstart', function(event) {
            scope.emojiDropdownVisible = false;
            scope.$digest();
          });
        }
      },
      templateUrl: 'templates/directives/emojiPicker.html'
    };
  }]);
})(angular);