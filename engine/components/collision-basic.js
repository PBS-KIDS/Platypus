/**
# COMPONENT **collision-basic**
This component causes this entity to collide with other entities. It must be part of a collision group and will receive messages when colliding with other entities in the collision group.

Multiple collision components may be added to a single entity if distinct messages should be triggered for certain collision areas on the entity or if the soft collision area is a different shape from the solid collision area. Be aware that too many additional collision areas may adversely affect performance. 

## Dependencies:
- [[handler-collision]] (on entity's parent) - This component listens for 'prepare-for-collision', 'relocate-entity', and 'hit-by' messages, commonly triggered by [[handler-collision]] on the parent entity.

## Messages

### Listens for:
- **collide-on** - On receiving this message, the component triggers `add-collision-entity` on the parent.
- **collide-off** - On receiving this message, the component triggers `remove-collision-entity` on the parent.
- **prepare-for-collision** - Updates the axis-aligned bounding box for this entity in preparation for collision checks.
- **relocate-entity** - This message causes the entity's x,y coordinates to update.
  - @param message.x (number) - Required. The new x coordinate.
  - @param message.y (number) - Required. The new y coordinate.
  - @param message.relative (boolean) - Optional. Determines whether the provided x,y coordinates are relative to the entity's current position. Defaults to `false`.
- **hit-by-[collision-types specified in definition]** - When the entity collides with a listed collision-type, this message is received and re-triggered as a new message according to the component definition.

### Local Broadcasts
- **[Message specified in definition]** - On receiving a 'hit-by' message, custom messages are triggered on the entity corresponding with the component definition.

### Parent Broadcasts
- **add-collision-entity** - On receiving 'collide-on', this message is triggered on the parent.
- **remove-collision-entity** - On receiving 'collide-off', this message is triggered on the parent.

## JSON Definition:
    {
      "type": "collision-basic",
      
      "collisionType": "boulder",
      // Optional. Defines how this entity should be recognized by other colliding entities. Defaults to `none`.
      
      "immobile": true,
      // Optional. Defaults to `false`, but should be set to true if entity doesn't move for better optimization.
      
      "shapes": [{
      //Optional. Defines one or more shapes to create the collision area. Defaults to a single shape with the width, height, regX, and regY properties of the entity if not specified.
      
        "type": "circle",
        // Optional. Defaults to "rectangle".
        
        "offsetX": 0,
        "offsetY": -120,
        // Optional. Specifies the collision shape's position relative to the entity's x,y coordinates. Defaults to 0. Alternatively, can specify regX and regY values, which are determined from the top-right of the collision object.
      }],
      
      //The following five properties are optional and can be specified instead of the more specific `shape` above. 
      "width": 160,
      // Optional. Sets the width of the collision area in world coordinates.
      
      "height": 240,
      // Optional. Sets the height of the collision area in world coordinates.
      
      "radius": 60,
      // Optional. Sets the radius of a circle collision area in world coordinates.
      
      "regX": 80,
      // Optional. Determines the x-axis center of the collision shape.

      "regY": 120,
      // Optional. Determines the y-axis center of the collision shape.
      
      "solidCollisions":{
      // Optional. Determines which collision types this entity should consider solid, meaning this entity should not pass through them.

        "boulder": "",
        // This specifies that this entity should not pass through other "boulder" collision-type entities.
        
        "diamond": "crack-up",
        // This specifies that this entity should not pass through "diamond" collision-type entities, but if it touches one, it triggers a "crack-up" message on the entity.

        "marble": ["flip", "dance", "crawl"]
        // This specifies that this entity should not pass through "marble" collision-type entities, but if it touches one, it triggers all three specified messages on the entity.
      },
      
      "softCollisions":{
      // Optional. Determines which collision types this entity should consider soft, meaning this entity may pass through them, but triggers collision messages on doing so.

        "water": "soaked",
        // This triggers a "soaked" message on the entity when it passes over a "water" collision-type entity.

        "lava": ["burn", "ouch"]
        // This triggers both messages on the entity when it passes over a "lava" collision-type entity.
      }
    }
    
Requires: ["../collision-shape.js", "../aabb.js"]
*/
(function(){
	var entityBroadcast = function(event, solidOrSoft, collisionType){
		if(typeof event === 'string'){
			return function(value){
				if(value.myType === collisionType){
					if(value.hitType === solidOrSoft){
						this.owner.triggerEvent(event, value);
					}
				}
			};
		} else if(Array.isArray(event)){
			return function(value){
				if(value.myType === collisionType){
					if(value.hitType === solidOrSoft){
						for (var e in event){
							this.owner.triggerEvent(event[e], value);
						}
					}
				}
			};
		} else {
			return function(collisionInfo){
				var dx = collisionInfo.x,
				dy     = collisionInfo.y;
				
				if(collisionInfo.entity && !(dx || dy)){
					dx = collisionInfo.entity.x - this.owner.x;
					dy = collisionInfo.entity.y - this.owner.y;
				}
				
				if(collisionInfo.myType === collisionType){
					if(collisionInfo.hitType === solidOrSoft){
						if((dy > 0) && event['bottom']){
							this.owner.trigger(event['bottom'], collisionInfo);
						}
						if((dy < 0) && event['top']){
							this.owner.trigger(event['top'], collisionInfo);
						}
						if((dx > 0) && event['right']){
							this.owner.trigger(event['right'], collisionInfo);
						}
						if((dx < 0) && event['left']){
							this.owner.trigger(event['left'], collisionInfo);
						}
						if(event['all']){
							this.owner.trigger(event['all'], collisionInfo);
						}
					}
				}
			};
		}
	},
	setupCollisionFunctions = function(self, entity){
		// This allows the same component type to be added multiple times.
		if(!entity.collisionFunctions){
			entity.collisionFunctions = {};
			entity.getAABB = function(collisionType){
				if(!collisionType){
					var aabb = entity.aabb = entity.aabb || new platformer.AABB();
					aabb.reset();
					for(var i in entity.collisionFunctions){
						aabb.include(entity.collisionFunctions[i].getAABB());
					}
					return aabb;
				} else if(entity.collisionFunctions[collisionType]){
					return entity.collisionFunctions[collisionType].getAABB();
				} else {
					return null;
				}
			};

			entity.getPreviousAABB = function(collisionType){
				if(entity.collisionFunctions[collisionType]){
					return entity.collisionFunctions[collisionType].getPreviousAABB();
				} else {
					return null;
				}
			};

			entity.getShapes = function(collisionType){
				if(entity.collisionFunctions[collisionType]){
					return entity.collisionFunctions[collisionType].getShapes();
				} else {
					return null;
				}
			};
			
			entity.getPrevShapes = function(collisionType){
				if(entity.collisionFunctions[collisionType]){
					return entity.collisionFunctions[collisionType].getPrevShapes();
				} else {
					return null;
				}
			};
			
			entity.prepareCollision = function(x, y){
				for(var i in entity.collisionFunctions){
					entity.collisionFunctions[i].prepareCollision(x, y);
				}
			};
			
			entity.relocateEntity = function(vector){
				entity.triggerEvent('relocate-entity', {position: vector});
			};
			
			entity.movePreviousX = function(x){
				for(var i in entity.collisionFunctions){
					entity.collisionFunctions[i].movePreviousX(x);
				}
			};
			
			entity.getCollisionTypes = function(){
				return entity.collisionTypes;
			};

			entity.getSolidCollisions = function(){
				return entity.solidCollisions;
			};
		}

		entity.collisionFunctions[self.collisionType] = {
			getAABB: function(){
				return self.getAABB();
			},

			getPreviousAABB: function(){
				return self.getPreviousAABB();
			},

			getShapes: function(){
				return self.getShapes();
			},
			
			getPrevShapes: function(){
				return self.getPrevShapes();
			},
			
			prepareCollision: function(x, y){
				self.prepareCollision(x, y);
			},
			
			movePreviousX: function(x){
				self.movePreviousX(x);
			}
		};
		
	};

	return platformer.createComponentClass({
		
		id: 'collision-basic',
		
		constructor: function(definition){
			var x        = 0,
			shapes       = null,
			regX         = definition.regX,
			regY         = definition.regY,
			width        = definition.width,
			height       = definition.height,
			radius       = definition.radius,
			margin       = definition.margin || 0,
			marginLeft   = definition.marginLeft   || margin,
			marginRight  = definition.marginRight  || margin,
			marginTop    = definition.marginTop    || margin,
			marginBottom = definition.marginBottom || margin;
			
			if(isNaN(width)){
				width = this.owner.width;
				if(isNaN(regX)){
					regX = this.owner.regX;
				}
			}
			if(isNaN(height)){
				height = this.owner.height;
				if(isNaN(regY)){
					regY = this.owner.regY;
				}
			}
			if(isNaN(radius)){
				radius = this.owner.radius;
				if(isNaN(regX)){
					regX = this.owner.regX;
				}
				if(isNaN(regY)){
					regY = this.owner.regY;
				}
			}

			this.immobile  = this.owner.immobile = this.owner.immobile || definition.immobile || false;

			platformer.Vector.assign(this.owner, 'position', 'x', 'y', 'z');
			platformer.Vector.assign(this.owner, 'previousPosition', 'previousX', 'previousY', 'previousZ');
			this.owner.previousX = this.owner.previousX || this.owner.x;
			this.owner.previousY = this.owner.previousY || this.owner.y;
			
			this.aabb     = new platformer.AABB();
			this.prevAABB = new platformer.AABB();
			
			this.owner.bullet = this.owner.bullet || definition.bullet;

			if(definition.shapes){
				shapes = definition.shapes;
			} else if (definition.shape) {
				shapes = [definition.shape];
			} else {
				if(definition.shapeType === 'circle'){
					radius = radius || (((width || 0) + (height || 0)) / 4);
					shapes = [{
						regX: (isNaN(regX)?radius:regX) - (marginRight - marginLeft) / 2,
						regY: (isNaN(regY)?radius:regY) - (marginBottom - marginTop) / 2,
						radius: radius,
						width:  radius * 2,
						height: radius * 2,
						type: definition.shapeType
					}];
				} else {
					shapes = [{
						regX: (isNaN(regX)?(width  || 0) / 2:regX) - (marginRight  - marginLeft)/2,
						regY: (isNaN(regY)?(height || 0) / 2:regY) - (marginBottom - marginTop )/2,
						points: definition.points,
						width:  (width  || 0) + marginLeft + marginRight,
						height: (height || 0) + marginTop  + marginBottom,
						type: definition.shapeType
					}];
				}
			}
			
			this.collisionType = definition.collisionType || 'none';
			
			this.owner.collisionTypes = this.owner.collisionTypes || [];
			this.owner.collisionTypes.push(this.collisionType);
			
			this.shapes = [];
			this.prevShapes = [];
			this.entities = undefined;
			for (x in shapes){
				this.shapes.push(new platformer.CollisionShape(this.owner, shapes[x], this.collisionType));
				this.prevShapes.push(new platformer.CollisionShape(this.owner, shapes[x], this.collisionType));
				this.prevAABB.include(this.prevShapes[x].getAABB());
				this.aabb.include(this.shapes[x].getAABB());
			}
			
			
			
			if(definition.jumpThrough){
				this.owner.jumpThrough = true;
			}
			
			setupCollisionFunctions(this, this.owner);
			
			this.owner.solidCollisions = this.owner.solidCollisions || {};
			this.owner.solidCollisions[this.collisionType] = [];
			if(definition.solidCollisions){
				for(var i in definition.solidCollisions){
					this.owner.solidCollisions[this.collisionType].push(i);
					this.owner.collides = true; //informs handler-collision that this entity should be processed in the list of solid colliders.
					if(definition.solidCollisions[i]){
						this.addEventListener('hit-by-' + i, entityBroadcast(definition.solidCollisions[i], 'solid', this.collisionType));
					}
				}
			}
	
			this.owner.softCollisions = this.owner.softCollisions || {};
			this.owner.softCollisions[this.collisionType] = [];
			if(definition.softCollisions){
				for(var i in definition.softCollisions){
					this.owner.softCollisions[this.collisionType].push(i);
					if(definition.softCollisions[i]){
						this.addEventListener('hit-by-' + i, entityBroadcast(definition.softCollisions[i], 'soft', this.collisionType));
					}
				}
			}
		},
		
		events:{
			"collide-on": function(){
				this.owner.parent.trigger('add-collision-entity', this.owner);
			},
			
			"collide-off": function(){
				this.owner.parent.trigger('remove-collision-entity', this.owner);
			},
			
			"handle-logic": function(){
				if(this.owner.movementAbsorbed){
					this.owner.movementAbsorbed = false;
				}
			},
			
			"prepare-for-collision": function(resp){
				var x = this.owner.x,
				y     = this.owner.y;
				
				// absorb velocities from the last logic tick
				if(!this.owner.movementAbsorbed && resp){
					this.owner.movementAbsorbed = true;
					if(this.owner.dx){
						x += this.owner.dx * (resp.delta || 0);
					}
					if(this.owner.dy){
						y += this.owner.dy * (resp.delta || 0);
					}
				}
				
//				this.prepareCollision(x, y);
				this.owner.x = x;
				this.owner.y = y;
			},
			
			"relocate-entity": function(resp){
				if(resp.relative){
					this.owner.position.set(this.owner.previousPosition).add(resp.position);
				} else {
					this.owner.position.set(resp.position);
				}

				this.aabb.reset();
				for (var x in this.shapes){
					this.shapes[x].update(this.owner.x, this.owner.y);
					this.aabb.include(this.shapes[x].getAABB());
				}

				this.owner.previousPosition.set(this.owner.position);
			}
		},
		
		methods: {
			getAABB: function(){
				return this.aabb;
			},
			
			getPreviousAABB: function(){
				return this.prevAABB;
			},
			
			getShapes: function(){
				return this.shapes;
			},
			
			getPrevShapes: function(){
				return this.prevShapes;
			},
			
			prepareCollision: function(x, y){
				var tempShapes = this.prevShapes;
				
				this.owner.x = x;
				this.owner.y = y;
				
				this.prevShapes = this.shapes;
				this.shapes = tempShapes;
				
				this.prevAABB.set(this.aabb);
				this.aabb.reset();
				
				// update shapes
				for (var x = 0; x < this.shapes.length; x++){
					this.shapes[x].update(this.owner.x, this.owner.y);
					this.aabb.include(this.shapes[x].getAABB());
				}
			},
			
			movePreviousX: function(x){
				this.prevAABB.moveX(x);
				for(var k = 0; k < this.prevShapes.length; k++) {
					this.prevShapes[k].setXWithEntityX(x);
				}
			},
			
			destroy: function(){
				this.owner.parent.trigger('remove-collision-entity', this.owner);

				this.owner.collides = false;

				delete this.aabb;
				delete this.prevAABB;
				
				for(var i = 0; i < this.owner.collisionTypes.length; i++){
					if(this.owner.collisionTypes[i] === this.collisionType){
						this.owner.collisionTypes.splice(i,1);
						break;
					}
				}
				if(this.owner.solidCollisions[this.collisionType]){
					this.owner.solidCollisions[this.collisionType].length = 0;
					delete this.owner.solidCollisions[this.collisionType];
				}
				for(var i in this.owner.solidCollisions){
					this.owner.collides = true;
				}
				if(this.owner.softCollisions[this.collisionType]){
					this.owner.softCollisions[this.collisionType].length = 0;
					delete this.owner.softCollisions[this.collisionType];
				}
				delete this.owner.collisionFunctions[this.collisionType];
				
				this.shapes.length = 0;
				this.prevShapes.length = 0;
				delete this.entities;

				if(this.owner.collisionTypes.length){
					this.owner.parent.trigger('add-collision-entity', this.owner);
				}
			}
		}
	});
})();
	
