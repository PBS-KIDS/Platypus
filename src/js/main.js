/**
# Main.js
Main.js handles loading the game assets and creates the game object. Main.js is called on the window 'load' event. Main takes advantage of [PreloadJS][link1] to handle the loading process.
[link1]: http://createjs.com/Docs/PreloadJS/PreloadJS.html
*/

// Clean up console logging for MSIE
(function(window){
	if(window && !window.console){
		var console = window.console = {};
		console.log = console.warn = console.error = function(){};
	}
})(window);

window.addEventListener('load', function(){
	var checkPush = function(asset, list){
		var i = 0,
		found = false;
		for(i in list){
			if(list[i].id === asset.id){
				found = true;
				break;
			}
		}
		if(!found){
			list.push(asset);
		}
	},
	loader     = new createjs.PreloadJS(),
	loadAssets = [],
	optimizeImages = platformer.settings.global.nativeAssetResolution || 0, //assets designed for this resolution
	scale = platformer.settings.scale = optimizeImages?Math.min(1, Math.max(window.screen.width, window.screen.height) * window.devicePixelRatio / optimizeImages):1,
//	scale = platformer.settings.scale = optimizeImages?Math.min(1, Math.max(window.innerWidth, window.innerHeight) * window.devicePixelRatio / optimizeImages):1,
	scaleImage = function(img, columns, rows){
		var r          = rows    || 1,
		c              = columns || 1,
		imgWidth       = Math.ceil((img.width  / c) * scale) * c,
		imgHeight      = Math.ceil((img.height / r) * scale) * r,
		element        = document.createElement('canvas'),
		ctx            = element.getContext('2d');
		element.width  = imgWidth;
		element.height = imgHeight;
		element.scaleX = imgWidth  / img.width;
		element.scaleY = imgHeight / img.height;
		ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, imgWidth, imgHeight);
		return element;
	};
	
	loader.onProgress = function (event) {
		console.log('Progress:', event);	
	};
	
	loader.onFileLoad = function (event) {
		var data = event.data,
		result   = event.result;
		
		console.log('Load:', event);
		
		if(event.type == "image"){
			if(optimizeImages && (scale !== 1) && (event.type == "image")){
				if(data){
					result = scaleImage(result, data.columns, data.rows);
				} else {
					result = scaleImage(result);
				}
			}
		}
		
		platformer.assets[event.id] = result;
	};
	
	loader.onError = function (event) {
		console.log('Your stuff broke!');
	};
	
	loader.onComplete = function (event) {
		platformer.game = new platformer.classes.game(platformer.settings, function(game){
			platformer.loadFullScreenButton(game.containerElement, game.settings.supports.touch, function(){
				game.bindings['resize'].callback();
			});
		});
		createjs.Ticker.useRAF = true;
		createjs.Ticker.setFPS(platformer.settings.global.fps);
		createjs.Ticker.addListener(platformer.game);
	};
	
	for(var i in platformer.settings.assets){
		if(typeof platformer.settings.assets[i].src === 'string'){
			checkPush(platformer.settings.assets[i], loadAssets);
		} else {
			for(var j in platformer.settings.assets[i].src){
				if(platformer.settings.aspects[j] && platformer.settings.assets[i].src[j]){
					if(typeof platformer.settings.assets[i].src[j] === 'string'){
						platformer.settings.assets[i].src  = platformer.settings.assets[i].src[j];
						checkPush(platformer.settings.assets[i], loadAssets);
					} else {
						platformer.settings.assets[i].data    = platformer.settings.assets[i].src[j].data || platformer.settings.assets[i].data;
						platformer.settings.assets[i].assetId = platformer.settings.assets[i].src[j].assetId;
						platformer.settings.assets[i].src     = platformer.settings.assets[i].src[j].src;
						checkPush({
							id:  platformer.settings.assets[i].assetId || platformer.settings.assets[i].id,
							src: platformer.settings.assets[i].src
						}, loadAssets);
					}
					break;
				}
			}
			if(typeof platformer.settings.assets[i].src !== 'string'){
				if(platformer.settings.assets[i].src['default']){
					if(typeof platformer.settings.assets[i].src['default'] === 'string'){
						platformer.settings.assets[i].src  = platformer.settings.assets[i].src['default'];
						checkPush(platformer.settings.assets[i], loadAssets);
					} else {
						platformer.settings.assets[i].data    = platformer.settings.assets[i].src['default'].data || platformer.settings.assets[i].data;
						platformer.settings.assets[i].assetId = platformer.settings.assets[i].src['default'].assetId;
						platformer.settings.assets[i].src     = platformer.settings.assets[i].src['default'].src;
						checkPush({
							id:  platformer.settings.assets[i].assetId || platformer.settings.assets[i].id,
							src: platformer.settings.assets[i].src
						}, loadAssets);
					}
				} else {
					console.warn('Asset has no valid source for this browser.', platformer.settings.assets[i]);
				}
			}
		}
	}
	if(platformer.settings.supports.android){ //Android thinks HTMLAudioPlugin works, so we avoid that misconception here
		createjs.SoundJS.registerPlugin(createjs.HTMLiOSAudioPlugin);
	} else {
		createjs.SoundJS.registerPlugins([createjs.HTMLAudioPlugin, createjs.HTMLiOSAudioPlugin]);
	}
	loader.installPlugin(createjs.SoundJS);
	loader.loadManifest(loadAssets);
	platformer.assets = [];

}, false);