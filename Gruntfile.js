/* global module, require */

module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({
        jshint: {
            src: ["src/promise.js"],
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
        },

        uglify: {
            dist: {
                src: ["<%= jshint.src %>"],
                dest: 'dist/promise.min.js'
            },
            options: {
                sourceMap: true,
                preserveComments: "some"
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-uglify");

    grunt.registerTask("default", ["test", "build"]);
    grunt.registerTask("test", ["mochaTest"]);
    grunt.registerTask("build", ["uglify"]);
};
