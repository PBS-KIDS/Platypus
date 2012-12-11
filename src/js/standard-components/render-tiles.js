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
		this.spriteSheet = new createjs.SpriteSheet(spriteSheet);
		this.imageMap    = definition.imageMap   || [];
		this.tiles       = [];
		this.tilesToRender = undefined;
		this.scaleX = ((definition.scaleX || 1) * (this.owner.scaleX || 1)) / scaleX;
		this.scaleY = ((definition.scaleY || 1) * (this.owner.scaleY || 1)) / scaleY;
		this.tileWidth   = definition.tileWidth  || (this.owner.tileWidth / this.scaleX)  || 10;
		this.tileHeight  = definition.tileHeight || (this.owner.tileHeight / this.scaleY) || 10;
		
		var buffer = (definition.buffer || (this.tileWidth / 2)) * this.scaleX;
		this.camera = {
			x: -buffer - 1, //to force camera update
			y: -buffer - 1,
			buffer: buffer
		};
		
		this.state = definition.state || 'tile';
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['handle-render-load', 'camera-update', 'add-tiles']);
	};
	var proto = component.prototype;

	proto['handle-render-load'] = function(resp){
		var x = 0,
		y     = 0,
		stage = this.stage = resp.stage;
		tile  = undefined;
		
		this.tilesToRender = new createjs.Container();
		this.tilesToRender.snapToPixel = true;
		this.tilesToRender.name = 'entity-managed'; //its visibility is self-managed
		
		for(x = 0; x < this.imageMap.length; x++){
			this.tiles[x] = [];
			for (y = 0; y < this.imageMap[x].length; y++){
				tile = new createjs.BitmapAnimation(this.spriteSheet);
				tile.x = x * this.tileWidth;
				tile.y = y * this.tileHeight;
				this.tiles[x][y] = tile;
				tile.gotoAndPlay(this.imageMap[x][y]);
				this.tiles[x][y].cache(0,0,this.tileWidth,this.tileHeight);
			}
		}
		this.tilesToRender.scaleX = this.scaleX;
		this.tilesToRender.scaleY = this.scaleY;
		this.tilesToRender.z = this.owner.z;
		stage.addChild(this.tilesToRender);
		stage.autoClear = false; //since tile map is re-painted every time, the canvas does not require clearing.
	};
	
	proto['add-tiles'] = function(definition){
		var x = 0,
		y     = 0,
		map   = definition.imageMap;
		
		if(map){
			for(x = 0; x < this.imageMap.length; x++){
				for (y = 0; y < this.imageMap[x].length; y++){
					this.tiles[x][y].gotoAndPlay(map[x][y]);
					this.tiles[x][y].updateCache('source-over');
				}
			}
		}
	};

	proto['camera-update'] = function(camera){
		var x  = 0,
		y      = 0,
		buffer = this.camera.buffer,
		maxX   = 0,
		maxY   = 0,
		minX   = 0,
		minY   = 0,
		vpL    = Math.floor(camera.viewportLeft / this.tileWidth)  * this.tileWidth,
		vpT    = Math.floor(camera.viewportTop  / this.tileHeight) * this.tileHeight;
				
		if (((Math.abs(this.camera.x - vpL) > buffer) || (Math.abs(this.camera.y - vpT) > buffer)) && (this.tiles.length > 0)){
			this.camera.x = vpL;
			this.camera.y = vpT;
			
			//only attempt to draw children that are relevant
			maxX = Math.min(Math.ceil((vpL + camera.viewportWidth + buffer) / (this.tileWidth * this.scaleX)), this.tiles.length) - 1;
			minX = Math.max(Math.floor((vpL - buffer) / (this.tileWidth * this.scaleX)), 0);
			maxY = Math.min(Math.ceil((vpT + camera.viewportHeight + buffer) / (this.tileHeight * this.scaleY)), this.tiles[0].length) - 1;
			minY = Math.max(Math.floor((vpT - buffer) / (this.tileHeight * this.scaleY)), 0);
			this.tilesToRender.removeAllChildren();
			for(x = minX; x <= maxX; x++){
				for (y = minY; y <= maxY; y++){
					this.tilesToRender.addChild(this.tiles[x][y]);
				}
			}

			this.tilesToRender.cache(minX * this.tileWidth, minY * this.tileHeight, (maxX - minX + 1) * this.tileWidth, (maxY - minY + 1) * this.tileHeight);
		}
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.tilesToRender.removeAllChildren();
		this.stage.removeChild(this.tilesToRender);
		this.stage = undefined;
		this.tilesToRender = undefined;
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
