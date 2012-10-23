platformer.components['collision-hero'] = (function(){
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
		
		this.owner.routeTileCollision = function(axis, dir, collisionInfo){
			return self.routeTileCollision(axis, dir, collisionInfo);
		};
		
		this.owner.routeSolidCollision = function(axis, dir, collisionInfo){
			return self.routeSolidCollision(axis, dir, collisionInfo);
		};
		
		this.owner.routeSoftCollision = function(collisionInfo){
			return self.routeSoftCollision(collisionInfo);
		};
		
		
		/*
		this.owner.resolveTileCollisionX = function(dir, collisionInfo){
			return self.resolveTileCollisionX(dir, collisionInfo);
		};
		this.owner.resolveTileCollisionY = function(dir, collisionInfo){
			return self.resolveTileCollisionY(dir, collisionInfo);
		};
		this.owner.resolveSolidCollisionX = function(dir, collisionInfo){
			return self.resolveSolidCollisionX(dir, collisionInfo);
		};
		this.owner.resolveSolidCollisionY = function(dir, collisionInfo){
			return self.resolveSolidCollisionY(dir, collisionInfo);
		};
		this.owner.resolveSoftCollision = function(collisionInfo){
			return self.resolveSoftCollision(collisionInfo);
		};
		*/
		
		this.owner.collisionType = definition.collisionType || 'solid';
		this.owner.collidesWith = definition.collidesWith || [];
	};
	var proto = component.prototype;
	
	
	proto['load'] = function(resp){
		
	};
	
	proto['layer:prep-collision'] = function(){
		this.owner.shape.update(this.owner.x, this.owner.y);
	};
	
	proto['layer:relocate'] = function(positionXY){
		this.owner.x = positionXY[0] - this.owner.shape.getXOffset();
		this.owner.y = positionXY[1] - this.owner.shape.getYOffset();
		this.owner.shape.setXY(positionXY[0], positionXY[1]);
	};
	
	proto.getAABB = function(){
		return this.owner.shape.getAABB();
	};
	
	proto.routeTileCollision = function(axis, dir, collisionInfo)
	{
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
		return false;
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
		return false;
	};
	
	proto.routeSoftCollision = function(collisionInfo){
		if (this.owner.resolveSoftCollision)
		{
			this.owner.resolveSoftCollision(collisionInfo);
		}
	};
	
	/*
	proto.resolveTileCollisionX = function(dir, collisionInfo){
		//TODO: Write this resolve function.
		if (dir > 0 && this.owner.tileCollisionRight)
		{
			return this.owner.tileCollisionRight(collisionInfo);
		} else if (dir > 0 && this.owner.tileCollisionLeft)
		{
			return this.owner.tileCollisionLeft(collisionInfo);
		} else {
			return collisionInfo.atX;
		}		
	};
	
	proto.resolveTileCollisionY  = function(dir, collisionInfo){
		//TODO: Write this resolve function.
		if (dir > 0 && this.owner.tileCollisionDown)
		{
			return this.owner.tileCollisionDown(collisionInfo);
		} else if (dir > 0 && this.owner.tileCollisionUp)
		{
			return this.owner.tileCollisionUp(collisionInfo);
		} else {
			return collisionInfo.atY;
		}
	};
	
	proto.resolveSolidCollisionX = function(dir, collisionInfo){
		//TODO: Write this resolve function.
		if (dir > 0 && this.owner.solidCollisionRight)
		{
			return this.owner.solidCollisionRight(collisionInfo);
		} else if (dir > 0 && this.owner.solidCollisionLeft)
		{
			return this.owner.solidCollisionLeft(collisionInfo);
		} else {
			return collisionInfo.atX;
		}
	};
	
	proto.resolveSolidCollisionY = function(dir, collisionInfo){
		//TODO: Write this resolve function.
		if (dir > 0 && this.owner.solidCollisionDown)
		{
			return this.owner.solidCollisionDown(collisionInfo);
		} else if (dir > 0 && this.owner.solidCollisionUp)
		{
			return this.owner.solidCollisionUp(collisionInfo);
		} else {
			return collisionInfo.atY;
		}
	};
	
	proto.resolveSolidCollisionY = function(dir, collisionInfo){
		//TODO: Write this resolve function.
		if (dir > 0 && this.owner.solidCollisionDown)
		{
			return this.owner.solidCollisionDown(collisionInfo);
		} else if (dir > 0 && this.owner.solidCollisionUp)
		{
			return this.owner.solidCollisionUp(collisionInfo);
		} else {
			return collisionInfo.atY;
		}
	};
	*/
	
	/*
	proto['layer:resolve-collision'] = function(other){
		var x = this.owner.shape.x;
		var y = this.owner.shape.y;
		var pX = this.owner.shape.prevX;
		var pY = this.owner.shape.prevY;
		
		var otherX = other.shape.x;
		var otherY = other.shape.y;
		
		switch (other.type)
		{
	
		}
	};
	*/
	
	/*
	proto['layer:resolve-solid-collision'] = function(myShape, theirShape){
		
		
		SOLID COLLISION ATTEMPT 2
		var terrain = collisionInfo.terrain;
		var tileCollisions = collisionInfo.tileCollisions;
		var otherCollisions = collisionInfo.otherCollisions;
		
		var x = this.owner.shape.x;
		var y = this.owner.shape.y;
		var pX = this.owner.shape.prevX;
		var pY = this.owner.shape.prevY;
		
		var deltaX = x - pX; 
		var deltaY = y - pY;
		var m = deltaY / deltaX; 
		var b = y - x * m;
		
		var displaceX = undefined;
		var displaceY = undefined;
		
		for (var c = 0; c < tileCollisions.length; c++)
		{
			var tile = tileCollisions[c];
			var tileX = tile.shape.x;
			var tileY = tile.shape.y;
		
			var targetX = undefined; 
			var targetY = undefined; 
			var yAtTargetX = undefined;
			var xAtTargetY = undefined;
			var thisAABB = this.owner.shape.aABB;
			var tileAABB = tile.shape.aABB;
			
			var leftPlane = tileX - tileAABB.halfWidth - thisAABB.halfWidth;
			var rightPlane = tileX + tileAABB.halfWidth + thisAABB.halfWidth;
			var topPlane = tileY - tileAABB.halfHeight - thisAABB.halfHeight;
			var bottomPlane = tileY + tileAABB.halfHeight + thisAABB.halfHeight;
			
			
			
			if (m !== Infinity && m !== -Infinity)
			{
				if (pX <= leftPlane)
				{
					targetX = leftPlane;
				} else if (pX >= rightPlane) {
					targetX = rightPlane;
				}
			}
			
			if (pY <= topPlane)
			{
				targetY = topPlane;
			} else if (pY >= bottomPlane) {
				targetY = bottomPlane;
			}	
			
			
			if (typeof targetX !== 'undefined')
			{
				yAtTargetX = m * targetX + b;
			}
			
			if (typeof targetY !== 'undefined')
			{
				if (m === Infinity || m === -Infinity)
				{
					xAtTargetY = x;
				} else {
					xAtTargetY = (targetY - b) / m ;
				}
			}
			
			if (targetX && yAtTargetX >= topPlane && yAtTargetX <= bottomPlane)
			{
				
				if (deltaX > 0)
				{
					if (!terrain.isTile(tile.gridX - 1, tile.gridY))
					{
						var displacement = targetX - x;
						if (typeof displaceX === 'undefined' || displacement < displaceX)
						{
							displaceX = displacement;
						}
					}
					
				} else if (deltaX < 0) {
					if (!terrain.isTile(tile.gridX + 1, tile.gridY))
					{
						var displacement = targetX - x;
						if (typeof displaceX === 'undefined' || displacement > displaceX)
						{
							displaceX = displacement;
						}
					}
				}
			} else if (targetY && xAtTargetY >= leftPlane && xAtTargetY <= rightPlane){
				if (deltaY > 0)
				{
					if (!terrain.isTile(tile.gridX, tile.gridY - 1))
					{
						var displacement = targetY - y;
						if (typeof displaceY === 'undefined' || displacement < displaceY)
						{
							displaceY = displacement;
						}
					}
					
				} else if (deltaY < 0) {
					if (!terrain.isTile(tile.gridX, tile.gridY + 1))
					{
						var displacement = targetY - y;
						if (typeof displaceY === 'undefined' || displacement > displaceY)
						{
							displaceY = displacement;
						}
					}
				}
			}
		}
		
		if (typeof displaceX !== 'undefined')
		{
			this.owner.x = x + displaceX - this.owner.shape.getXOffset();
			this.owner.shape.x = x + displaceX;
		}
		if (typeof displaceY !== 'undefined')
		{
			this.owner.y = y + displaceY - this.owner.shape.getYOffset();
			this.owner.shape.y = y + displaceY;	
		}
		
		SOLID COLLISION ATTEMPT 1
		case 'solid':
			var deltaX = x - pX; 
			var deltaY = y - pY;
			var m = deltaY / deltaX; 
			var b = y - x * m;
			var targetX = undefined; 
			var targetY = undefined; 
			var yAtTargetX = undefined;
			var xAtTargetY = undefined;
			var thisAABB = this.owner.shape.aABB;
			var otherAABB = other.shape.aABB;
			
			var leftPlane = otherX - otherAABB.halfWidth - thisAABB.halfWidth;
			var rightPlane = otherX + otherAABB.halfWidth + thisAABB.halfWidth;
			var topPlane = otherY - otherAABB.halfHeight - thisAABB.halfHeight;
			var bottomPlane = otherY + otherAABB.halfHeight + thisAABB.halfHeight;
			
			if (m !== Infinity && m !== -Infinity)
			{
				if (pX <= leftPlane)
				{
					targetX = leftPlane;
				} else if (pX >= rightPlane) {
					targetX = rightPlane;
				}
			}
			
			if (pY <= topPlane)
			{
				targetY = topPlane;
			} else if (pY >= bottomPlane) {
				targetY = bottomPlane;
			}	
			
			
			if (typeof targetX !== 'undefined')
			{
				yAtTargetX = m * targetX + b;
			}
			
			if (typeof targetY !== 'undefined')
			{
				if (m === Infinity || m === -Infinity)
				{
					xAtTargetY = x;
				} else {
					xAtTargetY = (targetY - b) / m ;
				}
			}
			
			if (targetX && yAtTargetX >= topPlane && yAtTargetX <= bottomPlane)
			{
				console.warn('Collide on Side');
				this.owner.x = targetX - this.owner.shape.getXOffset();
				this.owner.shape.x = targetX;
				this.owner.y = yAtTargetX - this.owner.shape.getYOffset();
				this.owner.shape.y = yAtTargetX;
			} else if (targetY && xAtTargetY >= leftPlane && xAtTargetY <= rightPlane){
				console.warn('Collide on Top/Bottom');
				this.owner.x = xAtTargetY - this.owner.shape.getXOffset();
				this.owner.shape.x = xAtTargetY;
				this.owner.y = targetY - this.owner.shape.getYOffset();
				this.owner.shape.y = targetY;
			} else {
				console.warn('Hero is inside the block.');
			}
			
			break;
		
	};
	*/

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
