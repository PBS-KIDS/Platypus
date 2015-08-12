(function(){
    var plugin = new window.springroll.ApplicationPlugin(),
	    updateFunction = null;

    // Setup function is called before anything else is created
    // good place to setup properties on Application or
    // create event listeners. Bound to application
    plugin.setup = function() {

    };

    // Preload is an optional asynchronous call for doing any loading
    // before the application is init. Make sure that done() is called
    // when this is complete. The display and options are available here.
    plugin.preload = function(done) {
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