/* global platypus */
import {arrayCache, greenSplice} from '../utils/array.js';
import Vector from '../Vector.js';
import createComponentClass from '../factory.js';

var tempVector = Vector.setUp(),
    updateMax   = function (delta, interim, goal, time) {
        if (delta && (interim !== goal)) {
            if (interim < goal) {
                return Math.min(interim + delta * time, goal);
            } else {
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
    
export default createComponentClass(/** @lends platypus.components.Mover.prototype */{
    
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
        maxMagnitudeDelta: 0,
        
        /**
         * This property determines whether orientation changes should apply external velocities from pre-change momentum.
         *
         * @property reorientVelocities
         * @type Boolean
         * @default true
         */
        reorientVelocities: true
    },
    
    /**
     * This component handles entity motion via velocity and acceleration changes. This is useful for directional movement, gravity, bounce-back collision reactions, jumping, etc.
     *
     * @memberof platypus.components
     * @uses platypus.Component
     * @constructs
     * @listens platypus.Entity#component-added
     * @listens platypus.Entity#component-removed
     * @listens platypus.Entity#handle-movement
     * @listens platypus.Entity#handle-post-collision-logic
     * @listens platypus.Entity#hit-solid
     * @listens platypus.Entity#load
     * @listens platypus.Entity#pause-movment
     * @listens platypus.Entity#orientation-updated
     * @listens platypus.Entity#set-mover
     * @listens platypus.Entity#unpause-movment
     */
    initialize: function () {
        var maxMagnitude = Infinity,
            max = this.maxMagnitude,
            thisState = this.owner.state;
        
        Vector.assign(this.owner, 'position',  'x',  'y',  'z');
        Vector.assign(this.owner, 'velocity', 'dx', 'dy', 'dz');

        this.position = this.owner.position;
        this.velocity = this.owner.velocity;
        this.lastVelocity = Vector.setUp(this.velocity);
        this.collision = null;
        
        this.pause = false;
        
        // Copy movers so we're not re-using mover definitions
        this.moversCopy = this.movers;
        this.movers = arrayCache.setUp();

        this.velocityChanges = arrayCache.setUp();
        this.velocityDirections = arrayCache.setUp();

        this.ground = Vector.setUp(this.ground);
        
        this.state = thisState;
        thisState.set('grounded', false);
        
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
                        };
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
                                up: this.maxMagnitudeInterim,
                                right: this.maxMagnitudeInterim,
                                down: this.maxMagnitudeInterim,
                                left: this.maxMagnitudeInterim
                            };
                        } else {
                            this.maxMagnitudeInterim = {
                                up: maxMagnitude.up,
                                right: maxMagnitude.right,
                                down: maxMagnitude.down,
                                left: maxMagnitude.left
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
        "component-added": function (component) {
            if (component.type === 'Motion') {
                this.movers.push(component);
            }
        },
        
        "component-removed": function (component) {
            var i = 0;
            
            if (component.type === 'Motion') {
                i = this.movers.indexOf(component);
                if (i >= 0) {
                    greenSplice(this.movers, i);
                }
            }
        },
        
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
        
        "handle-movement": function (tick) {
            var delta    = tick.delta,
                m        = null,
                thisState = this.state,
                vect     = null,
                velocity = this.velocity,
                position = this.position,
                movers   = this.movers,
                i        = movers.length;
            
            if (thisState.get('paused') || this.paused) {
                return;
            }
            
            if (!velocity.equals(this.lastVelocity, 2)) {
                this.externalForces.addVector(velocity).subtractVector(this.lastVelocity);
            }
            
            velocity.setXYZ(0, 0, 0);
            
            while (i--) {
                m = movers[i].update(delta);
                if (m) {
                    if (this.grounded) { // put this in here to match earlier behavior
                        if (movers[i].friction !== -1) {
                            m.multiply(1 - movers[i].friction);
                        } else {
                            m.multiply(1 - this.friction);
                        }
                    } else if (movers[i].drag !== -1) {
                        m.multiply(1 - movers[i].drag);
                    } else {
                        m.multiply(1 - this.drag);
                    }
                    velocity.add(m);
                }
            }

            this.clamp(velocity, delta);
            this.lastVelocity.setVector(velocity);
            
            vect = Vector.setUp(velocity).multiply(delta);
            position.add(vect);
            vect.recycle();
            
            thisState.set('grounded', this.grounded);
            
            this.grounded = false;
        },
        
        /**
         * On receiving this message, this component stops all velocities along the axis of the collision direction and sets "grounded" to `true` if colliding with the ground.
         *
         * @event platypus.Entity#hit-solid
         * @param collisionInfo {Object}
         * @param collisionInfo.direction {platypus.Vector} The direction of collision from the entity's position.
         */
        "hit-solid": function (collisionInfo) {
            var s = 0,
                e = 0,
                entityV = collisionInfo.entity && collisionInfo.entity.velocity,
                direction = collisionInfo.direction,
                add = true,
                vc = this.velocityChanges,
                vd = this.velocityDirections,
                i = vc.length;
            
            if (direction.dot(this.ground) > 0) {
                this.grounded = true;
            }

            s = this.velocity.scalarProjection(direction);
            if (s > 0) {
                if (entityV) {
                    e = Math.max(entityV.scalarProjection(direction), 0);
                    if (e < s) {
                        s = e;
                    } else {
                        s = 0;
                    }
                } else {
                    s = 0;
                }
                
                while (i--) {
                    if ((s < vc[i]) && (vd[i].dot(direction) > 0)) {
                        vc[i] = s;
                        vd[i].setVector(direction);
                        add = false;
                        break;
                    }
                }
                
                if (add) {
                    vc.push(s);
                    vd.push(Vector.setUp(direction));
                }
            }
        },
        
        "handle-post-collision-logic": function () {
            var direction = null,
                ms = this.movers,
                vc = this.velocityChanges,
                vd = this.velocityDirections,
                i = vc.length,
                j = ms.length,
                m = null,
                s = 0,
                sdi = 0,
                soc = null,
                v = tempVector;
            
            if (i) {
                soc = arrayCache.setUp();
                
                while (j--) {
                    m = ms[j];
                    if (m.stopOnCollision) {
                        soc.push(m);
                    }
                }
                
                while (i--) {
                    direction = vd[i];
                    s = vc[i];
                    j = soc.length;
                    sdi = s / j;
                    while (j--) {
                        m = soc[j];
                        v.setVector(direction).normalize().multiply(sdi - m.velocity.scalarProjection(direction));
                        m.velocity.add(v);
                    }
                    direction.recycle();
                }
                
                vc.length = 0;
                vd.length = 0;
                arrayCache.recycle(soc);
            }
        },
        
        /**
         * Update mover properties.
         *
         * @event platypus.Entity#set-mover
         * @param mover {Object}
         * @param [mover.maxMagnitude] {Number|Object} New maximums for magnitude.
         * @param [mover.magnitude] {Number} Delta for the change in maximums.
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
         * @event platypus.Entity#pause-movment
         */
        "pause-movement": function () {
            this.paused = true;
        },
        
        /**
         * Unpauses all movement on the Entity.
         *
         * @event platypus.Entity#unpause-movment
         */
        "unpause-movement": function () {
            this.paused = false;
        },
        
        "orientation-updated": function (matrix) {
            if (!this.reorientVelocities) {
                this.lastVelocity.multiply(matrix);
            }
        }
    },
    
    methods: {
        destroy: function () {
            var i = 0,
                max = this.maxMagnitude;
            
            for (i = this.movers.length - 1; i >= 0; i--) {
                this.removeMover(this.movers[i]);
            }
            arrayCache.recycle(this.movers);
            
            this.ground.recycle();
            this.lastVelocity.recycle();
            arrayCache.recycle(this.velocityChanges);
            arrayCache.recycle(this.velocityDirections);
            
            delete this.owner.maxMagnitude; // remove property handlers
            this.owner.maxMagnitude = max;
            
            this.state = null;
        }
    },
    
    publicMethods: {
        /**
         * This method adds a mover to the entity in the form of a ["Motion"]("Motion"%20Component.html) component definition.
         *
         * @method platypus.components.Mover#addMover
         * @param mover {Object} For motion definition properties, see the ["Motion"]("Motion"%20Component.html) component.
         * @return motion {Motion}
         */
        addMover: function (mover) {
            var m = this.owner.addComponent(new platypus.components.Motion(this.owner, mover));

            return m;
        },
        
        /**
         * This method removes a mover from the entity.
         *
         * @method platypus.components.Mover#removeMover
         * @param motion {Motion}
         */
        removeMover: function (m) {
            this.owner.removeComponent(m);
        }
    }
});
