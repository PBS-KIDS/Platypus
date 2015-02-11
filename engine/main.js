/**
# Main.js
Main.js creates the game object. Main.js is called on the window 'load' event.

 Requires: ["https://code.createjs.com/createjs-2014.12.12.min.js", "browser.js","game.js","factory.js"]

*/

(function(window){
	if(window){
		
		// Clean up console logging for MSIE: Make sure window has at least console stub.
		if(!window.console){
			var console = window.console = {};
			console.log = console.warn = console.error = function(){};
		}

		// Make sure Array has isArray.
		if(window.Array && !window.Array.isArray) {
			window.Array.isArray = function (arr) {
			    return (arr instanceof Array);
			};
		}
	}
})(window);

window.addEventListener('load', function(){
	
	// This creates the game once the page is loaded. If the game should not appear on page load, global setting "autoLoad" needs to be set to `false` and game must be created independently.
	if(platformer.settings && platformer.settings.global && (platformer.settings.global.autoLoad !== false)){
		new platformer.Game(platformer.settings);
	}
}, false);

