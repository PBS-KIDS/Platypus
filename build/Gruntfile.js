var path = require('path'),
    _ = require('lodash');

module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Default values
        version: 'NEXT',
        name: 'platypus',

        // Setup doc names / paths.
        docsName: '<%= pkg.name %>_docs-<%= version %>',
        docsZip: "<%= docsName %>.zip",

        // Setup Uglify for JS minification.
        uglify: {
            options: {
                banner: grunt.file.read('LICENSE'),
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
grunt.log.writeln(filepath);
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
                    'output/<%= pkg.name.toLowerCase() %>.combined.js': combineSource(
                            [
                                {cwd: '', config:'config.json', source:'platypus_source'}
                            ]
                    )
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
                    mode:'zip',
                    archive:'output/<%= docsZip %>'
                },
                files: [
                    {expand:true, src:'**', cwd:'<%= docsFolder %>'}
                ]
            }
        },

        copy: {
            docsZip: {
                files: [
                    {expand: true, cwd:'output/', src:'<%= docsZip %>', dest:'../docs/'}
                ]
            },
            docsSite: {
                files: [
                    {expand:true, cwd:'<%= docsFolder %>', src:'**', dest:getConfigValue('docs_out_path')}
                ]
            },
            src: {
                files: [
                    {expand: true, cwd:'./output/', src: '*.js', dest: '../lib/'}
                ]
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

    function getBuildConfig() {
        // Read the global settings file first.
        var config = grunt.file.readJSON('config.json');

        // If we have a config.local.json .. prefer its values.
        if (grunt.file.exists('config.local.json')) {
            var config2 = grunt.file.readJSON('config.local.json');
            _.extend(config, config2);
        }

        return config;
    }

    function getConfigValue(name) {
        var config = grunt.config.get('buildConfig');

        if (config == null) {
            config = getBuildConfig();
            grunt.config.set('buildConfig', config);
        }

        return config[name];
    }

    function getCombinedSource() {
        var configs = [
            {cwd: '', config:'config.json', source:'source'}
        ];

        return combineSource(configs);
    }

    function combineSource (configs) {
        // Pull out all the source paths.
        var sourcePaths = [];
        for (var i=0;i<configs.length;i++) {
            var o = configs[i];
            var json = grunt.file.readJSON(path.resolve(o.cwd, o.config));
            var sources = json[o.source];
            sources.forEach(function(item, index, array) {
                array[index] = path.resolve(o.cwd, item);
            });
            sourcePaths = sourcePaths.concat(sources);
        }

        return sourcePaths;
    }

    function getBuildArgs() {
        var banner = grunt.file.read("BANNER");
        grunt.config("concat.options.banner", banner);
    }

    // Load all the tasks we need
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadTasks('tasks/');

    grunt.registerTask('setDocsBase', "Internal utility task to set a correct base for YUIDocs.", function() {
        grunt.file.setBase('../src');
        grunt.config.set('docsFolder', "../build/output/<%= docsName %>/");
    });

    grunt.registerTask('resetBase', "Internal utility task to reset the base, after setDocsBase", function() {
        grunt.file.setBase('../build');
        grunt.config.set('docsFolder', "./output/<%= docsName %>/");
    });

    /**
     * Build the docs using YUIdocs.
     */
    grunt.registerTask('docs', [
        "setDocsBase", "yuidoc", "resetBase", "compress", "copy:docsZip"
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
    grunt.registerTask('next', function() {
        grunt.config("buildArgs", this.args || []);
        getBuildArgs();
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
    grunt.registerTask('build', function() {
        grunt.config("buildArgs", this.args || []);
        getBuildArgs();
        grunt.task.run(["setVersion", "updateversion", "combine", "uglify", "clearversion", "docs", "copy:src", "updatebower", "copy:docsSite", "clearBuildArgs"]);
    });

    grunt.registerTask('clearBuildArgs', function() {
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
