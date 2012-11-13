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
		var x  = 0, 
		self   = this,
		shapes = definition.shapes || (definition.shape?[definition.shape]:[]);

		this.owner    = owner;
		this.lastX    = this.owner.x;
		this.lastY    = this.owner.y;
		this.aabb     = new platformer.classes.aABB();
		this.prevAABB = new platformer.classes.aABB();
		this.canCollide = true;

		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['load',
		                   'collide-on',
		                   'collide-off',
		                   'prepare-for-collision', 
		                   'layer:resolve-collision', 
		                   'layer:resolve-solid-collision', 
		                   'relocate-entity']);
		this.shapes = [];
		this.entities = undefined;
		for (x in shapes){
			this.shapes.push(new platformer.classes.collisionShape([this.owner.x, this.owner.y], shapes[x].type, shapes[x].points, shapes[x].offset, shapes[x].radius));
			this.prevAABB.include(this.shapes[x].getAABB());
			this.aabb.include(this.shapes[x].getAABB());
		}

		this.owner.getAABB = function(){
			return self.getAABB();
		};
		this.owner.getPreviousAABB = function(){
			return self.getPreviousAABB();
		};
		this.owner.getShapes = function(){
			return self.getShapes();
		};
		this.owner.getPreviousX = function(){
			return self.lastX;
		};
		this.owner.getPreviousY = function(){
			return self.lastY;
		};
		
		this.owner.collisionType = definition.collisionType || 'none';
		//this.prevCollisionType = 'none';

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
	
	proto['collide-on'] = function(resp){
		//this.owner.collisionType = this.prevCollisionType;
		this.owner.parent.trigger('add-collision-entity', this.owner);
	};
	
	proto['collide-off'] = function(resp){
		this.owner.parent.trigger('remove-collision-entity', this.owner);
		//this.prevCollisionType = this.owner.collisionType;
		//this.owner.collisionType = 'none';
	};
	
	proto['prepare-for-collision'] = function(resp){
		var swap = this.prevAABB; 
		this.prevAABB = this.aabb;
		this.aabb     = swap;

/*		if(!this.entities){
			if(this.owner.getCollisionGroup){
				this.entities = this.owner.getCollisionGroup();
			}
		}
				
		if(this.entities && (this.entities.length > 1)){
			var goalX    = this.owner.x - this.lastX,
			goalY        = this.owner.y - this.lastY;

			this.aabb.reset();
			for (var x = 0; x < this.shapes.length; x++){
				this.aabb.include(this.shapes[x].getAABB());
			}

			this.owner.x = this.lastX;
			this.owner.y = this.lastY;
			this.owner.collisionUnresolved = false;
			this.owner.trigger('check-collision-group', resp);
//			for (var x = 0; x < this.entities.length; x++){
//				this.entities[x].x += goalX;
//				this.entities[x].y += goalY;
//				entities[x].collisionUnresolved = true; // to ensure they are again tested against parent collisions
//			}
			this.owner.collisionUnresolved = true;
			
			this.aabb.reset();
			for (var x = 0; x < this.shapes.length; x++){
				this.shapes[x].update(this.owner.x, this.owner.y);
				this.aabb.include(this.shapes[x].getAABB());
			}
			for (var x = 0; x < this.entities.length; x++){
				this.aabb.include(this.entities[x].getAABB());
			}

			this.owner.x += goalX;
			this.owner.y += goalY;
			this.aabb.move(this.aabb.x + goalX, this.aabb.y + goalY);
		} else {*/
		
		this.aabb.reset();
		for (var x = 0; x < this.shapes.length; x++){
			this.shapes[x].update(this.owner.x, this.owner.y);
			this.aabb.include(this.shapes[x].getAABB());
		}
		//}
	};
	
	
	proto['relocate-entity'] = function(resp){
		this.owner.x = resp.x;// - this.shapes[0].getXOffset();
		this.owner.y = resp.y;// - this.shapes[0].getYOffset();

		this.aabb.reset();
		for (var x in this.shapes){
			this.shapes[x].reset(this.owner.x, this.owner.y);
			this.aabb.include(this.shapes[x].getAABB());
		}

		this.lastX = this.owner.x;
		this.lastY = this.owner.y;
//		this.aabb.move(positionXY[0], positionXY[1]);
//		this.prevAABB.setAll(this.aabb.x, this.aabb.y, this.aabb.width, this.aabb.height);
	};
	
	proto.getAABB = function(){
		return this.aabb;
	};
	
	proto.getPreviousAABB = function(){
		return this.prevAABB;
	};
	
	proto.getShapes = function(){
		var shapes = this.shapes.slice();
		
/*		if(this.entities && (this.entities.length > 1)){
			for (var x = 0; x < this.entities.length; x++){
				if(this.entities[x] !== this.owner){
					shapes = shapes.concat(this.entities[x].shapes || this.entities[x].getShapes());
				}
			}
		}*/
		return shapes;
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
