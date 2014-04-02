/*global require, exports*/

var Promise = require('../src/promise');

exports.deferred = function () {
    "use strict";
    var promise = new Promise();

    return {
        'promise': promise,
        'resolve': promise.resolve.bind(promise),
        'reject' : promise.reject.bind(promise)
    };
};

exports.resolved = function (value) {
    return new Promise().resolve(value);
};

exports.rejected = function (reason) {
    return new Promise().reject(reason);
};
