window.addEventListener('load', function(){
	//gws.settings.assets
	var root = this;
	
	loader = new createjs.PreloadJS();
	loader.onProgress = function (event) {
		console.log('Progress:', event);	
	};
	
	loader.onFileLoad = function (event) {
		var i  = 0,
		j      = 0,
		data   = event.data,
		result = event.result,
		ss     = undefined;
		
		console.log('Load:', event);
		
		if((event.type == "image") && data){
			//split up image if it's a sprite sheet
			if(data.rows && data.columns){
				ss = new createjs.SpriteSheet({
					images: [result],
					frames: {width: result.width / data.columns, height: result.height / data.rows}
				});
				for (j = 0; j < data.rows; j++) for (i = 0; i < data.columns; i++){
					if(data.ids && data.ids[i] && data.ids[i][j]){
						gws.assets[data.ids[i][j]] = createjs.SpriteSheetUtils.extractFrame(ss, +j + (i * data.rows));
					} else {
						gws.assets[event.id + '-' + i + '_' + j] = createjs.SpriteSheetUtils.extractFrame(ss, +j + (i * data.rows));
					}
				}
				return ;
			}
		}
		
		gws.assets[event.id] = result;
	};
	
	loader.onError = function (event) {
		console.log('Your stuff broke!');
	};
	
	loader.onComplete = function (event) {
		
		root.game = new gws.classes.game(gws.settings);
		createjs.Ticker.setFPS(gws.settings.global.fps);
		createjs.Ticker.addListener(root.game);
	};
	
	
	gws.browser = gws.browserCheck();
	for(var i in gws.settings.assets){
		if(typeof gws.settings.assets[i].src !== 'string'){
			for(var j in gws.settings.assets[i].src){
				if(gws.browser[j]){
					gws.settings.assets[i].src = gws.settings.assets[i].src[j];
					break;
				}
			}
			if(typeof gws.settings.assets[i].src !== 'string'){
				if(gws.settings.assets[i].src['default']){
					gws.settings.assets[i].src = gws.settings.assets[i].src['default'];
				} else {
					console.warning('Asset has no valid source for this browser.', gws.settings.assets[i]);
				}
			}
		}
	}
	
	loader.loadManifest(gws.settings.assets);
	gws.assets = [];
});