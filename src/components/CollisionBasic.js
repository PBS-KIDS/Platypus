import {arrayCache, greenSplice} from '../utils/array.js';
import AABB from '../AABB.js';
import CollisionShape from '../CollisionShape.js';
import Data from '../Data.js';
import DataMap from '../DataMap.js';
import Vector from '../Vector.js';
import createComponentClass from '../factory.js';

const
    entityBroadcast = (function () {
        var stringBroadcast = function (event, collisionType, solidOrSoft, value) {
                if (value.myType === collisionType) {
                    if (value.hitType === solidOrSoft) {
                        this.owner.triggerEvent(event, value);
                    }
                }
            },
            arrayBroadcast = function (event, collisionType, solidOrSoft, value) {
                var i = 0;
                
                if (value.myType === collisionType) {
                    if (value.hitType === solidOrSoft) {
                        for (i = 0; i < event.length; i++) {
                            this.owner.triggerEvent(event[i], value);
                        }
                    }
                }
            },
            directionalBroadcast = function (event, collisionType, solidOrSoft, collisionInfo) {
                var dx = collisionInfo.x,
                    dy = collisionInfo.y;

                if (collisionInfo.entity && !(dx || dy)) {
                    dx = collisionInfo.entity.x - this.owner.x;
                    dy = collisionInfo.entity.y - this.owner.y;
                }

                if (collisionInfo.myType === collisionType) {
                    if (collisionInfo.hitType === solidOrSoft) {
                        if ((dy > 0) && event.bottom) {
                            this.owner.trigger(event.bottom, collisionInfo);
                        } else if ((dy < 0) && event.top) {
                            this.owner.trigger(event.top, collisionInfo);
                        }
                        if ((dx > 0) && event.right) {
                            this.owner.trigger(event.right, collisionInfo);
                        } else if ((dx < 0) && event.left) {
                            this.owner.trigger(event.left, collisionInfo);
                        }
                        if (event.all) {
                            this.owner.trigger(event.all, collisionInfo);
                        }
                    }
                }
            };
        
        return function (self, event, solidOrSoft) {
            if (typeof event === 'string') {
                return stringBroadcast.bind(self, event, self.collisionType, solidOrSoft);
            } else if (Array.isArray(event)) {
                return arrayBroadcast.bind(self, event, self.collisionType, solidOrSoft);
            } else {
                return directionalBroadcast.bind(self, event, self.collisionType, solidOrSoft);
            }
        };
    }()),
    setupCollisionFunctions = (function () {
        var entityGetAABB = function (aabb, colFuncs, collisionType) {
                var keys = colFuncs.keys,
                    i = keys.length,
                    funcs = null;

                if (!collisionType) {
                    aabb.reset();
                    while (i--) {
                        aabb.include(colFuncs.get(keys[i]).getAABB());
                    }
                    return aabb;
                } else {
                    funcs = colFuncs.get(collisionType);
                    if (funcs) {
                        return funcs.getAABB();
                    } else {
                        return null;
                    }
                }
            },
            entityGetPreviousAABB = function (colFuncs, collisionType) {
                var colFunc = colFuncs.get(collisionType);
                
                if (colFunc) {
                    return colFunc.getPreviousAABB();
                } else {
                    return null;
                }
            },
            entityGetShapes = function (colFuncs, collisionType) {
                var colFunc = colFuncs.get(collisionType);
                
                if (colFunc) {
                    return colFunc.getShapes();
                } else {
                    return null;
                }
            },
            entityGetPrevShapes = function (colFuncs, collisionType) {
                var colFunc = colFuncs.get(collisionType);
                
                if (colFunc) {
                    return colFunc.getPrevShapes();
                } else {
                    return null;
                }
            },
            entityPrepareCollision = function (colFuncs, x, y) {
                var keys = colFuncs.keys,
                    i = keys.length;
                
                while (i--) {
                    colFuncs.get(keys[i]).prepareCollision(x, y);
                }
            },
            entityRelocateEntity = (function () {
                var handleStuck = function (position, data, owner) {
                        var m = 0,
                            s = data.stuck;

                        if (s) {
                            m = position.magnitude();
                            if (data.thatShape.owner && (Math.abs(s) > 1)) {
                                s *= 0.05;
                            }
                            if (!m || (m > Math.abs(s))) {
                                if (data.vector.x) {
                                    position.x = s;
                                    position.y = 0;
                                }
                                if (data.vector.y) {
                                    position.x = 0;
                                    position.y = s;
                                }
                                if (owner.stuckWith) {
                                    owner.stuckWith.recycle();
                                }
                                owner.stuckWith = Vector.setUp(data.thatShape.x, data.thatShape.y);
                            }
                        }
                    },
                    message = {
                        position: null,
                        unstick: null
                    };
                
                return function (vector, collisionData) {
                    var colX = collisionData.xData[0],
                        colY = collisionData.yData[0],
                        msg = message,
                        v = null;

                    if (colX) {
                        v = Vector.setUp(0, 0, 0);
                        handleStuck(v, colX, this);
                    }

                    if (colY) {
                        v = v || Vector.setUp(0, 0, 0);
                        handleStuck(v, colY, this);
                    }

                    msg.position = vector;
                    msg.unstick = v;

                    /**
                     * This message causes the entity's x,y coordinates to update. (Usually after collision checks, but can be used to avoid collision checks during logic handling.)
                     *
                     * @event platypus.Entity#relocate-entity
                     * @param location {Object|platypus.Vector} The new coordinates.
                     * @param [location.position] {platypus.Vector} If specified, this vector is used instead of the passed-in object as the location.
                     * @param [location.relative=false] {boolean} Determines whether the provided x,y coordinates are relative to the entity's current position.
                     * @param [location.unstick=null] {platypus.Vector} Where the entity should be moved to unstick from collision contact.
                     * @param [relative] If `location.relative` is not specified, this parameter is also checked.
                     */
                    this.triggerEvent('relocate-entity', msg);
                    
                    if (v) {
                        v.recycle();
                    }
                };
            }()),
            entityMovePreviousX = function (colFuncs, x) {
                var keys = colFuncs.keys,
                    i = keys.length;
                
                while (i--) {
                    colFuncs.get(keys[i]).movePreviousX(x);
                }
            },
            entityGetCollisionTypes = function () {
                return this.collisionTypes;
            },
            entityGetSolidCollisions = function () {
                return this.solidCollisionMap;
            },
            getAABB = function () {
                return this.getAABB();
            },
            getPreviousAABB = function () {
                return this.getPreviousAABB();
            },
            getShapes = function () {
                return this.getShapes();
            },
            getPrevShapes = function () {
                return this.getPrevShapes();
            },
            prepareCollision = function (x, y) {
                this.prepareCollision(x, y);
            },
            movePreviousX = function (x) {
                this.movePreviousX(x);
            };
        
        return function (self, entity) {
            var colFuncs = entity.collisionFunctions;
            
            // This allows the same component type to be added multiple times.
            if (!colFuncs) {
                colFuncs = entity.collisionFunctions = DataMap.setUp();
                entity.aabb = AABB.setUp();
                entity.getAABB = entityGetAABB.bind(entity, entity.aabb, colFuncs);
                entity.getPreviousAABB = entityGetPreviousAABB.bind(entity, colFuncs);
                entity.getShapes = entityGetShapes.bind(entity, colFuncs);
                entity.getPrevShapes = entityGetPrevShapes.bind(entity, colFuncs);
                entity.prepareCollision = entityPrepareCollision.bind(entity, colFuncs);
                entity.relocateEntity = entityRelocateEntity.bind(entity);
                entity.movePreviousX = entityMovePreviousX.bind(entity, colFuncs);
                entity.getCollisionTypes = entityGetCollisionTypes.bind(entity);
                entity.getSolidCollisions = entityGetSolidCollisions.bind(entity);
            }

            colFuncs.set(self.collisionType, Data.setUp(
                "getAABB", getAABB.bind(self),
                "getPreviousAABB", getPreviousAABB.bind(self),
                "getShapes", getShapes.bind(self),
                "getPrevShapes", getPrevShapes.bind(self),
                "prepareCollision", prepareCollision.bind(self),
                "movePreviousX", movePreviousX.bind(self)
            ));
        };
    }()),
    updateShapesFull = function (shapes, prevs, aabb, x, y) {
        let i = shapes.length;

        while (i--) {
            const shape = shapes[i];
            shape.updateAll(prevs[i]);
            shape.update(x, y);
            aabb.include(shape.aABB);
        }

        // Done with the full update; back to fast!
        this.updateShapes = updateShapesFast;
    },
    updateShapesFast = function (shapes, prevs, aabb, x, y) {
        let i = shapes.length;

        while (i--) {
            const shape = shapes[i];
            shape.update(x, y);
            aabb.include(shape.aABB);
        }
    };

