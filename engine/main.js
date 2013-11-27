/**
# Main.js
Main.js creates the game object. Main.js is called on the window 'load' event.
*/

// Clean up console logging for MSIE
(function(window){
	if(window && !window.console){
		var console = window.console = {};
		console.log = console.warn = console.error = function(){};
	}
})(window);

window.addEventListener('load', function(){
	if(platformer.settings && platformer.settings.global && (platformer.settings.global.autoLoad !== false)){
		platformer.loadGame();
	}
}, false);

// This creates the game, typically immediately once the page is loaded. If the game should not appear on page load, global setting "autoLoad" needs to be set to `false` and this method must be called independently.
platformer.loadGame = function(settings, onFinishedLoading){
	var gameDefinition = settings || platformer.settings;
	
	platformer.game = new platformer.classes.game(gameDefinition, onFinishedLoading);
	platformer.settings = gameDefinition;
	createjs.Ticker.timingMode = 'raf';
	createjs.Ticker.setFPS(gameDefinition.global.fps || 60);
	createjs.Ticker.addEventListener("tick", function(e){
		platformer.game.tick(e);
	});
};