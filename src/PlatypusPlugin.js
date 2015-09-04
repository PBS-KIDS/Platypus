/**
 * This plugin instantiates a Platypus game using the configuration file.
 * 
 * @namespace platypus
 * @class PlatypusPlugin
 */
/*global platypus */
(function(){
    "use strict";
    
    var ApplicationPlugin = include('springroll.ApplicationPlugin'),
	    updateFunction = null,
        plugin = new ApplicationPlugin();

    // Preload is an optional asynchronous call for doing any loading
    // before the application is init. Make sure that done() is called
    // when this is complete. The display and options are available here.
    plugin.preload = function(done) {
        
        if (this.options.debug) { // Set debug property on game configuration.
            this.config.debug = true;
        }
        
        var game = this.game = new platypus.Game(this.config, this.display.stage);
		
		updateFunction = function (elapsed) {
	        game.tick({
	            delta: elapsed
	        });
		};
		
		this.on('update', updateFunction);

        done(); // required!
    };

    // Clean-up when the application is destroyed
    plugin.teardown = function() {
		this.off('update', updateFunction);
		this.game.destroy();
		delete this.game;
    };
    
}());