/**
 * This plugin instantiates a Platypus game using the configuration file. Configurations should be placed within the SpringRoll config with the following structure:
 * 
 *      {
 *          "platypus": {
 *              "global": {}, // Global Platypus settings go here.
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
/*global console, include, platypus */
(function () {
    "use strict";
    
    var ApplicationPlugin = include('springroll.ApplicationPlugin'),
        hello = true,
	    updateFunction = null,
        plugin = new ApplicationPlugin(),
        resizeFunction = null,
        sayHello = (function () {
            var getPortion = function (num, max) {
                    return Math.floor(204 * num / max);
                },
                getStyle = function (version) {
                    var max = 0,
                        style = 'color: #ffffff; padding:3px 0; border-radius: 6px;';
                    
                    if (version.length === 3) {
                        max = Math.max(version[0], version[1], version[2]);
                        
                        return style + ' background: rgb(' + getPortion(version[0], max) + ',' + getPortion(version[1], max) + ',' + getPortion(version[2], max) + ');';
                    } else {
                        return style + ' background: #8A3324;';
                    }
                };
            
            return function (settings, app) {
                var options = app.options,
                    author  = (options.author ? 'by ' + options.author : ''),
                    engine  = 'Platypus ' + platypus.version,
                    pixi    = 'Pixi.js ' + PIXI.VERSION,
                    title   = app.name,
                    version = options.version || 'none';
                
                if (hello) {
                    if (platypus.supports.firefox || platypus.supports.chrome) {
                        console.log('\n%c ' + pixi + ' %c %c ' + engine + ' %c %c ' + title + ' %c ' + author + ' \n\n', getStyle(PIXI.VERSION.split('.')), '',getStyle(platypus.version.split('.')), '', getStyle(version.split('.')), '');
                    } else {
                        console.log('--- ' + pixi + ' - ' + engine + ' - "' + title + '" ' + author + ' ---');
                    }
                }
    
                if (settings.debug) {
                    console.log("Game config loaded.", settings);
                }
            };
        }());
    
    PIXI.utils._saidHello = true; // Over-riding the pixi.js hello since we're creating our own.

	plugin.setup = function() {
        var author = '';
        
		/**
		 * Sets credit for the game.
		 * @property {Boolean} options.author
		 * @default ''
		 */
		Object.defineProperty(this, 'author', {
			set: function (value) {
                author = value;
			},
            get: function () {
                return author;
            }
		});

		/**
		 * Hides console hello for the game.
		 * @property {Boolean} options.hideHello
		 * @default ''
		 */
		Object.defineProperty(this, 'hideHello', {
			set: function (value) {
                hello = !value;
			},
            get: function () {
                return !hello;
            }
		});
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
            
            game = this.platypus = new platypus.Game(config, this);
            
            updateFunction = function (elapsed) {
                time.delta = elapsed;
                game.tick(time);
            };
            this.on('update', updateFunction, 320); // Needs to occur before PIXI's ticker update so rendered objects can be positioned correctly.
    
            resizeFunction = function (event) {
                game.currentScene.trigger('resize', event);
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
