/* global platformer */
/**
 * This class defines a collision shape, which defines the 'space' an entity occupies in the collision system. Currently only rectangle and circle shapes can be created. Collision shapes include an axis-aligned bounding box (AABB) that tightly wraps the shape. The AABB is used for initial collision checks.
 * 
 * @class CollisionShape
 * @constructor
 * @param owner {Entity} The entity that uses this shape.
 * @param definition {Object} This is an object of key/value pairs describing the shape.
 * @param definition.x {number} The x position of the shape. The x is always located in the center of the object.
 * @param definition.y {number} The y position of the shape. The y is always located in the center of the object.
 * @param [definition.type="rectangle"] {String} The type of shape this is. Currently this can be either "rectangle" or "circle".
 * @param [definition.width] {number} The width of the shape if it's a rectangle.
 * @param [definition.height] {number} The height of the shape if it's a rectangle.
 * @param [definition.radius] {number} The radius of the shape if it's a circle.
 * @param [definition.offsetX] {number} The x offset of the collision shape from the owner entity's location.
 * @param [definition.offsetY] {number} The y offset of the collision shape from the owner entity's location.
 * @param [definition.regX] {number} The registration x of the collision shape with the owner entity's location if offsetX is not provided.
 * @param [definition.regY] {number} The registration y of the collision shape with the owner entity's location if offsetX is not provided.
 * @param collisionType {String} A string describing the collision type of this shape.
 */
platformer.CollisionShape = (function () {
	"use strict";
	
	var collisionShape = function (owner, definition, collisionType) {
		var regX = definition.regX,
		regY     = definition.regY;
		
		this.owner = owner;
		this.collisionType = collisionType;
		
		this.width  = definition.width  || definition.radius || 0;
		this.height = definition.height || definition.radius || 0;
		this.radius = definition.radius || 0;
		
		if (typeof regX !== 'number') {
			regX = this.width / 2;
		}
		if (typeof regY !== 'number') {
			regY = this.height / 2;
		}
		
		platformer.Vector.assign(this, 'offset', 'offsetX', 'offsetY');
		this.offsetX = definition.offsetX || ((this.width  / 2) - regX);
		this.offsetY = definition.offsetY || ((this.height / 2) - regY);
		
		platformer.Vector.assign(this, 'position', 'x', 'y');
		if (owner) {
			this.x = owner.x + this.offsetX;
			this.y = owner.y + this.offsetY;
		} else {
			this.x = definition.x + this.offsetX;
			this.y = definition.y + this.offsetY;
		}

		this.type = definition.type || 'rectangle';
		this.subType = '';
		this.aABB = undefined;
		
		var width = 0;
		var height = 0; 
		switch (this.type) {
		case 'circle': //need TL and BR points
			width = height = this.radius * 2;
			break;
		case 'rectangle': //need TL and BR points
			width = this.width;
			height = this.height;
			break;
		}
		
		platformer.Vector.assign(this, 'size', 'width', 'height');
		this.width  = width;
		this.height = height;
		
		this.aABB     = new platformer.AABB(this.x, this.y, width, height);
	};
	var proto = collisionShape.prototype;
	
	/*
## Methods
- **reset** - Resets the location of the shape and AABBs so that the current and previous position are the same. The position you send should be that of the owner, the offset of the shape is added inside the function.
  - @param ownerX (number) - The x position of the owner.
  - @param ownerY (number) - The y position of the owner.
- **getXOffset** - Returns the x offset of the shape.
  - @return number - The x offset.
- **getYOffset** - Returns the y offset of the shape.
  - @return number - The y offset.
*/

	/**
	 * Updates the location of the shape and AABB. The position you send should be that of the owner, the offset of the shape is added inside the function.
	 * 
	 * @method update
	 * @param ownerX {number} The x position of the owner.
	 * @param ownerY {number} The y position of the owner.
	 */
	proto.update = function (ownerX, ownerY) {
		this.x = ownerX + this.offsetX;
		this.y = ownerY + this.offsetY;
		this.aABB.move(this.x, this.y);
	};
	
	/**
	 * Move the shape's x position.
	 * 
	 * @method moveX
	 * @param x {number} The x position to which the shape should be moved.
	 */
	proto.moveX = function (x) {
		this.x = x;
		this.aABB.moveX(this.x);
	};
	
	/**
	 * Move the shape's y position.
	 * 
	 * @method moveY
	 * @param y {number} The y position to which the shape should be moved.
	 */
	proto.moveY = function (y) {
		this.y = y;
		this.aABB.moveY(this.y);
	};
	
	/**
	 * Returns the axis-aligned bounding box of the shape.
	 * 
	 * @method getAABB
	 * @return {AABB} The AABB of the shape.
	 */
	proto.getAABB = function () {
		return this.aABB;
	};
	
	/**
	 * Set the shape's position as if the entity's x position is in a certain location.
	 * 
	 * @method setXWithEntityX
	 * @param entityX {number} The x position of the entity.
	 */
	proto.setXWithEntityX = function (entityX) {
		this.x = entityX + this.offsetX;
		this.aABB.moveX(this.x);
	};
	
	/**
	 * Set the shape's position as if the entity's y position is in a certain location.
	 * 
	 * @method setYWithEntityY
	 * @param entityY {number} The y position of the entity.
	 */
	proto.setYWithEntityY = function (entityY) {
		this.y = entityY + this.offsetY;
		this.aABB.moveY(this.y);
	};
	
	/**
	 * Destroys the shape so that it can be memory collected safely.
	 * 
	 * @method destroy
	 */
	proto.destroy = function () {
		this.aABB = undefined;
	};
	
	/**
	 * Transform the shape using a matrix transformation.
	 * 
	 * @method multiply
	 * @param matrix {Array} A matrix used to transform the shape.
	 */
	proto.multiply = function (m) {
		this.position.subtractVector(this.owner.position);
		
		this.position.multiply(m);
		this.offset.multiply(m);
		this.size.multiply(m);
		
		this.position.addVector(this.owner.position);
		this.width  = Math.abs(this.width);
		this.height = Math.abs(this.height);
		
		this.aABB.setAll(this.x, this.y, this.width, this.height);
	};
	
	return collisionShape;
}());