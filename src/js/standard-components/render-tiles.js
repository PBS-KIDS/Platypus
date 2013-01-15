/**
# COMPONENT **render-tiles**
This component handles rendering tile map backgrounds. When rendering the background, this component figures out what tiles are being displayed as caches them so they are rendered as one image rather than individually. As the camera moves, the cache is updated by blitting the relevant part of the old cached image into the new cached image and then rendering the tiles that have shifted into the camera's view into the cache.

## Dependencies:
- [createjs.EaselJS][link1] - This component requires the EaselJS library to be included for canvas functionality.
- [[Handler-Render-Createjs]] (on entity's parent) - This component listens for a render "handle-render-load" message to setup and display the content. This component is removed from the Handler-Render-Createjs list after the first tick because it doesn't possess a handle-render function. Instead it uses the camera-update function to update itself.

## Messages

### Listens for:
- **handle-render-load** - This event is triggered before `handle-render` and provides the CreateJS stage that this component will require to display. In this case it compiles the array of tiles that make up the map and adds the tilesToRender displayObject to the stage.
  > @param message.stage ([createjs.Stage][link2]) - Required. Provides the render component with the CreateJS drawing [Stage][link2].
- **camera-update** - Triggered when the camera moves, this function updates which tiles need to be rendered and caches the image.
  > @param camera (object) - Required. Provides information about the camera.

## JSON Definition
    {
      "type": "render-animation",
      "spritesheet": 
      //Required - The spritesheet for all the tile images.
      "imageMap" : [],
      //Required - This is a two dimensional array of the spritesheet indexes that describe the map that you're rendering.
	  "scaleX" : 1,
	  //Optional - The x-scale the tilemap is being displayed at. Defaults to 1.
	  "scaleY"  : 1,
	  //Optional - The y-scale the tilemap is being displayed at. Defaults to 1.
	  "tileWidth"  : 32,
	  //Optional - The the width in pixels of a tile. Defaults to 10.
	  "tileHeight"  : 32,
	  //Optional - The the height in pixels of a tile. Defaults to 10.
	  "buffer"  : 32
	  //Optional - The amount of space in pixels around the edge of the camera that we include in the buffered image. Is multiplied by the scaleX to get the actual buffersize. Defaults to the tileWidth.
    }
    
[link1]: http://www.createjs.com/Docs/EaselJS/module_EaselJS.html
[link2]: http://createjs.com/Docs/EaselJS/Stage.html
*/

