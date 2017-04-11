(function(exports) {
  'use strict';
  var moment = require('moment'),
      randomAdjectives,
      randomColours,
      randomAnimals;

  randomAdjectives = [
    'Obese',
    'Proud',
    'Fair',
    'Greedy',
    'Wise',
    'Foolish',
    'Tricky',
    'Truthful',
    'Loyal'
  ];
  randomColours = [
    'Beige',
    'Blond',
    'Cornsilk',
    'Crimson',
    'Eggplant',
    'Fandango',
    'Chestnut',
    'Chocolate',
    'Citrine',
    'Coffee',
    'Copper'
  ];
  randomAnimals = [
    'Chameleon',
    'Caiman',
    'Chipmunk',
    'Coati',
    'Coyote',
    'Chimpanzee',
    'Crocodile',
    'Dee',
    'Degu',
    'Dhole',
    'Dingoe',
    'Octopuse',
    'Opossum',
    'Owl',
    'Pangolin',
    'Panther',
    'Porcupine',
    'Platypuse',
    'Raccoon'
  ];

  function randomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  exports.createGuestName = function() {
    return randomFromArray(randomAdjectives) +
           randomFromArray(randomColours) +
           randomFromArray(randomAnimals);
  };

})(exports);