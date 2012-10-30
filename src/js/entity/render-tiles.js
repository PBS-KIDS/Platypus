platformer.components['render-tiles'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		this.controllerEvents = undefined;
		this.spriteSheet = new createjs.SpriteSheet(definition.spritesheet);
		this.imageMap    = definition.imageMap   || [];
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
		this.addListeners(['layer:render', 'layer:render-load', 'camera-update']);
	};
	var proto = component.prototype;

	proto['layer:render'] = function(stage){
	};

	proto['layer:render-load'] = function(resp){
		var x = 0,
		y     = 0,
		stage = this.stage = resp.stage;
		tile  = undefined;
		
		this.tileList = new createjs.Container();
		
		for(x = 0; x < this.imageMap.length; x++){
			for (y = 0; y < this.imageMap[x].length; y++){
				//TODO: Test speed of this - would non-animations perform better?
				tile = new createjs.BitmapAnimation(this.spriteSheet);
				//tile.scaleX = this.scaleX;
				//tile.scaleY = this.scaleY;
				tile.x = x * this.tileWidth;
				tile.y = y * this.tileHeight;
				this.tileList.addChild(tile);
				tile.gotoAndPlay(this.imageMap[x][y]);
			}
		}
		this.tileList.scaleX = this.scaleX;
		this.tileList.scaleY = this.scaleY;
//		tileList.cache(0, 0, x * this.tileWidth, y * this.tileWidth);
		stage.addChild(this.tileList);
	};
	
	proto['camera-update'] = function(camera){
		var buffer = this.camera.buffer / this.scaleX;
		
		if ((Math.abs(this.camera.x - camera.viewportLeft) > this.camera.buffer) || (Math.abs(this.camera.y - camera.viewportTop) > this.camera.buffer)){
			this.camera.x = camera.viewportLeft;
			this.camera.y = camera.viewportTop;
			this.tileList.cache(camera.viewportLeft / this.scaleX - buffer, camera.viewportTop / this.scaleY - buffer, camera.viewportWidth / this.scaleX + buffer * 2, camera.viewportHeight / this.scaleY + buffer * 2);
//			tileList.cache(buffer, buffer, camera.viewportWidth / this.scaleX - buffer, camera.viewportHeight / this.scaleY - buffer);
		}
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.tileList.removeAllChildren();
		this.stage.removeChild(this.tileList);
		this.stage = undefined;
		this.tileList = undefined;
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
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();
