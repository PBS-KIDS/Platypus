/**
 * This class defines a collision shape, which defines the 'space' an entity occupies in the collision system. Currently only rectangle and circle shapes can be created. Collision shapes include an axis-aligned bounding box (AABB) that tightly wraps the shape. The AABB is used for initial collision checks.
 *
 * @namespace platypus
 * @class CollisionShape
 * @constructor
 * @param owner {platypus.Entity} The entity that uses this shape.
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
/*global include, platypus */
platypus.CollisionShape = (function () {
    'use strict';
    
    var AABB = include('platypus.AABB'),
        Vector = include('platypus.Vector'),
        circleRectCollision = function (circle, rect) {
            var rectAabb         = rect.aABB,
                hh = rectAabb.halfHeight,
                hw = rectAabb.halfWidth,
                abs = Math.abs,
                pow = Math.pow,
                shapeDistanceX = abs(circle.x - rect.x),
                shapeDistanceY = abs(circle.y - rect.y),
                radius = circle.radius;
            
            /* This checks the following in order:
                - Is the x or y distance between shapes less than half the width or height respectively of the rectangle? If so, we know they're colliding.
                - Is the x or y distance between the shapes greater than the half width/height plus the radius of the circle? Then we know they're not colliding.
                - Otherwise, we check the distance between a corner of the rectangle and the center of the circle. If that distance is less than the radius of the circle, we know that there is a collision; otherwise there is not.
            */
            return (shapeDistanceX < hw) || (shapeDistanceY < hh) || ((shapeDistanceX < (hw + radius)) && (shapeDistanceY < (hh + radius)) && ((pow((shapeDistanceX - hw), 2) + pow((shapeDistanceY - hh), 2)) < pow(radius, 2)));
        },
        collidesCircle = function (shape) {
            var pow = Math.pow;
            
            return this.aABB.collides(shape.aABB) && (
                ((shape.type === 'rectangle') && circleRectCollision(this, shape)) ||
                ((shape.type === 'circle')    && ((pow((this.x - shape.x), 2) + pow((this.y - shape.y), 2)) <= pow((this.radius + shape.radius), 2)))
            );
        },
        collidesDefault = function () {
            return false;
        },
        collidesRectangle = function (shape) {
            return this.aABB.collides(shape.aABB) && (
                (shape.type === 'rectangle') ||
                ((shape.type === 'circle') && circleRectCollision(shape, this))
            );
        },
        CollisionShape = function (owner, definition, collisionType) {
            var regX = definition.regX,
                regY = definition.regY,
                width = definition.width || definition.radius * 2 || 0,
                height = definition.height || definition.radius * 2 || 0,
                radius = definition.radius || 0,
                type = definition.type || 'rectangle';

            // If this shape is recycled, the vectors will already be in place.
            if (!this.initialized) {
                this.initialized = true;
                Vector.assign(this, 'offset', 'offsetX', 'offsetY');
                Vector.assign(this, 'position', 'x', 'y');
                Vector.assign(this, 'size', 'width', 'height');
                this.aABB = AABB.setUp();
            }

            this.owner = owner;
            this.collisionType = collisionType;
            this.type = type;
            this.subType = '';
            
            /**
             * Determines whether shapes collide.
             *
             * @method collides
             * @param shape {platypus.CollisionShape} The shape to check against for collision.
             * @return {Boolean} Whether the shapes collide.
             * @since 0.7.4
             */
            if (type === 'circle') {
                width = height = radius * 2;
                this.collides = collidesCircle;
            } else if (type === 'rectangle') {
                this.collides = collidesRectangle;
            } else {
                this.collides = collidesDefault;
            }
            this.size.setXYZ(width, height);
            this.radius = radius;

            if (typeof regX !== 'number') {
                regX = width / 2;
            }
            if (typeof regY !== 'number') {
                regY = height / 2;
            }
            this.offset.setXYZ(definition.offsetX || ((width  / 2) - regX), definition.offsetY || ((height / 2) - regY));

            if (owner) {
                this.position.setXYZ(owner.x, owner.y).add(this.offset);
            } else {
                this.position.setXYZ(definition.x, definition.y).add(this.offset);
            }

            this.aABB.setAll(this.x, this.y, width, height);
        },
        proto = CollisionShape.prototype;

    /**
     * Updates the location of the shape and AABB. The position you send should be that of the owner, the offset of the shape is added inside the function.
     *
     * @method update
     * @param ownerX {number} The x position of the owner.
     * @param ownerY {number} The y position of the owner.
     */
    proto.update = function (ownerX, ownerY) {
        var x = ownerX + this.offsetX,
            y = ownerY + this.offsetY;

        this.position.setXYZ(x, y);
        this.aABB.move(x, y);
    };
    
    /**
     * Move the shape's x position.
     *
     * @method moveX
     * @param x {number} The x position to which the shape should be moved.
     */
    proto.moveX = function (x) {
        this.x = x;
        this.aABB.moveX(x);
    };
    
    /**
     * Move the shape's y position.
     *
     * @method moveY
     * @param y {number} The y position to which the shape should be moved.
     */
    proto.moveY = function (y) {
        this.y = y;
        this.aABB.moveY(y);
    };
    
    /**
     * Returns the axis-aligned bounding box of the shape.
     *
     * @method getAABB
     * @return {platypus.AABB} The AABB of the shape.
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
     * @deprecated since 0.7.4 - Use `recycle()` instead.
     */
    proto.destroy = function () {
        this.recycle();
    };
    
    /**
     * Transform the shape using a matrix transformation.
     *
     * @method multiply
     * @param matrix {Array} A matrix used to transform the shape.
     */
    proto.multiply = function (m) {
        var pos = this.position,
            own = this.owner.position;
        
        pos.subtractVector(own);
        
        pos.multiply(m);
        this.offset.multiply(m);
        this.size.multiply(m);
        
        pos.addVector(own);
        this.width  = Math.abs(this.width);
        this.height = Math.abs(this.height);
        
        this.aABB.setAll(this.x, this.y, this.width, this.height);
    };
    
    /**
     * Returns an CollisionShape from cache or creates a new one if none are available.
     *
     * @method CollisionShape.setUp
     * @return {platypus.CollisionShape} The instantiated CollisionShape.
     * @since 0.7.4
     */
    /**
     * Returns a CollisionShape back to the cache.
     *
     * @method CollisionShape.recycle
     * @param {platypus.CollisionShape} The CollisionShape to be recycled.
     * @since 0.7.4
     */
    /**
     * Relinquishes properties of the CollisionShape and recycles it.
     *
     * @method recycle
     * @since 0.7.4
     */
    platypus.setUpRecycle(CollisionShape, 'CollisionShape');
    
    return CollisionShape;
}());
