// TEMP fix for android bug found here: https://code.google.com/p/chromium/issues/detail?id=518863
// This fix renews the SoundJS WebAudio context so audio still plays after idle according to this: http://stackoverflow.com/a/33155239
(function () {
	"use strict";

	var lastTime = 0,
		Sound = include("createjs.Sound"),
		WebAudioPlugin = include("createjs.WebAudioPlugin"),
		handleAndroidWebAudio = function () {
			var activePlugin = Sound.activePlugin,
				lastPlugin = null,
				fixTime = 0;
			
			if (activePlugin instanceof WebAudioPlugin) {
				fixTime = Date.now();
				
				if (lastTime && ((fixTime - lastTime) > 30000)) {
					// Reset context
					if (window.AudioContext) {
						WebAudioPlugin.context = new AudioContext();
					} else if (window.webkitAudioContext) {
						WebAudioPlugin.context = new webkitAudioContext();
					}
					
					// Reset WebAudioPlugin
					Sound.registerPlugins([WebAudioPlugin]);
					
					// Copy over relevant properties
					lastPlugin = activePlugin;
					activePlugin = Sound.activePlugin;
					activePlugin._audioSources = lastPlugin._audioSources;
					activePlugin._soundInstances = lastPlugin._soundInstances;
				}
				lastTime = fixTime;
			}
		}
		
	window.handleAndroidWebAudio = createjs.BrowserDetect.isAndroid ? handleAndroidWebAudio : function () {};
}());
