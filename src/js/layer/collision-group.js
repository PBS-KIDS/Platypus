/**
 * Requires Owner entity to have 'entity-container' component 
 */
platformer.components['collision-group'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];
		
		this.tickMessages = ['collision'];
		this.addListeners(['load','child-entity-added','collision']);  
		//this.toResolve = [];
		
		this.entities = [];
		this.entitiesByType = {};
		this.terrain = undefined;
	};
	var proto = component.prototype; 

	proto['child-entity-added'] = function(entity){
		var messageIds = entity.getMessageIds(); 
		
		if ((entity.type == 'tile-layer') || (entity.type == 'collision-layer')) { //TODO: probably should have these reference a required function on the obj, rather than an explicit type list since new collision entity map types could be created - DDD
			this.terrain = entity;
		} else {
			for (var x = 0; x < messageIds.length; x++){
				if (messageIds[x] == 'layer:prep-collision'){
					if(!this.entitiesByType[entity.collisionType]){
						this.entitiesByType[entity.collisionType] = [];
					}
					this.entities.push(entity);
					this.entitiesByType[entity.collisionType].push(entity);
					break;
				}
			}
		}
	};
	
	proto['load'] = function(){
		
	};
	
	proto['collision'] = function(deltaT){
		this.prepareCollision(deltaT);

		this.checkSolidCollisions(deltaT);
		
		this.checkSoftCollisions(deltaT);
	};
	
	proto.prepareCollision = function ()
	{
		for (var x = this.entities.length - 1; x > -1; x--)
		{
			if(!this.entities[x].trigger('layer:prep-collision'))
			{
				var entities = this.entitiesByType[this.entities[x].collisionType];
				for (var y = entities.length - 1; y > -1; y--)
				{
					if(entities[y] === this.entities[x]){
						entities.splice(y, 1);
						break;
					}
				}
				this.entities.splice(x, 1);
			}
		}
	};
	
	proto.checkSolidCollisions = function (deltaT)
	{
		var x = 0,
		entities = [];
		
		for(x = 0; x < this.entities.length; x++){
			if(this.entities[x].solidCollisions.length > 0){
				this.entities[x].collisionUnresolved = true;
				entities.push(this.entities[x]);
			}
		}
		
		this.resolveCollisionList(entities);
	};
	
	proto.resolveCollisionList = function(entities){
		for (var x = entities.length - 1; x > -1; x--){
			if(entities[x].collisionUnresolved){
				if(entities[x].postponeCollisionCheck && (entities[x].postponeCollisionCheck.length > 0)){
					this.resolveCollisionList(entities[x].postponeCollisionCheck);
					entities[x].postponeCollisionCheck.length = 0;
					entities[x].trigger('collision-postponement-resolved');
				}
				this.checkSolidEntityCollision(entities[x]);
				entities[x].collisionUnresolved = false;
			}
		}
	};
	
	proto.checkSolidEntityCollision = function(ent){
		var y = 0,
		z = 0,
		initialX = 0,
		initialY = 0,
		triggerMessages = [];

		/******/
		
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
		var otherEntity = undefined;

		for (y = 0; y < ent.solidCollisions.length; y++)
		{
			if(this.entitiesByType[ent.solidCollisions[y]]){
				for(z = 0; z < this.entitiesByType[ent.solidCollisions[y]].length; z++){
					otherEntity = this.entitiesByType[ent.solidCollisions[y]][z];
					if((!otherEntity.postponeCollisionCheck || (otherEntity.postponeCollisionCheck.length === 0)) && (otherEntity !== ent) && (this.AABBCollision(sweepAABB, otherEntity.shape.getPreviousAABB()))) {
						potentialsEntities.push(this.entitiesByType[ent.solidCollisions[y]][z]);
					}
				}
			} else if (ent.solidCollisions[y] === 'tiles'){
				potentialTiles = this.terrain.getTiles(sweepAABB);
			}
		}
		
		var xDir = (ent.shape.getPrevX() < ent.shape.getX()) ? 1 : -1;
		var xPos = ent.shape.getPrevX();
		var xGoal = ent.shape.getX();
		var yDir = (ent.shape.getPrevY() < ent.shape.getY()) ? 1 : -1;
		var yPos = ent.shape.getPrevY();
		var yGoal = ent.shape.getY();

		initialX = xPos;
		initialY = yPos;
		var finalY = undefined;
		var finalX = undefined; 
		
		var collisionsX = [];
		var collisionsY = [];
		
		var tileCollisionX = undefined;
		var tileCollisionY = undefined;
		triggerMessages.length = 0;
		
		//////////////////////////////////////////////////////////////////////
		//MOVE IN THE X DIRECTION
		//////////////////////////////////////////////////////////////////////
		while (xPos != xGoal && (potentialTiles.length || potentialsEntities.length))
		{
			if (Math.abs(xGoal - xPos) <= 1)
			{
				xPos = xGoal;
			} else {
				xPos += xDir;
			}
			previousAABB.move(xPos, yPos);
			
			//CHECK AGAINST TILES
			var tileAABB = undefined;
			for (var t = 0; t < potentialTiles.length; t++)
			{
				tileAABB = potentialTiles[t].shape.getAABB();
				if(this.AABBCollision(previousAABB, tileAABB))
				{
					if(this.preciseCollision(ent.shape, potentialTiles[t].shape))
					{
						var atX = undefined;
						//TODO: How we solve for atX is going to need to change when we're dealing with non-rectangular objects.
						if (xDir > 0)
						{
							atX = tileAABB.left - previousAABB.halfWidth;
						} else {
							atX = tileAABB.right + previousAABB.halfWidth;
						}
						
						if ( typeof tilecollisionX === 'undefined') {
							tileCollisionX = {atX: atX, aABB: tileAABB, shape: potentialTiles[t].shape};
						} else if (xDir > 0) {
							if (atX < tileCollisionX.atX)
							{
								tileCollisionX = {atX: atX, aABB: tileAABB, shape: potentialTiles[t].shape};
							}
						} else {
							if (atX > tileCollisionX.atX)
							{
								tileCollisionX = {atX: atX, aABB: tileAABB, shape: potentialTiles[t].shape};
							}
						}
					}
				}
			}
			
			//CHECK AGAINST SOLID ENTITIES
			var entityAABB = undefined;
			for (var u = 0; u < potentialsEntities.length; u++)
			{
				entityAABB = potentialsEntities[u].shape.getPreviousAABB();
				if(this.AABBCollision(previousAABB, entityAABB))
				{
					if(this.preciseCollision(ent.shape, potentialsEntities[u].shape))
					{
						var atX = undefined;
						//TODO: How we solve for atX is going to need to change when we're dealing with non-rectangular objects.
						if (xDir > 0)
						{
							atX = entityAABB.left - previousAABB.halfWidth;
							if (tileCollisionX && atX > tileCollisionX.atX)  
							{
								//If the tile is collided with before this, we can skip it.
								continue;
							}
						} else {
							atX = entityAABB.right + previousAABB.halfWidth;
							if (tileCollisionX && atX < tileCollisionX.atX)  
							{
								//If the tile is collided with before this, we can skip it.
								continue;
							}
						}
						
						if (collisionsX.length == 0) {
							//finalX = atX;
							collisionsX.push({atX: atX, entity: potentialsEntities[u]});
						} else if (xDir > 0) {
							var insertIndex = 0; 
							for (var c = 0; c < collisionsX.length; c++)
							{
								if (atX < collisionsX[c].atX)
								{
									insertIndex = c;
									break;
								}
							}
							collisionsX.splice(insertIndex, 0, {atX: atX, type: potentialsEntities[u].collisionType, aABB: entityAABB,  entity: potentialsEntities[u]});
						} else {
							var insertIndex = 0; 
							for (var c = 0; c < collisionsX.length; c++)
							{
								if (atX > collisionsX[c].atX)
								{
									insertIndex = c;
									break;
								}
							}
							collisionsX.splice(insertIndex, 0, {atX: atX, type: potentialsEntities[u].collisionType, aABB: entityAABB,  entity: potentialsEntities[u]});
							
						} 
					}
				}
					
			}
			
			var complete = false;
			for(var q = 0; q < collisionsX.length; q++)
			{
				complete = ent.routeSolidCollision?ent.routeSolidCollision('x', xDir, collisionsX[q]):true;
				if (complete)
				{
					triggerMessages.push({
						entity: collisionsX[q].entity,
						type:   collisionsX[q].entity.collisionType,
						shape:  collisionsX[q].entity.shape,
						x: xDir,
						y: 0
					});
					if(((collisionsX[q].atX > initialX) && (xDir > 0)) || ((collisionsX[q].atX < initialX) && (xDir < 0))){
						finalX = collisionsX[q].atX;
					} else {
						finalX = initialX;
					}
					break;
				}
			}	
			
			if (ent.routeTileCollision)
			{
				var complete = false;
				if(typeof finalX === 'undefined' && tileCollisionX)
				{
					complete = ent.routeTileCollision('x', xDir, tileCollisionX);
					if (complete)
					{
						finalX = tileCollisionX.atX;
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
		
		//////////////////////////////////////////////////////////////////////
		//MOVE IN THE Y DIRECTION
		//////////////////////////////////////////////////////////////////////
		while (yPos != yGoal && (potentialTiles.length || potentialsEntities.length))
		{
			if (Math.abs(yGoal - yPos) < 1)
			{
				yPos = yGoal;
			} else {
				yPos += yDir;
			}
			previousAABB.move(finalX, yPos);
			
			//CHECK AGAINST TILES
			var tileAABB = undefined;
			for (var t = 0; t < potentialTiles.length; t++)
			{
				tileAABB = potentialTiles[t].shape.getAABB();
				if(this.AABBCollision(previousAABB, tileAABB))
				{
					if(this.preciseCollision(ent.shape, potentialTiles[t].shape))
					{
						var atY = undefined;
						//TODO: How we solve for atY is going to need to change when we're dealing with non-rectangular objects.
						if (yDir > 0)
						{
							atY = tileAABB.top - previousAABB.halfHeight; 
						} else {
							atY = tileAABB.bottom + previousAABB.halfHeight;
						}
						 
						if ( typeof tilecollisionY === 'undefined') {
							tileCollisionY = {atY: atY, aABB: tileAABB,  shape: potentialTiles[t].shape};
						} else if (yDir > 0) {
							if (atY < collisionsY[0].atY)
							{
								tileCollisionY = {atY: atY, aABB: tileAABB,  shape: potentialTiles[t].shape};
							}
						} else {
							if (atY > tileCollisionY.atY)
							{
								tileCollisionY = {atY: atY, aABB: tileAABB,  shape: potentialTiles[t].shape};
							}
						} 
					}
				}
			}
			
			//CHECK AGAINST SOLID ENTITIES
			var entityAABB = undefined;
			for (var u = 0; u < potentialsEntities.length; u++)
			{
				entityAABB = potentialsEntities[u].shape.getPreviousAABB();
				if(this.AABBCollision(previousAABB, entityAABB))
				{
					if(this.preciseCollision(ent.shape, potentialsEntities[u].shape))
					{
						var atY = undefined;
						//TODO: How we solve for atY is going to need to change when we're dealing with non-rectangular objects.
						if (yDir > 0)
						{
							atY = entityAABB.top - previousAABB.halfHeight;
							if (tileCollisionY && atY > tileCollisionY.atY)  
							{
								//If the tile is collided with before this, we can skip it.
								continue;
							}
						} else {
							atY = entityAABB.bottom + previousAABB.halfHeight;
							if (tileCollisionY && atY < tileCollisionY.atY)  
							{
								//If the tile is collided with before this, we can skip it.
								continue;
							}
						}
																						
						if (collisionsY.length == 0) {
							//finalX = atX;
							collisionsY.push({atY: atY, entity: potentialsEntities[u]});
						} else if (yDir > 0) {
							var insertIndex = 0; 
							for (var c = 0; c < collisionsY.length; c++)
							{
								if (atY < collisionsY[c].atY)
								{
									insertIndex = c;
									break;
								}
							}
							collisionsY.splice(insertIndex, 0, {atY: atY, type: potentialsEntities[u].collisionType, aABB: entityAABB,  entity: potentialsEntities[u]});
						} else {
							var insertIndex = 0; 
							for (var c = 0; c < collisionsY.length; c++)
							{
								if (atY > collisionsY[c].atY)
								{
									insertIndex = c;
									break;
								}
							}
							collisionsY.splice(insertIndex, 0, {atY: atY, type: potentialsEntities[u].collisionType, aABB: entityAABB,  entity: potentialsEntities[u]});
						} 
					}
				}
			}
			
			var complete = false;
			for(var q = 0; q < collisionsY.length; q++)
			{
				complete = ent.routeSolidCollision?ent.routeSolidCollision('y', yDir, collisionsY[q]):true;
				if (complete)
				{
					triggerMessages.push({
						entity: collisionsY[q].entity,
						type:   collisionsY[q].entity.collisionType,
						shape:  collisionsY[q].entity.shape,
						x: 0,
						y: yDir
					});
					if(((collisionsY[q].atY > initialY) && (yDir > 0)) || ((collisionsY[q].atY < initialY) && (yDir < 0))){
						finalY = collisionsY[q].atY;
					} else {
						finalY = initialY;
					}
					break;
				}
			}
			
			if (ent.routeTileCollision)
			{
				var complete = false;
				if(typeof finalY === 'undefined' && tileCollisionY)
				{
					complete = ent.routeTileCollision('y', yDir, tileCollisionY);
					if (complete)
					{
						finalY = tileCollisionY.atY;
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

		ent.trigger('layer:relocate', [finalX, finalY]);

		for (var i in triggerMessages){
			ent.trigger('hit-by-' + triggerMessages[i].type, triggerMessages[i]);
			triggerMessages[i].entity.trigger('hit-by-' + ent.collisionType, { //have to go both ways because the alternate direction may not be checked if the alternate entity is not moving toward this entity
				entity: ent,
				type:   ent.collisionType,
				shape:  ent.shape,
				x: -triggerMessages[i].x,
				y: -triggerMessages[i].y
			});
		}
	};
	
	proto.checkSoftCollisions = function ()
	{
		var otherEntity = undefined,
		ent = undefined,
		x   = 0,
		y   = 0,
		z   = 0;
		
		for(x = 0; x < this.entities.length; x++){
			ent = this.entities[x];
			for (y = 0; y < ent.softCollisions.length; y++){
				if(this.entitiesByType[ent.softCollisions[y]]){
					for(z = 0; z < this.entitiesByType[ent.softCollisions[y]].length; z++){
						otherEntity = this.entitiesByType[ent.softCollisions[y]][z];
						if((otherEntity !== ent) && (this.AABBCollision(ent.shape.getAABB(), otherEntity.shape.getAABB()))) {
							if (this.preciseCollision(ent.shape, otherEntity.shape))
							{
								ent.trigger('hit-by-' + otherEntity.collisionType, {
									entity: otherEntity,
									type:   otherEntity.collisionType,
									shape:  otherEntity.shape
								});
							}
						}
					}
				}
			}
		}
	};
	
	proto.AABBCollision = function (boxX, boxY)
	{
		
		if(boxX.left   >=  boxY.right)  return false;
		if(boxX.right  <=  boxY.left)   return false;
		if(boxX.top    >=  boxY.bottom) return false;
		if(boxX.bottom <=  boxY.top)    return false;
		return true;
	};
	
	proto.preciseCollision = function (shapeX, shapeY)
	{
		return true;
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.entities.length = 0;
		for (var i in this.entitiesByType){
			this.entitiesByType[i].length = 0;
		}
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
