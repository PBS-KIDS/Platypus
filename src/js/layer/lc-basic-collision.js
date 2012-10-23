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
					if (entity.collisionType == 'solid')
					{
						this.solidEntities.push(entity);
					} else {
						this.entities.push(entity);
					}
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
	
	
	
	/*************************************************************************************************************************
	 * TODO: This function currently FAILS to allow SOLID ENTITIES a chance TO RESOLVE the collision. WHAT WE GONNA DO!?!?
	 * 
	 ************************************************************************************************************************/
	proto.checkStupidCollision = function ()
	{
		for(var x = 0; x < this.entities.length; x++)
		{
			var ent = this.entities[x];
			if(this.collisionMatrix[ent.type]['solid'])
			{
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
				var potentialsEntities = [];
				
				var potentialTiles = this.terrain.getTiles(sweepAABB);
				
				for (var y = 0; y < this.solidEntities.length; y++)
				{
					if(this.AABBCollision(sweepAABB, this.solidEntities[y].shape.getAABB()))
					{
						potentialsEntities.push(this.solidEntities[y]);
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
				
				var collisionsX = [];
				var collisionsY = [];
				
				var tileCollisionX = undefined;
				var tileCollisionY = undefined;
				
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
						entityAABB = potentialsEntities[u].shape.getAABB();
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
					
					if (ent.routeSolidCollision)
					{
						var complete = false;
						for(var q = 0; q < collisionsX.length; q++)
						{
							complete = ent.routeSolidCollision('x', xDir, collisionsX[q]);
							if (complete)
							{
								finalX = collisionsX[q].atX;
								break;
							}
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
						entityAABB = potentialsEntities[u].shape.getAABB();
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
										if (atY > collisionsY[t].atY)
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
					
					if (ent.routeSolidCollision)
					{
						var complete = false;
						for(var q = 0; q < collisionsY.length; q++)
						{
							complete = ent.routeSolidCollision('y', yDir, collisionsY[q]);
							if (complete)
							{
								finalY = collisionsY[q].atY;
								break;
							}
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
			}
		}
	};
	
	/***********************************************************************************
	 * BEHAVIOR:
	 * This function tries to move the object to the new location. If it runs into 
	 * solid collision it returns FALSE, otherwise true.
	 ***********************************************************************************/
	proto.moveSolidFree = function (ent, newX, newY)
	{
		
		if(this.collisionMatrix[ent.type]['solid'])
		{
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
			var potentialsEntities = [];
			
			var potentialTiles = this.terrain.getTiles(sweepAABB);
			
			for (var y = 0; y < this.solidEntities.length; y++)
			{
				if(this.AABBCollision(sweepAABB, this.solidEntities[y].shape.getAABB()))
				{
					potentialsEntities.push(this.solidEntities[y]);
				}
			}
			
			var xDir = (ent.shape.getPrevX() < ent.shape.getX()) ? 1 : -1;
			var xPos = ent.shape.getPrevX();
			var xGoal = ent.shape.getX();
			var yDir = (ent.shape.getPrevY() < ent.shape.getY()) ? 1 : -1;
			var yPos = ent.shape.getPrevY();
			var yGoal = ent.shape.getY();
			
			
			var collisionsX = [];
			var collisionsY = [];
			
			
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
							return false;
						}
					}
				}
				
				//CHECK AGAINST SOLID ENTITIES
				var entityAABB = undefined;
				for (var u = 0; u < potentialsEntities.length; u++)
				{
					entityAABB = potentialsEntities[u].shape.getAABB();
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
				
				if (ent.routeSolidCollision)
				{
					var complete = false;
					for(var q = 0; q < collisionsX.length; q++)
					{
						complete = ent.routeSolidCollision('x', xDir, collisionsX[q]);
						if (complete)
						{
							finalX = collisionsX[q].atX;
							break;
						}
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
							return false;
						}
					}
				}
				
				//CHECK AGAINST SOLID ENTITIES
				var entityAABB = undefined;
				for (var u = 0; u < potentialsEntities.length; u++)
				{
					entityAABB = potentialsEntities[u].shape.getAABB();
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
									if (atY > collisionsY[t].atY)
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
				
				if (ent.routeSolidCollision)
				{
					var complete = false;
					for(var q = 0; q < collisionsY.length; q++)
					{
						complete = ent.routeSolidCollision('y', yDir, collisionsY[q]);
						if (complete)
						{
							finalY = collisionsY[q].atY;
							break;
						}
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
		}
	};
	
	
	
	/*
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
	*/
	
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
	
	proto.resolveCollision = function (toResolve)
	{
		for (var x = 0; x < toResolve.length; x++)
		{
			if (toResolve[x].routeSoftCollision)
			{
				toResolve[x].routeSoftCollision(toResolve[x].message);
			}
			//toResolve[x].entity.trigger('layer:resolve-collision', toResolve[x].message);
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
