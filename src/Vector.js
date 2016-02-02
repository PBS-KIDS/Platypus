/**
 * This class defines a multi-dimensional vector object and a variety of methods for manipulating the vector.
 * 
 * @namespace platypus
 * @class Vector
 * @constructor
 * @param x {number|Array|Vector} The x coordinate or an array or Vector describing the whole vector.
 * @param [y] {number} The y coordinate.
 * @param [z] {number} The z coordinate.
 */
/*global platypus */
/*jslint plusplus:true */
platypus.Vector = (function () {
    "use strict";
    
    var Vector = function (x, y, z) {
            this.matrix = Array.setUp(0, 0, 0);
            this.set(x, y, z);
        },
        proto = Vector.prototype;
    
    /**
     * The x component of the vector.
     * 
     * @property x
     * @type number
     * @default 0
     */
    Object.defineProperty(proto, 'x', {
        get: function () {
            return this.matrix[0];
        },
        set: function (value) {
            this.matrix[0] = value;
        }
    });
    
    /**
     * The y component of the vector.
     * 
     * @property y
     * @type number
     * @default 0
     */
    Object.defineProperty(proto, 'y', {
        get: function () {
            return this.matrix[1];
        },
        set: function (value) {
            this.matrix[1] = value;
        }
    });
    
    /**
     * The z component of the vector.
     * 
     * @property z
     * @type number
     * @default 0
     */
    Object.defineProperty(proto, 'z', {
        get: function () {
            return this.matrix[2];
        },
        set: function (value) {
            this.matrix[2] = value;
        }
    });
    
    /**
     * Returns a string describing the vector in the format of "[x, y, z]".
     * 
     * @method toString
     * @return {String}
     */
    proto.toString = function () {
        return '[' + this.matrix.join(',') + ']';
    };
    
    /**
     * Sets the coordinates of the vector.
     * 
     * @method set
     * @param x {number|Array|Vector} The x coordinate or an array or Vector describing the whole vector.
     * @param [y] {number} The y coordinate, or if x is an array/Vector this is the number of elements to copy from the array/Vector.
     * @param [z] {number} The z coordinate.
     * @chainable
     */
    proto.set = function (x, y, z) {
        var m = null,
            limit = 0,
            q = 0;
        
        if (x && Array.isArray(x)) {   // Passing in an array.
            m = x;
            limit = y || m.length;
        } else if (x && x.matrix) {   // Passing in a vector.
            m = x.matrix;
            limit = y || m.length;
        } else {                     // Passing in coordinates.
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
        }
        
        if (m) {
            for (q = 0; q < limit; q++) {
                this.matrix[q] = m[q];
            }
        }
        
        return this;
    };
    
    /**
     * Sets the vector to values of the parameter vector.
     * 
     * @param otherVector {platypus.Vector} The other vector.
     * @chainable
     */
    proto.copyValues = function (otherVector) {
        return this.set(otherVector);
    };
    
    /**
     * Returns the magnitude of the vector.
     * 
     * @method magnitude
     * @param [dimensions] {number} The dimensions to include. Defaults to all dimensions.
     * @return {number} The magnitude of the vector.
     */
    proto.magnitude = function (dimensions) {
        var squares = 0,
            x = 0;

        dimensions = dimensions || this.matrix.length;

        for (x = 0; x < dimensions; x++) {
            squares += Math.pow(this.matrix[x], 2);
        }

        return Math.sqrt(squares);
    };
    
    /**
     * Returns the direction of the vector from the z-axis
     * 
     * @return {number} The direction of the vector in radians.
     */
    proto.getAngle = function () {
        var mag   = this.magnitude(2),
            angle = 0;

        if (mag !== 0) {
            angle = Math.acos(this.x / mag);
            if (this.y < 0) {
                angle = (Math.PI * 2) - angle;
            }
        }
        return angle;
    };
    
    /**
     * Returns a normalized copy of the vector.
     * 
     * @method getUnit
     * @return {platypus.Vector} A normalized vector in the same direction as this vector.
     */
    proto.getUnit = function () {
        return platypus.Vector.setUp(this).normalize();
    };
    
    /**
     * Returns a copy of the Vector inverted.
     * 
     * @method getInverse
     * @return {platypus.Vector}
     */
    proto.getInverse = function () {
        return platypus.Vector.setUp(this).multiply(-1);
    };
    
    /**
     * Normalizes the vector.
     * 
     * @method normalize
     * @chainable
     */
    proto.normalize = function () {
        var mag = this.magnitude();
        
        if (mag === 0) {
            return this.multiply(0);
        } else {
            return this.multiply(1 / mag);
        }
    };
    
    /**
     * Crosses this vector with the parameter vector.
     * 
     * @method cross
     * @param vector {platypus.Vector} The vector to cross this vector with.
     * @chainable
     */
    proto.cross = (function () {
        var det = function (a, b, c, d) {
            return a * d - b * c;
        };
        
        return function (v) {
            var tempX = det(this.y, this.z, v.y, v.z),
                tempY = -det(this.x, this.z, v.x, v.z),
                tempZ = det(this.x, this.y, v.x, v.y);
            
            this.x = tempX;
            this.y = tempY;
            this.z = tempZ;
            
            return this;
        };
    }());
    
    /**
     * Crosses this vector with the parameter vector and returns the cross product.
     * 
     * @method getCrossProduct
     * @param vector {platypus.Vector} The vector to cross this vector with.
     * @return {platypus.Vector} The cross product.
     */
    proto.getCrossProduct = function (v) {
        return platypus.Vector.setUp(this).cross(v);
    };
    
    /**
     * Rotates the vector by the given amount.
     * 
     * @method rotate
     * @param angle {number} The amount to rotate the vector in radians.
     * @param [axis="z"] {String|Vector} A vector describing the axis around which the rotation should occur or 'x', 'y', or 'z'.
     * @chainable
     */
    proto.rotate = function (angle, axis) {
        var a    = axis,
            arr  = null,
            cos  = Math.cos(angle),
            sin  = Math.sin(angle),
            icos = 1 - cos,
            x    = 0,
            y    = 0,
            z    = 0,
            temp = platypus.Vector.setUp();
        
        if (a) {
            if (a === 'x') {
                a = temp.set(1, 0, 0);
            } else if (a === 'y') {
                a = temp.set(0, 1, 0);
            } else if (a === 'z') {
                a = temp.set(0, 0, 1);
            }
        } else {
            a = temp.set(0, 0, 1);
        }
        
        x     = a.x;
        y     = a.y;
        z     = a.z;
        
        arr = Array.setUp(
            Array.setUp(    cos + x * x * icos, x * y * icos - z * sin, x * z * icos + y * sin),
            Array.setUp(y * x * icos + z * sin,     cos + y * y * icos, y * z * icos - x * sin),
            Array.setUp(z * x * icos - y * sin, z * y * icos + x * sin,     cos + z * z * icos)
        );
        
        this.multiply(arr);
        
        temp.recycle();
        arr.recycle(2);
        
        return this;
    };
    
    /**
     * Scales the vector by the given factor or performs a transform if a matrix is provided.
     * 
     * @method multiply
     * @param multiplier {number|Array} The factor to scale by or a 2D array describing a multiplication matrix.
     * @param limit {number} For scaling, determines which coordinates are affected.
     * @chainable
     */
    proto.multiply = function (multiplier, limit) {
        var i = 0,
            j = 0,
            arr = null,
            l = 0;
        
        if (Array.isArray(multiplier)) {
            arr = this.matrix.greenSlice();
            l = limit || multiplier.length;
            for (i = 0; i < l; i++) {
                this.matrix[i] = 0;
                for (j = 0; j < l; j++) {
                    this.matrix[i] += arr[j] * multiplier[i][j];
                }
            }
            arr.recycle();
        } else {
            l = limit || this.matrix.length;
            for (i = 0; i < l; i++) {
                this.matrix[i] *= multiplier;
            }
        }
        
        return this;
    };
    
    /**
     * Adds the given components to this vector.
     * 
     * @method add
     * @param x {number|Array|Vector} The x component to add, or an array or vector describing the whole addition.
     * @param [y] {number} The y component to add or the limit if the first parameter is a vector or array.
     * @param [z] {number} The z component to add.
     * @chainable
     */
    proto.add = function (x, y, z) {
        var addMatrix = x,
            limit = 0,
            q = 0;

        if (!Array.isArray(addMatrix)) {
            if (addMatrix instanceof Vector) {
                addMatrix = addMatrix.matrix;
                limit = y || this.matrix.length;
            } else {
                addMatrix = [x || 0, y || 0, z || 0];
                limit = this.matrix.length;
            }
        } else {
            limit = y || this.matrix.length;
        }
        
        for (q = 0; q < limit; q++) {
            this.matrix[q] += addMatrix[q];
        }
        
        return this;
    };
    
    /**
     * Adds the given vector to this vector.
     * 
     * @method addVector
     * @param otherVector {platypus.Vector} The vector to add.
     * @chainable
     */
    proto.addVector = function (otherVector, dimensions) {
        return this.add(otherVector, dimensions);
    };
    
    /**
     * Subtracts the given vector from this vector.
     * 
     * @method subtractVector
     * @param otherVector {platypus.Vector} The vector to subtract.
     * @chainable
     */
    proto.subtractVector = function (otherVector, dimensions) {
        return this.add(otherVector.getInverse(), dimensions);
    };
    
    /**
     * Scales the vector by the given factor.
     * 
     * @method multiply
     * @param factor {number} The factor to scale by.
     * @param limit {number} Determines which coordinates are affected. Defaults to all coordinates.
     * @chainable
     */
    proto.scale = function (factor, limit) {
        return this.multiply(factor, limit);
    };
    
    /**
     * Finds the dot product of the two vectors.
     * 
     * @method dot
     * @param otherVector {platypus.Vector} The other vector.
     * @param limit {number} The number of vector indexes to include in the dot product.
     * @return {number} The dot product.
     */
    proto.dot = function (otherVector, limit) {
        var sum = 0,
            q = 0;
        limit = limit || this.matrix.length;
        
        for (q = 0; q < limit; q++) {
            sum += this.matrix[q] * (otherVector.matrix[q] || 0);
        }
        
        return sum;
    };
    
    /**
     * Finds the shortest angle between the two vectors.
     * 
     * @method angleTo
     * @param otherVector {platypus.Vector} The other vector.
     * @return {number} The angle between this vector and the received vector.
     */
    proto.angleTo = function (otherVector) {
        var v1 = this.getUnit(),
            v2 = otherVector.getUnit();
        
        return Math.acos(v1.dot(v2));
    };
    
    /**
     * Finds the shortest signed angle between the two vectors.
     * 
     * @method signedAngleTo
     * @param otherVector {platypus.Vector} The other vector.
     * @param normal {platypus.Vector} A normal vector determining the resultant sign of the angle between two vectors.
     * @return {number} The angle between this vector and the received vector.
     */
    proto.signedAngleTo = function (otherVector, normal) {
        var v1 = this.getUnit(),
            v2 = otherVector.getUnit();
        
        if (v1.getCrossProduct(v2).dot(normal) < 0) {
            return -Math.acos(v1.dot(v2));
        }
        return Math.acos(v1.dot(v2));
    };
    
    /**
     * Find the scalar value of projecting this vector onto the parameter vector or onto a vector at the specified angle away.
     * 
     * @method scalerProjection
     * @param vectorOrAngle {Vector|number} The other vector or the angle between the vectors.
     * @return {number} The magnitude of the projection. 

     */
    proto.scalarProjection = function (vectorOrAngle) {
        var angle = 0;
        if (typeof vectorOrAngle === "number") {
            angle = vectorOrAngle;
        } else {
            angle = this.angleTo(vectorOrAngle);
        }
        return this.magnitude(2) * Math.cos(angle);
    };
    
    /**
     * Returns a copy of this vector.
     * 
     * @method copy
     * @return {platypus.Vector} A copy of this vector.
     */
    proto.copy = function () {
        return platypus.Vector.setUp(this);
    };
    
    /**
     * Adds properties to an object that describe the coordinates of a vector.
     * 
     * @method Vector.assign
     * @param object {Object} Object on which the coordinates and vector will be added.
     * @param propertyName {String} A string describing the property name where the vector is accessable.
     * @param [coordinateName*] {String} One or more parameters describing coordinate values on the object.
     */
    Vector.assign = (function () {
        var createProperty = function (property, obj, vector, index) {
            var temp = null,
                propertyInUse = false;
            
            if (typeof property === 'string') {
                if (typeof obj[property] !== 'undefined') {
                    temp = obj[property];
                    delete obj[property];
                    propertyInUse = true;
                }
            }
            
            Object.defineProperty(obj, property, {
                get: function () {
                    return vector.matrix[index];
                },
                set: function (value) {
                    vector.matrix[index] = value;
                },
                enumerable: true
            });
            
            if (propertyInUse) {
                obj[property] = temp;
            }
        };
        
        return function (obj, prop) {
            var i = 0;

            if (obj && prop) {
                if (!obj[prop]) {
                    obj[prop] = platypus.Vector.setUp();
                    
                    for (i = 2; i < arguments.length; i++) {
                        if (arguments[i] !== prop) {
                            createProperty(arguments[i], obj, obj[prop], i - 2);
                        }
                    }
                    
                    return;
                }
                return obj[prop];
            } else {
                return null;
            }
        };
    }());

    /**
     * Returns a Vector from cache or creates a new one if none are available.
     * 
     * @method Vector.setUp
     * @return {platypus.Vector} The instantiated Vector.
     * @since 0.7.1
     */
    /**
     * Returns a Vector back to the cache. Prefer the Vector's recycle method since it recycles property objects as well.
     * 
     * @method Vector.recycle
     * @param {platypus.Vector} The Vector to be recycled.
     * @since 0.7.1
     */
    platypus.setUpRecycle(Vector);

    /**
     * Relinquishes properties of the vector and recycles it.
     * 
     * @method recycle
     * @since 0.7.1
     */
    proto.recycle = function () {
        this.matrix.recycle();
        Vector.recycle(this);
    };
    
    
    return Vector;
}());
