/*global exports, setTimeout*/

exports.Promise = (function () {
    'use strict';

    var STATE = {
            'PENDING'  : 0,
            'FULFILLED': 1,
            'REJECTED' : 2
        },

        isObject = function (x) {
            return (x !== null && typeof x === 'object');
        },

        isFunction = function (x) {
            return (typeof x === 'function');
        },

        async = function (observer, state, value) {
            var promise      = observer.promise,
                isFulfilled  = state === STATE.FULFILLED,
                callbackName = (isFulfilled ? 'onFulfilled' : 'onRejected'),
                callback     = observer[callbackName];

            setTimeout(function () {
                if (typeof callback === 'function') {
                    try {
                        value = callback(value);

                        if (value === promise) {
                            throw new TypeError('Return value cannot refer to the same promise!');
                        }

                        if (isObject(value) || isFunction(value)) {
                            var then = value.then;

                            if (isFunction(then)) {
                                value.then.call(value, this.resolve.bind(this), this.reject.bind(this));
                            } else {
                                promise.resolve(value);
                            }
                        } else {
                            promise.resolve(value);
                        }
                    } catch (error) {
                        promise.reject(error);
                    }
                } else {
                    if (isFulfilled) {
                        promise.resolve(value);
                    } else {
                        promise.reject(value);
                    }
                }
            }, 0);
        },

        Promise = function () {
            var state = STATE.PENDING,
                value = null;

            this.observers = [];

            this.getState = function () {
                return state;
            };

            this.setState = function (newState, newValue) {
                if (state === STATE.PENDING) {
                    state = newState;
                    value = newValue;

                    return true;
                }

                return false;
            };

            this.getValue = function () {
                return value;
            };
        };

    Promise.prototype.resolve = function (value) {
        if (this.setState(STATE.FULFILLED, value)) {
            this.notify();
        }
    };

    Promise.prototype.reject = function (reason) {
        if (this.setState(STATE.REJECTED, reason)) {
            this.notify();
        }
    };

    Promise.prototype.notify = function () {
        var value = this.getValue(),
            state = this.getState(),
            observer;

        while (this.observers.length) {
            observer = this.observers.shift();
            async(observer, state, value);
        }
    };

    Promise.prototype.then = function (onFulfilled, onRejected) {
        var promise = new Promise();

        this.observers.push({
            'promise'    : promise,
            'onFulfilled': onFulfilled,
            'onRejected' : onRejected
        });

        if (this.getState() !== STATE.PENDING) {
            this.notify();
        }

        return promise;
    };

    return Promise;
}());
