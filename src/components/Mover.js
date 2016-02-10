/**
 * This component handles entity motion via velocity and acceleration changes. This is useful for directional movement, gravity, bounce-back collision reactions, jumping, etc.
 * 
 * @namespace platypus.components
 * @class Mover
 * @uses platypus.Component
 */
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";
    
    var Vector = include('platypus.Vector'),
    tempVector = Vector.setUp(),
    updateMax   = function (delta, interim, goal, time) {
        if (delta && (interim !== goal)) {
            if (interim < goal) {
                //console.log("Up   - " + Math.min(interim + delta * time, goal));
                return Math.min(interim + delta * time, goal);
            } else {
                //console.log("Down - " + Math.max(interim - delta * time, goal));
                return Math.max(interim - delta * time, goal);
            }
        }
        
        return interim;
    },
    clampNumber = function (v, d) {
        var mIn = this.maxMagnitudeInterim = updateMax(this.maxMagnitudeDelta, this.maxMagnitudeInterim, this.maxMagnitude, d);
        
        if (v.magnitude() > mIn) {
            v.normalize().multiply(mIn);
        }
    },
    clampObject = function (v, d) {
        var max = this.maxMagnitude,
            mD  = this.maxMagnitudeDelta,
            mIn = this.maxMagnitudeInterim;

        mIn.up    = updateMax(mD, mIn.up,    max.up,    d);
        mIn.right = updateMax(mD, mIn.right, max.right, d);
        mIn.down  = updateMax(mD, mIn.down,  max.down,  d);
        mIn.left  = updateMax(mD, mIn.left,  max.left,  d);
        
        if (v.x > 0) {
            if (v.x > mIn.right) {
                v.x = mIn.right;
            }
        } else if (v.x < 0) {
            if (v.x < -mIn.left) {
                v.x = -mIn.left;
            }
        }

        if (v.y > 0) {
            if (v.y > mIn.down) {
                v.y = mIn.down;
            }
        } else if (v.y < 0) {
            if (v.y < -mIn.up) {
                v.y = -mIn.up;
            }
        }
    };
    
    return platypus.createComponentClass({
        
        id: 'Mover',

        properties: {
            /** This is a normalized vector describing the direction the ground should face away from the entity.
             * 
             * @property ground
             * @type Array|Vector
             * @default Vector(0, 1)
             */
            ground: [0, 1]
        },
        
        publicProperties: {
            /**
             * A list of key/value pairs describing vectors or vector-like objects describing acceleration and velocity on the entity. See the ["Motion"]("Motion"%20Component.html) component for properties.
             * 
             * @property movers
             * @type Array
             * @default []
             */
            movers: [],
            
            /**
             * If specified, the property adds gravity motion to the entity.
             * 
             * @property gravity
             * @type number|Array|Vector
             * @default: 0
             */
            gravity: 0,
            
            /**
             * If specified, the property adds jumping motion to the entity.
             * 
             * @property jump
             * @type number|Array|Vector
             * @default: 0
             */
            jump: 0,
            
            /**
             * If specified, the property adds velocity to the entity.
             * 
             * @property speed
             * @type number|Array|Vector
             * @default: 0
             */
            speed: 0,
            
            /**
             * This property determines how quickly velocity is dampened when the entity is not in a "grounded" state. This should be a value between 1 (no motion) and 0 (no drag).
             * 
             * @property drag
             * @type number
             * @default 0.01
             */
            drag: 0.01,
            
            /**
             * This property determines how quickly velocity is dampened when the entity is in a "grounded" state. This should be a value between 1 (no motion) and 0 (no friction).
             * 
             * @property friction
             * @type number
             * @default 0.06
             */
            friction: 0.06,
            
            /**
             * This property determines the maximum amount of velocity this entity can maintain. This can be a number or an object describing maximum velocity in a particular direction. For example:
             *     
             *     {
             *         "up": 8,
             *         "right": 12,
             *         "down": 0.4,
             *         "left": 12
             *     }
             * 
             * @property maxMagnitude
             * @type number|Object
             * @default Infinity
             */
            maxMagnitude: Infinity,
            
            /**
             * This property determines the rate of change to new maximum amount of velocities.
             * 
             * @property maxMagnitudeDelta
             * @type number
             * @default 0
             */
            maxMagnitudeDelta: 0
        },
        
        constructor: function (definition) {
            var maxMagnitude = Infinity,
                max = this.maxMagnitude;
            
            platypus.Vector.assign(this.owner, 'position',  'x',  'y',  'z');
            platypus.Vector.assign(this.owner, 'velocity', 'dx', 'dy', 'dz');

            this.position = this.owner.position;
            this.velocity = this.owner.velocity;
            this.lastVelocity = Vector.setUp(this.velocity);
            
            this.pause = false;
            
            // Copy movers so we're not re-using mover definitions
            this.moversCopy = this.movers;
            this.movers = Array.setUp();

            this.ground = Vector.setUp(this.ground);
            
            Object.defineProperty(this.owner, "maxMagnitude", {
                get: function () {
                    return maxMagnitude;
                },
                set: function (max) {
                    if (typeof max === 'number') {
                        this.clamp = clampNumber;
                        maxMagnitude = max;
                        if (!this.maxMagnitudeDelta) {
                            this.maxMagnitudeInterim = max;
                        }
                    } else {
                        this.clamp = clampObject;
                        if (typeof maxMagnitude === 'number') {
                            maxMagnitude = {
                                up: maxMagnitude,
                                right: maxMagnitude,
                                down: maxMagnitude,
                                left: maxMagnitude
                            }
                        }
                        if (typeof max.up === 'number') {
                            maxMagnitude.up = max.up;
                        }
                        if (typeof max.right === 'number') {
                            maxMagnitude.right = max.right;
                        }
                        if (typeof max.down === 'number') {
                            maxMagnitude.down = max.down;
                        }
                        if (typeof max.left === 'number') {
                            maxMagnitude.left = max.left;
                        }

                        if (typeof this.maxMagnitudeInterim === 'number') {
                            if (this.maxMagnitudeDelta) {
                                this.maxMagnitudeInterim = {
                                    up:    this.maxMagnitudeInterim,
                                    right: this.maxMagnitudeInterim,
                                    down:  this.maxMagnitudeInterim,
                                    left:  this.maxMagnitudeInterim
                                };
                            } else {
                                this.maxMagnitudeInterim = {
                                    up:    maxMagnitude.up,
                                    right: maxMagnitude.right,
                                    down:  maxMagnitude.down,
                                    left:  maxMagnitude.left
                                };
                            }
                        } else if (!this.maxMagnitudeDelta) {
                            this.maxMagnitudeInterim.up    = maxMagnitude.up;
                            this.maxMagnitudeInterim.right = maxMagnitude.right;
                            this.maxMagnitudeInterim.down  = maxMagnitude.down;
                            this.maxMagnitudeInterim.left  = maxMagnitude.left;
                        }
                    }
                }.bind(this)
            });
            this.maxMagnitudeInterim = 0;
            this.maxMagnitude = max;
        },

        events: {
            /**
             * When a ["Motion"]("Motion"%20Component.html) component is added, this component adds it to its list of movers.
             * 
             * @method 'component-added'
             * @param component {"Motion" Component} The motion to add as a mover on this entity.
             */
            "component-added": function (component) {
                if (component.type === 'Motion') {
                    this.movers.push(component);
                }
            },
            
            /**
             * When a ["Motion"]("Motion"%20Component.html) component is removed, this component removes it from its list of movers.
             * 
             * @method 'component-removed'
             * @param component {"Motion" Component} The motion to remove as a mover from this entity.
             */
            "component-removed": function (component) {
                var i = 0;
                
                if (component.type === 'Motion') {
                    i = this.movers.indexOf(component);
                    if (i >= 0) {
                        this.movers.greenSplice(i);
                    }
                }
            },
            
            /**
             * This component listens for a "load" event before setting up its mover list.
             * 
             * @method 'load'
             */
            "load": function () {
                var i = 0,
                    movs = this.moversCopy;
                
                delete this.moversCopy;
                for (i = 0; i < movs.length; i++) {
                    this.addMover(movs[i]);
                }
                
                this.externalForces = this.addMover({
                    velocity: [0, 0, 0],
                    orient: false
                }).velocity;
                
                // Set up speed property if supplied.
                if (this.speed) {
                    if (!isNaN(this.speed)) {
                        this.speed = [this.speed, 0, 0];
                    }
                    this.speed = this.addMover({
                        velocity: this.speed,
                        controlState: "moving"
                    }).velocity;
                }

                // Set up gravity property if supplied.
                if (this.gravity) {
                    if (!isNaN(this.gravity)) {
                        this.gravity = [0, this.gravity, 0];
                    }
                    this.gravity = this.addMover({
                        acceleration: this.gravity,
                        orient: false,
                        aliases: {
                            "gravitate": "control-acceleration"
                        }
                    }).acceleration;
                }
                
                // Set up jump property if supplied.
                if (this.jump) {
                    if (!isNaN(this.jump)) {
                        this.jump = [0, this.jump, 0];
                    }
                    this.jump = this.addMover({
                        velocity: this.jump,
                        instant: true,
                        controlState: "grounded",
                        state: "jumping",
                        instantSuccess: "just-jumped",
                        instantDecay: 0.2,
                        aliases: {
                            "jump": "instant-motion"
                        }
                    }).instant;
                }
            },
            
            /**
             * On each "handle-movement" event, this component moves the entity according to the list of movers on the entity.
             * 
             * @method 'handle-movement'
             * @param tick {Object}
             * @param tick.delta {number} The amount of time in milliseconds since the last tick.
             * @since 0.6.8
             */
            "handle-movement": function (tick) {
                var delta    = tick.delta,
                    m        = null,
                    vect     = null,
                    velocity = this.velocity,
                    position = this.position,
                    movers   = this.movers,
                    i        = movers.length;
                
                if (this.owner.state.paused || this.paused) {
                    return;
                }
                
                if (!velocity.equals(this.lastVelocity, 2)) {
                    this.externalForces.addVector(velocity).subtractVector(this.lastVelocity);
                }
                
                velocity.set(0, 0, 0);
                
                while (i--) {
                    m = movers[i].update(delta);
                    if (m) {
                        if (this.grounded) { // put this in here to match earlier behavior
                            if (movers[i].friction !== -1) {
                                m.multiply(1 - movers[i].friction)
                            } else {
                                m.multiply(1 - this.friction);
                            }
                        } else {
                            if (movers[i].drag !== -1) {
                                m.multiply(1 - movers[i].drag);
                            } else {
                                m.multiply(1 - this.drag);
                            }
                        }
                        velocity.add(m);
                    }
                }
                
                // Finally, add aggregated velocity to the position
/*                if (this.grounded) {
                    velocity.multiply(this.friction);
                } else {
                    velocity.multiply(this.drag);
                }*/
                this.clamp(velocity, delta);
                this.lastVelocity.set(velocity);
                
                vect = Vector.setUp(velocity).multiply(delta);
                position.add(vect);
                vect.recycle();
                
                if (this.grounded !== this.owner.state.grounded) {
                    this.owner.state.grounded = this.grounded;
                }
                
                this.grounded = false;
            },
            
            /**
             * On receiving this message, this component stops velocity in the direction of the collision and sets "grounded" to `true` if colliding with the ground.
             * 
             * @method 'hit-solid'
             * @param collisionInfo {Object}
             * @param collisionInfo.direction {platypus.Vector} The direction of collision from the entity's position.
             */
            "hit-solid": function (collisionInfo) {
                var i = 0,
                    m = null,
                    s = 0,
                    v = tempVector;
                
                if (collisionInfo.direction.dot(this.ground) > 0) {
                    this.grounded = true;
                }
                
                for (i = 0; i < this.movers.length; i++) {
                    m = this.movers[i];
                    if (m.stopOnCollision) {
                        s = m.velocity.scalarProjection(collisionInfo.direction);
                        if (v.set(collisionInfo.direction).normalize().multiply(s).dot(m.velocity) > 0) {
                            m.velocity.subtractVector(v);
                        }
                    }
                }
            },
            
            /**
             * Update mover properties.
             * 
             * @method 'set-mover'
             * @param mover {Object}
             * @param [mover.maxMagnitude] {Number|Object} New maximums for magnitude.
             * @param [mover.magnitude] {Number} Delta for the change in maximums.
             * @since 0.6.8
             */
            "set-mover": function (mover) {
                if (typeof mover.maxMagnitudeDelta === 'number') {
                    this.maxMagnitudeDelta = mover.maxMagnitudeDelta;
                }
                
                if (mover.maxMagnitude) {
                    this.maxMagnitude = mover.maxMagnitude;
                }
            },
            
            /**
             * Stops all movement on the Entity.
             * 
             * @method 'pause-movment'
             * @since 0.6.8
             */
            "pause-movement": function () {
                this.paused = true;
            },
            
            /**
             * Unpauses all movement on the Entity.
             * 
             * @method 'unpause-movment'
             * @since 0.6.8
             */
            "unpause-movement": function () {
                this.paused = false;
            }
        },
        
        methods: {
            destroy: function () {
                var i = 0,
                    max = this.maxMagnitude;
                
                for (i = this.movers.length - 1; i >= 0; i--) {
                    this.removeMover(this.movers[i]);
                }
                this.movers.recycle();
                this.ground.recycle();
                this.lastVelocity.recycle();
                
                delete this.owner.maxMagnitude; // remove property handlers
                this.owner.maxMagnitude = max;
            }
        },
        
        publicMethods: {
            /**
             * This method adds a mover to the entity in the form of a ["Motion"]("Motion"%20Component.html) component definition.
             * 
             * @method addMover
             * @param mover {Object} For motion definition properties, see the ["Motion"]("Motion"%20Component.html) component.
             * @return motion {"Motion" Component}
             */
            addMover: function (mover) {
                var m = this.owner.addComponent(new platypus.components.Motion(this.owner, mover));

                return m;
            },
            
            /**
             * This method removes a mover from the entity.
             * 
             * @method removeMover
             * @param motion {"Motion" Component}
             */
            removeMover: function (m) {
                this.owner.removeComponent(m);
            }
        }
    });
}());