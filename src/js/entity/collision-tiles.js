platformer.components['collision-tiles'] = (function(){
	var component = function(owner, definition){
		var self = this;
		this.owner = owner;
		
		this.collisionMap   = definition.collisionMap   || [];
		this.tileWidth      = definition.tileWidth  || this.owner.tileWidth  || 10;
		this.tileHeight     = definition.tileHeight || this.owner.tileHeight || 10;
		this.tileHalfWidth  = this.tileWidth  / 2;
		this.tileHalfHeight = this.tileHeight / 2;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['layer:prep-collision']);
		
		this.owner.getTiles = function(aabb){
			return self.getTiles(aabb);
		};
		this.owner.getAABB = function(){
			return self.getAABB();
		};
		this.owner.isTile = function(x, y){
			return self.isTile(x, y);
		};
	};
	var proto = component.prototype;

	proto['layer:prep-collision'] = function(){
		
	};
	
	proto.getAABB = function(){
		return {
			left: 0,
			top:  0,
			right: this.tileWidth * this.collisionMap.length,
			bottom: this.tileHeight * this.collisionMap.length[0]
		};
	};
	
	proto.isTile = function (x, y) {
		if (x >=0 && x < this.collisionMap.length && y >=0 && y < this.collisionMap[0].length && this.collisionMap[x][y] != -1) 
		{
			return true;
		} else {
			//If there's not a tile or we're outside the map.
			return false;
		}
	};
	
	proto.getTiles = function(aabb){
		var left = Math.max(Math.floor(aabb.left   / this.tileWidth),  0),
		top      = Math.max(Math.floor(aabb.top    / this.tileHeight), 0),
		right    = Math.min(Math.ceil(aabb.right   / this.tileWidth),  this.collisionMap.length),
		bottom   = Math.min(Math.ceil(aabb.bottom  / this.tileHeight), this.collisionMap[0].length),
		x        = 0,
		y        = 0,
		tiles   = [];
		
		for (x = left; x < right; x++){
			for (y = top; y < bottom; y++){
				if (this.collisionMap[x][y] != -1) {
					tiles.push({
								gridX: x,
								gridY: y,
								//type: this.collisionMap[x][y],
								shape: new platformer.classes.collisionShape([x * this.tileWidth + this.tileHalfWidth, y * this.tileHeight + this.tileHalfHeight], 'rectangle', [[-this.tileHalfWidth, -this.tileHalfHeight],[this.tileHalfWidth, this.tileHalfHeight]])	
								});
					
					//shapes.push(new platformer.classes.collisionShape([x * this.tileWidth + this.tileHalfWidth, y * this.tileHeight + this.tileHalfHeight], 'rectangle', [[-this.tileHalfWidth, -this.tileHalfHeight],[this.tileHalfWidth, this.tileHalfHeight]]));
				}
			}
		}
		
		return tiles;
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
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
