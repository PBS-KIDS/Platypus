/**
 * Uses 'entity-container' component messages if triggered to add to its collision list;
 * also listens for explicit add/remove messages (useful in the absence of 'entity-container'). - DDD
 */
platformer.components['collision-group'] = (function(){
	//set here to make them reusable objects
	var tempAABB = new platformer.classes.aABB(),
	tempArray1   = [],
	tempArray2   = [],
	tempArray3   = [],
	tempArray4   = [],
	triggerMessage = {
		entity: null,
		type:   null,
		shape:  null,
		x: 0,
		y: 0
	},
	collisionXMessage = {
		atX: 0,
		aABB: null,
		shape: null
	},
	collisionYMessage = {
		atY: 0,
		aABB: null,
		shape: null
	},
	xyPair = {
		x: 0,
		y: 0,
		relative: false
	},

	
	component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];
		
		this.addListeners([
		    'child-entity-added',   'add-collision-entity',
		    'child-entity-removed', 'remove-collision-entity',
		    'check-collision-group','relocate-group'
		]);  
		//this.toResolve = [];
		
		var self = this;
		this.owner.getCollisionGroup = function(){
			return self.solidEntities;
		};
		this.owner.getCollisionGroupAABB = function(){
			return self.getAABB();
		};
		this.owner.getPreviousCollisionGroupAABB = function(){
			return self.getPreviousAABB();
		};
		
		this.entitiesByType = {};
		this.solidEntities = [];
		this.solidEntitiesLive = [];
		this.softEntities = [];
		this.softEntitiesLive = [];
		this.entitiesByTypeLive = {};
		this.terrain = undefined;
		this.aabb     = new platformer.classes.aABB(this.owner.x, this.owner.y);
		this.prevAABB = new platformer.classes.aABB(this.owner.x, this.owner.y);
		this.lastX = this.owner.x;
		this.lastY = this.owner.y;
		
		this.cameraLogicAABB = new platformer.classes.aABB(0, 0);
		this.cameraCollisionAABB = new platformer.classes.aABB(0, 0);
		
		this.unitStepSize = 1;

		//defined here so we aren't continually recreating new arrays
		this.collisionGroups = [];
		//this.triggerMessages = [];
		
		this.debugCameraChecking = 0;
		this.debugSolidCollision = 0;
		this.debugSoftCollision  = 0;
		this.debugGroupCollision = 0;
		this.debugPercents = {
			camera: 0,
			solid: 0,
			soft: 0,
			group: 0
		};
	};
	var proto = component.prototype; 

	proto['child-entity-added'] = proto['add-collision-entity'] = function(entity){
		var messageIds = entity.getMessageIds(); 
		
		if ((entity.type == 'tile-layer') || (entity.type == 'collision-layer')) { //TODO: probably should have these reference a required function on the obj, rather than an explicit type list since new collision entity map types could be created - DDD
			this.terrain = entity;
		} else {
			for (var x = 0; x < messageIds.length; x++){
				if (messageIds[x] == 'prepare-for-collision'){
					if(!this.entitiesByType[entity.collisionType]){
						this.entitiesByType[entity.collisionType] = [];
						this.entitiesByTypeLive[entity.collisionType] = [];
					}
					this.entitiesByType[entity.collisionType][this.entitiesByType[entity.collisionType].length] = entity;
					if(entity.solidCollisions.length && !entity.immobile){
						this.solidEntities[this.solidEntities.length] = entity;
					}
					if(entity.softCollisions.length){
						this.softEntities[this.softEntities.length] = entity;
					}
					break;
				}
			}
		}
	};
	
	proto['child-entity-removed'] = proto['remove-collision-entity'] = function(entity){
		var x = 0;

		for (x in this.entitiesByType[entity.collisionType]) {
			if(this.entitiesByType[entity.collisionType][x] === entity){
				this.entitiesByType[entity.collisionType].splice(x, 1);
				break;
			}
		}
		
		if(entity.solidCollisions.length){
			for (x in this.solidEntities) {
				if(this.solidEntities[x] === entity){
					this.solidEntities.splice(x, 1);
					break;
				}
			}
		}

		if(entity.softCollisions.length){
			for (x in this.softEntities) {
				if(this.softEntities[x] === entity){
					this.softEntities.splice(x, 1);
					break;
				}
			}
		}
	};
	
	proto['check-collision-group'] = function(resp){
		var time = new Date().getTime();
		
		if(resp.camera){
			this.checkCamera(resp.camera);
		}
		this.debugCameraChecking += new Date().getTime() - time;
		
		if(this.owner.x && this.owner.y){ // is this collision group attached to a collision entity?
			var goalX = this.owner.x - this.lastX,
			goalY     = this.owner.y - this.lastY;
			
			console.log('goalY = ' + goalY + ' = ' + this.owner.y + ' - ' + this.lastY + ' = this.owner.y - this.lastY:');

			this.owner.x = this.lastX;
			this.owner.y = this.lastY;
			this.owner.trigger('prepare-for-collision');
			this.owner.trigger('prepare-for-collision');
		
			this.checkGroupCollisions(resp);
			this.checkSolidCollisions(resp);
	
//			this.prevAABB.setAll(this.aabb.x, this.aabb.y, this.aabb.width, this.aabb.height);;
			this.aabb.reset();
			for (var x = 0; x < this.entities.length; x++){
				this.aabb.include(((this.entities[x] !== this.owner) && this.entities[x].getCollisionGroupAABB)?this.entities[x].getCollisionGroupAABB():this.entities[x].getAABB());
//				this.entities[x].x += goalX;
//				this.entities[x].y += goalY;
			}
	
			this.owner.x += goalX;
			this.owner.y += goalY;
			
			this.prevAABB.setAll(this.aabb.x, this.aabb.y, this.aabb.width, this.aabb.height);
			this.aabb.move(this.aabb.x + goalX, this.aabb.y + goalY);
	
			this.checkSoftCollisions(resp);
		} else {
			time = new Date().getTime();
			this.checkGroupCollisions(resp);
			this.debugGroupCollision += new Date().getTime() - time;
			
			time = new Date().getTime();
			this.checkSolidCollisions(resp);
			this.debugSolidCollision += new Date().getTime() - time;
			
			time = new Date().getTime();
			this.checkSoftCollisions(resp);
			this.debugSoftCollision += new Date().getTime() - time;
			
			var total = this.debugCameraChecking + this.debugSolidCollision + this.debugSoftCollision + this.debugGroupCollision;
			if(total > 10000){
				this.debugCameraChecking *= 10000 / total;
				this.debugSolidCollision *= 10000 / total;
				this.debugSoftCollision  *= 10000 / total;
				this.debugGroupCollision *= 10000 / total;
				total = 10000;
			}
			this.debugPercents.camera = this.debugCameraChecking / total;
			this.debugPercents.solid  = this.debugSolidCollision / total;
			this.debugPercents.soft   = this.debugSoftCollision  / total;
			this.debugPercents.group  = this.debugGroupCollision / total;
		}
	};
	
	proto.getAABB = function(){
		return this.aabb;
	};

	proto.getPreviousAABB = function(){
		return this.prevAABB;
	};
	
	proto.checkCamera = function(camera){
		var i  = 0,
		j      = 0,
		length = 0,
		list   = this.solidEntitiesLive,
		width  = camera.width,
		height = camera.height,
		x      = camera.left + width  / 2,
		y      = camera.top  + height / 2,
		buffer = camera.buffer * 2,
		entities = undefined,
		entity = undefined,
		check  = this.AABBCollision;
		
		this.cameraLogicAABB.setAll(x, y, width + buffer, height + buffer);
		list.length = 0;
		length = this.solidEntities.length;
		for (; i < length; i++){
			entity = this.solidEntities[i];
			if(check(entity.getAABB(), this.cameraLogicAABB)){
				list[list.length] = entity;
			}
		}
		list = this.softEntitiesLive;
		list.length = 0;
		length = this.softEntities.length;
		for (i = 0; i < length; i++){
			entity = this.softEntities[i];
			if(check(entity.getAABB(), this.cameraLogicAABB)){
				list[list.length] = entity;
			}
		}
		
		buffer *= 2;
		this.cameraCollisionAABB.setAll(x, y, width + buffer, height + buffer);
		for (i in this.entitiesByType){
			entities = this.entitiesByType[i];
			list = this.entitiesByTypeLive[i];
			list.length = 0;
			length = entities.length;
			for (j = 0; j < length; j++){
				entity = entities[j];
				if(check(entity.getAABB(), this.cameraCollisionAABB)){
					list[list.length] = entity;
				}
			}
		}	};

	proto.checkGroupCollisions = function (resp){
		var groups = this.collisionGroups;
		
		groups.length = 0;
		for (var x = 0; x < this.solidEntitiesLive.length; x++){
			if(this.solidEntitiesLive[x] !== this.owner){
				if(this.solidEntitiesLive[x].trigger('check-collision-group', resp)){
					this.solidEntitiesLive[x].collisionUnresolved = true;
					groups[groups.length] = this.solidEntitiesLive[x];
				};
			}
		}

		if(groups.length > 0){
			this.resolveCollisionList(groups, true);
		}
	};

	proto.checkSolidCollisions = function (resp){
		var x    = 0,
		entity   = null,
		entities = this.collisionGroups;
		entities.length = 0;
		
		for (x = this.solidEntitiesLive.length - 1; x > -1; x--)
		{
			entity = this.solidEntitiesLive[x];
			if(this.owner !== entity){
				if(entity.trigger('prepare-for-collision', resp)){
					entity.collisionUnresolved = true;
					entities[entities.length] = entity;
/*				} else { // remove the entity because it no longer has a collision handler
					var typeEntities = this.entitiesByType[this.entities[x].collisionType];
					for (y = typeEntities.length - 1; y > -1; y--)
					{
						if(typeEntities[y] === this.entities[x]){
							typeEntities.splice(y, 1);
							break;
						}
					}
					this.entities.splice(x, 1);*/ //temp removed since this line must now find the actual listed entity, not the live entity index
				}
			}
		}
		
		this.resolveCollisionList(entities, false);
	};
	
	proto.resolveCollisionList = function(entities, group){
		for (var x = entities.length - 1; x > -1; x--){
			if(entities[x].collisionUnresolved){
				this.checkSolidEntityCollision(entities[x], group);
				entities[x].collisionUnresolved = false;
			}
		}
	};
	
	proto.checkSolidEntityCollision = function(ent, groupCheck){
		var y    = 0,
		z        = 0,
		initialX = 0,
		initialY = 0,
		message  = triggerMessage,
		xy       = xyPair,
		unitStepSize = this.unitStepSize;
		
		var currentAABB = groupCheck?ent.getCollisionGroupAABB():ent.getAABB();
		var previousAABB = groupCheck?ent.getPreviousCollisionGroupAABB():ent.getPreviousAABB();//ent.getAABB().getCopy().move(ent.getPreviousX() + ent.getShapes()[0].getXOffset(), ent.getPreviousY() + ent.getShapes()[0].getYOffset());
		
		var sweepTop = Math.min(currentAABB.top, previousAABB.top);
		var sweepBottom = Math.max(currentAABB.bottom, previousAABB.bottom);
		var sweepHeight = sweepBottom - sweepTop;
		var sweepLeft = Math.min(currentAABB.left, previousAABB.left);
		var sweepRight = Math.max(currentAABB.right, previousAABB.right);
		var sweepWidth = sweepRight - sweepLeft;
		var sweepX = sweepLeft + (sweepWidth / 2);
		var sweepY = sweepTop + (sweepHeight / 2); 
		var sweepAABB = tempAABB.setAll(sweepX, sweepY, sweepWidth, sweepHeight);
		var otherEntity = undefined;
		var include = false;
		var entityCollisionGroup = (groupCheck && ent.getCollisionGroup)?ent.getCollisionGroup():false;
		
		var potentialTiles = tempArray1,
		potentialsEntities = tempArray2,
		collisionsX        = tempArray3,
		collisionsY        = tempArray4;
		potentialTiles.length = 0;
		potentialsEntities.length = 0;
		collisionsX.length = 0;
		collisionsY.length = 0;

		for (y = 0; y < ent.solidCollisions.length; y++) {
			if(this.entitiesByTypeLive[ent.solidCollisions[y]]){
				for(z = 0; z < this.entitiesByTypeLive[ent.solidCollisions[y]].length; z++){
					include = true;
					otherEntity = this.entitiesByTypeLive[ent.solidCollisions[y]][z];
					if(entityCollisionGroup){
						for(var i in entityCollisionGroup){
							if(otherEntity === entityCollisionGroup[i]){
								include = false;
							}
						}
					} else if (otherEntity === ent){
						include = false;
					}
					if(include && (this.AABBCollision(sweepAABB, otherEntity.collisionUnresolved?otherEntity.getPreviousAABB():otherEntity.getAABB()))) {
						potentialsEntities[potentialsEntities.length] = this.entitiesByTypeLive[ent.solidCollisions[y]][z];
					}
				}
			} else if (this.terrain && (ent.solidCollisions[y] === 'tiles')){
				potentialTiles = this.terrain.getTiles(sweepAABB);
			}
		}
		
		initialX  = previousAABB.x;//ent.getPreviousX();
		var xPos  = initialX;
		var xGoal = currentAABB.x;//ent.x;
		var xStep  = (xPos < xGoal) ? unitStepSize : -unitStepSize;
		var finalX = undefined; 
		var aabbOffsetX = groupCheck?0:(previousAABB.x - ent.getPreviousX());//previousAABB.x - initialX;
		
		initialY  = previousAABB.y;//ent.getPreviousY();
		var yPos  = initialY;
		var yGoal = currentAABB.y;//ent.y;
		var yStep  = (yPos < yGoal) ? unitStepSize : -unitStepSize;
		var finalY = undefined;
		var aabbOffsetY = groupCheck?0:(previousAABB.y - ent.getPreviousY());//previousAABB.y - initialY;

		var tileCollisionX = collisionXMessage;
		var tileCollisionY = collisionYMessage;
		tileCollisionX.aABB = null;
		tileCollisionY.aABB = null;
		
		//////////////////////////////////////////////////////////////////////
		//MOVE IN THE X DIRECTION
		//////////////////////////////////////////////////////////////////////
		while (xPos != xGoal && (potentialTiles.length || potentialsEntities.length)){
			if (Math.abs(xGoal - xPos) < unitStepSize)
			{
				xPos = xGoal;
			} else {
				xPos += xStep;
			}
//			previousAABB.move(xPos + aabbOffsetX, yPos + aabbOffsetY);
			previousAABB.move(xPos, yPos);
			
			//CHECK AGAINST TILES
			var tileAABB = undefined;
			for (var t = 0; t < potentialTiles.length; t++)
			{
				tileAABB = potentialTiles[t].shapes[0].getAABB();
				if(this.AABBCollision(previousAABB, tileAABB))
				{
					if(groupCheck || this.preciseCollision(ent, potentialTiles[t]))
					{
						var atX = undefined;
						//TODO: How we solve for atX is going to need to change when we're dealing with non-rectangular objects.
						if (xStep > 0)
						{
							atX = tileAABB.left - previousAABB.halfWidth;
						} else {
							atX = tileAABB.right + previousAABB.halfWidth;
						}
						
						if (tileCollisionX.aABB === null) {
							tileCollisionX.atX = atX;
							tileCollisionX.aABB = tileAABB;
							tileCollisionX.shape = potentialTiles[t].shapes[0];
						} else if (xStep > 0) {
							if (atX < tileCollisionX.atX)
							{
								tileCollisionX.atX = atX;
								tileCollisionX.aABB = tileAABB;
								tileCollisionX.shape = potentialTiles[t].shapes[0];
							}
						} else {
							if (atX > tileCollisionX.atX)
							{
								tileCollisionX.atX = atX;
								tileCollisionX.aABB = tileAABB;
								tileCollisionX.shape = potentialTiles[t].shapes[0];
							}
						}
					}
				}
			}
			
			//CHECK AGAINST SOLID ENTITIES
			var entityAABB = undefined;
			for (var u = 0; u < potentialsEntities.length; u++)
			{
				entityAABB = potentialsEntities[u].collisionUnresolved?potentialsEntities[u].getPreviousAABB():potentialsEntities[u].getAABB();
				if(this.AABBCollision(previousAABB, entityAABB)) {
					if(groupCheck || this.preciseCollision(ent, potentialsEntities[u]))
					{
						var atX = undefined;
						//TODO: How we solve for atX is going to need to change when we're dealing with non-rectangular objects.
						if (xStep > 0)
						{
							atX = entityAABB.left - previousAABB.halfWidth;
							if (tileCollisionX.aABB && atX > tileCollisionX.atX)  
							{
								//If the tile is collided with before this, we can skip it.
								continue;
							}
						} else {
							atX = entityAABB.right + previousAABB.halfWidth;
							if (tileCollisionX.aABB && atX < tileCollisionX.atX)  
							{
								//If the tile is collided with before this, we can skip it.
								continue;
							}
						}
						
						if (collisionsX.length == 0) {
							//finalX = atX;
							collisionsX[collisionsX.length] = {atX: atX, entity: potentialsEntities[u]};
						} else if (xStep > 0) {
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
				complete = ent.routeSolidCollision?ent.routeSolidCollision('x', xStep, collisionsX[q]):true;
				if (complete) {
					message.entity = otherEntity = collisionsX[q].entity;
					message.type   = otherEntity.collisionType;
					message.shape  = otherEntity.shape;
					message.x      = xStep / Math.abs(xStep);
					message.y      = 0;
					ent.trigger('hit-by-' + otherEntity.collisionType, message);
					
					message.entity = ent;
					message.type   = ent.collisionType;
					message.shape  = ent.shape;
					message.x      = -message.x;
					message.y      = 0;
					otherEntity.trigger('hit-by-' + ent.collisionType, message);
					
					if(((collisionsX[q].atX > initialX) && (xStep > 0)) || ((collisionsX[q].atX < initialX) && (xStep < 0))){
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
				if(typeof finalX === 'undefined' && tileCollisionX.aABB)
				{
					complete = ent.routeTileCollision('x', xStep, tileCollisionX);
					if (complete) {
						message.entity = null;
						message.type   = 'tiles';
						message.shape  = tileCollisionX.shape;
						message.x      = xStep / Math.abs(xStep);
						message.y      = 0;
						ent.trigger('hit-by-tiles', message);

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
			if (Math.abs(yGoal - yPos) < unitStepSize)
			{
				yPos = yGoal;
			} else {
				yPos += yStep;
			}
//			previousAABB.move(finalX + aabbOffsetX, yPos + aabbOffsetY);
			previousAABB.move(finalX, yPos);
			
			//CHECK AGAINST TILES
			var tileAABB = undefined;
			for (var t = 0; t < potentialTiles.length; t++)
			{
				tileAABB = potentialTiles[t].shapes[0].getAABB();
				if(this.AABBCollision(previousAABB, tileAABB))
				{
					if(groupCheck || this.preciseCollision(ent, potentialTiles[t]))
					{
						var atY = undefined;
						//TODO: How we solve for atY is going to need to change when we're dealing with non-rectangular objects.
						if (yStep > 0)
						{
							atY = tileAABB.top - previousAABB.halfHeight; 
						} else {
							atY = tileAABB.bottom + previousAABB.halfHeight;
						}
						 
						if (tileCollisionY.aABB === null) {
							tileCollisionY.atY = atY;
							tileCollisionY.aABB = tileAABB;
							tileCollisionY.shape = potentialTiles[t].shapes[0];
						} else if (yStep > 0) {
							if (atY < tileCollisionY.atY)
							{
								tileCollisionY.atY = atY;
								tileCollisionY.aABB = tileAABB;
								tileCollisionY.shape = potentialTiles[t].shapes[0];
							}
						} else {
							if (atY > tileCollisionY.atY)
							{
								tileCollisionY.atY = atY;
								tileCollisionY.aABB = tileAABB;
								tileCollisionY.shape = potentialTiles[t].shapes[0];
							}
						} 
					}
				}
			}
			
			//CHECK AGAINST SOLID ENTITIES
			var entityAABB = undefined;
			for (var u = 0; u < potentialsEntities.length; u++)
			{
				entityAABB = potentialsEntities[u].collisionUnresolved?potentialsEntities[u].getPreviousAABB():potentialsEntities[u].getAABB();
				if(this.AABBCollision(previousAABB, entityAABB))
				{
					if(groupCheck || this.preciseCollision(ent, potentialsEntities[u]))
					{
						var atY = undefined;
						//TODO: How we solve for atY is going to need to change when we're dealing with non-rectangular objects.
						if (yStep > 0)
						{
							atY = entityAABB.top - previousAABB.halfHeight;
							if (tileCollisionY.aABB && atY > tileCollisionY.atY)  
							{
								//If the tile is collided with before this, we can skip it.
								continue;
							}
						} else {
							atY = entityAABB.bottom + previousAABB.halfHeight;
							if (tileCollisionY.aABB && atY < tileCollisionY.atY)  
							{
								//If the tile is collided with before this, we can skip it.
								continue;
							}
						}
																						
						if (collisionsY.length == 0) {
							//finalX = atX;
							collisionsY[collisionsY.length] = {atY: atY, entity: potentialsEntities[u]};
						} else if (yStep > 0) {
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
				complete = ent.routeSolidCollision?ent.routeSolidCollision('y', yStep, collisionsY[q]):true;
				if (complete) {
					message.entity = otherEntity = collisionsY[q].entity;
					message.type   = otherEntity.collisionType;
					message.shape  = otherEntity.shape;
					message.x      = 0;
					message.y      = yStep / Math.abs(yStep);
					ent.trigger('hit-by-' + otherEntity.collisionType, message);
					
					message.entity = ent;
					message.type   = ent.collisionType;
					message.shape  = ent.shape;
					message.x      = 0;
					message.y      = -message.y;
					otherEntity.trigger('hit-by-' + ent.collisionType, message);
					

					if(((collisionsY[q].atY > initialY) && (yStep > 0)) || ((collisionsY[q].atY < initialY) && (yStep < 0))){
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
				if(typeof finalY === 'undefined' && tileCollisionY.aABB)
				{
					complete = ent.routeTileCollision('y', yStep, tileCollisionY);
					if (complete) {
						message.entity = null;
						message.type   = 'tiles';
						message.shape  = tileCollisionY.shape;
						message.x      = 0;
						message.y      = yStep / Math.abs(yStep);
						ent.trigger('hit-by-tiles', message);
						
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

		xy.relative = false;
		if(groupCheck){
			xy.x = finalX - initialX;
			xy.y = finalY - initialY;
			ent.trigger('relocate-group', xy);
		} else {
			xy.x = finalX - aabbOffsetX;
			xy.y = finalY - aabbOffsetY;
			ent.trigger('relocate-entity', xy);
		}
/*
		for (var i in triggerMessages){
			ent.trigger('hit-by-' + triggerMessages[i].type, triggerMessages[i]);
			if(triggerMessages[i].entity){ //have to go both ways because the alternate direction may not be checked if the alternate entity is not moving toward this entity
				triggerMessages[i].entity.trigger('hit-by-' + ent.collisionType, {
					entity: ent,
					type:   ent.collisionType,
					shape:  ent.shape,
					x: -triggerMessages[i].x,
					y: -triggerMessages[i].y
				});
			}
		}*/
	};
	
	proto.checkSoftCollisions = function (resp)
	{
		var otherEntity = undefined,
		ent = undefined,
		message = triggerMessage,
		x   = 0,
		y   = 0,
		z   = 0;

		message.x = 0;
		message.y = 0;
		
		for(x = 0; x < this.softEntitiesLive.length; x++){
			ent = this.softEntitiesLive[x];
			for (y = 0; y < ent.softCollisions.length; y++){
				if(this.entitiesByTypeLive[ent.softCollisions[y]]){
					for(z = 0; z < this.entitiesByTypeLive[ent.softCollisions[y]].length; z++){
						otherEntity = this.entitiesByTypeLive[ent.softCollisions[y]][z];
						if((otherEntity !== ent) && (this.AABBCollision(ent.getAABB(), otherEntity.getAABB()))) {
							if (this.preciseCollision(ent, otherEntity)){
								message.entity = otherEntity;
								message.type   = otherEntity.collisionType;
								message.shape  = otherEntity.shape;
								ent.trigger('hit-by-' + otherEntity.collisionType, message);
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
	
	proto.preciseCollision = function (entityA, entityB){
		var i = 0,
		j     = 0,
		aabb  = undefined,
		shapesA = entityA.shapes || entityA.getShapes(),
		shapesB = entityB.shapes || entityB.getShapes();
		
		if((shapesA.length > 1) || (shapesB.length > 1)){
			for (i = 0; i < shapesA.length; i++){
				aabb = shapesA[i].getAABB();
				for (j = 0; j < shapesB.length; j++){
					if((this.AABBCollision(aabb, shapesB[j].getAABB())) && (this.shapeCollision(shapesA[i], shapesB[j]))){
						return true; //TODO: return all true instances instead of just the first one in case they need to be resolved in unique ways - DDD
					}
				}
			}
			return false;
		} else {
			return this.shapeCollision(shapesA[0], shapesB[0]);
		}
	};
	
	proto.shapeCollision = function(shapeA, shapeB){
		return true;
	};
	
	proto['relocate-group'] = function(resp){
		var xy = xyPair,
		x = resp.x,
		y = resp.y;
		
		for (var i = 0; i < this.solidEntities.length; i++){
			if(this.solidEntities[i] !== this.owner){
				xy.x = this.solidEntities[i].x + x;
				xy.y = this.solidEntities[i].y + y;
				xy.relative = false;
				this.solidEntities[i].trigger('relocate-entity', xy);
			} else {
				xy.x = x;
				xy.y = y;
				xy.relative = true;
				this.solidEntities[i].trigger('relocate-entity', xy);
			}
		}
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.solidEntities.length = 0;
		this.softEntities.length = 0;
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();
