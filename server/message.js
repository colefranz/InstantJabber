(function(exports) {
  'use strict';
  var moment = require('moment');

  exports.Message = function(id, message) {
    var messageObject = {},
        timestamp = moment().format("dddd, MMMM Do YYYY, h:mm:ss a");

    messageObject.msg = message;
    messageObject.user = id;
    messageObject.timestamp = timestamp;

    return messageObject;
  };
})(exports);