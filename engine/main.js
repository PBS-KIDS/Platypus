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
	// This creates the game once the page is loaded. If the game should not appear on page load, global setting "autoLoad" needs to be set to `false` and game must be created independently.
	if(platformer.settings && platformer.settings.global && (platformer.settings.global.autoLoad !== false)){
		new platformer.classes.game(platformer.settings);
	}
}, false);