platformer.components['render-tiles'] = (function(){
	var component = function(owner, definition){
		var spriteSheet = {
			images: definition.spriteSheet.images.slice(),
			frames: definition.spriteSheet.frames,
			animations: definition.spriteSheet.animations
		},
		scaleX = spriteSheet.images[0].scaleX || 1,
		scaleY = spriteSheet.images[0].scaleY || 1;
		if((scaleX !== 1) || (scaleY !== 1)){
			spriteSheet.frames = {
				width: spriteSheet.frames.width * scaleX,	
				height: spriteSheet.frames.height * scaleY,	
				regX: spriteSheet.frames.regX * scaleX,	
				regY: spriteSheet.frames.regY * scaleY
			};
		}

		this.owner = owner;
		
		this.controllerEvents = undefined;
		this.spriteSheet   = new createjs.SpriteSheet(spriteSheet);
		this.imageMap      = definition.imageMap   || [];
		this.tiles         = {};
		this.tilesToRender = undefined;
		this.scaleX        = ((definition.scaleX || 1) * (this.owner.scaleX || 1)) / scaleX;
		this.scaleY        = ((definition.scaleY || 1) * (this.owner.scaleY || 1)) / scaleY;
		this.tileWidth     = definition.tileWidth  || (this.owner.tileWidth / this.scaleX)  || 10;
		this.tileHeight    = definition.tileHeight || (this.owner.tileHeight / this.scaleY) || 10;
		
		var buffer = (definition.buffer || (this.tileWidth / 2)) * this.scaleX;
		this.camera = {
			x: -buffer - 1, //to force camera update
			y: -buffer - 1,
			buffer: buffer
		};
		this.cache = {
			minX: -1,
			minY: -1,
			maxX: -1,
			maxY: -1
		};
		
		//this.state = definition.state || 'tile';
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['handle-render-load', 'camera-update', 'add-tiles']);
	};
	var proto = component.prototype;

	proto['handle-render-load'] = function(resp){
		var x = 0,
		y     = 0,
		stage = this.stage = resp.stage,
		index = '',
		imgMapDefinition = this.imageMap,
		newImgMap = [];
		
		this.tilesToRender = new createjs.Container();
		this.tilesToRender.snapToPixel = true;
		this.tilesToRender.name = 'entity-managed'; //its visibility is self-managed
		
		for(x = 0; x < imgMapDefinition.length; x++){
			newImgMap[x] = [];
			for (y = 0; y < imgMapDefinition[x].length; y++){
				newImgMap[x][y] = index = imgMapDefinition[x][y];
				if(!this.tiles[index]){
					this.tiles[index] = this.createTile(index);
				}
			}
		}
		this.imageMap = newImgMap;
		
		this.tilesToRender.scaleX = this.scaleX;
		this.tilesToRender.scaleY = this.scaleY;
		this.tilesToRender.z = this.owner.z;

		stage.addChild(this.tilesToRender);
		stage.autoClear = false; //since tile map is re-painted every time, the canvas does not require clearing.
	};
	
	proto['add-tiles'] = function(definition){
		var x = 0,
		y     = 0,
		map   = definition.imageMap,
		index = '',
		newIndex = 0;
		
		if(map){
			for(x = 0; x < this.imageMap.length; x++){
				for (y = 0; y < this.imageMap[x].length; y++){
					newIndex = map[x][y];
					index = this.imageMap[x][y];
					if(this.tiles[index]){
						delete this.tiles[index];
					}
					index = this.imageMap[x][y] += ' ' + newIndex;
					if(!this.tiles[index]){
						this.tiles[index] = this.createTile(index);
					}
				}
			}
		}
	};

	proto['camera-update'] = function(camera){
		var x  = 0,
		y      = 0,
		buffer = this.camera.buffer,
		cache  = this.cache,
		context= null,
		canvas = null,
		width  = 0,
		height = 0,
		maxX   = 0,
		maxY   = 0,
		minX   = 0,
		minY   = 0,
		vpL    = Math.floor(camera.viewportLeft / this.tileWidth)  * this.tileWidth,
		vpT    = Math.floor(camera.viewportTop  / this.tileHeight) * this.tileHeight,
		tile   = null;
				
		if (((Math.abs(this.camera.x - vpL) > buffer) || (Math.abs(this.camera.y - vpT) > buffer)) && (this.imageMap.length > 0)){
			this.camera.x = vpL;
			this.camera.y = vpT;
			
			//only attempt to draw children that are relevant
			maxX = Math.min(Math.ceil((vpL + camera.viewportWidth + buffer) / (this.tileWidth * this.scaleX)), this.imageMap.length) - 1;
			minX = Math.max(Math.floor((vpL - buffer) / (this.tileWidth * this.scaleX)), 0);
			maxY = Math.min(Math.ceil((vpT + camera.viewportHeight + buffer) / (this.tileHeight * this.scaleY)), this.imageMap[0].length) - 1;
			minY = Math.max(Math.floor((vpT - buffer) / (this.tileHeight * this.scaleY)), 0);

			if((maxY > cache.maxY) || (minY < cache.minY) || (maxX > cache.maxX) || (minX < cache.minX)){
				if(this.tilesToRender.cacheCanvas){
					canvas = this.tilesToRender.cacheCanvas;
					this.tilesToRender.uncache();
				}
				
				this.tilesToRender.removeChildAt(0);
				this.tilesToRender.cache(minX * this.tileWidth, minY * this.tileHeight, (maxX - minX + 1) * this.tileWidth, (maxY - minY + 1) * this.tileHeight);
				
				for(x = minX; x <= maxX; x++){
					for (y = minY; y <= maxY; y++){
						if((y > cache.maxY) || (y < cache.minY) || (x > cache.maxX) || (x < cache.minX)){
							tile = this.tiles[this.imageMap[x][y]];
							this.tilesToRender.removeChildAt(0); // Leaves one child in the display object so createjs will render the cached image.
							this.tilesToRender.addChild(tile);
							tile.x = x * this.tileWidth;
							tile.y = y * this.tileHeight;
							this.tilesToRender.updateCache('source-over');
						}
					}
				}

				if(canvas){
					context = this.tilesToRender.cacheCanvas.getContext('2d');
					width   = (cache.maxX - cache.minX + 1) * this.tileWidth;
					height  = (cache.maxY - cache.minY + 1) * this.tileHeight;
					context.drawImage(canvas, 0, 0, width, height, (cache.minX - minX) * this.tileWidth, (cache.minY - minY) * this.tileHeight, width, height);
					cache.minX = minX;
					cache.minY = minY;
					cache.maxX = maxX;
					cache.maxY = maxY;
				}
			}
		}
	};
	
	proto.createTile = function(imageName){
		var i = 1,
		imageArray = imageName.split(' ');
		tile  = new createjs.BitmapAnimation(this.spriteSheet);
		
		tile.x = 0;
		tile.y = 0;
		tile.gotoAndStop(imageArray[0]);
		tile.cache(0,0,this.tileWidth,this.tileHeight);
		
		for (; i < imageArray.length; i++){
			if(imageArray[i] !== 'tile-1'){
				tile.gotoAndStop(imageArray[i]);
				tile.updateCache('source-over');
			}
		}

		return tile;
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.tilesToRender.removeAllChildren();
		this.stage.removeChild(this.tilesToRender);
		this.imageMap.length = 0;
		this.tiles = undefined;
		this.camera = undefined;
		this.stage = undefined;
		this.tilesToRender = undefined;
		this.owner = undefined;
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/
	
	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value, debug){
			self[messageId](value, debug);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();
