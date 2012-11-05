platformer.components['collision-basic'] = (function(){
	var entityBroadcast = function(event){
		if(typeof event === 'string'){
			return function(value){
				this.owner.trigger(event, value);
			};
		} else {
			return function(value){
				for (var e in event){
					this.owner.trigger(event[e], value);
				}
			};
		}
	};
	var component = function(owner, definition){
		var self = this;
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['load',
		                   'layer:prep-collision', 
		                   'layer:resolve-collision', 
		                   'layer:resolve-solid-collision', 
		                   'layer:relocate']);
		
		this.owner.shape = new platformer.classes.collisionShape([this.owner.x, this.owner.y],definition.shape.type, definition.shape.points, definition.shape.offset, definition.shape.radius); 
		this.owner.getAABB = function(){
			return self.getAABB();
		};
		this.owner.getPreviousAABB = function(){
			return self.getPreviousAABB();
		};
		
		this.owner.collisionType = definition.collisionType || 'none';
		this.owner.solidCollisions = [];
		if(definition.solidCollisions){
			for(var i in definition.solidCollisions){
				this.owner.solidCollisions.push(i);
				if(definition.solidCollisions[i]){
					this.addListener('hit-by-' + i);
					this['hit-by-' + i] = entityBroadcast(definition.solidCollisions[i]);
				}
			}
		}

		this.owner.softCollisions = [];
		if(definition.softCollisions){
			for(var i in definition.softCollisions){
				this.owner.softCollisions.push(i);
				if(definition.softCollisions[i]){
					this.addListener('hit-by-' + i);
					this['hit-by-' + i] = entityBroadcast(definition.softCollisions[i]);
				}
			}
		}
		
		this.owner.routeTileCollision = function(axis, dir, collisionInfo){
			return self.routeTileCollision(axis, dir, collisionInfo);
		};
		
		this.owner.routeSolidCollision = function(axis, dir, collisionInfo){
			return self.routeSolidCollision(axis, dir, collisionInfo);
		};
		
		this.owner.routeSoftCollision = function(collisionInfo){
			return self.routeSoftCollision(collisionInfo);
		};
	};
	var proto = component.prototype;
	
	
	proto['load'] = function(resp){
	};
	
	proto['layer:prep-collision'] = function(){ //TODO: Gravity-sensitive solids collision shapes break away from their owner due to this event not being fired - DDD
		this.owner.shape.update(this.owner.x, this.owner.y);
	};
	
	
	proto['layer:relocate'] = function(positionXY){
		this.owner.x = positionXY[0] - this.owner.shape.getXOffset();
		this.owner.y = positionXY[1] - this.owner.shape.getYOffset();
		this.owner.shape.reset(this.owner.x, this.owner.y);
	};
	
	proto.getAABB = function(){
		return this.owner.shape.getAABB();
	};
	
	proto.getPreviousAABB = function(){
		return this.owner.shape.getPreviousAABB();
	};
	
	proto.routeTileCollision = function(axis, dir, collisionInfo){
		if (this.owner.resolveTileCollision)
		{
			if (axis == 'x' && dir > 0)
			{
				return this.owner.resolveTileCollision('right', collisionInfo);
			} else if (axis == 'x' && dir < 0)
			{
				return this.owner.resolveTileCollision('left', collisionInfo);
			} else if (axis == 'y' && dir > 0)
			{
				return this.owner.resolveTileCollision('down', collisionInfo);
			} else if (axis == 'y' && dir < 0)
			{
				return this.owner.resolveTileCollision('up', collisionInfo);
			}
		}
		return true;
	};
	
	proto.routeSolidCollision = function(axis, dir, collisionInfo)
	{
		if (this.owner.resolveSolidCollision)
		{
			if (axis == 'x' && dir > 0)
			{
				return this.owner.resolveSolidCollision('right', collisionInfo);
			} else if (axis == 'x' && dir < 0)
			{
				return this.owner.resolveSolidCollision('left', collisionInfo);
			} else if (axis == 'y' && dir > 0)
			{
				return this.owner.resolveSolidCollision('down', collisionInfo);
			} else if (axis == 'y' && dir < 0)
			{
				return this.owner.resolveSolidCollision('up', collisionInfo);
			}
		}
		return true;
	};
	
	proto.routeSoftCollision = function(collisionInfo){
		if (this.owner.resolveSoftCollision)
		{
			this.owner.resolveSoftCollision(collisionInfo);
		}
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
