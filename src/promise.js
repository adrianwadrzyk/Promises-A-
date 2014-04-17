/* global module, setTimeout */

/**!
 * Promise A+
 *
 * @version 1.0.0
 * @link https://github.com/adrianwadrzyk/Promises-Aplus
 * @author Adrian Wądrzyk
 * @license MIT License
 */
(function (global) {
    "use strict";

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
        };

    /**
     * Promise A+
     *
     * @class Promise
     * @param {Function} resolver
     * @constructor
     */
    var Promise = function (resolver) {
        var state  = STATE.PENDING,
            result = null;

        this.reactions = [];

        this.getState = function () {
            return state;
        };

        this.setState = function (newState, value) {
            if (state === STATE.PENDING) {
                state  = newState;
                result = value;

                return true;
            }

            return false;
        };

        this.getResult = function () {
            return result;
        };

        if (isFunction(resolver)) {
            handle(resolver, this.resolve.bind(this), this.reject.bind(this));
        }
    };

    var handle = function (resolver, resolve, reject) {
        var done = false;

        try {
            resolver(function (value) {
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

    /**
     * @method cast
     * @static
     * @param {Object} obj
     * @return {Promise}
     */
    Promise.cast = function (obj) {
        if (isObject(obj) && obj instanceof Promise) {
            return obj;
        }

        return new Promise().resolve(obj);
    };

    /**
     * @method resolve
     * @static
     * @param {Object} value
     * @return {Promise}
     */
    Promise.resolve = function (value) {
        return new Promise().resolve(value);
    };

    /**
     * @method reject
     * @static
     * @param {Object} reason
     * @return {Promise}
     */
    Promise.reject = function (reason) {
        return new Promise().reject(reason);
    };

    /**
     * @method all
     * @static
     * @param {Promise} items*
     * @return {Promise}
     */
    Promise.all = function (items) {
        return new Promise(function (resolve, reject) {
            var remaining = items.length,
                results = [],

                onFulfilled = function (index) {
                    return function (value) {
                        results[index] = value;

                        if (--remaining === 0) {
                            resolve(results);
                        }
                    };
                },

                onRejected = function (reason) {
                    remaining = 0;
                    reject(reason);
                };

            for (var i = 0; i < items.length; i++) {
                items[i].then(onFulfilled(i), onRejected);
            }
        });
    };

    /**
     * @method race
     * @static
     * @param {Promise} items*
     * @return {Promise}
     */
    Promise.race = function (items) {
        return new Promise(function (resolve, reject) {
            var pending = true,

                onFulfilled = function (value) {
                    if (pending) {
                        pending = false;
                        resolve(value);
                    }
                },

                onRejected = function (reason) {
                    if (pending) {
                        pending = false;
                        reject(reason);
                    }
                };

            for (var i = 0; i < items.length; i++) {
                items[i].then(onFulfilled, onRejected);
            }
        });
    };

    /**
     * @method resolve
     * @param {Object} value
     * @chainable
     */
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

    /**
     * @method reject
     * @param {Object} reason
     * @chainable
     */
    Promise.prototype.reject = function (reason) {
        if (this.setState(STATE.REJECTED, reason)) {
            this.notify();
        }

        return this;
    };

    /**
     * @method notify
     */
    Promise.prototype.notify = function () {
        var value = this.getResult(),
            state = this.getState(),
            reaction;

        while (this.reactions.length) {
            reaction = this.reactions.shift();
            async(reaction, state, value);
        }
    };

    var async = function (reaction, state, value) {
        var promise     = reaction.promise,
            isFulfilled = state === STATE.FULFILLED,
            handlerName = (isFulfilled ? 'onFulfilled' : 'onRejected'),
            handler     = reaction[handlerName];

        setTimeout(function () {
            try {
                if (typeof handler === 'function') {
                    value = handler(value);
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

    /**
     * @method then
     * @param {Function} onFulfilled
     * @param {Function} onRejected
     * @return {Promise}
     */
    Promise.prototype.then = function (onFulfilled, onRejected) {
        var promise = new Promise();

        this.reactions.push({
            'promise'    : promise,
            'onFulfilled': onFulfilled,
            'onRejected' : onRejected
        });

        if (this.getState() !== STATE.PENDING) {
            this.notify();
        }

        return promise;
    };

    /**
     * @method catch
     * @param {Function} onRejected
     * @return {Promise}
     */
    Promise.prototype.catch = function (onRejected) {
        return this.then(undefined, onRejected);
    };

    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = Promise;
    } else {
        global.Promise = Promise;
    }
}(this));
