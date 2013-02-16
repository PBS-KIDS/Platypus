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
      
      "shape": {
      //Optional. Defines the shape of the collision area. Defaults to the width, height, regX, and regY properties of the entity.
      
        "type": "rectangle",
        // Optional. Defaults to "rectangle". Rectangles are currently the only supported shape.
        
        "offset": [0,-120]
        // Optional. Specifies the collision shape's position relative to the entity's x,y coordinates. Defaults to [0, 0].
        
        "points": [[-80,-120],[80, 120]]
        // Required. Specifies the top-left and bottom-right corners of the rectangle, with the center at [0,0].
      },
      
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
	var entityBroadcast = function(event){
		if(typeof event === 'string'){
			return function(value){
				this.owner.trigger(event, value);
			};
		} else {
			return function(value){
				for (var e in event){
					this.owner.trigger(event[e], value);
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
		if(definition.shapes)
		{
			shapes = definition.shapes;
		} else if (definition.shape) {
			shapes = [definition.shape];
		} else {
			var halfWidth  = (definition.width  || this.owner.width)  / 2;
			var halfHeight = (definition.height || this.owner.height) / 2;
			var points = [[-halfWidth, -halfHeight], [halfWidth, halfHeight]];
			var offset = [(definition.regX?halfWidth-definition.regX:(this.owner.regX?halfWidth-this.owner.regX:0)), (definition.regY?halfHeight-definition.regY:(this.owner.regY?halfHeight-this.owner.regY:0))];
			shapes = [{offset: offset, points: points, shape: 'rectangle'}];
		}
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['collide-on',
		                   'collide-off',
		                   'prepare-for-collision', 
		                   'relocate-entity',
		                   'resolve-momentum']);
		this.shapes = [];
		this.entities = undefined;
		for (x in shapes){
			this.shapes.push(new platformer.classes.collisionShape([this.owner.x, this.owner.y], shapes[x].type, shapes[x].points, shapes[x].offset, shapes[x].radius));
			this.prevAABB.include(this.shapes[x].getAABB());
			this.aabb.include(this.shapes[x].getAABB());
		}

		this.collisionType = definition.collisionType || 'none';
		
		this.owner.collisionTypes = this.owner.collisionTypes || [];
		this.owner.collisionTypes[this.owner.collisionTypes.length] = this.collisionType;

		this.owner.getAABB = reassignFunction(this.owner.getAABB, function(collisionType){
			return self.getAABB();
		}, this.collisionType);

		this.owner.getPreviousAABB = reassignFunction(this.owner.getPreviousAABB, function(collisionType){
			return self.getPreviousAABB();
		}, this.collisionType);

		this.owner.getShapes = reassignFunction(this.owner.getShapes, function(collisionType){
			return self.getShapes();
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
					this['hit-by-' + i] = entityBroadcast(definition.solidCollisions[i]);
				}
			}
		}

		this.owner.softCollisions = this.owner.softCollisions || {};
		this.owner.softCollisions[this.collisionType] = [];
		if(definition.softCollisions){
			for(var i in definition.softCollisions){
				this.owner.softCollisions[this.collisionType].push(i);
				if(definition.softCollisions[i]){
					this.addListener('hit-by-' + i);
					this['hit-by-' + i] = entityBroadcast(definition.softCollisions[i]);
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
	
	proto['prepare-for-collision'] = function(collisionType){
//		if(collisionType === this.collisionType){
			this.prevAABB.setAll(this.aabb.x, this.aabb.y, this.aabb.width, this.aabb.height);
			this.aabb.reset();
			for (var x = 0; x < this.shapes.length; x++){
				this.shapes[x].update(this.owner.x, this.owner.y);
				this.aabb.include(this.shapes[x].getAABB());
			}
			if(this.owner.solidCollisions.length == 0)
			{
				this.relocateObj.x = this.owner.x;
				this.relocateObj.y = this.owner.y;
				this['relocate-entity'](this.relocateObj);
			}
//		}
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
			this.shapes[x].reset(this.owner.x, this.owner.y);
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
		var shapes = this.shapes.slice();
		
/*		if(this.entities && (this.entities.length > 1)){
			for (var x = 0; x < this.entities.length; x++){
				if(this.entities[x] !== this.owner){
					shapes = shapes.concat(this.entities[x].shapes || this.entities[x].getShapes());
				}
			}
		}*/
		return shapes;
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
