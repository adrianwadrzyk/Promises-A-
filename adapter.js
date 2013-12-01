/*global require, exports*/

var Promise = require('./promise').Promise;

exports.deferred = function () {
    "use strict";
    var promise = new Promise();

    return {
        'promise': promise,
        'resolve': function (value) { promise.resolve(value); },
        'reject' : function (reason) { promise.reject(reason); }
    };
};
