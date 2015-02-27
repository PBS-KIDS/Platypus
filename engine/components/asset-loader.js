/**
# COMPONENT **asset-loader**
This component loads a list of assets, wrapping PreloadJS functionality into a game engine component. Settings and files are pulled from the information provided in config.js, with the expectation that this component will exist on the initial loading screen.

## Dependencies
- [createjs.PreloadJS][link1] - Requires the PreloadJS library to load a list of assets.

## Messages

### Listens for:
- **load** - On receiving this event, the asset loader begins downloading the list of assets if the "automatic" property is not set to `false`.
- **load-assets** - On receiving this event, the asset loader begins downloading the list of assets.
- **fileload** - This message used to update a progress bar if one has been defined by JSON.
  - @param fraction (Number) - Value of (progress / total) is used to set the width of the progress bar element.

### Local Broadcasts:
- **fileload** - This message is broadcast when an asset has been loaded.
  - @param complete (Boolean) - Whether this is the final asset to be loaded.
  - @param total (Number) - The total number of assets being loaded.
  - @param progress (Number) - The number of assets finished loading.
  - @param fraction (Number) - Value of (progress / total) provided for convenience.
- **complete** - This message is triggered when the asset loader is finished loading assets.

## JSON Definition
    {
      "type": "asset-loader",
      
      "assets": [
      // Optional. A list of assets to load; typically the asset list is pulled directly from the config.json file.
        {"id": "item-1",         "src": "images/item-1.png"},
        {"id": "item-2",         "src": "images/item-2.png"},
        {"id": "item-3",         "src": "images/item-3.png"}
      ]
      
      "progressBar": "progress-bar",
      // Optional. A DOM element id for an element that should be updated as assets are loaded.
      
      "useXHR": true,
      // Whether to use XHR for asset downloading. The default is `true`.
      
      "automatic": false,
      // Whether to automatically load assets when this component loads. The default is `true`.
      
      "crossOrigin": true
      // Whether images are loaded from a CORS-enabled domain. The default is `false`.
    }

[link1]: http://www.createjs.com/Docs/PreloadJS/modules/PreloadJS.html

*/
(function(){
	return platformer.createComponentClass({
		id: 'asset-loader',
		
		constructor: function(definition){
			this.useXHR = (definition.useXHR !== false);
			
			this.assets = definition.assets || platformer.game.settings.assets;
			
			this.crossOrigin = definition.crossOrigin || "";
			
			this.progressBar = definition.progressBar || false;
			
			this.automatic = (definition.automatic !== false);
			
			this.message = {
				complete: false,
				total: 0,
				progress: 0,
				fraction: 0
			};
		},

		events: {// These are messages that this component listens for
		    "load": function(){
		    	if(this.automatic){
		    		this.owner.triggerEvent('load-assets');
		    	}
		    },
		    
		    "load-assets": function(){
		    	var i = '',
		    	j     = 0,
		    	self = this,
		    	checkPush = function(asset, list){
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
		    	loader     = new createjs.LoadQueue(this.useXHR, "", this.crossOrigin),
		    	loadAssets = [],
		    	optimizeImages = platformer.game.settings.global.nativeAssetResolution || 0, //assets designed for this resolution
		    	scale = platformer.game.settings.scale = optimizeImages?Math.min(1, Math.max(window.screen.width, window.screen.height) * (window.devicePixelRatio || 1) / optimizeImages):1,
//		    	scale = platformer.game.settings.scale = optimizeImages?Math.min(1, Math.max(window.innerWidth, window.innerHeight) * window.devicePixelRatio / optimizeImages):1,
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
		    	},
		    	fileloadfunc = function (event) {
		    		var item = event.item,
		    		data     = item.data,
		    		result   = event.result;
		    		
		    		if(event.item.type == "image"){
		    			if(optimizeImages && (scale !== 1)){
		    				if(data){
		    					result = scaleImage(result, data.columns, data.rows);
		    				} else {
		    					result = scaleImage(result);
		    				}
		    			}
		    		}
		    		
		    		platformer.assets[event.item.id] = result;
		    		
		    		self.message.progress += 1;
		    		self.message.fraction = self.message.progress/self.message.total;
		    		if(self.message.progress === self.message.total){
		    			self.message.complete = true;
		    		}
	    			self.owner.trigger('fileload', self.message);
		    	},
		    	forceTypeForManifest = function(asset){
		    		var ext  = '',
		    		newSrc   = null,
		    		manifest = platformer.game.settings.manifest;
	    			if(manifest){
		    			newSrc = asset.src.split('.');
		    			ext    = newSrc[newSrc.length - 1];
	    				if(manifest[ext] && (manifest[ext] !== ext)){
		    				newSrc[newSrc.length - 1] = manifest[ext];
		    				asset.src = newSrc.join('.');
	    				}
	    			}
	    			return asset;
		    	};
		    	
		    	loader.addEventListener('fileload', fileloadfunc);
		    	
		    	loader.addEventListener('error', function(event){
		    	    if(event.item && !event.error) { //Handles this PreloadJS bug: https://github.com/CreateJS/PreloadJS/issues/46
		    	        event.item.tag.src = event.item.src;
		    	        fileloadfunc(event);
		    	    }
		    	});
		    	
		    	loader.addEventListener('complete', function (event) {
		    		setTimeout(function(){ // Allow current process to finish before firing completion.
		    			self.owner.triggerEvent('complete');
		    		}, 10);
		    	});
		    	
		    	for(i in this.assets){
		    		if(typeof this.assets[i].src === 'string'){
		    			checkPush(forceTypeForManifest(this.assets[i]), loadAssets);
		    		}
		    	}

		    	if(createjs.Sound){
			    	loader.installPlugin(createjs.Sound);
		    	}
		    	self.message.total = loadAssets.length;
		    	loader.loadManifest(loadAssets);
		    	platformer.assets = [];
		    },
		
		    "fileload": function(resp) {
		    	var pb = null;
		    	
		    	if(this.progressBar){
		    		pb = document.getElementById(this.progressBar);
		    		if(pb){
		    			pb = pb.style;
		    			
		    			pb.width = (resp.fraction * 100) + '%';
		    			pb.backgroundSize = ((1 / resp.fraction) * 100) + '%';
		    		}
		    	}
		    }
		}
		
	});
})();
