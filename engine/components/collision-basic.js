/**
# COMPONENT **collision-basic**
This component causes this entity to collide with other entities. It must be part of a collision group and will receive messages when colliding with other entities in the collision group.

Multiple collision components may be added to a single entity if distinct messages should be triggered for certain collision areas on the entity or if the soft collision area is a different shape from the solid collision area. Be aware that too many additional collision areas may adversely affect performance. 

## Dependencies:
- [[Collision-Group]] (on entity's parent) - This component listens for 'prepare-for-collision', 'relocate-entity', and 'hit-by' messages, commonly triggered by [[Collision-Group]] on the parent entity.

## Messages

### Listens for:
- **collide-on** - On receiving this message, the component triggers `add-collision-entity` on the parent.
- **collide-off** - On receiving this message, the component triggers `remove-collision-entity` on the parent.
- **prepare-for-collision** - Updates the axis-aligned bounding box for this entity in preparation for collision checks.
- **relocate-entity** - This message causes the entity's x,y coordinates to update.
  > @param message.x (number) - Required. The new x coordinate.
  > @param message.y (number) - Required. The new y coordinate.
  > @param message.relative (boolean) - Optional. Determines whether the provided x,y coordinates are relative to the entity's current position. Defaults to `false`.
- **resolve-momentum** - On receiving this message, this component adds the currently stored momentum in x and y to its coordinates. 
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
      
        "type": "rectangle",
        // Optional. Defaults to "rectangle". Rectangles are currently the only supported shape.
        
        "offsetX": 0,
        "offsetY": -120,
        // Optional. Specifies the collision shape's position relative to the entity's x,y coordinates. Defaults to 0. Alternatively, can specify regX and regY values.
        
        "points": [[-80,-120],[80, 120]]
        // Required. Specifies the top-left and bottom-right corners of the rectangle, with the center at [0,0].
      }],
      
      //The following four properties are optional and can be specified instead of the more specific `shape` above. 
      "width": 160,
      // Optional. Sets the width of the collision area in world coordinates.
      
      "height": 240,
      // Optional. Sets the height of the collision area in world coordinates.
      
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
*/
(function(){
	var twinBroadcast = function(component, funcA, funcB){
		return function (value) {
			funcA.call(component, value);
			funcB.call(component, value);
		  };
	},
	entityBroadcast = function(event, solidOrSoft, collisionType){
		if(typeof event === 'string'){
			return function(value){
				if(value.myType === collisionType){
					if(value.hitType === solidOrSoft){
						this.owner.triggerEvent(event, value);
					}
				}
			};
		} else if(event.length){
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
	reassignFunction = function(oldFunction, newFunction, collisionType){
		if(oldFunction){
			return function(collision){
				if(collision === collisionType){
					return newFunction(collision);
				} else {
					return oldFunction(collision);
				}
			};
		} else {
			return newFunction;
		}
	},
	setupCollisionFunctions = function(self, entity){
		// This allows the same component type to be added multiple times.
		if(!entity.collisionFunctions){
			entity.collisionFunctions = {};
			entity.getAABB = function(collisionType){
				if(!collisionType){
					var aabb = entity.aabb = entity.aabb || new platformer.classes.aABB();
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
			}
		};
		
	};

	return platformer.createComponentClass({
		
		id: 'collision-basic',
		
		constructor: function(definition){
			var x  = 0; 
			var self   = this;
			
			this.immobile  = this.owner.immobile = this.owner.immobile || definition.immobile || false;
			this.owner.previousX = this.owner.previousX || this.owner.x;
			this.owner.previousY = this.owner.previousY || this.owner.y;
			this.xMomentum = 0;
			this.yMomentum = 0;
			this.aabb      = new platformer.classes.aABB();
			this.prevAABB  = new platformer.classes.aABB();
			this.owner.bullet = this.owner.bullet || definition.bullet;
			this.relocateObj = {
									x: 0,
									y: 0,
									relative: false,
									xMomentum: 0,
									yMomentum: 0
								};
	
			var shapes = [];
			if(definition.shapes){
				shapes = definition.shapes;
			} else if (definition.shape) {
				shapes = [definition.shape];
			} else {
				var halfWidth  = (definition.width  || this.owner.width  || 0) / 2;
				var halfHeight = (definition.height || this.owner.height || 0) / 2;
				var margin = definition.margin || 0;
				var marginLeft   = definition.marginLeft   || margin;
				var marginRight  = definition.marginRight  || margin;
				var marginTop    = definition.marginTop    || margin;
				var marginBottom = definition.marginBottom || margin;
				if(definition.shapeType === 'circle'){
					var radius = definition.radius || this.owner.radius || ((halfWidth + halfHeight) / 2);
					shapes = [{
						offsetX: (definition.regX?halfWidth-definition.regX:(this.owner.regX?halfWidth-this.owner.regX:0)) + (marginRight - marginLeft)/2,
						offsetY: (definition.regY?halfHeight-definition.regY:(this.owner.regY?halfHeight-this.owner.regY:0)) + (marginBottom - marginTop)/2,
						radius: radius,
						width:  radius * 2,
						height: radius * 2,
						type: definition.shapeType
					}];
				} else {
					shapes = [{
						offsetX: (definition.regX?halfWidth-definition.regX:(this.owner.regX?halfWidth-this.owner.regX:0)) + (marginRight - marginLeft)/2,
						offsetY: (definition.regY?halfHeight-definition.regY:(this.owner.regY?halfHeight-this.owner.regY:0)) + (marginBottom - marginTop)/2,
						points: definition.points,
						width:  halfWidth  * 2 + marginLeft + marginRight,
						height: halfHeight * 2 + marginTop  + marginBottom,
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
				this.shapes.push(new platformer.classes.collisionShape(this.owner, shapes[x], this.collisionType));
				this.prevShapes.push(new platformer.classes.collisionShape(this.owner, shapes[x], this.collisionType));
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
					if(definition.solidCollisions[i]){
						this.addListener('hit-by-' + i);
						this['hit-by-' + i] = entityBroadcast(definition.solidCollisions[i], 'solid', this.collisionType);
					}
				}
			}
	
			this.owner.softCollisions = this.owner.softCollisions || {};
			this.owner.softCollisions[this.collisionType] = [];
			if(definition.softCollisions){
				for(var i in definition.softCollisions){
					this.owner.softCollisions[this.collisionType].push(i);
					if(definition.softCollisions[i]){
						if(this['hit-by-' + i]) {
							//this['hit-by-' + i + '-solid'] = this['hit-by-' + i];
							//this['hit-by-' + i + '-soft'] = entityBroadcast(definition.softCollisions[i], 'soft');
							this['hit-by-' + i] = twinBroadcast(this, this['hit-by-' + i], entityBroadcast(definition.softCollisions[i], 'soft', this.collisionType));
						} else {
							this.addListener('hit-by-' + i);
							this['hit-by-' + i] = entityBroadcast(definition.softCollisions[i], 'soft', this.collisionType);
						}
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
				if(this.owner.accelerationAbsorbed){
					this.owner.accelerationAbsorbed = false;
				}
			},
			
			"prepare-for-collision": function(resp){
				var x = this.owner.x,
				y     = this.owner.y;
				
				// absorb velocities from the last logic tick
				if(!this.owner.accelerationAbsorbed && resp){
					this.owner.accelerationAbsorbed = true;
					if(this.owner.dx){
						x += this.owner.dx * (resp.deltaT || 0);
					}
					if(this.owner.dy){
						y += this.owner.dy * (resp.deltaT || 0);
					}
				}
				
//				this.prepareCollision(x, y);
				this.owner.x = x;
				this.owner.y = y;
			},
			
			"relocate-entity": function(resp){
				if(resp.relative){
					this.owner.x = this.owner.previousX + resp.x;
					this.owner.y = this.owner.previousY + resp.y;
				} else {
					this.owner.x = resp.x;
					this.owner.y = resp.y;
				}

				this.aabb.reset();
				for (var x in this.shapes){
					this.shapes[x].update(this.owner.x, this.owner.y);
					this.aabb.include(this.shapes[x].getAABB());
				}

				this.owner.previousX = this.owner.x;
				this.owner.previousY = this.owner.y;
				
				this.xMomentum = resp.xMomentum || 0;
				this.yMomentum = resp.yMomentum || 0;
			},
			
			"resolve-momentum": function(){
				this.owner.x += this.xMomentum;
				this.owner.y += this.yMomentum;
				this.xMomentum = 0;
				this.yMomentum = 0;
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
			}
		}
	});
})();
	