export default createComponentClass(/** @lends platypus.components.CollisionBasic.prototype */{
        
    id: 'CollisionBasic',

    properties: {
        /**
         * Defines how this entity should be recognized by other colliding entities.
         *
         * @property collisionType
         * @type String
         * @default "none"
         */
        collisionType: "none",

        /**
         * Defines the type of colliding shape.
         *
         * @property shapeType
         * @type String
         * @default "rectangle"
         */
        shapeType: "rectangle",
        
        /**
         * Determines whether the collision area should transform on orientation changes.
         *
         * @property ignoreOrientation
         * @type boolean
         * @default false
         */
        ignoreOrientation: false,
        
        /**
         * Determines the x-axis center of the collision shape.
         *
         * @property regX
         * @type number
         * @default width / 2
         */
        regX: null,
        
        /**
         * Determines the y-axis center of the collision shape.
         *
         * @property regY
         * @type number
         * @default height / 2
         */
        regY: null,
        
        /**
         * Sets the width of the collision area in world coordinates.
         *
         * @property width
         * @type number
         * @default 0
         */
        width: 0,
        
        /**
         * Sets the height of the collision area in world coordinates.
         *
         * @property height
         * @type number
         * @default 0
         */
        height: 0,
        
        /**
         * Sets the radius of a circle collision area in world coordinates.
         *
         * @property radius
         * @type number
         * @default 0
         */
        radius: 0,
        
        /**
         * Determines which collision types this entity should consider soft, meaning this entity may pass through them, but triggers collision messages on doing so. Example:
         *
         *     {
         *         "water": "soaked",       // This triggers a "soaked" message on the entity when it passes over a "water" collision-type entity.
         *         "lava": ["burn", "ouch"] // This triggers both messages on the entity when it passes over a "lava" collision-type entity.
         *     }
         *
         * @property softCollisions
         * @type Object
         * @default null
         */
        softCollisions: null,
        
        /**
         * Determines which collision types this entity should consider solid, meaning this entity should not pass through them. Example:
         *
         *     {
         *         "boulder": "",                       // This specifies that this entity should not pass through other "boulder" collision-type entities.
         *         "diamond": "crack-up",               // This specifies that this entity should not pass through "diamond" collision-type entities, but if it touches one, it triggers a "crack-up" message on the entity.
         *         "marble": ["flip", "dance", "crawl"] // This specifies that this entity should not pass through "marble" collision-type entities, but if it touches one, it triggers all three specified messages on the entity.
         *     }
         *
         * @property solidCollisions
         * @type Object
         * @default null
         */
        solidCollisions: null,
        
        /**
         * This is the margin around the entity's width and height. This is an alternative method for specifying the collision shape in terms of the size of the entity. Can also pass in an object specifying the following parameters if the margins vary per side: top, bottom, left, and right.
         *
         * @property margin
         * @type number|Object
         * @default 0
         */
        margin: 0,
        
        /**
         * Defines one or more shapes to create the collision area. Defaults to a single shape with the width, height, regX, and regY properties of the entity if not specified. See [CollisionShape](CollisionShape.html) for the full list of properties.
         *
         * @property shapes
         * @type Array
         * @default null
         */
        shapes: null
    },
    
    publicProperties: {
        collisionDirty: false,

        /**
         * This property should be set to true if entity doesn't move for better optimization. This causes other entities to check against this entity, but this entity performs no checks of its own. Available on the entity as `entity.immobile`.
         *
         * @property immobile
         * @type boolean
         * @default false
         */
        immobile: false,

        /**
         * Whether this entity should be tested across its entire movement path. This is necessary for fast-moving entities, but shouldn't be used for others due to the processing overhead. Available on the entity as `entity.bullet`.
         *
         * @property bullet
         * @type boolean
         * @default false
         */
        bullet: false,
        
        /**
         * Whether the entity is only solid when being collided with from the top.
         *
         * @property jumpThrough
         * @type boolean
         * @default: false
         */
        jumpThrough: false
    },
    
    /**
     * This component causes this entity to collide with other entities. It must be part of a collision group and will receive messages when colliding with other entities in the collision group.
     *
     * Multiple collision components may be added to a single entity if distinct messages should be triggered for certain collision areas on the entity or if the soft collision area is a different shape from the solid collision area. Be aware that too many additional collision areas may adversely affect performance.
     * 
     * On receiving a 'hit-by' message, custom messages may be triggered on the entity corresponding with the component's `solidCollisions` and `softCollisions` key/value mappings.
     *
     * @memberof platypus.components
     * @uses platypus.Component
     * @constructs
     * @listens platypus.Entity#collide-off
     * @listens platypus.Entity#collide-on
     * @listens platypus.Entity#handle-logic
     * @listens platypus.Entity#hit-by-*
     * @listens platypus.Entity#orientation-updated
     * @listens platypus.Entity#relocate-entity
     * @fires platypus.Entity#add-collision-entity
     * @fires platypus.Entity#relocate-entity
     * @fires platypus.Entity#remove-collision-entity
     */
    initialize: function (definition) {
        var arr = null,
            x            = 0,
            key          = '',
            shapes       = null,
            regX         = this.regX,
            regY         = this.regY,
            width        = this.width,
            height       = this.height,
            radius       = this.radius,
            marginLeft   = 0,
            marginRight  = 0,
            marginTop    = 0,
            marginBottom = 0;

        if (typeof this.margin === "number") {
            marginLeft   = this.margin;
            marginRight  = this.margin;
            marginTop    = this.margin;
            marginBottom = this.margin;
        } else {
            marginLeft   = this.margin.left || 0;
            marginRight  = this.margin.right || 0;
            marginTop    = this.margin.top || 0;
            marginBottom = this.margin.bottom || 0;
        }
        
        if (regX === null) {
            regX = this.regX = width / 2;
        }
        
        if (regY === null) {
            regY = this.regY = height / 2;
        }
        
        Vector.assign(this.owner, 'position', 'x', 'y', 'z');
        Vector.assign(this.owner, 'previousPosition', 'previousX', 'previousY', 'previousZ');
        this.owner.previousX = this.owner.previousX || this.owner.x;
        this.owner.previousY = this.owner.previousY || this.owner.y;
        
        this.aabb     = AABB.setUp();
        this.prevAABB = AABB.setUp();
        
        if (this.shapes) {
            shapes = this.shapes;
        } else if (this.shapeType === 'circle') {
            radius = radius || (((width || 0) + (height || 0)) / 4);
            shapes = [{
                regX: (isNaN(regX) ? radius : regX) - (marginRight - marginLeft) / 2,
                regY: (isNaN(regY) ? radius : regY) - (marginBottom - marginTop) / 2,
                radius: radius,
                type: this.shapeType
            }];
        } else {
            shapes = [{
                //regX: (isNaN(regX) ? (width  || 0) / 2 : regX) - (marginRight  - marginLeft) / 2,
                //regY: (isNaN(regY) ? (height || 0) / 2 : regY) - (marginBottom - marginTop)  / 2,
                regX: (isNaN(regX) ? (width  || 0) / 2 : regX) + marginLeft,
                regY: (isNaN(regY) ? (height || 0) / 2 : regY) + marginTop,
                points: definition.points,
                width: (width  || 0) + marginLeft + marginRight,
                height: (height || 0) + marginTop  + marginBottom,
                type: this.shapeType
            }];
        }
        
        this.owner.collisionTypes = this.owner.collisionTypes || arrayCache.setUp();
        this.owner.collisionTypes.push(this.collisionType);
        
        this.shapes = arrayCache.setUp();
        this.prevShapes = arrayCache.setUp();
        this.entities = null;
        for (x = 0; x < shapes.length; x++) {
            this.shapes.push(CollisionShape.setUp(this.owner, shapes[x], this.collisionType));
            this.prevShapes.push(CollisionShape.setUp(this.owner, shapes[x], this.collisionType));
            this.prevAABB.include(this.prevShapes[x].aABB);
            this.aabb.include(this.shapes[x].aABB);
        }
        
        this.updateShapes = updateShapesFast;

        setupCollisionFunctions(this, this.owner);
        
        this.owner.solidCollisionMap = this.owner.solidCollisionMap || DataMap.setUp();
        arr = this.owner.solidCollisionMap.set(this.collisionType, arrayCache.setUp());
        if (this.solidCollisions) {
            for (key in this.solidCollisions) {
                if (this.solidCollisions.hasOwnProperty(key)) {
                    arr.push(key);
                    if (this.solidCollisions[key]) { // To make sure it's not an empty string.
                        this.addEventListener('hit-by-' + key, entityBroadcast(this, this.solidCollisions[key], 'solid'));
                    }
                }
            }
        }

        this.owner.softCollisionMap = this.owner.softCollisionMap || DataMap.setUp();
        arr = this.owner.softCollisionMap.set(this.collisionType, arrayCache.setUp());
        if (this.softCollisions) {
            for (key in this.softCollisions) {
                if (this.softCollisions.hasOwnProperty(key)) {
                    arr.push(key);
                    if (this.softCollisions[key]) { // To make sure it's not an empty string.
                        this.addEventListener('hit-by-' + key, entityBroadcast(this, this.softCollisions[key], 'soft'));
                    }
                }
            }
        }
        
        this.active = true;
        this.stuck = false;
    },
    
    events: {
        /**
         * On receiving this message, the component triggers `add-collision-entity` on the parent.
         *
         * @event platypus.Entity#collide-on
         * @param type {String} If specified, only collision components of this type are added to the collision list.
         */
        "collide-on": function (type) {
            var owner = this.owner,
                colType = this.collisionType,
                colTypes = owner.collisionTypes;
            
            /**
             * On receiving 'collide-on', this message is triggered on the parent to turn on collision.
             *
             * @event platypus.Entity#add-collision-entity
             * @param {platypus.Entity} entity The entity this component is attached to.
             */
            if (!this.active && ((typeof type !== 'string') || (type === colType))) {
                owner.parent.triggerEvent('remove-collision-entity', owner);
                if (colTypes.indexOf(colType) === -1) {
                    colTypes.push(colType);
                }
                owner.parent.triggerEvent('add-collision-entity', owner);
                this.active = true;
                this.collisionDirty = true;
            }
        },
        
        /**
         * On receiving this message, the component triggers `remove-collision-entity` on the parent.
         *
         * @event platypus.Entity#collide-off
         * @param type {String} If specified, only collision components of this type are removed from the collision list.
         */
        "collide-off": function (type) {
            var index = 0,
                owner = this.owner,
                parent = owner.parent,
                colType = this.collisionType,
                colTypes = owner.collisionTypes;
            
            /**
             * On receiving 'collide-off', this message is triggered on the parent to turn off collision.
             *
             * @event platypus.Entity#remove-collision-entity
             * @param {platypus.Entity} entity The entity this component is attached to.
             */
            if (this.active && ((typeof type !== 'string') || (type === colType))) {
                parent.triggerEvent('remove-collision-entity', owner);
                index = colTypes.indexOf(colType);
                if (index >= 0) {
                    greenSplice(colTypes, index);
                }
                this.active = false;

                if (colTypes.length) {
                    parent.triggerEvent('add-collision-entity', owner);
                }
            }
        },
        
        "relocate-entity": function (location, relative) {
            var unstick = location.unstick,
                um      = 0,
                i       = 0,
                x       = 0,
                y       = 0,
                aabb    = this.aabb,
                owner   = this.owner,
                shape   = null,
                shapes  = this.shapes,
                v = location.position || location;
            
            if (unstick) {
                um = unstick.magnitude();
            }
            
            if (this.move) {
                this.move.recycle();
                this.move = null;
            }
            
            if (location.relative || relative) {
                owner.position.setVector(owner.previousPosition).add(v);
            } else {
                owner.position.setVector(v);
            }

            if (this.stuck) {
                if (um > 0) {
                    owner.position.add(unstick);
                } else {
                    this.stuck = false;
                }
            }
            
            x = owner.x;
            y = owner.y;
            
            aabb.reset();
            i = shapes.length;
            while (i--) {
                shape = shapes[i];
                shape.update(x, y);
                aabb.include(shape.aABB);
            }

            owner.previousPosition.setVector(owner.position);
            
            if (um > 0) { // to force check in all directions for ultimate stuck resolution (esp. for stationary entities)
                if (!this.stuck) {
                    this.stuck = true;
                }
                this.move = owner.stuckWith.copy().add(-x, -y).normalize();
            }
        },
        
        "handle-logic": function () {
            if (this.move) {
                this.owner.position.add(this.move); // By trying to move into it, we should get pushed back out.
            }
        },
        
        "orientation-updated": function (matrix) {
            var i = 0;
            
            if (!this.ignoreOrientation) {
                for (i = 0; i < this.shapes.length; i++) {
                    this.shapes[i].multiply(matrix);
                }
                this.updateShapes = updateShapesFull;
                this.collisionDirty = true;
            }
        }
    },
    
    methods: {
        getAABB: function () {
            return this.aabb;
        },
        
        getPreviousAABB: function () {
            return this.prevAABB;
        },
        
        getShapes: function () {
            return this.shapes;
        },
        
        getPrevShapes: function () {
            return this.prevShapes;
        },
        
        prepareCollision: function (x, y) {
            const
                prevShapes = this.shapes,
                shapes     = this.prevShapes,
                aabb       = this.aabb;
            
            this.owner.x = x;
            this.owner.y = y;
            
            this.prevShapes = prevShapes;
            this.shapes = shapes;
            
            this.prevAABB.set(aabb);
            aabb.reset();
            
            this.updateShapes(shapes, prevShapes, aabb, x, y);
            
            if (this.collisionDirty) {
                this.collisionDirty = false;
            }
        },
        
        movePreviousX: function (x) {
            var i = 0;
            
            this.prevAABB.moveX(x);
            for (i = 0; i < this.prevShapes.length; i++) {
                this.prevShapes[i].setXWithEntityX(x);
            }
        },
        
        destroy: function () {
            var colFuncs = this.owner.collisionFunctions,
                collisionType = this.collisionType,
                i = this.owner.collisionTypes ? this.owner.collisionTypes.indexOf(collisionType) : -1,
                owner = this.owner;
            
            owner.parent.triggerEvent('remove-collision-entity', owner);

            this.aabb.recycle();
            delete this.aabb;
            this.prevAABB.recycle();
            delete this.prevAABB;
            
            if (i >= 0) {
                greenSplice(owner.collisionTypes, i);
            }
            
            if (owner.collisionTypes) {
                if (owner.solidCollisionMap.has(collisionType)) {
                    arrayCache.recycle(owner.solidCollisionMap.delete(collisionType));
                }
                if (owner.softCollisionMap.has(collisionType)) {
                    arrayCache.recycle(owner.softCollisionMap.delete(collisionType));
                }

                colFuncs.delete(collisionType).recycle();
            }
            
            i = this.shapes.length;
            while (i--) {
                this.shapes[i].recycle();
                this.prevShapes[i].recycle();
            }
            arrayCache.recycle(this.shapes);
            arrayCache.recycle(this.prevShapes);
            this.shapes = null;
            this.prevShapes = null;

            this.entities = null;

            if (owner.collisionTypes) {
                if (owner.collisionTypes.length) {
                    owner.parent.triggerEvent('add-collision-entity', owner);
                } else { //remove collision functions
                    colFuncs.recycle();
                    owner.collisionFunctions = null;
                    owner.solidCollisionMap.recycle();
                    owner.solidCollisionMap = null;
                    owner.softCollisionMap.recycle();
                    owner.softCollisionMap = null;
                    owner.aabb.recycle();
                    owner.aabb = null;
                    arrayCache.recycle(owner.collisionTypes);
                    owner.collisionTypes = null;
                }
            }
        }
    }
});
    
