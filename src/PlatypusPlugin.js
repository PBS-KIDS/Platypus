/**
 * This plugin instantiates a Platypus game using the configuration file. Configurations should be placed within the SpringRoll config with the following structure:
 *
 *      {
 *          "platypus": {
 *              "entities": {},
 *              "levels": {},
 *              "scenes": {},
 *              "spriteSheets": {}
 *          },
 *          "sounds": {} // Platypus uses the SpringRoll audio system and syntax for audio assets.
 *      }
 *
 * The Platypus game instance is `app.platypus` on the SpringRoll Application and `platypus.game` within the platypus namespace.
 *
 * @namespace platypus
 * @class PlatypusPlugin
 */
/*global console, document, include, platypus, window */
(function () {
    'use strict';
    
    var Application = include('springroll.Application'),
        ApplicationPlugin = include('springroll.ApplicationPlugin'),
        PIXI = include('window.PIXI', false),
        updateFunction = null,
        plugin = new ApplicationPlugin(),
        resizeFunction = null,
        sayHello = (function () {
            var getPortion = function (num, max) {
                    var min = 204;
                
                    return Math.floor(min * num / max);
                },
                getStyle = function (title, version) {
                    var max = 0,
                        min = 0,
                        style = 'color: #ffffff; padding:3px 0; border-radius: 6px;',
                        r = 0,
                        g = 0,
                        b = 0,
                        v = null;
                        
                    if (version) {
                        v = version.greenSplit('.');
                    }
                    
                    if (version && (v.length === 3)) {
                        r = parseInt(v[0], 10);
                        g = parseInt(v[1], 10);
                        b = parseInt(v[2], 10);
                    } else {
                        r = title.charCodeAt(0) || 0;
                        g = title.charCodeAt(1) || 0;
                        b = title.charCodeAt(2) || 0;
                        min = Math.min(r, g, b);
                        r -= min;
                        g -= min;
                        b -= min;
                    }
                    
                    if (v) {
                        v.recycle();
                    }
                    
                    max = Math.max(r, g, b, 1);

                    return style + ' background: rgb(' + getPortion(r, max) + ',' + getPortion(g, max) + ',' + getPortion(b, max) + ');';
                },
                getVersions = function (text, title, arr) {
                    var i = 0,
                        str = '',
                        versions = Array.setUp(text, getStyle(title, title.substr(title.lastIndexOf(' ') - title.length + 1)), '');
                    
                    for (i = 0; i < arr.length; i++) {
                        str = arr[i];
                        versions.push(getStyle(str, str.substr(str.lastIndexOf(' ') - str.length + 1)), '');
                    }
                    
                    return versions;
                };
            
            return function (settings, app) {
                var cJS     = window.createjs,
                    options = app.options,
                    author  = (options.author ? 'by ' + options.author : ''),
                    pixi    = PIXI,
                    title   = app.name || document.title || '',
                    engine  = 'Platypus ' + platypus.version,
                    version = options.version || '(?)',
                    using   = Array.setUp(),
                    usingV  = Array.setUp();
                
                if (!options.hideHello) {
                    using   = Array.setUp('SpringRoll ' + Application.version);
                    
                    if (pixi) {
                        using.push('Pixi.js ' + pixi.VERSION);
                        if (pixi.animate) {
                            using.push('PixiAnimate ' + pixi.animate.VERSION);
                        }
                    }
                    if (cJS) {
                        if (cJS.EaselJS) {
                            using.push('EaselJS ' + cJS.EaselJS.version);
                        }
                        if (cJS.PreloadJS) {
                            using.push('PreloadJS ' + cJS.PreloadJS.version);
                        }
                        if (cJS.SoundJS) {
                            using.push('SoundJS ' + cJS.SoundJS.version);
                        }
                        if (cJS.TweenJS) {
                            using.push('TweenJS ' + cJS.TweenJS.version);
                        }
                    }
                    
                    if (version !== '(?)') {
                        title += ' ' + version;
                    }
                    
                    if (platypus.supports.firefox || platypus.supports.chrome) {
                        using.push(engine);
                        usingV = getVersions('\n%c ' + title + ' %c ' + author + ' \n\nUsing %c ' + using.join(' %c %c ') + ' %c\n\n', title, using);
                        console.log.apply(console, usingV);
                        usingV.recycle();
                    } else {
                        console.log('--- "' + title + '" ' + author + ' - Using ' + using.join(', ') + ', and ' + engine + ' ---');
                    }

                    using.recycle();
                }
    
                platypus.debug.olive("Game config loaded.", settings);
            };
        }()),
        flattenEntityList = function (entityList) {
            var entity = null,
                folder = null,
                folderEntity = null,
                resultList = {};
            
            for (entity in entityList) {
                if (!entityList[entity].id) {
                    folder = flattenEntityList(entityList[entity]);
                    for (folderEntity in folder) {
                        if (folder.hasOwnProperty(folderEntity)) {
                            resultList[folderEntity] = folder[folderEntity];
                        }
                    }
                } else {
                    resultList[entity] = entityList[entity];
                }
            }
            return resultList;
        },
        setSpriteSheetIds = function (ss) { // Putting this here for now. May handle differently in the future. - DDD 2/2/2016
            var key = '';
            
            for (key in ss) {
                if (ss.hasOwnProperty(key)) {
                    ss[key].id = key;
                }
            }
        };
    
    if (PIXI) { // Over-riding the pixi.js hello since we're creating our own.
        if (PIXI.utils.skipHello) { // version 4+
            PIXI.utils.skipHello();
        } else { // version 3-
            PIXI.utils._saidHello = true;
        }
    }

    plugin.setup = function () {
        var author = '',
            authorTag = document.getElementsByName('author'),
            options = this.options;
        
        if (authorTag.length) { // Set default author by page meta data if it exists.
            author = authorTag[0].getAttribute('content') || '';
        }
        
        /**
         * Sets credit for the game. Defaults to the "author" META tag if present on the document.
         *
         * @property {String} options.author
         * @default ''
         */
        options.add('author', author, true);

        /**
         * Hides console hello for the game.
         *
         * @property {Boolean} options.hideHello
         * @default false
         */
        options.add('hideHello', false, true);
    };
    
    // Preload is an optional asynchronous call for doing any loading
    // before the application is init. Make sure that done() is called
    // when this is complete. The display and options are available here.
    plugin.preload = function (done) {
        var config = this.config.platypus || this.config,
            game = null,
            priority = 320,
            time = {
                delta: 0
            };
        
        if (!config) {
            platypus.debug.warn('PlatypusPlugin: Platypus requires a game configuration.');
        } else {
            if (this.options.debug) { // Set debug property on game configuration.
                config.debug = true;
            }
            
            sayHello(config, this);
            
            config.entities = flattenEntityList(config.entities);
            
            if (config.spriteSheets) {
                setSpriteSheetIds(config.spriteSheets);
            }
            
            game = this.platypus = new platypus.Game(config, this);
            
            updateFunction = function (elapsed) {
                time.delta = elapsed;
                game.tick(time);
            };
            this.on('update', updateFunction, priority); // Needs to occur before PIXI's ticker update so rendered objects can be positioned correctly.
    
            resizeFunction = function (event) {
                if (game.currentScene) {
                    game.currentScene.triggerOnChildren('resize', event);
                }
            };
            this.on('resize', resizeFunction);
        }

        done(); // required!
    };

    // Clean-up when the application is destroyed
    plugin.teardown = function () {
        if (this.platypus) { // May not exist if game failed to instantiate in preload.
            this.off('update', updateFunction);
            this.off('resize', resizeFunction);
            this.platypus.destroy();
            delete this.platypus;
        }
    };
    
}());
