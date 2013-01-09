/**
# COMPONENT **collision-group**
This component checks for collisions between entities in its group which typically have either a [[Collision-Tiles]] component for tile maps or a [[Collision-Basic]] component for other entities. It uses `entity-container` component messages if triggered to add to its collision list and also listens for explicit add/remove messages (useful in the absence of an `entity-container` component).

## Dependencies:
- [[Handler-Logic]] (on entity) - At the top-most layer, the logic handler triggers `check-collision-group` causing this component to test collisions on all children entities.

## Messages

### Listens for:
- **child-entity-added, add-collision-entity** - On receiving this message, the component checks the entity to determine whether it listens for collision messages. If so, the entity is added to the collision group.
  > @param message ([[Entity]] object) - The entity to be added.
- **child-entity-removed, remove-collision-entity** - On receiving this message, the component looks for the entity in its collision group and removes it.
  > @param message ([[Entity]] object) - The entity to be removed.
- **check-collision-group** - This message causes the component to go through the entities and check for collisions.
  > @param message.camera (object) - Optional. Specifies a region in which to check for collisions. Expects the camera object to contain the following properties: top, left, width, height, and buffer.
- **relocate-group** - This message causes the collision group to trigger `relocate-entity` on entities in the collision group.
  > @param message.x (number) - Required. The new x coordinate.
  > @param message.y (number) - Required. The new y coordinate.
- **relocate-entity** - When this message is triggered, the collision group updates its record of the owner's last (x, y) coordinate.

### Child Broadcasts
- **prepare-for-collision** - This message is triggered on collision entities to make sure their axis-aligned bounding box is prepared for collision testing.
- **relocate-entity** - This message is triggered on an entity that has been repositioned due to a solid collision.
- **hit-by-[collision-types specified in collision entities' definitions]** - When an entity collides with an entity of a listed collision-type, this message is triggered on the entity.
  > @param message.entity ([[Entity]]) - The entity with which the collision occurred.
  > @param message.type (string) - The collision type of the other entity.
  > @param message.shape ([[CollisionShape]]) - This is the shape of the other entity that caused the collision.
  > @param message.x (number) - Returns -1, 0, or 1 indicating on which side of this entity the collision occurred: left, neither, or right respectively.
  > @param message.y (number) - Returns -1, 0, or 1 indicating on which side of this entity the collision occurred: top, neither, or bottom respectively.

## JSON Definition:
    {
      "type": "collision-group"
      // This component has no customizable properties.
    }
*/
platformer.components['collision-group'] = (function(){
	//set here to make them reusable objects
	var tempAABB = new platformer.classes.aABB(),
	tempArray1   = [],
	tempArray2   = [],
	tempArray4   = [],
	preciseColls = [],
	triggerMessage = {
		entity: null,
		type:   null,
		shape:  null,
		x: 0,
		y: 0
	},
	entityCollisionMessage = {
		atX: null,
		atY: null,
		aABB: null,
		shape: null
	},
	tileCollisionMessage = {
		atX: null,
		atY: null,
		aABB: null,
		shape: null
	},
	xyPair = {
		x: 0,
		y: 0,
		xMomentum: 0,
		yMomentum: 0,
		relative: false
	},
	
	triggerCollisionMessages = function(entity, collision, x, y){
		var otherEntity = collision.entity;

		triggerMessage.entity = collision.entity;

		triggerMessage.type   = otherEntity.collisionType;
		triggerMessage.shape  = otherEntity.shape;
		triggerMessage.x      = x;
		triggerMessage.y      = y;
		entity.trigger('hit-by-' + otherEntity.collisionType, triggerMessage);
		
		triggerMessage.entity = entity;
		triggerMessage.type   = entity.collisionType;
		triggerMessage.shape  = entity.shape;
		triggerMessage.x      = -x;
		triggerMessage.y      = -y;
		otherEntity.trigger('hit-by-' + entity.collisionType, triggerMessage);
	},
	triggerTileCollisionMessage = function(entity, shape, x, y){
		triggerMessage.entity = null;
		triggerMessage.type   = 'tiles';
		triggerMessage.shape  = shape;
		triggerMessage.x      = x;
		triggerMessage.y      = y;
		entity.trigger('hit-by-tiles', triggerMessage);
	},
	AABBCollisionX = function (boxX, boxY)
	{
		if(boxX.left   >=  boxY.right)  return false;
		if(boxX.right  <=  boxY.left)   return false;
		return true;
	},
	AABBCollisionY = function (boxX, boxY)
	{
		if(boxX.top    >=  boxY.bottom) return false;
		if(boxX.bottom <=  boxY.top)    return false;
		return true;
	},
	AABBCollision = function (boxX, boxY)
	{
		if(boxX.left   >=  boxY.right)  return false;
		if(boxX.right  <=  boxY.left)   return false;
		if(boxX.top    >=  boxY.bottom) return false;
		if(boxX.bottom <=  boxY.top)    return false;
		return true;
	},
	shapeCollision = function(shapeA, shapeB){
		return true;
	},
	preciseCollision = function (entityA, entityB){
		var i = 0,
		j     = 0,
		aabb  = undefined,
		shapesA = entityA.shapes || entityA.getShapes(),
		shapesB = entityB.shapes || entityB.getShapes();
		
		if((shapesA.length > 1) || (shapesB.length > 1)){
			for (i = 0; i < shapesA.length; i++){
				aabb = shapesA[i].getAABB();
				for (j = 0; j < shapesB.length; j++){
					if((AABBCollision(aabb, shapesB[j].getAABB())) && (shapeCollision(shapesA[i], shapesB[j]))){
						return true; //TODO: return all true instances instead of just the first one in case they need to be resolved in unique ways - DDD
					}
				}
			}
			return false;
		} else {
			return shapeCollision(shapesA[0], shapesB[0]);
		}
	},
	preciseCollisions = function (entities, entity, originalY){
		var shapes = entity.shapes || entity.getShapes();
			aabb   = shapes[0].getAABB();
		
//		preciseColls = [];
		preciseColls.length = 0;
		
		if(originalY){
			for(var i = 0; i < entities.length; i++){
				if(AABBCollisionX(entities[i].getAABB(), aabb) && AABBCollisionY(entities[i].getPreviousAABB(), aabb)){
					preciseColls[preciseColls.length] = entities[i];
				}
			}
		} else {
			for(var i = 0; i < entities.length; i++){
				if(preciseCollision(entities[i], entity, originalY)){
					preciseColls[preciseColls.length] = entities[i];
				}
			}
		}
		
		if (preciseColls.length){
			return preciseColls;
		} else {
			return false;
		}
	},
	checkDirection = function(position, xDirection, yDirection, thisAABB, thatAABB){
		var value = null;
		if (xDirection > 0) {
			value = thatAABB.left - thisAABB.halfWidth;
			if(position !== null){
				value = Math.min(position, value);
			}
		} else if (xDirection < 0) {
			value = thatAABB.right + thisAABB.halfWidth;
			if(position !== null){
				value = Math.max(position, value);
			}
		} else if (yDirection > 0) {
			value = thatAABB.top - thisAABB.halfHeight;
			if(position !== null){
				value = Math.min(position, value);
			}
		} else if (yDirection < 0) {
			value = thatAABB.bottom + thisAABB.halfHeight;
			if(position !== null){
				value = Math.max(position, value);
			}
		}
		return value;
	},
	checkAgainst = function(thisEntity, thisAABB, thatEntity, thatAABB, collisionType, xDirection, yDirection, collision, group){
		var position  = null,
		lastPosition  = null,
		groupPosition = null,
		x = (xDirection?1:null),
		y = (yDirection?1:null),
		collidingEntities = null,
		i        = 0;
		
		if(AABBCollision(thisAABB, thatAABB)){
			if(group){
				collidingEntities = preciseCollisions(group, thatEntity, xDirection);
				if(collidingEntities){
					for(i = 0; i < collidingEntities.length; i++){
						position = checkDirection(position, xDirection, yDirection, collidingEntities[i].getAABB(), thatAABB);
						if (position !== lastPosition){
							if (xDirection > 0) {
								groupPosition = position - (collidingEntities[i].getAABB().x - thisAABB.x);
							} else if (xDirection < 0) {
								groupPosition = position - (collidingEntities[i].getAABB().x - thisAABB.x);
							} else if (yDirection > 0) {
								groupPosition = position - (collidingEntities[i].getAABB().y - thisAABB.y);
							} else if (yDirection < 0) {
								groupPosition = position - (collidingEntities[i].getAABB().y - thisAABB.y);
							}
						}
						lastPosition = position;
					}
					position = groupPosition;
				}
			} else if (preciseCollision(thisEntity, thatEntity)) {
				position = checkDirection(position, xDirection, yDirection, thisAABB, thatAABB);
			}

			if(position !== null){
				if (collision.aABB === null) {
					collision.atX = position * x;
					collision.atY = position * y;
					collision.aABB = thatAABB;
					collision.shape = thatEntity.shapes?thatEntity.shapes[0]:null;
					collision.entity = thatEntity;
					collision.type = thatEntity.collisionType;
				} else if (((xDirection > 0) && (position < collision.atX)) || ((yDirection > 0) && (position < collision.atY))) {
					collision.atX = position * x;
					collision.atY = position * y;
					collision.aABB = thatAABB;
					collision.shape = thatEntity.shapes?thatEntity.shapes[0]:null;
					collision.entity = thatEntity;
					collision.type = thatEntity.collisionType;
				} else if (((xDirection < 0) && (position > collision.atX)) || ((yDirection < 0) && (position > collision.atY))) {
					collision.atX = position * x;
					collision.atY = position * y;
					collision.aABB = thatAABB;
					collision.shape = thatEntity.shapes?thatEntity.shapes[0]:null;
					collision.entity = thatEntity;
					collision.type = thatEntity.collisionType;
				}
			}
			return collision;
		}
	},
	component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];
		
		this.addListeners([
		    'child-entity-added',    'add-collision-entity',
		    'child-entity-removed',  'remove-collision-entity',
		    'check-collision-group', 'relocate-group', 'relocate-entity'
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
		this.lastX = this.owner.getPreviousX?this.owner.getPreviousX():this.owner.x;
		this.lastY = this.owner.getPreviousY?this.owner.getPreviousY():this.owner.y;
		this.xMomentum = 0;
		this.yMomentum = 0;
		
		this.cameraLogicAABB = new platformer.classes.aABB(0, 0);
		this.cameraCollisionAABB = new platformer.classes.aABB(0, 0);
		
		this.unitStepSize = 1000;

		//defined here so we aren't continually recreating new arrays
		this.collisionGroups = [];
		
		this.groupCollisionMessage = {
			entities: this.entitiesByTypeLive,
			terrain: null,
			deltaT: null,
			tick: null,
			camera: null
		};
	};
	var proto = component.prototype; 

	proto['child-entity-added'] = proto['add-collision-entity'] = function(entity){
		var messageIds = entity.getMessageIds(); 
		
		if ((entity.type == 'tile-layer') || (entity.type == 'collision-layer')) { //TODO: probably should have these reference a required function on the obj, rather than an explicit type list since new collision entity map types could be created - DDD
			this.terrain = entity;
			this.groupCollisionMessage.terrain = entity;
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
		var entitiesLive = null;
		
		if(resp.camera){
			this.checkCamera(resp.camera);
		}
		
		if(this.owner.x && this.owner.y){ // is this collision group attached to a collision entity?
			if (resp.entities){
				entitiesLive = this.entitiesByTypeLive; //save to reattach later so entities live grouping is not corrupted 
				this.entitiesByTypeLive = resp.entities;
			}
			if (resp.terrain && (this.terrain !== resp.terrain)){
				this.terrain = resp.terrain;
			}
			
			var goalX = this.owner.x - this.lastX,
			goalY     = this.owner.y - this.lastY;

			this.owner.x = this.lastX;
			this.owner.y = this.lastY;
			this.owner.trigger('prepare-for-collision');
		
			this.checkGroupCollisions(resp);
			this.checkSolidCollisions(resp, false);
	
			this.aabb.reset();
			for (var x = 0; x < this.solidEntitiesLive.length; x++){
				this.aabb.include(((this.solidEntitiesLive[x] !== this.owner) && this.solidEntitiesLive[x].getCollisionGroupAABB)?this.solidEntitiesLive[x].getCollisionGroupAABB():this.solidEntitiesLive[x].getAABB());
			}
	
			this.prevAABB.setAll(this.aabb.x, this.aabb.y, this.aabb.width, this.aabb.height);
			this.aabb.move(this.aabb.x + goalX, this.aabb.y + goalY);
	
			this.checkSoftCollisions(resp);
			
			if (resp.entities){
				this.entitiesByTypeLive = entitiesLive; //from above so entities live grouping is not corrupted 
			}
		} else {
			this.checkGroupCollisions(resp);
			this.checkSolidCollisions(resp, true);
			this.checkSoftCollisions(resp);
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
		check  = AABBCollision;
		
		this.cameraLogicAABB.setAll(x, y, width + buffer, height + buffer);
		list.length = 0;
		length = this.solidEntities.length;
		for (; i < length; i++){
			entity = this.solidEntities[i];
			if(entity.alwaysOn || check(entity.getAABB(), this.cameraLogicAABB)){
				list[list.length] = entity;
			}
		}
		list = this.softEntitiesLive;
		list.length = 0;
		length = this.softEntities.length;
		for (i = 0; i < length; i++){
			entity = this.softEntities[i];
			if(entity.alwaysOn || check(entity.getAABB(), this.cameraLogicAABB)){
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
				if(entity.alwaysOn || check(entity.getAABB(), this.cameraCollisionAABB)){
					list[list.length] = entity;
				}
			}
		}	};

	proto.checkGroupCollisions = function (resp){
		var groups = this.collisionGroups;
		groups.length = 0;
		
		this.groupCollisionMessage.deltaT = resp.deltaT;
		this.groupCollisionMessage.tick = resp.tick;
		this.groupCollisionMessage.camera = resp.camera;
		
		// values inherited from primary world collision group
		if(resp.terrain){
			this.groupCollisionMessage.terrain = resp.terrain;
		}
		if(resp.entities){
			this.groupCollisionMessage.entities = resp.entities;
		}

		for (var x = 0; x < this.solidEntitiesLive.length; x++){
			if(this.solidEntitiesLive[x] !== this.owner){
				if(this.solidEntitiesLive[x].trigger('check-collision-group', this.groupCollisionMessage)){
					this.solidEntitiesLive[x].collisionUnresolved = true;
					groups[groups.length] = this.solidEntitiesLive[x];
				};
			}
		}

		if(groups.length > 0){
			this.resolveCollisionList(groups, true);
		}
	};

	proto.checkSolidCollisions = function (resp, finalMovement){
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
		
		this.resolveCollisionList(entities, false, finalMovement);
	};
	
	proto.resolveCollisionList = function(entities, group, finalMovement){
		for (var x = entities.length - 1; x > -1; x--){
			if(entities[x].collisionUnresolved){
				this.checkSolidEntityCollision(entities[x], group, finalMovement);
				entities[x].collisionUnresolved = false;
			}
		}
	};
	
	proto.checkSolidEntityCollision = function(ent, groupCheck, finalMovement){
		var y    = 0,
		z        = 0,
		initialX = 0,
		initialY = 0,
		xy       = xyPair,
		unitStepSize = this.unitStepSize,
		collisionGroup = ((groupCheck && ent.getCollisionGroup)?ent.getCollisionGroup():null),
		checkAABBCollision = AABBCollision;
		
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
		
		var potentialTiles = tempArray1,
		potentialsEntities = tempArray2,
		collisionsY        = tempArray4;
		potentialTiles.length = 0;
		potentialsEntities.length = 0;
		collisionsY.length = 0;

		for (y = 0; y < ent.solidCollisions.length; y++) {
			if(this.entitiesByTypeLive[ent.solidCollisions[y]]){
				for(z = 0; z < this.entitiesByTypeLive[ent.solidCollisions[y]].length; z++){
					include = true;
					otherEntity = this.entitiesByTypeLive[ent.solidCollisions[y]][z];
					if(collisionGroup){
						for(var i in collisionGroup){
							if(otherEntity === collisionGroup[i]){
								include = false;
							}
						}
					} else if (otherEntity === ent){
						include = false;
					}
					if(include && (checkAABBCollision(sweepAABB, otherEntity.collisionUnresolved?otherEntity.getPreviousAABB():otherEntity.getAABB()))) {
						potentialsEntities[potentialsEntities.length] = this.entitiesByTypeLive[ent.solidCollisions[y]][z];
						connectedToGroup = true; // still touching another entity
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

		var tileCollision    = tileCollisionMessage;
		var entityCollision  = entityCollisionMessage;
		
		//////////////////////////////////////////////////////////////////////
		//MOVE IN THE X DIRECTION
		//////////////////////////////////////////////////////////////////////
		tileCollision.aABB   = null;
		tileCollision.atX    = null;
		tileCollision.atY    = null;
		entityCollision.aABB = null;
		entityCollision.atX  = null;
		entityCollision.atY  = null;

		while (xPos != xGoal && (potentialTiles.length || potentialsEntities.length)){
			if (Math.abs(xGoal - xPos) < unitStepSize)
			{
				if(collisionGroup){
					for(var i in collisionGroup){
						collisionGroup[i].x += xGoal - xPos;
						collisionGroup[i].trigger('prepare-for-collision');
					}
				}
				xPos = xGoal;
			} else {
				if(collisionGroup){
					for(var i in collisionGroup){
						collisionGroup[i].x += xStep;
						collisionGroup[i].trigger('prepare-for-collision');
					}
				}
				xPos += xStep;
			}
			previousAABB.move(xPos, yPos);
			
			//CHECK AGAINST TILES
			for (var t = 0; t < potentialTiles.length; t++) {
				checkAgainst(ent, previousAABB, potentialTiles[t], potentialTiles[t].shapes[0].getAABB(), 'tiles', xStep, 0, tileCollision, collisionGroup);
			}
			
			//CHECK AGAINST SOLID ENTITIES
			for (var u = 0; u < potentialsEntities.length; u++) {
				checkAgainst(ent, previousAABB, potentialsEntities[u], potentialsEntities[u].collisionUnresolved?potentialsEntities[u].getPreviousAABB():potentialsEntities[u].getAABB(), potentialsEntities[u].collisionType, xStep, 0, entityCollision, collisionGroup);
			}
			
			if((entityCollision.atX !== null) && (((xStep > 0) && (!tileCollision.aABB || (entityCollision.atX < tileCollision.atX))) || ((xStep < 0) && (!tileCollision.aABB || (entityCollision.atX > tileCollision.atX))))){
				if(!groupCheck){
					triggerCollisionMessages(ent, entityCollision, xStep / Math.abs(xStep), 0);
				}
					
				if(((entityCollision.atX > initialX) && (xStep > 0)) || ((entityCollision.atX < initialX) && (xStep < 0))){
					finalX = entityCollision.atX;
				} else {
					finalX = initialX;
				}
			} else if(typeof finalX === 'undefined' && tileCollision.aABB){
				if(!groupCheck){
					triggerTileCollisionMessage(ent, tileCollision.shape, xStep / Math.abs(xStep), 0);
				}

				if(((tileCollision.atX > initialX) && (xStep > 0)) || ((tileCollision.atX < initialX) && (xStep < 0))){
					finalX = tileCollision.atX;
				} else {
					finalX = initialX;
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
		tileCollision.aABB   = null;
		tileCollision.atX    = null;
		tileCollision.atY    = null;
		entityCollision.aABB = null;
		entityCollision.atX  = null;
		entityCollision.atY  = null;

		while (yPos != yGoal && (potentialTiles.length || potentialsEntities.length))
		{
			if (Math.abs(yGoal - yPos) < unitStepSize)
			{
				if(collisionGroup){
					for(var i in collisionGroup){
						collisionGroup[i].y += yGoal - yPos;
						collisionGroup[i].trigger('prepare-for-collision');
					}
				}
				yPos = yGoal;
			} else {
				if(collisionGroup){
					for(var i in collisionGroup){
						collisionGroup[i].y += yStep;
						collisionGroup[i].trigger('prepare-for-collision');
					}
				}
				yPos += yStep;
			}
			previousAABB.move(finalX, yPos);
			
			//CHECK AGAINST TILES
			for (var t = 0; t < potentialTiles.length; t++) {
				checkAgainst(ent, previousAABB, potentialTiles[t], potentialTiles[t].shapes[0].getAABB(), 'tiles', 0, yStep, tileCollision, collisionGroup);
			}
			
			//CHECK AGAINST SOLID ENTITIES
			for (var u = 0; u < potentialsEntities.length; u++) {
				checkAgainst(ent, previousAABB, potentialsEntities[u], potentialsEntities[u].collisionUnresolved?potentialsEntities[u].getPreviousAABB():potentialsEntities[u].getAABB(), potentialsEntities[u].collisionType, 0, yStep, entityCollision, collisionGroup);
			}
			
			if((entityCollision.atY !== null) && (((yStep > 0) && (!tileCollision.aABB || (entityCollision.atY < tileCollision.atY))) || ((yStep < 0) && (!tileCollision.aABB || (entityCollision.atY > tileCollision.atY))))){
				if(!groupCheck){
					triggerCollisionMessages(ent, entityCollision, 0, yStep / Math.abs(yStep));
				}
					
				if(((entityCollision.atY > initialY) && (yStep > 0)) || ((entityCollision.atY < initialY) && (yStep < 0))){
					finalY = entityCollision.atY;
				} else {
					finalY = initialY;
				}
			} else if(typeof finalY === 'undefined' && tileCollision.aABB){
				if(!groupCheck){
					triggerTileCollisionMessage(ent, tileCollision.shape, 0, yStep / Math.abs(yStep));
				}

				if(((tileCollision.atY > initialY) && (yStep > 0)) || ((tileCollision.atY < initialY) && (yStep < 0))){
					finalY = tileCollision.atY;
				} else {
					finalY = initialY;
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
			xy.xMomentum = xGoal - finalX;
			xy.yMomentum = yGoal - finalY;
			xy.x = finalX - initialX;
			xy.y = finalY - initialY;
			ent.trigger('relocate-group', xy);
		} else {
			xy.x = finalX - aabbOffsetX;
			xy.y = finalY - aabbOffsetY;
			if(finalMovement){
				xy.xMomentum = 0;
				xy.yMomentum = 0;
			} else {
				xy.xMomentum = xGoal - finalX;
				xy.yMomentum = yGoal - finalY;
			}
			ent.trigger('relocate-entity', xy);
		}
	};
	
	proto.checkSoftCollisions = function (resp)
	{
		var otherEntity = undefined,
		ent = undefined,
		message = triggerMessage,
		x   = 0,
		y   = 0,
		z   = 0,
		checkAABBCollision = AABBCollision;

		message.x = 0;
		message.y = 0;
		
		for(x = 0; x < this.softEntitiesLive.length; x++){
			ent = this.softEntitiesLive[x];
			for (y = 0; y < ent.softCollisions.length; y++){
				if(this.entitiesByTypeLive[ent.softCollisions[y]]){
					for(z = 0; z < this.entitiesByTypeLive[ent.softCollisions[y]].length; z++){
						otherEntity = this.entitiesByTypeLive[ent.softCollisions[y]][z];
						if((otherEntity !== ent) && (checkAABBCollision(ent.getAABB(), otherEntity.getAABB()))) {
							if (preciseCollision(ent, otherEntity)){
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
	
	proto['relocate-group'] = function(resp){
		var xy = xyPair;
		this.xMomentum = resp.xMomentum;
		this.yMomentum = resp.yMomentum;
		xy.x = resp.x;
		xy.y = resp.y;
		xy.xMomentum = 0;
		xy.yMomentum = 0;
		xy.relative = true;
		for (var i = 0; i < this.solidEntities.length; i++){
			this.solidEntities[i].trigger('relocate-entity', xy);
		}
		this.aabb.reset();
		for (var x = 0; x < this.solidEntities.length; x++){
			this.aabb.include(((this.solidEntities[x] !== this.owner) && this.solidEntities[x].getCollisionGroupAABB)?this.solidEntities[x].getCollisionGroupAABB():this.solidEntities[x].getAABB());
		}
		this.resolveMomentum();
	};
	
	proto['relocate-entity'] = function(resp){
		this.lastX = this.owner.x;
		this.lastY = this.owner.y;
	};
	
	proto.resolveMomentum = function(){
		for (var x = 0; x < this.solidEntities.length; x++){
			this.solidEntities[x].trigger('resolve-momentum');
			this.solidEntities[x].x += this.xMomentum;
			this.solidEntities[x].y += this.yMomentum;
		}
		this.xMomentum = 0;
		this.yMomentum = 0;
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











