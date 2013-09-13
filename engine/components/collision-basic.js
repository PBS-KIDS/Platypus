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
platformer.components['collision-basic'] = (function(){
	var twinBroadcast = function(component, funcA, funcB){
		return function (value) {
			funcA.call(component, value);
			funcB.call(component, value);
		  };
	};
	
	var entityBroadcast = function(event, solidOrSoft, collisionType){
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
	component = function(owner, definition){
		this.type  = 'collision-basic';
		var x  = 0; 
		var self   = this;
		
		this.owner    = owner;
		this.immobile = this.owner.immobile = this.owner.immobile || definition.immobile || false;
		this.lastX    = this.owner.x;
		this.lastY    = this.owner.y;
		this.xMomentum= 0;
		this.yMomentum= 0;
		this.aabb     = new platformer.classes.aABB();
		this.prevAABB = new platformer.classes.aABB();
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
			shapes = [{
				offsetX: (definition.regX?halfWidth-definition.regX:(this.owner.regX?halfWidth-this.owner.regX:0)) + (marginRight - marginLeft)/2,
				offsetY: (definition.regY?halfHeight-definition.regY:(this.owner.regY?halfHeight-this.owner.regY:0)) + (marginBottom - marginTop)/2,
				points: definition.points,
				width:  halfWidth  * 2 + marginLeft + marginRight,
				height: halfHeight * 2 + marginTop  + marginBottom,
				radius: definition.radius || this.owner.radius || ((halfWidth + halfHeight) / 2),
				type: definition.shapeType || 'rectangle'
			}];
		}
		
		this.collisionType = definition.collisionType || 'none';
		
		this.owner.collisionTypes = this.owner.collisionTypes || [];
		this.owner.collisionTypes.push(this.collisionType);
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['collide-on',
		                   'collide-off',
		                   'prepare-for-collision', 'handle-logic', 
		                   'relocate-entity',
		                   'resolve-momentum']);
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
		
		

		this.owner.getAABB = reassignFunction(this.owner.getAABB, function(collisionType){
			return self.getAABB();
		}, this.collisionType);

		this.owner.getPreviousAABB = reassignFunction(this.owner.getPreviousAABB, function(collisionType){
			return self.getPreviousAABB();
		}, this.collisionType);

		this.owner.getShapes = reassignFunction(this.owner.getShapes, function(collisionType){
			return self.getShapes();
		}, this.collisionType);
		
		this.owner.getPrevShapes = reassignFunction(this.owner.getPrevShapes, function(collisionType){
			return self.getPrevShapes();
		}, this.collisionType);
			
		this.owner.getPreviousX = reassignFunction(this.owner.getPreviousX, function(collisionType){
			return self.lastX;
		}, this.collisionType);

		this.owner.getPreviousY = reassignFunction(this.owner.getPreviousY, function(collisionType){
			return self.lastY;
		}, this.collisionType);
		
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
	};
	var proto = component.prototype;
	
	proto['collide-on'] = function(){
		this.owner.parent.trigger('add-collision-entity', this.owner);
	};
	
	proto['collide-off'] = function(){
		this.owner.parent.trigger('remove-collision-entity', this.owner);
	};
	
	proto['handle-logic'] = function(){
		if(this.accelerationAbsorbed){
			this.accelerationAbsorbed = false;
		}
	};

	proto['prepare-for-collision'] = function(resp){
		var tempShapes = this.prevShapes;
		this.prevShapes = this.shapes;
		this.shapes = tempShapes;
		
		this.prevAABB.set(this.aabb);
		this.aabb.reset();
		
		
		// absorb velocities from the last logic tick
		if(!this.accelerationAbsorbed && resp){
			this.accelerationAbsorbed = true;
			if(this.owner.dx){
				this.owner.x += this.owner.dx * (resp.deltaT || 0);
			}
			if(this.owner.dy){
				this.owner.y += this.owner.dy * (resp.deltaT || 0);
			}
		}
		
		// update shapes
		for (var x = 0; x < this.shapes.length; x++){
			this.shapes[x].update(this.owner.x, this.owner.y);
			this.aabb.include(this.shapes[x].getAABB());
		}
	};
	
	proto['relocate-entity'] = function(resp){
		if(resp.relative){
			this.owner.x = this.lastX + resp.x;
			this.owner.y = this.lastY + resp.y;
		} else {
			this.owner.x = resp.x;
			this.owner.y = resp.y;
		}

		this.aabb.reset();
		for (var x in this.shapes){
			this.shapes[x].update(this.owner.x, this.owner.y);
			this.aabb.include(this.shapes[x].getAABB());
		}

		this.lastX = this.owner.x;
		this.lastY = this.owner.y;
		
		this.xMomentum = resp.xMomentum || 0;
		this.yMomentum = resp.yMomentum || 0;
	};
	
	proto['resolve-momentum'] = function(){
		this.owner.x += this.xMomentum;
		this.owner.y += this.yMomentum;
		this.xMomentum = 0;
		this.yMomentum = 0;
	};
	
	proto.getAABB = function(){
		return this.aabb;
	};
	
	proto.getPreviousAABB = function(){
		return this.prevAABB;
	};
	
	proto.getShapes = function(){
		return this.shapes;
	};
	
	proto.getPrevShapes = function(){
		return this.prevShapes;
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
