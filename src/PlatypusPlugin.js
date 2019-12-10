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
 * The Platypus game instance is `app.platypusGame` on the SpringRoll Application and `platypus.game` within the platypus namespace.
 *
 * @namespace platypus
 * @class PlatypusPlugin
 */
/*global include, platypus */
export default (function () {
    
    
    var ApplicationPlugin = include('springroll.ApplicationPlugin'),
        Tween = include('createjs.Tween', false),
        updateFunction = Tween ? function (game, time, elapsed) {
            time.delta = elapsed;
            Tween.tick(elapsed);
            game.tick(time);
        } : function (game, time, elapsed) {
            time.delta = elapsed;
            game.tick(time);
        },
        plugin = new ApplicationPlugin(),
        resizeFunction = function (game, event) {
            game.triggerOnChildren('resize', event);
        },
        setSpriteSheetIds = function (ss) { // Putting this here for now. May handle differently in the future. - DDD 2/2/2016
            var key = '';
            
            for (key in ss) {
                if (ss.hasOwnProperty(key)) {
                    ss[key].id = key;
                }
            }
        };
    
    plugin.setup = function () {
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
            },
            deprecationAnnounced = false;
        
        if (!config) {
            platypus.debug.warn('PlatypusPlugin: Platypus requires a game configuration.');
        } else {
            if (this.options.debug) { // Set debug property on game configuration.
                config.debug = true;
            }
            
            if (config.spriteSheets) {
                setSpriteSheetIds(config.spriteSheets);
            }
            
            game = this.platypusGame = new platypus.Game(config, this);

            // as of v0.11.1 deprecating `.platypus` as a reference to the game since it's confusing. Using `.platypusGame` instead.
            Object.defineProperty(this, 'platypus', {
                get: function () {
                    if (!deprecationAnnounced) {
                        platypus.debug.warn('Referencing `.platypus` to access the Platypus game instance on the SpringRoll Application has been deprecated in favor of `.platypusGame`.');
                        deprecationAnnounced = true;
                    }
                    return this.platypusGame;
                }
            });
            
            updateFunction = updateFunction.bind(null, game, time);
            this.on('update', updateFunction, priority); // Needs to occur before PIXI's ticker update so rendered objects can be positioned correctly.
    
            resizeFunction = resizeFunction.bind(null, game);
            this.on('resize', resizeFunction);
        }

        done(); // required!
    };

    // Clean-up when the application is destroyed
    plugin.teardown = function () {
        if (this.platypusGame) { // May not exist if game failed to instantiate in preload.
            this.off('update', updateFunction);
            this.off('resize', resizeFunction);
            this.platypusGame.destroy();
            delete this.platypusGame;
        }
    };
    
}());
