import config from 'config';
import recycle from 'recycle';

const
    /**
     * This class defines an axis-aligned bounding box (AABB) which is used during the collision process to determine if two objects are colliding. This is used in a few places including [CollisionBasic](platypus.components.CollisionBasic.html) and [[Collision-Shape]].
     *
     * @memberof platypus
     * @class AABB
     * @param x {number} The x position of the AABB. The x is always located in the center of the object.
     * @param y {number} The y position of the AABB. The y is always located in the center of the object.
     * @param width {number} The width of the AABB.
     * @param height {number} The height of the AABB.
     * @return {platypus.AABB} Returns the new aabb object.
     */
    AABB = function (x, y, width, height) {
        if (x instanceof AABB) {
            this.set(x);
        } else {
            this.empty = true;
            this.setAll(x, y, width, height);
        }
    },
    proto = AABB.prototype;

/**
 * Sets all of the properties of the AABB.
 *
 * @method platypus.AABB#setAll
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
 * @method platypus.AABB#setBounds
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

/**
 * Sets the AABB values to those of the provided AABB.
 *
 * @method platypus.AABB#set
 * @param aabb {platypus.AABB} The AABB to copy values.
 * @chainable
 */
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
 * Returns a string listing AABB dimensions.
 *
 * @method platypus.AABB#toString
 * @return String
 */
proto.toString = function () {
    return '[AABB: ' + this.width + 'x' + this.height + ' (' + this.x + ', ' + this.y + ')]';
};

/**
 * Resets all the values in the AABB so that the AABB can be reused.
 *
 * @method platypus.AABB#reset
 * @chainable
 */
proto.reset = function () {
    this.empty = true;
    return this;
};

/**
 * Resizes the AABB.
 *
 * @method platypus.AABB#resize
 * @param width {number} The new width of the AABB
 * @param height {number} The new height of the AABB
 * @chainable
 */
proto.resize = function (width, height) {
    var w = width || 0,
        h = height || 0,
        hw = w / 2,
        hh = h / 2;
    
    this.width  = w;
    this.height = h;
    this.halfWidth = hw;
    this.halfHeight = hh;
    if (typeof this.x === 'number') {
        this.left = -hw + this.x;
        this.right = hw + this.x;
    } else {
        this.empty = true;
    }
    if (typeof this.y === 'number') {
        this.top = -hh + this.y;
        this.bottom = hh + this.y;
    } else {
        this.empty = true;
    }
    return this;
};

/**
 * Changes the size and position of the bounding box so that it contains the current area and the area described in the incoming AABB.
 *
 * @method platypus.AABB#include
 * @param aabb {platypus.AABB} The AABB whose area will be included in the area of the current AABB.
 * @chainable
 */
proto.include = function (aabb) {
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
    
    return this;
};

/**
 * Moves the AABB to the specified location.
 *
 * @method platypus.AABB#move
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
 * @method platypus.AABB#moveX
 * @param x {number} The new x position of the AABB.
 * @chainable
 */
proto.moveX = function (x) {
    this.x = x;
    this.left   = -this.halfWidth + x;
    this.right  = this.halfWidth + x;
    return this;
};

/**
 * Moves the AABB to the specified location.
 *
 * @method platypus.AABB#moveY
 * @param y {number} The new y position of the AABB.
 * @chainable
 */
proto.moveY = function (y) {
    this.y = y;
    this.top    = -this.halfHeight + y;
    this.bottom = this.halfHeight + y;
    return this;
};

/**
 * Moves the AABB to the specified location.
 *
 * @method platypus.AABB#moveXBy
 * @param deltaX {number} The change in x position of the AABB.
 * @chainable
 */
proto.moveXBy = function (deltaX) {
    return this.moveX(this.x + deltaX);
};

/**
 * Moves the AABB to the specified location.
 *
 * @method platypus.AABB#moveYBy
 * @param deltaY {number} The change in y position of the AABB.
 * @chainable
 */
proto.moveYBy = function (deltaY) {
    return this.moveY(this.y + deltaY);
};

/**
 * Expresses whether this AABB matches the provided AABB.
 *
 * @method platypus.AABB#equals
 * @param aabb {platypus.AABB} The AABB to check against.
 * @return {Boolean} Returns `true` if the AABB's match.
 */
