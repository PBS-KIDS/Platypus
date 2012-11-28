platformer.components['render-tiles'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		this.controllerEvents = undefined;
		this.spriteSheet = new createjs.SpriteSheet(definition.spritesheet);
		this.imageMap    = definition.imageMap   || [];
		this.tiles       = [];
		this.tilesToRender = undefined;
		this.scaleX      = definition.scaleX || this.owner.scaleX || 1;
		this.scaleY      = definition.scaleY || this.owner.scaleY || 1;
		this.tileWidth   = definition.tileWidth  || (this.owner.tileWidth / this.scaleX)  || 10;
		this.tileHeight  = definition.tileHeight || (this.owner.tileHeight / this.scaleY) || 10;
		
		var buffer = (definition.buffer || this.tileWidth) * this.scaleX;
		this.camera = {
			x: -buffer - 1, //to force camera update
			y: -buffer - 1,
			buffer: buffer
		};
		
		this.state = definition.state || 'tile';
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['handle-render', 'handle-render-load', 'camera-update']);
	};
	var proto = component.prototype;

	proto['handle-render'] = function(stage){
	};

	proto['handle-render-load'] = function(resp){
		var x = 0,
		y     = 0,
		stage = this.stage = resp.stage;
		tile  = undefined;
		
		this.tilesToRender = new createjs.Container();
		
		for(x = 0; x < this.imageMap.length; x++){
			this.tiles[x] = [];
			for (y = 0; y < this.imageMap[x].length; y++){
				//TODO: Test speed of this - would non-animations perform better?
				tile = new createjs.BitmapAnimation(this.spriteSheet);
				tile.x = x * this.tileWidth;
				tile.y = y * this.tileHeight;
				//this.tilesToRender.addChild(tile);
				this.tiles[x][y] = tile;
				tile.gotoAndPlay(this.imageMap[x][y]);
			}
		}
		this.tilesToRender.scaleX = this.scaleX;
		this.tilesToRender.scaleY = this.scaleY;
		this.tilesToRender.z = this.owner.z;
//		tileList.cache(0, 0, x * this.tileWidth, y * this.tileWidth);
		stage.addChild(this.tilesToRender);
	};
	
	proto['camera-update'] = function(camera){
		var x  = 0,
		y      = 0,
		buffer = this.camera.buffer / this.scaleX,
		maxX   = 0,
		maxY   = 0,
		minX   = 0,
		minY   = 0;
				
		if ((Math.abs(this.camera.x - camera.viewportLeft) > this.camera.buffer) || (Math.abs(this.camera.y - camera.viewportTop) > this.camera.buffer)){
			this.camera.x = camera.viewportLeft;
			this.camera.y = camera.viewportTop;
			
			//only attempt to draw children that are relevant
			maxX = Math.min(Math.ceil((camera.viewportLeft + camera.viewportWidth + this.camera.buffer) / (this.tileWidth * this.scaleX)), this.tiles.length - 1),
			minX = Math.max(Math.floor((camera.viewportLeft - this.camera.buffer) / (this.tileWidth * this.scaleX)), 0),
			maxY = Math.min(Math.ceil((camera.viewportTop + camera.viewportHeight + this.camera.buffer) / (this.tileHeight * this.scaleY)), this.tiles[0].length - 1),
			minY = Math.max(Math.floor((camera.viewportTop - this.camera.buffer) / (this.tileHeight * this.scaleY)), 0);
//			maxX = Math.min(Math.ceil((camera.viewportLeft + camera.viewportWidth) / (this.tileWidth * this.scaleX) + buffer), this.tiles.length - 1),
//			minX = Math.max(Math.floor(camera.viewportLeft / (this.tileWidth * this.scaleX) - buffer), 0),
//			maxY = Math.min(Math.ceil((camera.viewportTop + camera.viewportHeight) / (this.tileHeight * this.scaleY) + buffer), this.tiles[0].length - 1),
//			minY = Math.max(Math.floor(camera.viewportTop / (this.tileHeight * this.scaleY) - buffer), 0);
			this.tilesToRender.removeAllChildren();
			for(x = minX; x <= maxX; x++){
				for (y = minY; y <= maxY; y++){
					this.tilesToRender.addChild(this.tiles[x][y]);
//					tile.gotoAndPlay(this.imageMap[x][y]);
				}
			}

			this.tilesToRender.cache(camera.viewportLeft / this.scaleX - buffer, camera.viewportTop / this.scaleY - buffer, camera.viewportWidth / this.scaleX + buffer * 2, camera.viewportHeight / this.scaleY + buffer * 2);
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
