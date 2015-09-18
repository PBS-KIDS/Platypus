/**
 * This class defines an axis-aligned bounding box (AABB) which is used during the collision process to determine if two objects are colliding. This is used in a few places including [[Collision-Basic]] and [[Collision-Shape]].
 * 
 * @namespace platypus
 * @class AABB
 * @constructor
 * @param x {number} The x position of the AABB. The x is always located in the center of the object.
 * @param y {number} The y position of the AABB. The y is always located in the center of the object.
 * @param width {number} The width of the AABB.
 * @param height {number} The height of the AABB.
 * @return {AABB} Returns the new aabb object.
 */
/*global platypus */
platypus.AABB = (function () {
    "use strict";
    
    var AABB = function (x, y, width, height) {
            this.empty = true;
            this.setAll(x, y, width, height);
        },
        proto = AABB.prototype;
    
    /**
     * Sets all of the properties of the AABB.
     * 
     * @method setAll
     * @param x {number} The x position of the AABB. The x is always located in the center of the object.
     * @param y {number} The y position of the AABB. The y is always located in the center of the object.
     * @param width {number} The width of the AABB.
     * @param height {number} The height of the AABB.
     * @chainable
     */
    proto.setAll = function (x, y, width, height) {
        this.empty = false;
        this.x = x;
        this.y = y;
        this.resize(width, height);
        return this;
    };
    
    /**
     * Sets bounds of the AABB.
     * 
     * @method setBounds
     * @param left {number} The left side of the AABB.
     * @param top {number} The top side of the AABB.
     * @param right {number} The right side of the AABB.
     * @param bottom {number} The bottom side of the AABB.
     * @chainable
     */
    proto.setBounds = function (left, top, right, bottom) {
        this.empty = false;
        this.x = (right + left) / 2;
        this.y = (top + bottom) / 2;
        this.resize(right - left, bottom - top);
        return this;
    };
    
    proto.set = function (aabb) {
        /**
         * Whether the AABB encloses a valid space.
         * 
         * @property empty
         * @type boolean
         */
        this.empty = aabb.empty;
        
        /**
         * The x position of the AABB. The x is always located in the center of the object.
         * 
         * @property x
         * @type number
         */
        this.x = aabb.x;
        
        /**
         * The y position of the AABB. The y is always located in the center of the object.
         * 
         * @property y
         * @type number
         */
        this.y = aabb.y;
        
        /**
         * The width of the AABB.
         * 
         * @property width
         * @type number
         */
        this.width  = aabb.width;
        
        /**
         * The height of the AABB.
         * 
         * @property height
         * @type number
         */
        this.height = aabb.height;
        
        /**
         * Half the width of the AABB.
         * 
         * @property halfWidth
         * @type number
         */
        this.halfWidth = aabb.halfWidth;
        
        /**
         * Half the height of the AABB.
         * 
         * @property halfHeight
         * @type number
         */
        this.halfHeight = aabb.halfHeight;
        
        /**
         * The x-position of the left edge of the AABB.
         * 
         * @property left
         * @type number
         */
        this.left = aabb.left;
        
        /**
         * The x-position of the right edge of the AABB.
         * 
         * @property right
         * @type number
         */
        this.right = aabb.right;
        
        /**
         * The y-position of the top edge of the AABB.
         * 
         * @property top
         * @type number
         */
        this.top = aabb.top;
        
        /**
         * The y-position of the bottom edge of the AABB.
         * 
         * @property bottom
         * @type number
         */
        this.bottom = aabb.bottom;
        
        return this;
    };
    
    /**
     * Resets all the values in the AABB so that the AABB can be reused.
     * 
     * @method reset
     * @chainable
     */
    proto.reset = function () {
        this.empty = true;
        return this;
    };
    
    /**
     * Resizes the AABB.
     * 
     * @method reset
     * @param width {number} The new width of the AABB
     * @param height {number} The new height of the AABB
     * @chainable
     */
    proto.resize = function (width, height) {
        this.width  = width || 0;
        this.height = height || 0;
        this.halfWidth = this.width / 2;
        this.halfHeight = this.height / 2;
        if (isNaN(this.x)) {
            this.empty = true;
        } else {
            this.left = -this.halfWidth + this.x;
            this.right = this.halfWidth + this.x;
        }
        if (isNaN(this.y)) {
            this.empty = true;
        } else {
            this.top = -this.halfHeight + this.y;
            this.bottom = this.halfHeight + this.y;
        }
        return this;
    };
    
    /**
     * Changes the size and position of the bounding box so that it contains the current area and the area described in the incoming AABB.
     * 
     * @method include
     * @param aabb {AABB} The AABB whose area will be included in the area of the current AABB.
     * @chainable
     */
    proto.include = function (aabb) {
        if (aabb) {
            if (this.empty) {
                this.set(aabb);
            } else {
                if (this.left > aabb.left) {
                    this.left = aabb.left;
                }
                if (this.right < aabb.right) {
                    this.right = aabb.right;
                }
                if (this.top > aabb.top) {
                    this.top = aabb.top;
                }
                if (this.bottom < aabb.bottom) {
                    this.bottom = aabb.bottom;
                }
                
                this.width      = this.right  - this.left;
                this.height     = this.bottom - this.top;
                this.halfWidth  = this.width / 2;
                this.halfHeight = this.height / 2;
                this.x          = this.left + this.halfWidth;
                this.y          = this.top  + this.halfHeight;
            }
        }
        
        return this;
    };
    
    /**
     * Moves the AABB to the specified location.
     * 
     * @method move
     * @param x {number} The new x position of the AABB.
     * @param y {number} The new y position of the AABB.
     * @chainable
     */
    proto.move = function (x, y) {
        this.moveX(x);
        this.moveY(y);
        return this;
    };

    /**
     * Moves the AABB to the specified location.
     * 
     * @method moveX
     * @param x {number} The new x position of the AABB.
     * @chainable
     */
    proto.moveX = function (x) {
        this.x = x;
        this.left   = -this.halfWidth + this.x;
        this.right  = this.halfWidth + this.x;
        return this;
    };

    /**
     * Moves the AABB to the specified location.
     * 
     * @method moveY
     * @param y {number} The new y position of the AABB.
     * @chainable
     */
    proto.moveY = function (y) {
        this.y = y;
        this.top    = -this.halfHeight + this.y;
        this.bottom = this.halfHeight + this.y;
        return this;
    };
    
    /**
     * Moves the AABB to the specified location.
     * 
     * @method moveXBy
     * @param deltaX {number} The change in x position of the AABB.
     * @chainable
     */
    proto.moveXBy = function (deltaX) {
        this.x += deltaX;
        this.left   = -this.halfWidth + this.x;
        this.right  = this.halfWidth + this.x;
        return this;
    };

    /**
     * Moves the AABB to the specified location.
     * 
     * @method moveYBy
     * @param deltaY {number} The change in y position of the AABB.
     * @chainable
     */
    proto.moveYBy = function (deltaY) {
        this.y += deltaY;
        this.top    = -this.halfHeight + this.y;
        this.bottom = this.halfHeight + this.y;
        return this;
    };
    
    /**
     * Creates a new AABB with the same properties as this AABB.
     * 
     * @method getCopy
     * @return {AABB} Returns the new AABB object.
     */
    proto.getCopy = function () {
        return new AABB(this.x, this.y, this.width, this.height);
    };

    /**
     * Expresses whether this AABB matches parameters describing an AABB.
     * 
     * @method matches
     * @param x {number} X coordinate of a bounding box
     * @param y {number} Y coordinate of a bounding box
     * @param width {number} Width of a bounding box
     * @param height {number} Height of a bounding box
     * @return {boolean} Returns `true` if the parameters match.
     */
    proto.matches = function (x, y, width, height) {
        return !((this.x !== x) || (this.y !== y) || (this.width !== width) || (this.height !== height));
    };

    /**
     * Expresses whether this AABB contains the given AABB.
     * 
     * @method contains
     * @param aabb {AABB} The AABB to check against
     * @return {boolean} Returns `true` if this AABB contains the other AABB.
     */
    proto.contains = function (aabb) {
        return !((aabb.top < this.top) || (aabb.bottom > this.bottom) || (aabb.left < this.left) || (aabb.right > this.right));
    };
    
    /**
     * Expresses whether this AABB contains the given point.
     * 
     * @method containsVector
     * @param vector {Vector} The vector to check.
     * @return {boolean} Returns `true` if this AABB contains the vector.
     */
    proto.containsVector = function (vector) {
        return !((vector.y < this.top) || (vector.y > this.bottom) || (vector.x < this.left) || (vector.x > this.right));
    };
    
    /**
     * Expresses whether this AABB intersects the given AABB.
     * 
     * @method intersects
     * @param aabb {AABB} The AABB to check against
     * @return {boolean} Returns `true` if this AABB intersects the other AABB.
     */
    proto.intersects = function (aabb) {
        return !((aabb.bottom < this.top) || (aabb.top > this.bottom) || (aabb.right < this.left) || (aabb.left > this.right));
    };
    
    return AABB;
}());