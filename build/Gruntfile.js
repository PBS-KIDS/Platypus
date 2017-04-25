/* global module, require */
var path = require('path');

module.exports = function (grunt) {
    'use strict';

    grunt.loadNpmTasks('grunt-contrib-jasmine');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Default values
        version: 'NEXT',
        name: 'platypus',

        // Setup doc names / paths.
        docsName: '<%= pkg.name %>_docs-<%= version %>',
        docsZip: "<%= docsName %>.zip",

        // Setup tests
        jasmine: {
            src: [
                "node_modules/springroll/components/preloadjs/lib/preloadjs.combined.js",
                "node_modules/springroll/components/soundjs/lib/soundjs.combined.js",
                "node_modules/pixi.js/dist/pixi.js",
                "node_modules/springroll/dist/core.js",
                "node_modules/springroll/dist/modules/pixi-display.js",
                "node_modules/springroll/dist/modules/states.js",
                "output/platypus.combined.js"
            ],
            options: {
                specs: "spec/**/*.js",
                vendor: "vendor/**/*.js",
                version: '2.0.0'
            }
        },
        
        // Setup Uglify for JS minification.
        uglify: {
            options: {
                banner: "/*!\n * @license PLATYPUS v<%= version %>\n *\n * Distributed under the terms of the MIT license.\n * http://www.opensource.org/licenses/mit-license.html\n *\n * This notice shall be included in all copies or substantial portions of the Software.\n */\n\n",
                preserveComments: "some",
                compress: {
                    global_defs: {
                        "DEBUG": false
                    }
                }
            },
            build: {
                files: {
                    'output/<%= pkg.name.toLowerCase() %>.min.js': getConfigValue('platypus_source')
                }
            }
        },

        concat: {
            options: {
                separator: '',
                process: function (src, filepath) {
                    // Remove a few things from each file, they will be added back at the end.

                    // Strip the license header.
                    var file = src.replace(/^(\/\*\s)[\s\S]+?\*\//, "");

                    // Strip namespace label
                    file = file.replace(/\/\/\s*namespace:/, "");

                    // Strip @module
                    file = file.replace(/\/\*\*[\s\S]+?@module[\s\S]+?\*\//, "");

                    // Clean up white space
                    file = file.replace(/^\s*/, "");
                    file = file.replace(/\s*$/, "");

                    // Append on the class name
                    file =
                        "\n\n//##############################################################################\n"+
                        "// " + path.basename(filepath) + "\n" +
                        "//##############################################################################\n\n"+
                        file;
                    return file;
                }
            },
            build: {
                files: {
                    'output/<%= pkg.name.toLowerCase() %>.combined.js': combineSource([{
                        cwd: '',
                        config: 'config.json',
                        source: 'platypus_source'
                    }])
                }
            }
        },

        // Build docs using yuidoc
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                version: '<%= version %>',
                description: '<%= pkg.description %>',
                url: '<%= pkg.url %>',
                logo: '<%= pkg.logo %>',
                options: {
                    paths: ['./'],
                    outdir: '<%= docsFolder %>',
                    linkNatives: true,
                    attributesEmit: true,
                    selleck: true,
                    helpers: ["../build/path.js"],
                    themedir: "../build/platypusTheme/"
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
                    dest: getConfigValue('docs_out_path')
                }]
            },
            src: {
                files: [{
                    expand: true,
                    cwd: './output/',
                    src: '*.js',
                    dest: '../lib/'
                }]
            }
        },

        updateversion: {
            platypus: {
                file: '../src/platypus.js',
                version: '<%= version %>'
            }
        },

        clearversion: {
            platypus: {
                file: '../src/platypus.js'
            }
        }
    });

    function getConfigValue (name) {
        var config = grunt.file.readJSON('config.json');

        grunt.config.set('buildConfig', config);

        return config[name];
    }

    function combineSource (configs) {
        var handle = function (item, index, array) {
                array[index] = path.resolve(this.cwd, item);
            },
            i = 0,
            json = null,
            o = null,
            sourcePaths = [],
            sources = null;

        // Pull out all the source paths.
        for (i = 0; i < configs.length; i++) {
            o = configs[i];
            json = grunt.file.readJSON(path.resolve(o.cwd, o.config));
            sources = json[o.source];
            sources.forEach(handle.bind(o));
            sourcePaths = sourcePaths.concat(sources);
        }

        return sourcePaths;
    }

    // Load all the tasks we need
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadTasks('tasks/');

    grunt.registerTask('setDocsBase', "Internal utility task to set a correct base for YUIDocs.", function () {
        grunt.file.setBase('../src');
        grunt.config.set('docsFolder', "../build/output/<%= docsName %>/");
    });

    grunt.registerTask('resetBase', "Internal utility task to reset the base, after setDocsBase", function () {
        grunt.file.setBase('../build');
        grunt.config.set('docsFolder', "./output/<%= docsName %>/");
    });

    /**
     * Build the docs using YUIdocs.
     */
    grunt.registerTask('docs', [
        "setDocsBase", "yuidoc", "resetBase", "compress", "copy:docsSite"
    ]);

    /**
     * Sets out version to the version in package.json (defaults to NEXT)
     */
    grunt.registerTask('setVersion', function () {
        grunt.config.set('version', grunt.config.get('pkg').version);
    });

    /**
     * Task for exporting a next build.
     *
     */
    grunt.registerTask('next', function () {
        grunt.config("buildArgs", this.args || []);
        grunt.config("concat.options.banner", "/*!\n * PLATYPUS v<%= pkg.version %>-next\n *\n */");
        grunt.task.run(["updateversion", "combine", "uglify", "clearversion", "copy:src", "clearBuildArgs"]);
    });

    /**
     * Task for exporting only the next lib.
     *
     */
    grunt.registerTask('nextlib', [
        "updateversion", "combine", "uglify", "clearversion", "copy:src"
    ]);

    /**
     * Task for exporting a release build (version based on package.json)
     *
     */
    grunt.registerTask('build', function () {
        grunt.config("buildArgs", this.args || []);
        grunt.config("concat.options.banner", "/*!\n * PLATYPUS v<%= pkg.version %>\n *\n */");
        grunt.task.run(["setVersion", "updateversion", "combine", "uglify", "clearversion", "docs", "copy:src", "updatebower", "copy:docsSite", "clearBuildArgs"]);
    });

    grunt.registerTask('clearBuildArgs', function () {
        grunt.config("buildArgs", []);
    });

    /**
     * Task for exporting combined view.
     *
     */
    grunt.registerTask('combine', 'Combine all source into a single, un-minified file.', [
        "concat"
    ]);

};