proto.equals = function (aabb) {
    return !this.empty && !aabb.empty && (this.left === aabb.left) && (this.top === aabb.top) && (this.right === aabb.right) && (this.bottom === aabb.bottom);
};

/**
 * Expresses whether this AABB contains the given AABB.
 *
 * @method platypus.AABB#contains
 * @param aabb {platypus.AABB} The AABB to check against
 * @return {boolean} Returns `true` if this AABB contains the other AABB.
 */
proto.contains = function (aabb) {
    return (aabb.top >= this.top) && (aabb.bottom <= this.bottom) && (aabb.left >= this.left) && (aabb.right <= this.right);
};

/**
 * Expresses whether this AABB contains the given point.
 *
 * @method platypus.AABB#containsVector
 * @param vector {platypus.Vector} The vector to check.
 * @return {boolean} Returns `true` if this AABB contains the vector.
 */
proto.containsVector = function (vector) {
    return this.containsPoint(vector.x, vector.y);
};

/**
 * Expresses whether this AABB contains the given point.
 *
 * @method platypus.AABB#containsPoint
 * @param x {number} The x-axis value.
 * @param y {number} The y-axis value.
 * @return {boolean} Returns `true` if this AABB contains the point.
 */
proto.containsPoint = function (x, y) {
    return (y >= this.top) && (y <= this.bottom) && (x >= this.left) && (x <= this.right);
};

/**
 * Expresses whether this AABB collides with the given AABB. This is similar to `intersects` but returns true for overlapping only, not touching edges.
 *
 * @method platypus.AABB#collides
 * @param aabb {platypus.AABB} The AABB to check against
 * @return {boolean} Returns `true` if this AABB collides with the other AABB.
 */
proto.collides = function (aabb) {
    return (aabb.bottom > this.top) && (aabb.top < this.bottom) && (aabb.right > this.left) && (aabb.left < this.right);
};

/**
 * Expresses whether this AABB collides with the given point. This is an exclusive version of containsPoint.
 *
 * @method platypus.AABB#collidesPoint
 * @param x {number} The x-axis value.
 * @param y {number} The y-axis value.
 * @return {boolean} Returns `true` if this AABB collides with the point.
 */
proto.collidesPoint = function (x, y) {
    return (y > this.top) && (y < this.bottom) && (x > this.left) && (x < this.right);
};

/**
 * Expresses whether this AABB intersects the given AABB. This is similar to `collides` but returns true for overlapping or touching edges.
 *
 * @method platypus.AABB#intersects
 * @param aabb {platypus.AABB} The AABB to check against
 * @return {boolean} Returns `true` if this AABB intersects the other AABB.
 */
proto.intersects = function (aabb) {
    return (aabb.bottom >= this.top) && (aabb.top <= this.bottom) && (aabb.right >= this.left) && (aabb.left <= this.right);
};

/**
 * Returns the area of the intersection. If the AABB's do not intersect, `0` is returned.
 *
 * @method platypus.AABB#getIntersectionArea
 * @param aabb {AABB} The AABB this AABB intersects with.
 * @return {Number} Returns the area of the intersected AABB's.
 */
proto.getIntersectionArea = function (aabb) {
    var max    = Math.max,
        min    = Math.min;
    
    if (this.intersects(aabb)) {
        return (min(this.bottom, aabb.bottom) - max(this.top,  aabb.top)) * (min(this.right,  aabb.right) - max(this.left, aabb.left));
    } else {
        return 0;
    }
};

/**
 * Returns an AABB from cache or creates a new one if none are available.
 *
 * @method platypus.AABB.setUp
 * @return {platypus.AABB} The instantiated AABB.
 */
/**
 * Returns a AABB back to the cache.
 *
 * @method platypus.AABB.recycle
 * @param {platypus.AABB} aabb The AABB to be recycled.
 */
/**
 * Relinquishes properties of the AABB and recycles it.
 *
 * @method platypus.AABB#recycle
 */
recycle.add(AABB, 'AABB', AABB, null, true, config.dev);

export default AABB;
