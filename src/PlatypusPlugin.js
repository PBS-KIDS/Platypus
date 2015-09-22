/**
 * This plugin instantiates a Platypus game using the configuration file. Configurations should be placed within the SpringRoll config with the following structure:
 * 
 *      {
 *          "platypus": {
 *              "global": {}, // Global Platypus settings go here.
 *              "assets": [], // Images (and preloaded sounds if they should be loaded graphically) should be listed here.
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
	    updateFunction = null,
        plugin = new ApplicationPlugin(),
        resizeFunction = null;

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
            
            game = this.platypus = new platypus.Game(config, this.display.stage);
            
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
