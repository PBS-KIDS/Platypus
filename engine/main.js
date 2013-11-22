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
//	window.console = {log:function(txt){document.title += txt;}}; //test code for android
//	document.title = '';

	platformer.game = new platformer.classes.game(platformer.settings, function(game){});
	createjs.Ticker.timingMode = 'raf';
	createjs.Ticker.setFPS(platformer.settings.global.fps || 60);
	createjs.Ticker.addEventListener("tick", function(e){
		platformer.game.tick(e);
	});
}, false);