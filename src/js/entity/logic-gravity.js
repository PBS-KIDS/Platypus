platformer.components['logic-gravity'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		var self = this;
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['layer:logic']);
		
		this.vX = definition.velocityX || 0; 
		this.vY = definition.velocityY || 0;
		this.maxVX = definition.maxVelocityX || definition.maxVelocity || 3;
		this.maxVY = definition.maxVelocityY || definition.maxVelocity || 3;
		this.yGravity = definition.gravity || definition.yGravity || .01;
		this.xGravity = definition.xGravity || 0;
		
		//Handle Tile Collisions
		this.owner.resolveTileCollision = function(heading, collisionInfo){
			return self.resolveTileCollision(heading, collisionInfo);
		};
		
		//Handle Solid Collisions
		this.owner.resolveSolidCollision = function(heading, collisionInfo){
			return self.resolveSolidCollision(heading, collisionInfo);
		};
		
		//Handle Soft Collisions
		this.owner.resolveSoftCollision = function(collisionInfo){
			return self.resolveSoftCollision(collisionInfo);
		};
	};
	var proto = component.prototype;
	
	proto['layer:logic'] = function(deltaT){
		this.vY += this.yGravity * deltaT;
		if (this.vY > this.maxVY)
		{
			this.vY = this.maxVY;
		}
		this.vX += this.xGravity * deltaT;
		if (this.vX > this.maxVX)
		{
			this.vX = this.maxVX;
		}
		
		this.owner.x += (this.vX * deltaT);
		this.owner.y += (this.vY * deltaT);
	};
	
	proto.resolveSolidCollision = proto.resolveTileCollision = function(heading, collisionInfo){
		if(((heading == 'down') && (this.vY > 0)) || ((heading == 'up') && (this.vY < 0))){
			this.vY = 0;
		} else if(((heading == 'left') && (this.vX < 0)) || ((heading == 'right') && (this.vX > 0))){
			this.vX = 0;
		}
		return true;
	};
	
	proto.resolveSoftCollision = function(collisionInfo){
		return false;
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
