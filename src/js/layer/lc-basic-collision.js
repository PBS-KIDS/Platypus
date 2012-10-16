platformer.components['lc-basic-collision'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		
		// Messages that this component listens for
		this.listeners = [];
		
		this.tickMessages = ['collision'];
		this.addListeners(['load','entity-added','collision']);  
		//this.toResolve = [];
		
		this.entities = [];
		this.solidEntities = [];
		this.terrain = undefined;
		this.collisionMatrix = {};
	};
	var proto = component.prototype; 

	proto['entity-added'] = function(entity){
		var self = this;
		var messageIds = entity.getMessageIds(); 
		
		if (entity.type == 'tile-layer')
		{
			this.terrain = entity;
		} else {
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
				}
			}
		}
	};
	
	proto['load'] = function(){
		
	};
	
	proto['collision'] = function(deltaT){
		var toResolve = [];
		
		this.prepareCollision();
		
		//toResolve = this.checkSolidCollision();
		//this.resolveSolidCollision(toResolve); 
		this.checkStupidCollision();
		
		toResolve = this.checkCollision();
		this.resolveCollision(toResolve);
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
	
	proto.checkStupidCollision = function ()
	{
		//TODO: Is this just for Solid collision? What happens with moveable solid collision????????????
		for(var x = 0; x < this.entities.length - 1; x++)
		{
			var ent = this.entities[x];
			
			var currentAABB = ent.shape.getAABB();
			var prevPos = ent.shape.getPrevLocation();
			var previousAABB = (currentAABB.getCopy()).move(prevPos[0], prevPos[1]);
			
			var sweepTop = Math.min(currentAABB.top, previousAABB.top);
			var sweepBottom = Math.max(currentAABB.bottom, previousAABB.bottom);
			var sweepHeight = sweepBottom - sweepTop;
			var sweepLeft = Math.min(currentAABB.left, previousAABB.left);
			var sweepRight = Math.max(currentAABB.right, previousAABB.right);
			var sweepWidth = sweepRight - sweepLeft;
			var sweepX = sweepLeft + (sweepWidth / 2);
			var sweepY = sweepTop + (sweepHeight / 2); 
			var sweepAABB = new platformer.classes.aABB(sweepX, sweepY, sweepWidth, sweepHeight);
			
			var potentialTiles = [];
			var potentialsEntities = [];
			if (this.collisionMatrix[ent.type]['solid'])
			{
				potentialTiles = this.terrain.getTiles(sweepAABB);
			}
			
			for (var y = x + 1; y < this.entities.length; y++)
			{
				//TODO: Do we need a list of solid objects???? What are we doing here checking the collision Matrix?????? 
				if(this.collisionMatrix[ent.type][this.entities[y].collisionType] && this.AABBCollision(sweepAABB, this.entities[y].shape.getAABB()))
				{
					potentialsEntities.push(this.entities[y]);
				}
			}
			
			var xDir = (ent.shape.getPrevX() < ent.shape.getX()) ? 1 : -1;
			var xPos = ent.shape.getPrevX();
			var xGoal = ent.shape.getX();
			var yDir = (ent.shape.getPrevY() < ent.shape.getY()) ? 1 : -1;
			var yPos = ent.shape.getPrevY();
			var yGoal = ent.shape.getY();
			
			var finalY = undefined;
			var finalX = undefined; 
			
			
			//Move in the x direction
			while (xPos != xGoal && (potentialTiles.length || potentialsEntities.length))
			{
				//alert('xGoal: ' + xGoal + ' xPos: ' + xPos + ' xDir: ' + xDir);
				if (Math.abs(xGoal - xPos) <= 1)
				{
					xPos = xGoal;
				} else {
					xPos += xDir;
				}
				previousAABB.move(xPos, yPos);
				
				var tileAABB = undefined;
				for (var t = 0; t < potentialTiles.length; t++)
				{
					tileAABB = potentialTiles[t].shape.getAABB();
					if(this.AABBCollision(previousAABB, tileAABB))
					{
						//var atX = tileAAB.left + previousAABB.halfWidth;
						var atX = undefined;
						if (xDir > 0)
						{
							atX = tileAABB.left - previousAABB.halfWidth;
						} else {
							atX = tileAABB.right + previousAABB.halfWidth;
						}
						
						
						if (typeof finalX === 'undefined') {
							finalX = atX;
						} else if (xDir > 0) {
							if (atX < finalX)
							{
								finalX = atX;
							}
						} else {
							if (atX < finalX)
							{
								finalX = atX;
							}
						} 
					}
				}
				
				var entityAABB = undefined;
				for (var u = 0; u < potentialsEntities.length; u++)
				{
					entityAABB = potentialsEntities[u].shape.getAABB();
					if(this.AABBCollision(previousAABB, entityAABB))
					{
						var atX = undefined;
						if (xDir > 0)
						{
							atX = entityAABB.left - previousAABB.halfWidth;
						} else {
							atX = entityAABB.right + previousAABB.halfWidth;
						}
						
						
						if (typeof finalX === 'undefined') {
							finalX = atX;
						} else if (xDir > 0) {
							if (atX < finalX)
							{
								finalX = atX;
							}
						} else {
							if (atX < finalX)
							{
								finalX = atX;
							}
						} 
					}
				}
				
				if(typeof finalX !== 'undefined')
				{
					break;
				}
			}
			
			if(typeof finalX === 'undefined')
			{
				
				finalX = xGoal;
			}
			
			//Move in the y direction
			while (yPos != yGoal && (potentialTiles.length || potentialsEntities.length))
			{
				if (Math.abs(yGoal - yPos) < 1)
				{
					yPos = yGoal;
				} else {
					yPos += yDir;
				}
				previousAABB.move(finalX, yPos);
				
				var tileAABB = undefined;
				for (var t = 0; t < potentialTiles.length; t++)
				{
					tileAABB = potentialTiles[t].shape.getAABB();
					if(this.AABBCollision(previousAABB, tileAABB))
					{
						var atY = undefined;
						if (yDir > 0)
						{
							atY = tileAABB.top - previousAABB.halfHeight; 
						} else {
							atY = tileAABB.bottom + previousAABB.halfHeight;
						}
						 
						
						if (typeof finalY === 'undefined') {
							finalY = atY;
						} else if (yDir > 0) {
							if (atY < finalY)
							{
								finalY = atY;
							}
						} else {
							if (atY < finalY)
							{
								finalY = atY;
							}
						} 
					}
				}
				
				var entityAABB = undefined;
				for (var u = 0; u < potentialsEntities.length; u++)
				{
					entityAABB = potentialsEntities[u].shape.getAABB();
					if(this.AABBCollision(previousAABB, entityAABB))
					{
						//var atY = entityAABB.left + previousAABB.halfWidth;
						var atY = undefined;
						if (yDir > 0)
						{
							atY = entityAABB.top - previousAABB.halfHeight; 
						} else {
							atY = entityAABB.bottom + previousAABB.halfHeight;
						}						
						
						if (typeof finalY === 'undefined') {
							finalY = atY;
						} else if (yDir > 0) {
							if (atY < finalY)
							{
								finalY = atY;
							}
						} else {
							if (atY < finalY)
							{
								finalY = atY;
							}
						} 
					}
				}
				
				if(typeof finalY !== 'undefined')
				{
					break;
				}
			}
			
			
			if(typeof finalY === 'undefined')
			{
				finalY = yGoal;
			}
			
			//TODO: Figure out how this is actually going to work. 
			
			//alert('Relocate: x: ' + finalX);			
			ent.trigger('layer:relocate', [finalX, finalY]);
		}
	};
	
	
	proto.checkSolidCollision = function ()
	{
		var toResolve = [];
		for(var x = 0; x < this.entities.length - 1; x++) //TODO: There may be an error in the for loops for this function.
		{
			var tileCollisions = [];
			var otherCollisions = [];
			if (this.collisionMatrix[this.entities[x].type]['solid'])
			{
				if (this.terrain)
				{
					tileCollisions = this.terrain.getTiles(this.entities[x].getAABB());
					/*
					for (var y = 0; y < tileShapes.length; y++)
					{
						tileCollisions.push({
												tiles:  tiles[y]
											});
					}	
					*/
				}
				
				for (var y = x + 1; y < this.solidEntities.length; y++)
				{
					if(this.AABBCollision(this.entities[x].shape.getAABB(), this.entities[y].shape.getAABB()))
					{
						if (this.preciseCollision(this.entities[x].shape, this.solidEntities[y].shape))
						{
							//TODO: WHY IS THE MESSAGE CONSTRUCTED AS SUCH?
							otherCollisions.push({
												entity: this.solidEntities[y],
												shape:  this.solidEntities[y].shape
											});
						}	
					}
				}
			}
			
			toResolve.push({
				entity:  this.entities[x],
				tileCollisions: tileCollisions,
				otherCollisions: otherCollisions
			});
			
		}
		return toResolve;
	};
	
	proto.checkCollision = function ()
	{
		var toResolve = [];
		for(var x = 0; x < this.entities.length - 1; x++)
		{
			for (var y = x + 1; y < this.entities.length; y++)
			{
				if (this.collisionMatrix[this.entities[x].type][this.entities[y].collisionType] || this.collisionMatrix[this.entities[y].type][this.entities[x].collisionType])
				{
					if(this.AABBCollision(this.entities[x].shape.getAABB(), this.entities[y].shape.getAABB()))
					{
						if (this.preciseCollision(this.entities[x].shape, this.entities[y].shape))
						{
							if (this.collisionMatrix[this.entities[x].type][this.entities[y].collisionType])
							{
								//TODO: WHY IS THE MESSAGE CONSTRUCTED AS SUCH?
								
								toResolve.push({
									entity:  this.entities[x],
									message:{
										entity: this.entities[y],
										type:   this.entities[y].collisionType,
										shape:  this.entities[y].shape
									}
								});
							}
							
							if (this.collisionMatrix[this.entities[y].type][this.entities[x].collisionType])
							{
								//TODO: WHY IS THE MESSAGE CONSTRUCTED AS SUCH?
								
								toResolve.push({
									entity:  this.entities[y],
									message:{
										entity: this.entities[x],
										type:   this.entities[x].collisionType,
										shape:  this.entities[x].shape
									}
								});
							}
						}
					}
				}
			}
		}
		return toResolve;
	};
	
	proto.AABBCollision = function (boxX, boxY)
	{
		
		if(boxX.left   >=  boxY.right)  return false;
		if(boxX.right  <=  boxY.left)   return false;
		if(boxX.top    >=  boxY.bottom) return false;
		if(boxX.bottom <=  boxY.top)    return false;
		return true;
		
		/*
		var i   = 0;
		var j   = 0;
		var shapeA  = undefined;
		var shapeB  = undefined;
		var shapesA = entityA.getShapes?entityA.getShapes(entityB.getAABB()):[entityA.shape];
		var shapesB = entityB.getShapes?entityB.getShapes(entityA.getAABB()):[entityB.shape];
		
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
		*/	
	};
	
	proto.preciseCollision = function (shapeX, shapeY)
	{
		return true;
	};
	
	
	proto.resolveSolidCollision = function (toResolve)
	{
		for (var x = 0; x < toResolve.length; x++)
		{
			toResolve[x].entity.trigger('layer:resolve-solid-collision', {terrain: this.terrain, tileCollisions: toResolve[x].tileCollisions, otherCollisions: toResolve[x].otherCollisions});
		}
	};
	
	proto.resolveCollision = function (toResolve)
	{
		for (var x = 0; x < toResolve.length; x++)
		{
			toResolve[x].entity.trigger('layer:resolve-collision', toResolve[x].message);
		}
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
