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
	tempArray3   = [],
	tempArray4   = [],
	tempArray5   = [],
	emptyArray   = [],
	preciseColls = [],
	diff         = null,
	triggerMessage = {
		entity: null,
		type:   null,
		shape:  null,
		x: 0,
		y: 0,
		hitType: null,
		myType: null
	},
	entityCollisionMessage = {
		x: null,
		y: null,
		aABB: null,
		shape: null,
		thisType: null,
		thatType: null
	},
	tileCollisionMessage = {
		x: null,
		y: null,
		aABB: null,
		shape: null,
		thisType: null,
		thatType: null
	},
	xyPair = {
		x: 0,
		y: 0,
		xMomentum: 0,
		yMomentum: 0,
		relative: false
	},
	
	triggerCollisionMessages = function(entity, collision, x, y, hitType){
		var otherEntity = collision.entity;

		triggerMessage.entity = collision.entity;

		triggerMessage.type   = collision.thatType;
		triggerMessage.myType = collision.thisType;
		triggerMessage.shape  = otherEntity.shape;
		triggerMessage.x      = x;
		triggerMessage.y      = y;
		triggerMessage.hitType= hitType;
		entity.trigger('hit-by-' + collision.thatType, triggerMessage);
		
		triggerMessage.entity = entity;
		triggerMessage.type   = collision.thisType;
		triggerMessage.myType = collision.thatType;
		triggerMessage.shape  = entity.shape;
		triggerMessage.x      = -x;
		triggerMessage.y      = -y;
		otherEntity.trigger('hit-by-' + collision.thisType, triggerMessage);
	},
	triggerTileCollisionMessage = function(entity, shape, x, y, myType){
		triggerMessage.entity = null;
		triggerMessage.type   = 'tiles';
		triggerMessage.myType = myType;
		triggerMessage.shape  = shape;
		triggerMessage.x      = x;
		triggerMessage.y      = y;
		triggerMessage.hitType= 'solid';
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
	checkAgainst = function(thisEntity, thisAABB, thatEntity, thatAABB, xDirection, yDirection, collision, group, thisCollisionType, thatCollisionType){
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
				if ((collision.aABB === null) || (((xDirection > 0) && (position < collision.x)) || ((yDirection > 0) && (position < collision.y))) || (((xDirection < 0) && (position > collision.x)) || ((yDirection < 0) && (position > collision.y)))) {
					collision.x = position * x;
					collision.y = position * y;
					collision.aABB = thatAABB;
					collision.shape = thatEntity.shapes?thatEntity.shapes[0]:null;
					collision.entity = thatEntity;
					collision.thisType = thisCollisionType;
					collision.thatType = thatCollisionType;
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
		this.allEntities = [];
		this.allEntitiesLive = [];
		this.groupsLive = [];
		this.entitiesByTypeLive = {};
		this.terrain = undefined;
		this.aabb     = new platformer.classes.aABB(this.owner.x, this.owner.y);
		this.prevAABB = new platformer.classes.aABB(this.owner.x, this.owner.y);
		this.lastX = this.owner.getPreviousX?this.owner.getPreviousX():this.owner.x;
		this.lastY = this.owner.getPreviousY?this.owner.getPreviousY():this.owner.y;
		this.xMomentum = 0;
		this.yMomentum = 0;
		
		this.updateLiveList = true;
		this.cameraLogicAABB = new platformer.classes.aABB(0, 0);
		this.cameraCollisionAABB = new platformer.classes.aABB(0, 0);
		
		//defined here so we aren't continually recreating new arrays
		this.collisionGroups = [];
		
		this.groupCollisionMessage = {
			entities: this.entitiesByTypeLive,
			terrain: null,
			deltaT: null,
			tick: null,
			camera: null
		};
		
		this.timeElapsed = {
			name: 'Col',
			time: 0
		};
	};
	var proto = component.prototype; 

	proto['child-entity-added'] = proto['add-collision-entity'] = function(entity){
		var i = 0,
		types = entity.collisionTypes,
		solid = false,
		soft  = false;
		
		if ((entity.type == 'tile-layer') || (entity.type == 'collision-layer')) { //TODO: probably should have these reference a required function on the obj, rather than an explicit type list since new collision entity map types could be created - DDD
			this.terrain = entity;
			this.groupCollisionMessage.terrain = entity;
			this.updateLiveList = true;
		} else {
			if(types){
				for(; i < types.length; i++){
					if(!this.entitiesByType[types[i]]){
						this.entitiesByType[types[i]] = [];
						this.entitiesByTypeLive[types[i]] = [];
					}
					this.entitiesByType[types[i]][this.entitiesByType[types[i]].length] = entity;
					if(entity.solidCollisions[types[i]].length && !entity.immobile){
						solid = true;
					}
					if(entity.softCollisions[types[i]].length){
						soft = true;
					}
				}
				if(solid && !entity.immobile){
					this.solidEntities[this.solidEntities.length] = entity;
				}
				if(soft){
					this.softEntities[this.softEntities.length] = entity;
				}
//				if(entity.jumpThrough){ // Need to do jumpthrough last, since everything else needs to check against it's original position
					this.allEntities[this.allEntities.length] = entity;
//				} else {
//					this.allEntities.splice(0, 0, entity);
//				}
				this.updateLiveList = true;
			}
		}
	};
	
	proto['child-entity-removed'] = proto['remove-collision-entity'] = function(entity){
		var x = 0,
		i     = 0,
		j	  = 0,
		types = entity.collisionTypes,
		solid = false,
		soft  = false;

		if (types)
		{
			for(; i < types.length; i++){
				for (x in this.entitiesByType[types[i]]) {
					if(this.entitiesByType[types[i]][x] === entity){
						this.entitiesByType[types[i]].splice(x, 1);
						break;
					}
				}
				if(entity.solidCollisions[types[i]].length){
					solid = true;
				}
				if(entity.softCollisions[types[i]].length){
					soft = true;
				}
			}
			
			if(solid){
				for (x in this.solidEntities) {
					if(this.solidEntities[x] === entity){
						this.solidEntities.splice(x, 1);
						break;
					}
				}
			}
	
			if(soft){
				for (x in this.softEntities) {
					if(this.softEntities[x] === entity){
						this.softEntities.splice(x, 1);
						break;
					}
				}
			}
			
			for (j = 0; j < this.allEntities.length; j++)
			{
				if (this.allEntities[j] === entity)
				{
					this.allEntities.splice(j,1);
					break;
				}
			}
			this.updateLiveList = true;
		}
		
	};
	
	proto['check-collision-group'] = function(resp){
		var entitiesLive = null,
		time = new Date().getTime();
		
		if(resp.camera){
			this.checkCamera(resp.camera);
		}/*
		if(resp.movers){
			this.checkMovers(resp.camera, resp.movers);
		}*/

		this.timeElapsed.name = 'Col-Cam';
		this.timeElapsed.time = new Date().getTime() - time;
		platformer.game.currentScene.trigger('time-elapsed', this.timeElapsed);
		time += this.timeElapsed.time;

//		this.tester = 0;
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

			this.owner.triggerEvent('prepare-for-collision');

			if(this.allEntitiesLive.length > 1){
				this.checkGroupCollisions(resp);
				this.prepareCollisions(resp);
				this.checkSolidCollisions(resp, false);
				this.resolveNonCollisions(resp);
			}
	
			this.aabb.reset();
			this.aabb.include(this.owner.getAABB());
			for (var x = 0; x < this.solidEntitiesLive.length; x++){
				this.aabb.include(this.solidEntitiesLive[x].getCollisionGroupAABB?this.solidEntitiesLive[x].getCollisionGroupAABB():this.solidEntitiesLive[x].getAABB());
			}
	
			this.prevAABB.setAll(this.aabb.x, this.aabb.y, this.aabb.width, this.aabb.height);
			this.aabb.move(this.aabb.x + goalX, this.aabb.y + goalY);
	
//			if(test) console.log('set: ' + this.aabb.y);
			
			this.checkSoftCollisions(resp);
			
			if (resp.entities){
				this.entitiesByTypeLive = entitiesLive; //from above so entities live grouping is not corrupted 
			}
		} else {
//			this.tester = 0;

			this.checkGroupCollisions(resp);

			this.timeElapsed.name = 'Col-Group';
			this.timeElapsed.time = new Date().getTime() - time;
			platformer.game.currentScene.trigger('time-elapsed', this.timeElapsed);
			time += this.timeElapsed.time;

			this.prepareCollisions(resp);

			this.timeElapsed.name = 'Col-Prep';
			this.timeElapsed.time = new Date().getTime() - time;
			platformer.game.currentScene.trigger('time-elapsed', this.timeElapsed);
			time += this.timeElapsed.time;

			this.checkSolidCollisions(resp, true);

			this.timeElapsed.name = 'Col-Solid';
			this.timeElapsed.time = new Date().getTime() - time;
			platformer.game.currentScene.trigger('time-elapsed', this.timeElapsed);
			time += this.timeElapsed.time;

			this.resolveNonCollisions(resp);

			this.timeElapsed.name = 'Col-None';
			this.timeElapsed.time = new Date().getTime() - time;
			platformer.game.currentScene.trigger('time-elapsed', this.timeElapsed);
			time += this.timeElapsed.time;

			this.checkSoftCollisions(resp);

			this.timeElapsed.name = 'Col-Soft';
			this.timeElapsed.time = new Date().getTime() - time;
			platformer.game.currentScene.trigger('time-elapsed', this.timeElapsed);
			time += this.timeElapsed.time;

		}
	};
	
	proto.getAABB = function(){
		return this.aabb;
//		if(test) console.log('get: ' + this.aabb.y);
	};

	proto.getPreviousAABB = function(){
		return this.prevAABB;
	};

	proto.checkCamera = function(camera, movers){
		var i  = 0,
		j      = 0,
		length = 0,
		list   = null,
		all    = null,
		softs  = null,
		solids = null,
		groups = null,
		width  = camera.width,
		height = camera.height,
		x      = camera.left + width  / 2,
		y      = camera.top  + height / 2,
		buffer = camera.buffer * 2,
		entities = undefined,
		entity = undefined,
		check  = AABBCollision,
		aabbLogic     = this.cameraLogicAABB,
		aabbCollision = this.cameraCollisionAABB,
		types = null,
		createdGroupList = false;
		
		// store buffered size since the actual width x height is not used below.
		width += buffer * 2;
		height += buffer * 2;
		
		if(this.updateLiveList || !aabbLogic.matches(x, y, width, height)){
			
			aabbLogic.setAll(x, y, width, height);
			
			if(this.updateLiveList || !aabbCollision.contains(aabbLogic)){ //if the camera has not moved beyond the original buffer, we do not continue these calculations
				this.updateLiveList = false;

				all = this.allEntitiesLive;
				all.length = 0;
				
				solids = this.solidEntitiesLive;
				solids.length = 0;
				
				softs = this.softEntitiesLive;
				softs.length = 0;

				groups = this.groupsLive;
				groups.length = 0;
				createdGroupList = true;

				length = this.allEntities.length;// console.log(length);
				for (i = 0; i < length; i++){
					entity = this.allEntities[i];
					if(entity.checkCollision || check(entity.getAABB(), aabbLogic)){
						all[all.length] = entity;

						types = entity.collisionTypes;
						if(entity !== this.owner){
							if(!entity.immobile){
								for (j = 0; j < types.length; j++) {
									if(entity.solidCollisions[types[j]].length){
										solids[solids.length] = entity;
										break;
									}
								}
							}
							
							if(entity.getCollisionGroup){
								if(entity.getCollisionGroup().length > 1){
									groups[groups.length] = entity;
								}
							}
						}
						for (j = 0; j < types.length; j++) {
							if(entity.softCollisions[types[j]].length){
								softs[softs.length] = entity;
								break;
							}
						}
					} 
				}
				
				// add buffer again to capture stationary entities along the border that may be collided against 
				aabbCollision.setAll(x, y, width + buffer, height + buffer);
				
				for (i in this.entitiesByType){
					entities = this.entitiesByType[i];
					list = this.entitiesByTypeLive[i];
					list.length = 0;
					length = entities.length;
					for (j = 0; j < length; j++){
						entity = entities[j];
						if(entity.alwaysOn || check(entity.getAABB(), aabbCollision)){
							list[list.length] = entity;
						}
					}
				}
			}
		}
		
		if(!createdGroupList){ //If the camera has not moved, the groupings still need to be checked and updated.
			groups = this.groupsLive;
			groups.length = 0;

			length = this.allEntitiesLive.length;// console.log(length);
			for (i = 0; i < length; i++){
				entity = this.allEntitiesLive[i];
				if(entity !== this.owner){
					if(entity.getCollisionGroup){
						if(entity.getCollisionGroup().length > 1){
							groups[groups.length] = entity;
						}
					}
				}
			}
		}
	};

	proto.checkGroupCollisions = function (resp){
		var groups = this.groupsLive;
		if(groups.length > 0){
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
	
			for (var x = 0; x < groups.length; x++){
				groups[x].trigger('check-collision-group', this.groupCollisionMessage);
				groups[x].collisionUnresolved = true;
			}

			this.resolveCollisionList(groups, true, false, resp);
		}
	};

	proto.prepareCollisions = function (resp) {
		var entity = null;
		for (var x = this.allEntitiesLive.length - 1; x > -1; x--) {
			entity = this.allEntitiesLive[x];
			entity.collisionUnresolved = true;
			if(entity !== this.owner){
				entity.triggerEvent('prepare-for-collision', resp);
			}
		}
	};

	proto.resolveNonCollisions = function (resp) {
		var entity = null,
		xy         = xyPair;

		xy.relative = false;
		xy.xMomentum = 0;
		xy.yMomentum = 0;
		
		for (var x = this.allEntitiesLive.length - 1; x > -1; x--) {
			entity = this.allEntitiesLive[x];
			if(entity.collisionUnresolved){
				xy.x = entity.x;
				xy.y = entity.y;
				entity.trigger('relocate-entity', xy);
			}
		}
	};
	
	proto.checkSolidCollisions = function (resp, finalMovement){
		this.resolveCollisionList(this.solidEntitiesLive, false, finalMovement);
	};
	
	proto.resolveCollisionList = function(entities, group, finalMovement, resp){
		for (var x = entities.length - 1; x > -1; x--){
//		for (var x = 0; x < entities.length; x++){
			if(entities[x].collisionUnresolved){
				this.checkSolidEntityCollision(entities[x], group, finalMovement, resp);
				entities[x].collisionUnresolved = false;
			}
		}
	};
	
	proto.checkSolidEntityCollision = function(ent, groupCheck, finalMovement, resp){
		var i     = 0,
		y         = 0,
		z         = 0,
		initialX  = 0,
		initialY  = 0,
		xy        = xyPair,
		sweepAABB = tempAABB,
		collisionType = null,
		collisionGroup = ((groupCheck && ent.getCollisionGroup)?ent.getCollisionGroup():null),
		checkAABBCollision = AABBCollision,
		currentAABB  = null,
		previousAABB = null,
		otherEntity  = null,
		include      = false,
		potentialTiles = tempArray1,
		potentialsEntities = tempArray2,
		thatTypes    = tempArray3,
		thisTypes    = tempArray4,
		thisTileTypes= tempArray5,
		aabbOffsetX  = 0,
		aabbOffsetY  = 0,
		finalX       = null,
		finalY       = null,
		finalQ       = null,
		otherAABB    = null;
		
		potentialTiles.length = 0;
		potentialsEntities.length = 0;
		thatTypes.length = 0;
		thisTypes.length = 0;
		thisTileTypes.length = 0;

		if(groupCheck){
			currentAABB  = ent.getCollisionGroupAABB();
			previousAABB = ent.getPreviousCollisionGroupAABB();
			
			sweepAABB.reset();
			sweepAABB.include(currentAABB);
			sweepAABB.include(previousAABB);

			if(!ent.jumpThrough || (currentAABB.y < previousAABB.y)){
				for(; i < ent.collisionTypes.length; i++){
					collisionType = ent.collisionTypes[i];
					
					for (y = 0; y < ent.solidCollisions[collisionType].length; y++) {
						if(this.entitiesByTypeLive[ent.solidCollisions[collisionType][y]]){
							for(z = 0; z < this.entitiesByTypeLive[ent.solidCollisions[collisionType][y]].length; z++){
								include = true;
								otherEntity = this.entitiesByTypeLive[ent.solidCollisions[collisionType][y]][z];
								otherAABB = otherEntity.collisionUnresolved?otherEntity.getPreviousAABB(ent.solidCollisions[collisionType][y]):otherEntity.getAABB(ent.solidCollisions[collisionType][y]);
								if(collisionGroup){
									for(var i in collisionGroup){
										if(otherEntity === collisionGroup[i]){
											include = false;
										}
									}
								} else if (otherEntity === ent){
									include = false;
								} else if (otherEntity.jumpThrough && (previousAABB.bottom > otherAABB.top)) {
									include = false;
								} else if (ent.jumpThrough && (otherAABB.bottom > previousAABB.top)) {
									include = false;
								}
								if(include && (checkAABBCollision(sweepAABB, otherAABB))) {
									potentialsEntities[potentialsEntities.length] = otherEntity;
									otherEntity.currentCollisionType = ent.solidCollisions[collisionType][y]; //used for messaging later on
								}
							}
						} else if (this.terrain && (ent.solidCollisions[collisionType][y] === 'tiles')){
							potentialTiles = this.terrain.getTiles(sweepAABB, previousAABB);
						}
					}
				}
			}

			initialX  = previousAABB.x;//ent.getPreviousX();
			initialY  = previousAABB.y;//ent.getPreviousY();
			
			finalX = this.linearMovement(ent, 'x', previousAABB, currentAABB, groupCheck, collisionGroup, potentialTiles, potentialsEntities, null, null, null, resp);
			previousAABB.moveX(finalX);
			finalY = this.linearMovement(ent, 'y', previousAABB, currentAABB, groupCheck, collisionGroup, potentialTiles, potentialsEntities, null, null, null, resp);

			xy.relative = false;
			xy.xMomentum = currentAABB.x - finalX;
			xy.yMomentum = currentAABB.y - finalY;
			xy.x = finalX - initialX;
			xy.y = finalY - initialY;
			ent.trigger('relocate-group', xy);
		} else {
			for(; i < ent.collisionTypes.length; i++){
				collisionType = ent.collisionTypes[i];

				currentAABB  = ent.getAABB(collisionType);
				previousAABB = ent.getPreviousAABB(collisionType);

				if(!ent.jumpThrough || (currentAABB.y < previousAABB.y)){ //TODO: shouldn't do this here. Need to extend jumpthrough to handle different directions and forward motion - DDD

					sweepAABB.reset();
					sweepAABB.include(currentAABB);
					sweepAABB.include(previousAABB);

					for (y = 0; y < ent.solidCollisions[collisionType].length; y++) {
						if(this.entitiesByTypeLive[ent.solidCollisions[collisionType][y]]){
							for(z = 0; z < this.entitiesByTypeLive[ent.solidCollisions[collisionType][y]].length; z++){
								include = true;
								otherEntity = this.entitiesByTypeLive[ent.solidCollisions[collisionType][y]][z];
								otherAABB = otherEntity.collisionUnresolved?otherEntity.getPreviousAABB(ent.solidCollisions[collisionType][y]):otherEntity.getAABB(ent.solidCollisions[collisionType][y]);
								if (otherEntity === ent){
									include = false;
								} else if (otherEntity.jumpThrough && (previousAABB.bottom > otherAABB.top)) {
									include = false;
								} else if (ent.jumpThrough && (otherAABB.bottom > previousAABB.top)) { // This will allow platforms to hit something solid sideways if it runs into them from the side even though originally they were above the top. - DDD
									include = false;
								}
								if(include && (checkAABBCollision(sweepAABB, otherAABB))) {
									potentialsEntities[potentialsEntities.length] = otherEntity;
									thisTypes[thisTypes.length] = collisionType;
									thatTypes[thatTypes.length] = ent.solidCollisions[collisionType][y];
									//otherEntity.currentCollisionType = ent.solidCollisions[collisionType][y]; //used for messaging later on
								}
							}
						} else if (this.terrain && (ent.solidCollisions[collisionType][y] === 'tiles')){
							potentialTiles = this.terrain.getTiles(sweepAABB, previousAABB);
							for(z = 0; z < potentialTiles.length; z++){
								thisTileTypes[thisTileTypes.length] = collisionType;
							}
						}
					}
				}
			}

			diff = null;
			for(i = 0; i < ent.collisionTypes.length; i++){
				collisionType = ent.collisionTypes[i];
				currentAABB  = ent.getAABB(collisionType); //<-- do this inside lienar movement
				previousAABB = ent.getPreviousAABB(collisionType); //ditto
				initialX  = previousAABB.x;//ent.getPreviousX();
				aabbOffsetX = initialX - ent.getPreviousX(collisionType);//previousAABB.x - initialX;
				finalQ = this.linearDifference(ent, 'x', previousAABB, currentAABB, initialX, potentialTiles, potentialsEntities, thisTypes, thatTypes, thisTileTypes);
				if(finalQ !== false){
					finalX = finalQ;
					xy.x = finalX - aabbOffsetX;
					if(finalMovement){
						xy.xMomentum = 0;
					} else {
						xy.xMomentum = currentAABB.x - finalX;
					}
				}
			}

			diff = null;
			for(i = 0; i < ent.collisionTypes.length; i++){
				collisionType = ent.collisionTypes[i];
				currentAABB  = ent.getAABB(collisionType);
				previousAABB = ent.getPreviousAABB(collisionType);
				previousAABB.moveX(finalX);
				initialY  = previousAABB.y;//ent.getPreviousY();
				aabbOffsetY = initialY - ent.getPreviousY(collisionType);//previousAABB.y - initialY;
				finalQ = this.linearDifference(ent, 'y', previousAABB, currentAABB, initialY, potentialTiles, potentialsEntities, thisTypes, thatTypes, thisTileTypes);
				if(finalQ !== false){
					finalY = finalQ;
					xy.y = finalY - aabbOffsetY;
					if(finalMovement){
						xy.yMomentum = 0;
					} else {
						xy.yMomentum = currentAABB.y - finalY;
					}
				}
			}

			xy.relative = false;
			ent.trigger('relocate-entity', xy);
		}
	};
	
	proto.linearDifference = function(ent, axis, previousAABB, currentAABB, initial, potentialTiles, potentialsEntities, thisTypes, thatTypes, thisTileTypes){
		var finalPoint      = this.linearMovement(ent, axis, previousAABB, currentAABB, false, false, potentialTiles, potentialsEntities, thisTypes, thatTypes, thisTileTypes);
		
		if((diff !== null) && (Math.abs(finalPoint - initial) > diff)){
			return false;
		} else {
			diff = Math.abs(finalPoint - initial);
			return finalPoint;
		}
	};
	
	proto.linearMovement = function (ent, axis, previousAABB, currentAABB, groupCheck, collisionGroup, tiles, entities, thisCollisionTypes, thatCollisionTypes, tileCollisionTypes)	{
		var xStep        = 0,
		yStep            = 0,
		initialPoint     = previousAABB[axis],
		goalPoint        = currentAABB[axis],
		step             = (initialPoint < goalPoint) ? 1 : -1,
		tileCollision    = tileCollisionMessage,
		entityCollision  = entityCollisionMessage;
		
		tileCollision.aABB = null;
		tileCollision.x    = null;
		tileCollision.y    = null;
		entityCollision.aABB = null;
		entityCollision.x  = null;
		entityCollision.y  = null;

		if(tiles.length || entities.length) {
			if(collisionGroup){
				for(var i in collisionGroup){
					collisionGroup[i][axis] += goalPoint - initialPoint;
					collisionGroup[i].triggerEvent('prepare-for-collision');
				}
			}
			
			if(axis === 'x'){
				previousAABB.moveX(goalPoint);
				xStep = step;
			} else if(axis === 'y'){
				previousAABB.moveY(goalPoint);
				yStep = step;
			}
			
			//CHECK AGAINST TILES
			for (var t = 0; t < tiles.length; t++) {
				checkAgainst(ent, previousAABB, tiles[t], tiles[t].shapes[0].getAABB(), xStep, yStep, tileCollision, collisionGroup, (tileCollisionTypes || emptyArray)[t]);
			}
			
			//CHECK AGAINST SOLID ENTITIES
			for (var u = 0; u < entities.length; u++) {
				checkAgainst(ent, previousAABB, entities[u], entities[u].collisionUnresolved?entities[u].getPreviousAABB(entities[u].currentCollisionType):entities[u].getAABB(entities[u].currentCollisionType), xStep, yStep, entityCollision, collisionGroup, (thisCollisionTypes || emptyArray)[u], (thatCollisionTypes || emptyArray)[u]);
			}
			
			if((entityCollision[axis] !== null) && (((step > 0) && (!tileCollision.aABB || (entityCollision[axis] < tileCollision[axis]))) || ((step < 0) && (!tileCollision.aABB || (entityCollision[axis] > tileCollision[axis]))))){
				if(!groupCheck){
					triggerCollisionMessages(ent, entityCollision, xStep, yStep, 'solid');
				}
					
				if(((entityCollision[axis] > initialPoint) && (step > 0)) || ((entityCollision[axis] < initialPoint) && (step < 0))){
					return entityCollision[axis];
				} else {
					return initialPoint;
				}
			} else if(tileCollision.aABB){
				if(!groupCheck){
					triggerTileCollisionMessage(ent, tileCollision.shape, xStep, yStep, tileCollision.thisType);
				}

				if(((tileCollision[axis] > initialPoint) && (step > 0)) || ((tileCollision[axis] < initialPoint) && (step < 0))){
					return tileCollision[axis];
				} else {
					return initialPoint;
				}
			}
		}
		
		return goalPoint;
	};
	
	proto.checkSoftCollisions = function (resp)	{
		var otherEntity = undefined,
		ent = undefined,
		message = triggerMessage,
		i   = 0,
		x   = 0,
		y   = 0,
		z   = 0,
		checkAABBCollision = AABBCollision,
		softCollisions = null,
		otherEntities  = null,
		otherCollisionType = null;

		message.x = 0;
		message.y = 0;
		
		for(x = 0; x < this.softEntitiesLive.length; x++){
			ent = this.softEntitiesLive[x];
			for (i = 0; i < ent.collisionTypes.length; i++){
				softCollisions = ent.softCollisions[ent.collisionTypes[i]];
				for (y = 0; y < softCollisions.length; y++){
					otherCollisionType = softCollisions[y];
					otherEntities = this.entitiesByTypeLive[otherCollisionType]; 
					if(otherEntities){
						for(z = 0; z < otherEntities.length; z++){
							otherEntity = otherEntities[z];
							if((otherEntity !== ent) && (checkAABBCollision(ent.getAABB(ent.collisionTypes[i]), otherEntity.getAABB(otherCollisionType)))) {
								if (preciseCollision(ent, otherEntity)){
									message.entity = otherEntity;
									message.type   = otherCollisionType;
									message.myType = ent.collisionTypes[i];
									message.shape  = otherEntity.shape;
									message.hitType= 'soft';
									ent.trigger('hit-by-' + otherCollisionType, message);
									message.debug = false;
								}
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
//		if(test) console.log('rlc: ' + this.aabb.y);
		this.resolveMomentum();
	};
	
//	var test = false;
	
	proto['relocate-entity'] = function(resp){
		this.lastX = this.owner.x;
		this.lastY = this.owner.y;
		
/*		if(test || (this.allEntitiesLive.length > 1)){
			test = true;
			console.log('r0' + this.tester + ': ' + this.lastY + ': ' + this.allEntitiesLive.length);
			this.tester += 1;
		}*/
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











