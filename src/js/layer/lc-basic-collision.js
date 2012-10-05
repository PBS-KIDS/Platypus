platformer.components['lc-basic-collision'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		
		this.tickMessages = ['collision'];
		this.addListeners(['load','entity-added','collision']);  
		this.toResolve = [];
		
		this.collisionMatrix = {};
	};
	var proto = component.prototype; 

	proto['entity-added'] = function(entity){
		var self = this;
		var messageIds = entity.getMessageIds(); 
		
		for (var x = 0; x < messageIds.length; x++){
			if (messageIds[x] == 'layer:resolve-collision'){
				this.entities.push(entity);
				if(!this.collisionMatrix[entity.type]){
					this.collisionMatrix[entity.type] = {};
					for (var x = 0; x < entity.collidesWith.length; x++){
						this.collisionMatrix[entity.type][entity.collidesWith[x]] = true;
					}
				}
				break;
			} else if (messageIds[x] == 'getShapes'){
				this.entities.push(entity); // same as above for now
				if(!this.collisionMatrix[entity.type]){
					this.collisionMatrix[entity.type] = {};
					for (var x = 0; x < entity.collidesWith.length; x++){
						this.collisionMatrix[entity.type][entity.collidesWith[x]] = true;
					}
				}
				break;
			}

		}
	};
	
	proto['load'] = function(){
		
	};
	
	proto['collision'] = function(deltaT){
		this.prepareCollision();
		this.checkCollision();
		this.resolveCollisions();
	};
	
	proto.prepareCollision = function ()
	{
		for(var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger('layer:prep-collision');
		}
	};
	
	/*
	 * Collision Matrix is set up so that [x,y] is a check to see if X cares about Y
	 */
	
	proto.checkCollision = function ()
	{
		for(var x = 0; x < this.entities.length - 1; x++)
		{
			for (var y = x + 1; y < this.entities.length; y++)
			{
				if (this.collisionMatrix[this.entities[x].type][this.entities[y].collisionType] || this.collisionMatrix[this.entities[y].type][this.entities[x].collisionType])
				{
					var aabbCollision = this.AABBCollision(this.entities[x], this.entities[y]); 
					if(aabbCollision)
					{
						if (this.preciseCollision(this.entities[x], this.entities[y]))
						{
							if (this.collisionMatrix[this.entities[x].type][this.entities[y].collisionType])
							{
								this.toResolve.push({
									entity:  this.entities[x],
									message:{
										entity: this.entities[y],
										type:   this.entities[y].type,
										shape:  aabbCollision.shapeB
									}
								});
							}
							
							if (this.collisionMatrix[this.entities[y].type][this.entities[x].collisionType])
							{
								this.toResolve.push({
									entity:  this.entities[y],
									message:{
										entity: this.entities[x],
										type:   this.entities[x].type,
										shape:  aabbCollision.shapeA
									}
								});
							}
						}
					}
				}
			}
		}
	};
	
	proto.AABBCollision = function (entityA, entityB)
	{
		/*
		var aLeft = entityA.x + entityA.AABB[0];
		var aRight = entityA.x + entityA.AABB[0] + entityA.AABB[2];
		var aTop = entityA.y + entityA.AABB[1];
		var aBottom = entityA.y + entityA.AABB[1] + entityA.AABB[3];
		
		var bLeft = entityB.x + entityB.AABB[0];
		var bRight = entityB.x + entityB.AABB[0] + entityB.AABB[2];
		var bTop = entityB.y + entityB.AABB[1];
		var bBottom = entityB.y + entityB.AABB[1] + entityB.AABB[3];
		
		if(aLeft > bRight) return false;
		if(aRight < bLeft) return false;
		if(aTop  > bBottom) return false;
		if(aBottom < bTop) return false;
		return true;
		*/
		var i   = 0,
		j       = 0,
		shapeA  = undefined,
		shapeB  = undefined,
		shapesA = entityA.getShapes?entityA.getShapes(entityB.getAABB()):[entityA.shape],
		shapesB = entityB.getShapes?entityB.getShapes(entityA.getAABB()):[entityB.shape];
		
		for (i = 0; i < shapesA.length; i++){
			shapeA = shapesA[i].getAABB();
			for (j = 0; j < shapesB.length; j++){
				shapeB = shapesB[j].getAABB();
				if(shapeA.left   >=  shapeB.right)  break;
				if(shapeA.right  <=  shapeB.left)   break;
				if(shapeA.top    >=  shapeB.bottom) break;
				if(shapeA.bottom <=  shapeB.top)    break;
				return {
					shapeA: shapesA[i],
					shapeB: shapesB[j]
				};
			}
		}
		
		return false;	
	};
	
	proto.preciseCollision = function (entityX, entityY)
	{
		return true;
	};
	
	
	proto.resolveCollisions = function ()
	{
		for (var x = 0; x < this.toResolve.length; x++)
		{
			this.toResolve[x].entity.trigger('layer:resolve-collision', this.toResolve[x].message);
		}
		this.toResolve = [];
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.entities.length = 0;
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
