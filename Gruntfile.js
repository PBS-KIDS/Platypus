/* global module, require */
var path = require('path');

module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Default values
        version: 'NEXT',
        name: 'platypus',

        // Setup doc names / paths.
        docsName: '<%= pkg.name %>_docs-<%= version %>',
        docsZip: "<%= docsName %>.zip",

        // Build docs using yuidoc
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                version: '<%= version %>',
                description: '<%= pkg.description %>',
                url: '<%= pkg.url %>',
                logo: '<%= pkg.logo %>',
                options: {
                    paths: ['./src/'],
                    outdir: '<%= docsFolder %>',
                    linkNatives: true,
                    attributesEmit: true,
                    selleck: true,
                    helpers: ["./build/path.js"],
                    themedir: "./build/platypusTheme/"
                }
            }
        },

        compress: {
            build: {
                options: {
                    mode: 'zip',
                    archive: 'output/<%= docsZip %>'
                },
                files: [{
                    expand: true,
                    src: '**',
                    cwd: '<%= docsFolder %>'
                }]
            }
        },

        copy: {
            docsSite: {
                files: [{
                    expand: true,
                    cwd: '<%= docsFolder %>',
                    src: '**',
                    dest: "docs/"
                }]
            },
            src: {
                files: [{
                    expand: true,
                    cwd: './build/output/',
                    src: '*.js',
                    dest: './lib/'
                }]
            }
        }
    });

    // Load all the tasks we need
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadTasks('tasks/');

    grunt.file.setBase('.');
    grunt.config.set('docsFolder', "./build/output/<%= docsName %>/");

    /**
     * Sets out version to the version in package.json (defaults to NEXT)
     */
    grunt.registerTask('setVersion', function () {
        grunt.config.set('version', grunt.config.get('pkg').version);
    });

    /**
     * Task for exporting a release build (version based on package.json)
     *
     */
    grunt.registerTask('build', function () {
        grunt.config("buildArgs", this.args || []);
        grunt.task.run(["setVersion", "yuidoc", "compress", "copy:docsSite", "clearBuildArgs"]);
    });

    grunt.registerTask('clearBuildArgs', function () {
        grunt.config("buildArgs", []);
    });
};
