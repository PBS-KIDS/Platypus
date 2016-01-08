/**
 * This plugin instantiates a Platypus game using the configuration file. Configurations should be placed within the SpringRoll config with the following structure:
 * 
 *      {
 *          "platypus": {
 *              "assets": [], // Images and preloaded sounds should be listed here if they should be loaded graphically.
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
/*global console, include, platypus, PIXI */
(function () {
    "use strict";
    
    var Application = include('springroll.Application'),
	    ApplicationPlugin = include('springroll.ApplicationPlugin'),
	    updateFunction = null,
        plugin = new ApplicationPlugin(),
        resizeFunction = null,
        sayHello = (function () {
            var getPortion = function (num, max) {
                    return Math.floor(204 * num / max);
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
                        v = version.split('.');
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
                    max = Math.max(r, g, b, 1);

                    return style + ' background: rgb(' + getPortion(r, max) + ',' + getPortion(g, max) + ',' + getPortion(b, max) + ');';
                };
            
            return function (settings, app) {
                var options = app.options,
                    author  = (options.author ? 'by ' + options.author : ''),
                    title   = app.name || document.title || '',
                    srV     = Application.version || '(?)',
                    engine  = 'Platypus ' + platypus.version,
                    pixi    = 'Pixi.js ' + PIXI.VERSION,
                    spring  = 'SpringRoll ' + srV,
                    version = options.version || '(?)';
                
                if (!options.hideHello) {
                    if (version !== '(?)') {
                        title += ' ' + version;
                    }
                    
                    if (platypus.supports.firefox || platypus.supports.chrome) {
                        console.log('\n%c ' + title + ' %c ' + author + ' \n\nUsing %c ' + spring + ' %c %c ' + pixi + ' %c %c ' + engine + ' %c\n\n', getStyle(title, version), '', getStyle(spring, srV), '', getStyle(pixi, PIXI.VERSION), '', getStyle(engine, platypus.version), '');
                    } else {
                        console.log('--- "' + title + '" ' + author + ' - Using ' + spring + ', ' + pixi + ', and ' + engine + ' ---');
                    }
                }
    
                if (settings.debug) {
                    console.log("Game config loaded.", settings);
                }
            };
        }()),
        flattenEntityList = function(entityList) {
            var entity = null,
                folder = null,
                folderEntity = null,
                resultList = {};
            
            for (entity in entityList) {
                if (!entityList[entity].id) {
                    folder = flattenEntityList(entityList[entity]);
                    for (folderEntity in folder) {
                        resultList[folderEntity] = folder[folderEntity]
                    }
                } else {
                    resultList[entity] = entityList[entity]
                }
            }
            return resultList;
        };
    
    PIXI.utils._saidHello = true; // Over-riding the pixi.js hello since we're creating our own.

	plugin.setup = function() {
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
        var config = this.config.platypus,
            game = null,
            time = {
                delta: 0
            };
        
        if (!config) {
            console.warn('PlatypusPlugin: Platypus requires a game configuration.');
        } else {
            if (this.options.debug) { // Set debug property on game configuration.
                config.debug = true;
            }
            
            sayHello(config, this);
            
            config.entities = flattenEntityList(config.entities);
            
            game = this.platypus = new platypus.Game(config, this);
            
            updateFunction = function (elapsed) {
                time.delta = elapsed;
                game.tick(time);
            };
            this.on('update', updateFunction, 320); // Needs to occur before PIXI's ticker update so rendered objects can be positioned correctly.
    
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
