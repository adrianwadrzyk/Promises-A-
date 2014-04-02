/* global module, require */

module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({
        jshint: {
            src: ["promise.js"],
            options: {
                reporter: require("jshint-stylish")
            }
        },

        mochaTest: {
            src: ['test/test-runner.js'],
            options: {
                reporter: 'spec'
            }
        },

        watch: {
            files: ["<%= jshint.src %>"],
            tasks: ["jshint", "mochaTest"]
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.registerTask("default", ["watch"]);
    grunt.registerTask("test", ["mochaTest"]);
};
