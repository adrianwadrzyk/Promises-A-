/* global require, describe */

var adapter = require('./test-adapter');

describe('Promises/A+ Tests', function () {
    require('promises-aplus-tests').mocha(adapter);
});
