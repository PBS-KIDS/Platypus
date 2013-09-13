/**
# COMPONENT **collision-tiles**
This component causes the tile-map to collide with other entities. It must be part of a collision group and will cause "hit-by-tile" messages to fire on colliding entities.

## Dependencies:
- [[Collision-Group]] (on entity's parent) - This component handles the collision state of the map for the [[Collision-Group]] component on the parent entity.
- [[CollisionShape]] object - This component uses collisionShape objects to expose individual tiles to the collision group.

## Methods

- **getTiles** - Returns all the collision tiles within the provided axis-aligned bounding box.
  > @param aabb ([[Aabb]]) - The axis-aligned bounding box for which tiles should be returned.
  > @return tiles (Array of objects) - Each returned object provides the shape [[collisionShape]] of the tile and the grid coordinates of the returned tile.
- **getAABB** - Returns the axis-aligned bounding box of the entire map.
  > @return aabb (object) - The returned object provides the top, left, width, and height of the collision map.
- **isTile** - Confirms whether a particular map grid coordinate contains a tile.
  > @param x (number) - Integer specifying the row of tiles in the collision map to check.
  > @param y (number) - Integer specifying the column of tiles in the collision map to check.
  > @return isTile (boolean) - Returns `true` if the coordinate contains a collision tile, `false` if it does not.

## JSON Definition:
    {
      "type": "collision-tiles",
      
      "collisionMap": [[-1,-1,-1], [1,-1,-1], [1,1,1]],
      // Required. A 2D array describing the tile-map with off (-1) and on (!-1) states.
      
      "tileWidth": 240,
      // Optional. The width of tiles in world coordinates. Defaults to 10.
      
      "tileHeight": 240,
      // Optional. The height of tiles in world coordinates. Defaults to 10.
    }
*/
platformer.components['collision-tiles'] = (function(){
	var component = function(owner, definition){
		var self = this;
		this.owner = owner;
		
		this.collisionMap   = definition.collisionMap  || [];
		this.tileWidth      = definition.tileWidth  || this.owner.tileWidth  || 10;
		this.tileHeight     = definition.tileHeight || this.owner.tileHeight || 10;
		this.tileHalfWidth  = this.tileWidth  / 2;
		this.tileHalfHeight = this.tileHeight / 2;
		
		// Messages that this component listens for
		this.listeners = [];
		
		this.owner.getTileShapes = function(aabb, prevAABB){
			return self.getTileShapes(aabb, prevAABB);
		};
		this.owner.getAABB = function(){
			return self.getAABB();
		};
		this.owner.isTile = function(x, y){
			return self.isTile(x, y);
		};
	};
	var proto = component.prototype;
	
	proto.createShape = function(prevAABB, x, y){
		//TODO: Make some optimizations here. Remove creation of objects if possible. - DDD
		return new platformer.classes.collisionShape(null, {
			x:      x * this.tileWidth  + this.tileHalfWidth,
			y:      y * this.tileHeight + this.tileHalfHeight,
			type:   'rectangle',
			width:  this.tileWidth,
			height: this.tileHeight
		}, 'tiles');
	};
	
	proto.addShape = function(shapes, prevAABB, x, y){
		if (this.collisionMap[x][y] > -1) {
			shapes.push(this.createShape(prevAABB, x, y));
		} else if (this.collisionMap[x][y] < -1) {
			switch(this.collisionMap[x][y]){
			case -2: //Top
				if(prevAABB.bottom <= y * this.tileHeight){
					shapes.push(this.createShape(prevAABB, x, y));
				}
				break;
			case -3: //Right
				if(prevAABB.left >= (x + 1) * this.tileWidth){
					shapes.push(this.createShape(prevAABB, x, y));
				}
				break;
			case -4: //Bottom
				if(prevAABB.top >= (y + 1) * this.tileHeight){
					shapes.push(this.createShape(prevAABB, x, y));
				}
				break;
			case -5: //Left
				if(prevAABB.right <= x * this.tileWidth){
					shapes.push(this.createShape(prevAABB, x, y));
				}
				break;
			}
		}
		return shapes;
	};

	proto.getAABB = function(){
		return {
			left: 0,
			top:  0,
			right: this.tileWidth * this.collisionMap.length,
			bottom: this.tileHeight * this.collisionMap.length[0]
		};
	};
	
	proto.isTile = function (x, y) {
		if (x >=0 && x < this.collisionMap.length && y >=0 && y < this.collisionMap[0].length && this.collisionMap[x][y] != -1){
			return true;
		} else { //If there's not a tile or we're outside the map.
			return false;
		}
	};
	
	proto.getTileShapes = function(aabb, prevAABB){
		var left = Math.max(Math.floor(aabb.left   / this.tileWidth),  0),
		top      = Math.max(Math.floor(aabb.top    / this.tileHeight), 0),
		right    = Math.min(Math.ceil(aabb.right   / this.tileWidth),  this.collisionMap.length),
		bottom   = Math.min(Math.ceil(aabb.bottom  / this.tileHeight), this.collisionMap[0].length),
		x        = 0,
		y        = 0,
		shapes   = [];
		
		for (x = left; x < right; x++){
			for (y = top; y < bottom; y++){
				this.addShape(shapes, prevAABB, x, y);
			}
		}
		
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
