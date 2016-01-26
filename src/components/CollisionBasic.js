/**
 * This component causes this entity to collide with other entities. It must be part of a collision group and will receive messages when colliding with other entities in the collision group.
 * 
 * Multiple collision components may be added to a single entity if distinct messages should be triggered for certain collision areas on the entity or if the soft collision area is a different shape from the solid collision area. Be aware that too many additional collision areas may adversely affect performance. 
 * 
 * @namespace platypus.components
 * @class CollisionBasic
 * @uses platypus.Component
 */
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";
    
    var AABB = include('platypus.AABB'),
        CollisionShape = include('platypus.CollisionShape'),
        Vector = include('platypus.Vector'),
        handleStuck = function (position, data, owner) {
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
                    owner.stuckWith = new Vector(data.thatShape.x, data.thatShape.y);
                }
            }
        },

        /**
         * On receiving a 'hit-by' message, custom messages are triggered on the entity corresponding with the component's `solidCollisions` and `softCollisions` key/value mappings.
         * 
         * @event *
         * @param collision {Object} A list of key/value pairs describing the collision.
         */
        entityBroadcast = function (event, solidOrSoft, collisionType) {
            if (typeof event === 'string') {
                return function (value) {
                    if (value.myType === collisionType) {
                        if (value.hitType === solidOrSoft) {
                            this.owner.triggerEvent(event, value);
                        }
                    }
                };
            } else if (Array.isArray(event)) {
                return function (value) {
                    var i = 0;
                    
                    if (value.myType === collisionType) {
                        if (value.hitType === solidOrSoft) {
                            for (i = 0; i < event.length; i++) {
                                this.owner.triggerEvent(event[i], value);
                            }
                        }
                    }
                };
            } else {
                return function (collisionInfo) {
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
                            }
                            if ((dy < 0) && event.top) {
                                this.owner.trigger(event.top, collisionInfo);
                            }
                            if ((dx > 0) && event.right) {
                                this.owner.trigger(event.right, collisionInfo);
                            }
                            if ((dx < 0) && event.left) {
                                this.owner.trigger(event.left, collisionInfo);
                            }
                            if (event.all) {
                                this.owner.trigger(event.all, collisionInfo);
                            }
                        }
                    }
                };
            }
        },
        setupCollisionFunctions = function (self, entity) {
            // This allows the same component type to be added multiple times.
            if (!entity.collisionFunctions) {
                entity.collisionFunctions = {};
                entity.getAABB = function (collisionType) {
                    var aabb = null,
                        key  = '';

                    if (!collisionType) {
                        aabb = entity.aabb = entity.aabb || new AABB();
                        aabb.reset();
                        for (key in entity.collisionFunctions) {
                            if (entity.collisionFunctions.hasOwnProperty(key)) {
                                aabb.include(entity.collisionFunctions[key].getAABB());
                            }
                        }
                        return aabb;
                    } else if (entity.collisionFunctions[collisionType]) {
                        return entity.collisionFunctions[collisionType].getAABB();
                    } else {
                        return null;
                    }
                };

                entity.getPreviousAABB = function (collisionType) {
                    if (entity.collisionFunctions[collisionType]) {
                        return entity.collisionFunctions[collisionType].getPreviousAABB();
                    } else {
                        return null;
                    }
                };

                entity.getShapes = function (collisionType) {
                    if (entity.collisionFunctions[collisionType]) {
                        return entity.collisionFunctions[collisionType].getShapes();
                    } else {
                        return null;
                    }
                };

                entity.getPrevShapes = function (collisionType) {
                    if (entity.collisionFunctions[collisionType]) {
                        return entity.collisionFunctions[collisionType].getPrevShapes();
                    } else {
                        return null;
                    }
                };

                entity.prepareCollision = function (x, y) {
                    var key = '';
                    
                    for (key in entity.collisionFunctions) {
                        if (entity.collisionFunctions.hasOwnProperty(key)) {
                            entity.collisionFunctions[key].prepareCollision(x, y);
                        }
                    }
                };

                entity.relocateEntity = function (vector, collisionData) {
                    var v = null;

                    if (collisionData.xCount) {
                        v = new Vector(0, 0, 0);
                        handleStuck(v, collisionData.getXEntry(0), entity);
                    }

                    if (collisionData.yCount) {
                        v = v || new Vector(0, 0, 0);
                        handleStuck(v, collisionData.getYEntry(0), entity);
                    }

                    entity.triggerEvent('relocate-entity', {position: vector, unstick: v});
                };

                entity.movePreviousX = function (x) {
                    var key = '';
                    
                    for (key in entity.collisionFunctions) {
                        if (entity.collisionFunctions.hasOwnProperty(key)) {
                            entity.collisionFunctions[key].movePreviousX(x);
                        }
                    }
                };

                entity.getCollisionTypes = function () {
                    return entity.collisionTypes;
                };

                entity.getSolidCollisions = function () {
                    return entity.solidCollisionMap;
                };
            }

            entity.collisionFunctions[self.collisionType] = {
                getAABB: function () {
                    return self.getAABB();
                },

                getPreviousAABB: function () {
                    return self.getPreviousAABB();
                },

                getShapes: function () {
                    return self.getShapes();
                },

                getPrevShapes: function () {
                    return self.getPrevShapes();
                },

                prepareCollision: function (x, y) {
                    self.prepareCollision(x, y);
                },

                movePreviousX: function (x) {
                    self.movePreviousX(x);
                }
            };

        };

    return platypus.createComponentClass({
        
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
        
        constructor: function (definition) {
            var x            = 0,
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
            
            this.aabb     = new AABB();
            this.prevAABB = new AABB();
            
            if (this.shapes) {
                shapes = this.shapes;
            } else {
                if (this.shapeType === 'circle') {
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
                        width:  (width  || 0) + marginLeft + marginRight,
                        height: (height || 0) + marginTop  + marginBottom,
                        type: this.shapeType
                    }];
                }
            }
            
            this.owner.collisionTypes = this.owner.collisionTypes || [];
            this.owner.collisionTypes.push(this.collisionType);
            
            this.shapes = [];
            this.prevShapes = [];
            this.entities = undefined;
            for (x = 0; x < shapes.length; x++) {
                this.shapes.push(new CollisionShape(this.owner, shapes[x], this.collisionType));
                this.prevShapes.push(new CollisionShape(this.owner, shapes[x], this.collisionType));
                this.prevAABB.include(this.prevShapes[x].getAABB());
                this.aabb.include(this.shapes[x].getAABB());
            }
            
            setupCollisionFunctions(this, this.owner);
            
            this.owner.solidCollisionMap = this.owner.solidCollisionMap || {};
            this.owner.solidCollisionMap[this.collisionType] = [];
            if (this.solidCollisions) {
                for (key in this.solidCollisions) {
                    if (this.solidCollisions.hasOwnProperty(key)) {
                        this.owner.solidCollisionMap[this.collisionType].push(key);
                        this.owner.collides = true; //informs HandlerCollision that this entity should be processed in the list of solid colliders.
                        if (this.solidCollisions[key]) { // To make sure it's not an empty string.
                            this.addEventListener('hit-by-' + key, entityBroadcast(this.solidCollisions[key], 'solid', this.collisionType));
                        }
                    }
                }
            }
    
            this.owner.softCollisionMap = this.owner.softCollisionMap || {};
            this.owner.softCollisionMap[this.collisionType] = [];
            if (this.softCollisions) {
                for (key in this.softCollisions) {
                    if (this.softCollisions.hasOwnProperty(key)) {
                        this.owner.softCollisionMap[this.collisionType].push(key);
                        if (this.softCollisions[key]) { // To make sure it's not an empty string.
                            this.addEventListener('hit-by-' + key, entityBroadcast(this.softCollisions[key], 'soft', this.collisionType));
                        }
                    }
                }
            }
            
            this.stuck = false;
        },
        
        events: {
            /**
             * On receiving this message, the component triggers `add-collision-entity` on the parent.
             * 
             * @method 'collide-on'
             */
            "collide-on": function (type) {
                /**
                 * On receiving 'collide-on', this message is triggered on the parent to turn on collision.
                 * 
                 * @event 'add-collision-entity'
                 * @param entity {platypus.Entity} The entity this component is attached to.
                 */
                if (!type || (type === this.collisionType)) {
                    this.owner.collisionTypes.union([this.collisionType]);
                    this.owner.parent.trigger('add-collision-entity', this.owner);
                    this.active = true;
                }
            },
            
            /**
             * On receiving this message, the component triggers `remove-collision-entity` on the parent.
             * 
             * @method 'collide-off'
             */
            "collide-off": function (type) {
                var index = 0;
                
                /**
                 * On receiving 'collide-off', this message is triggered on the parent to turn off collision.
                 * 
                 * @event 'remove-collision-entity'
                 * @param entity {platypus.Entity} The entity this component is attached to.
                 */
                if (!type || (type === this.collisionType)) {
                    this.owner.parent.trigger('remove-collision-entity', this.owner);
                    index = this.owner.collisionTypes.indexOf(this.collisionType);
                    if (index >= 0) {
                        this.owner.collisionTypes.splice(index, 1);
                    }
                    this.active = false;
                }

                if (this.owner.collisionTypes.length) {
                    this.owner.parent.trigger('add-collision-entity', this.owner);
                }
            },
            
            /**
             * This message causes the entity's x,y coordinates to update.
             * 
             * @method 'relocate-entity'
             * @param location.position {platypus.Vector|Object}
             * @param location.position.x {number} The new x coordinate.
             * @param location.position.y {number} The new y coordinate.
             * @param [location.relative=false] {boolean} Determines whether the provided x,y coordinates are relative to the entity's current position.
             */
            "relocate-entity": function (resp) {
                var unstick = resp.unstick,
                    um      = 0,
                    i       = 0;
                
                if (unstick) {
                    um = unstick.magnitude();
                }
                
                this.move = null;
                
                if (resp.relative) {
                    this.owner.position.set(this.owner.previousPosition).add(resp.position);
                } else {
                    this.owner.position.set(resp.position);
                }

                if (this.stuck) {
                    if (um > 0) {
                        this.owner.position.add(unstick);
                    } else {
                        this.stuck = false;
                    }
                }
                
                this.aabb.reset();
                for (i = 0; i < this.shapes.length; i++) {
                    this.shapes[i].update(this.owner.x, this.owner.y);
                    this.aabb.include(this.shapes[i].getAABB());
                }

                this.owner.previousPosition.set(this.owner.position);
                
                if (um > 0) { // to force check in all directions for ultimate stuck resolution (esp. for stationary entities)
                    if (!this.stuck) {
                        this.stuck = true;
                    }
                    this.move = this.owner.stuckWith.copy().add(-this.owner.x, -this.owner.y).normalize();
                }
            },
            
            /**
             * If the entity is stuck to another entity, this component tries to unstick the entity on each logic step.
             * 
             * @method 'handle-logic'
             */
            "handle-logic": function () {
                if (this.move) {
                    this.owner.position.add(this.move); // By trying to move into it, we should get pushed back out.
                }
                
                // Sets a flag to make sure this entity is checked against
                this.owner.checkCollision = true;
            },
            
            /**
             * Collision shapes are updated to reflect the new orientation when this message occurs.
             * 
             * @method 'orientation-updated'
             * @param matrix {Array} A 2D matrix describing the new orientation.
             */
            "orientation-updated": function (matrix) {
                var i = 0;
                
                if (!this.ignoreOrientation) {
                    for (i = 0; i < this.shapes.length; i++) {
                        this.shapes[i].multiply(matrix);
                    }
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
                var i          = 0,
                    tempShapes = this.prevShapes;
                
                this.owner.x = x;
                this.owner.y = y;
                
                this.prevShapes = this.shapes;
                this.shapes = tempShapes;
                
                this.prevAABB.set(this.aabb);
                this.aabb.reset();
                
                // update shapes
                for (i = 0; i < this.shapes.length; i++) {
                    this.shapes[i].update(this.owner.x, this.owner.y);
                    this.aabb.include(this.shapes[i].getAABB());
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
                var i = this.owner.collisionTypes.indexOf(this.collisionType);
                
                this.owner.parent.trigger('remove-collision-entity', this.owner);

                this.owner.collides = false;

                delete this.aabb;
                delete this.prevAABB;
                
                if (i >= 0) {
                    this.owner.collisionTypes.splice(i, 1);
                }
                if (this.owner.solidCollisionMap[this.collisionType]) {
                    this.owner.solidCollisionMap[this.collisionType].length = 0;
                    delete this.owner.solidCollisionMap[this.collisionType];
                }
                if (Object.keys(this.owner.solidCollisionMap).length > 0) {
                    this.owner.collides = true;
                }
                if (this.owner.softCollisionMap[this.collisionType]) {
                    this.owner.softCollisionMap[this.collisionType].length = 0;
                    delete this.owner.softCollisionMap[this.collisionType];
                }
                delete this.owner.collisionFunctions[this.collisionType];
                
                this.shapes.length = 0;
                this.prevShapes.length = 0;
                delete this.entities;

                if (this.owner.collisionTypes.length) {
                    this.owner.parent.trigger('add-collision-entity', this.owner);
                }
            }
        }
    });
}());
    
