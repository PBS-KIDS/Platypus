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
 * @param [definition.type="rectangle"] {String} The type of shape this is. Currently this can be either "rectangle", "circle", or "polygon".
 * @param [definition.width] {number} The width of the shape if it's a rectangle.
 * @param [definition.height] {number} The height of the shape if it's a rectangle.
 * @param [definition.radius] {number} The radius of the shape if it's a circle.
 * @param [definition.offsetX] {number} The x offset of the collision shape from the owner entity's location.
 * @param [definition.offsetY] {number} The y offset of the collision shape from the owner entity's location.
 * @param [definition.regX] {number} The registration x of the collision shape with the owner entity's location if offsetX is not provided.
 * @param [definition.regY] {number} The registration y of the collision shape with the owner entity's location if offsetX is not provided.
 * @param [definition.points] {array} A 2D array of coordinate pairs [[x0, y0], [x1, y1], ...] describing the points that make up a polygon. Points must be in clockwise order.
 * @param collisionType {String} A string describing the collision type of this shape.
 */
import AABB from './AABB.js';
import Vector from './Vector.js';
import config from 'config';
import recycle from 'recycle';

export default (function () {
    var circleRectCollision = function (circle, rect) {
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
        rectPoints = [Vector.setUp(0, 0), Vector.setUp(0, 0), Vector.setUp(0, 0), Vector.setUp(0, 0)],
        polyRectCollision = function (polygon, rect) {
            let normal = null,
                x = 0,
                overlap = 0,
                overlapAxis = null,
                minOverlap = Infinity;

            rectPoints[0].setXYZ(rect.aABB.left, rect.aABB.top);
            rectPoints[1].setXYZ(rect.aABB.right, rect.aABB.top);
            rectPoints[2].setXYZ(rect.aABB.right, rect.aABB.bottom);
            rectPoints[3].setXYZ(rect.aABB.left, rect.aABB.bottom);

            //Only check the normals on the polygon, the AABB check already covered the normals for the rectangle
            for (x = 0; x < polygon.normals.length; x++) {
                normal = polygon.normals[x];

                overlap = checkSeparatingAxis(normal, polygon.points, rectPoints);

                if (overlap === 0) {
                    return false;
                } else if (overlap < minOverlap) {
                    minOverlap = overlap;
                    //overlapAxis = normal;
                }
            }

            return true;
        },
        circlePoint = [Vector.setUp(0, 0)],
        shortestPointNormal = Vector.setUp(0, 0),
        polyCircleCollision = function (polygon, circle) {
            const radiusSquared = Math.pow(circle.radius, 2);
            let normal = null,
                x = 0,
                overlap = 0,
                overlapAxis = null,
                minOverlap = Infinity,
                point = null,
                distanceSquared = 0,
                shortestSquared = Infinity,
                shortestPoint = -1;

            circlePoint[0].setXYZ(circle.x, circle.y);

            for (x = 0; x < polygon.normals.length; x++) {
                normal = polygon.normals[x];

                overlap = checkSeparatingAxis(normal, polygon.points, circlePoint, circle.radius);

                if (overlap === 0) {
                    return false;
                } else if (overlap < minOverlap) {
                    minOverlap = overlap;
                    //overlapAxis = normal;
                }
            }

            //If we're still here we check the points
            for (x = 0; x < polygon.points.length; x++) {
                point = polygon.points[x];
                distanceSquared = Math.pow(point.x - circle.x, 2) + Math.pow(point.y - circle.y, 2);

                if (distanceSquared < radiusSquared && distanceSquared < shortestSquared) {
                    shortestSquared = distanceSquared;
                    shortestPoint = point;
                }
            }

            shortestPointNormal.set(shortestPoint.x - circle.x, shortestPoint.y - circle.y);
            shortestPointNormal.normalize();

            overlap = checkSeparatingAxis(shortestPointNormal, polygon.points, circlePoint, circle.radius);

            if (overlap === 0) {
                return false;
            } else if (overlap < minOverlap) {
                minOverlap = overlap;
                //overlapAxis = shortestPointNormal;
            }

            return true;
        },

        polyPolyCollision = function (polygonA, polygonB) {
            let normal = null,
                x = 0,
                overlap = 0,
                overlapAxis = null,
                minOverlap = Infinity;

            for (x = 0; x < polygonA.normals.length; x++) {
                normal = polygonA.normals[x];

                overlap = checkSeparatingAxis(normal, polygonA.points, polygonB.points);

                if (overlap === 0) {
                    return false;
                } else if (overlap < minOverlap) {
                    minOverlap = overlap;
                    //overlapAxis = normal;
                }
            }

            for (x = 0; x < polygonB.normals.length; x++) {
                normal = polygonB.normals[x];

                overlap = checkSeparatingAxis(normal, polygonA.points, polygonB.points);

                if (overlap === 0) {
                    return false;
                } else if (overlap < minOverlap) {
                    minOverlap = overlap;
                    //overlapAxis = normal;
                }
            }

            //WHAT TO DO WITH MY EXTRA INFO ABOUT THE MIN OVERLAP!?
            return true;
        },

        checkSeparatingAxis = function (axis, pointsA, pointsB, radiusOfB) {
            const minMaxA = [Infinity, -Infinity], //min in [0], max in [1]
                minMaxB = [Infinity, -Infinity];

            getMinMax(minMaxA, axis, pointsA);

            if (radiusOfB) { //If we have a radius for B, B is a circle.
                getMinMax(minMaxB, axis, pointsB, radiusOfB);
            } else {
                getMinMax(minMaxB, axis, pointsB);
            }
            
            //If the max of A is greater min of B AND the max of B is greater than the min of A, OVERLAP!
            if (minMaxA[1] > minMaxB[0] && minMaxB[1] > minMaxA[0]) {
                //overlap!
                return Math.min(minMaxA[1] - minMaxB[0], minMaxB[1] - minMaxA[0]);
            } else {
                //no overlap!
                return 0;
            }

        },

        getMinMax = function (minMax, axis, points, radius) {
            let x = 0,
                currentMin = Infinity,
                currentMax = -Infinity,
                projection = 0,
                point = 0;

            for (x = 0; x < points.length; x++) {
                point = points[x];
                projection = point.dot(axis);

                if (projection < currentMin) {
                    currentMin = projection;
                    minMax[0] = projection;
                }
                
                if (projection > currentMax) {
                    currentMax = projection;
                    minMax[1] = projection;
                }
            }

            //If we have a radius we expand the projection because we're dealing with a circle.
            if (radius) {
                minMax[0] -= radius;
                minMax[1] += radius;
            }
        },

        collidesCircle = function (shape) {
            var pow = Math.pow;
            
            return this.aABB.collides(shape.aABB) && (
                ((shape.type === 'rectangle') && circleRectCollision(this, shape)) ||
                ((shape.type === 'circle')    && ((pow((this.x - shape.x), 2) + pow((this.y - shape.y), 2)) <= pow((this.radius + shape.radius), 2)))
            );
        },
        collidesRectangle = function (shape) {
            return this.aABB.collides(shape.aABB) && (
                (shape.type === 'rectangle') ||
                ((shape.type === 'circle') && circleRectCollision(shape, this))
            );
        },
        collidesPolygon = function (shape) {
            //Figure out how to do this collision!!!
            return this.aABB.collides(shape.aABB) && 
                ((shape.type === 'rectangle') && polyRectCollision(this, shape)) ||
                ((shape.type === 'circle') && polyCircleCollision(this, shape)) ||
                ((shape.type === 'polygon') && polyPolyCollision(this, shape));
        },
        collidesDefault = function () {
            return false;
        },
        CollisionShape = function (owner, definition, collisionType) {
            var regX = definition.regX,
                regY = definition.regY,
                width = definition.width || definition.radius * 2 || 0,
                height = definition.height || definition.radius * 2 || 0,
                radius = definition.radius || 0,
                type = null;
            
            this.owner = owner;
            this.points = null;
            this.shapePoints = null;
            this.type = type = definition.type || 'rectangle';
            this.normals = null;
            this.collisionType = collisionType;
            this.subType = '';

            // If this shape is recycled, the vectors will already be in place.
            if (!this.initialized) {
                this.initialized = true;
                Vector.assign(this, 'offset', 'offsetX', 'offsetY');
                Vector.assign(this, 'position', 'x', 'y');
                Vector.assign(this, 'size', 'width', 'height');
                this.aABB = AABB.setUp();
            }
            
            /**
             * Determines whether shapes collide.
             *
             * @method collides
             * @param shape {platypus.CollisionShape} The shape to check against for collision.
             * @return {Boolean} Whether the shapes collide.
             */
            if (type === 'circle') {
                this.collides = collidesCircle;
            } else if (type === 'rectangle') {
                this.collides = collidesRectangle;
            } else if (type === 'polygon') {
                let p = 0,
                    minX = Infinity,
                    maxX = -Infinity,
                    minY = Infinity,
                    maxY = -Infinity;
                this.shapePoints = [];
                this.points = [];
                for (p = 0; p < definition.points.length; p++) {
                    const x = definition.points[p][0],
                        y = definition.points[p][1];

                    this.shapePoints[p] = Vector.setUp(x, y, 0);
                    this.points[p] = Vector.setUp(x + owner.x, y + owner.y, 0);
                    if (x < minX) {
                        minX = x;
                    }
                    if (x > maxX) {
                        maxX = x;
                    }

                    if (y < minY) {
                        minY = y;
                    }
                    if (y > maxY) {
                        maxY = y;
                    }
                }
                width = maxX - minX;
                height = maxY - minY;
                this.size.setXYZ(width, height);
                this.calculateNormals();
                this.collides = collidesPolygon;
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
     * Updates the shape to match another shape.
     *
     * @method updateAll
     * @param updateAll {platypus.CollisionShape} The shape to copy into this one.
     */
    proto.updateAll = function (shape) {
        this.owner = shape.owner;
        this.collisionType = shape.collisionType;
        this.type = shape.type;
        this.subType = shape.subType;
        this.offset.x = shape.offset.x;
        this.offset.y = shape.offset.y;
        this.position.x = shape.position.x;
        this.position.y = shape.position.y;
        this.size.x = shape.size.x;
        this.size.y = shape.size.y;
        this.radius = shape.radius;
        
        if (this.type === 'circle') {
            this.collides = collidesCircle;
        } else if (this.type === 'rectangle') {
            this.collides = collidesRectangle;
        } else if (this.type === 'polygon') {
            let p = 0,
                minX = Infinity,
                maxX = -Infinity,
                minY = Infinity,
                maxY = -Infinity,
                height = 0,
                width = 0;

            //recycle the old points
            for (p = 0; p < this.points.length; p++) {
                this.points[p].recycle();
                this.shapePoints[p].recycle();
            }

            //make new points and set width and height
            this.shapePoints = [];
            this.points = [];
            for (p = 0; p < shape.points.length; p++) {
                const x = shape.points[p][0],
                    y = shape.points[p][1];

                this.shapePoints[p] = Vector.setUp(x, y, 0);
                this.points[p] = Vector.setUp(x + this.position.x, y + this.position.y, 0);
                if (x < minX) {
                    minX = x;
                }
                if (x > maxX) {
                    maxX = x;
                }

                if (y < minY) {
                    minY = y;
                }
                if (y > maxY) {
                    maxY = y;
                }
            }
            width = maxX - minX;
            height = maxY - minY;
            this.size.setXYZ(width, height);

            //recycle the old normals
            for (p = 0; p < this.normals.length; p++) {
                this.normals[p].recycle();
            }
            this.normals = null;
            
            //make new normals
            this.calculateNormals();

            this.collides = collidesPolygon;
        } else {
            this.collides = collidesDefault;
        }

        this.aABB.setAll(this.x, this.y, this.width, this.height);
    };

    /**
     * Updates the normals for the faces of the polygon.
     *
     * @method calculateNormals
     */
    proto.calculateNormals = function () {
        let x = 0,
            y = 0,
            duplicate = false,
            normal = null,
            pA = null,
            pB = null;

        if (this.type !== 'polygon') {
            this.normals = null;
            return;
        }

        this.normals = [];
        // TML 2/15/21 - We use the shapePoints to calculate the normals. If we start rotating polygons, we can figure that out then.
        for (x = 0; x < this.shapePoints.length; x++) {
            pA = this.shapePoints[x];
            if (x === this.shapePoints.length - 1) {
                pB = this.shapePoints[0];
            } else {
                pB = this.shapePoints[x + 1];
            }
            
            //Creating the normal, rotating it by 90 degrees by swapping around the subtraction.
            normal = Vector.setUp(pB.y - pA.y, -(pB.x - pA.x));
            normal.normalize();

            duplicate = false;
            for (y = 0; y < this.normals.length; y++) {
                //If normals are the same, just opposite direction, we skip them because they are parallel and would produce the same separating axis.
                //TML 2/15/21 - Is this sufficient to catch all duplicates? Javascript math is sketchy!
                if ((normal.x === this.normals[y].x && normal.y === this.normals[y].y) ||
                    (-normal.x === this.normals[y].x && -normal.y === this.normals[y].y)) {
                    duplicate = true;
                    break;
                }
            }

            if (duplicate) {
                normal.recycle();
            } else {
                this.normals.push(normal);
            }
        }
    };


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

        if (this.points) {
            let c = 0; 
            for (c = 0; c < this.points.length; c++) {
                this.points[c].setXYZ(this.shapePoints[c].x + x, this.shapePoints[c].y + y)
            }
        }
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
     * Move the shape's x and y position.
     *
     * @method moveXY
     * @param x {number} The x position to which the shape should be moved.
     * @param y {number} The y position to which the shape should be moved.
     */
    proto.moveXY = function (x, y) {
        this.x = x;
        this.y = y;
        this.aABB.move(x, y);
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
     * Expresses whether this shape contains the given point.
     *
     * @method containsPoint
     * @param x {number} The x-axis value.
     * @param y {number} The y-axis value.
     * @return {boolean} Returns `true` if this shape contains the point.
     */
    proto.containsPoint = function (x, y) {
        var pow = Math.pow;

        return this.aABB.containsPoint(x, y) && (
            (this.type === 'rectangle') ||
            ((this.type === 'circle') && ((pow((this.x - x), 2) + pow((this.y - y), 2)) <= pow(this.radius, 2)))
        );
    };
    
    /**
    * Returns a JSON object describing the collision shape.
    *
    * @method toJSON
    * @return {Object} Returns a JSON definition that can be used to recreate the collision shape.
    **/
    proto.toJSON = function () {
        var json = {},
            width = this.size.width,
            height = this.size.height;

        if (width / 2 !== this.regX) {
            json.regX = this.regX;
        }
        if (height / 2 !== this.regY) {
            json.regY = this.regY;
        }
        if (this.offset.x !== ((width / 2) - this.regX)) {
            json.offsetX = this.offset.x;
        }
        if (this.offset.y !== ((height / 2) - this.regY)) {
            json.offsetY = this.offset.y;
        }
        if (this.type === 'circle') {
            json.radius = this.radius;
        } else {
            json.width = width;
            json.height = height;
        }
        json.type = this.type;

        return json;
    };

    /**
     * Returns an CollisionShape from cache or creates a new one if none are available.
     *
     * @method CollisionShape.setUp
     * @return {platypus.CollisionShape} The instantiated CollisionShape.
     */
    /**
     * Returns a CollisionShape back to the cache.
     *
     * @method CollisionShape.recycle
     * @param {platypus.CollisionShape} The CollisionShape to be recycled.
     */
    /**
     * Relinquishes properties of the CollisionShape and recycles it.
     *
     * @method recycle
     */
    recycle.add(CollisionShape, 'CollisionShape', CollisionShape, function () {
        let x = 0;
        for (x = 0; x < this.points.length; x++) {
            this.points[x].recycle();
            this.points[x] = null;

            this.shapePoints[x].recycle();
            this.shapePoints[x] = null;
        }
        this.points = null;
        this.shapePoints = null;
    }, true, config.dev);
    
    return CollisionShape;
}());