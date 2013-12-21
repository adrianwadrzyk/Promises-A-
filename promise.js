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

        Promise = function (callback) {
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

            if (isFunction(callback)) {
                handle(callback, this.resolve.bind(this), this.reject.bind(this));
            }
        };

    var handle = function (callback, resolve, reject) {
        var done = false;

        try {
            callback(function (value) {
                if (done === false) {
                    done = true;
                    resolve(value);
                }
            }, function (reason) {
                if (done === false) {
                    done = true;
                    reject(reason);
                }
            });
        } catch (error) {
            if (done === false) {
                reject(error);
            }
        }
    };

    Promise.prototype.resolve = function (value) {
        try {
            if (value === this) {
                throw new TypeError('Return value cannot refer to the same promise!');
            }

            if (isObject(value) || isFunction(value)) {
                var then = value.then;

                if (isFunction(then)) {
                    handle(then.bind(value), this.resolve.bind(this), this.reject.bind(this));
                    return this;
                }
            }

            if (this.setState(STATE.FULFILLED, value)) {
                this.notify();
            }
        } catch (error) {
            this.reject(error);
        }

        return this;
    };

    Promise.prototype.reject = function (reason) {
        if (this.setState(STATE.REJECTED, reason)) {
            this.notify();
        }

        return this;
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

    var async = function (observer, state, value) {
        var promise      = observer.promise,
            isFulfilled  = state === STATE.FULFILLED,
            callbackName = (isFulfilled ? 'onFulfilled' : 'onRejected'),
            callback     = observer[callbackName];

        setTimeout(function () {
            try {
                if (typeof callback === 'function') {
                    value = callback(value);
                    promise.resolve(value);
                } else {
                    if (isFulfilled) {
                        promise.resolve(value);
                    } else {
                        promise.reject(value);
                    }
                }
            } catch (error) {
                promise.reject(error);
            }
        }, 0);
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
