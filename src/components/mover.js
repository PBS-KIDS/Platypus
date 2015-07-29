/**
 * This component handles entity motion via velocity and acceleration changes. This is useful for directional movement, gravity, bounce-back collision reactions, jumping, etc.
 * 
 * @class "Mover" Component
 * @uses Component
 */
// Requires: ["Motion", "../Vector.js"]
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";
    
    var tempVector = new platypus.Vector();
    
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
             * This property determines how quickly velocity is dampened when the entity is not in a "grounded" state. This should be a value between 0 (no motion) and 1 (no drag).
             * 
             * @property drag
             * @type number
             * @default 0.99
             */
            drag: 0.99,
            
            /**
             * This property determines how quickly velocity is dampened when the entity is in a "grounded" state. This should be a value between 0 (no motion) and 1 (no friction).
             * 
             * @property friction
             * @type number
             * @default 0.94
             */
            friction: 0.94,
            
            /**
             * This property determines the maximum amount of velocity this entity can maintain.
             * 
             * @property maxMagnitude
             * @type number
             * @default Infinity
             */
            maxMagnitude: Infinity
        },
        
        constructor: function (definition) {
            platypus.Vector.assign(this.owner, 'position',  'x',  'y',  'z');
            platypus.Vector.assign(this.owner, 'velocity', 'dx', 'dy', 'dz');

            this.position = this.owner.position;
            this.velocity = this.owner.velocity;
            
            // Copy movers so we're not re-using mover definitions
            this.moversCopy = this.movers;
            this.movers = [];

            this.ground = new platypus.Vector(this.ground);
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
                    for (i = 0; i < this.movers.length; i++) {
                        if (component === this.movers[i]) {
                            this.movers.splice(i, 1);
                            break;
                        }
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
                
                // Set up speed property if supplied.
                if (this.speed) {
                    if (!isNaN(this.speed)) {
                        this.speed = [this.speed, 0, 0];
                    }
                    this.speed = this.addMover({
                        vector: this.speed,
                        controlState: "moving"
                    }).vector;
                }

                // Set up gravity property if supplied.
                if (this.gravity) {
                    if (!isNaN(this.gravity)) {
                        this.gravity = [0, this.gravity, 0];
                    }
                    this.gravity = this.addMover({
                        vector: this.gravity,
                        orient: false,
                        accelerator: true,
                        event: "gravitate"
                    }).vector;
                }
                
                // Set up jump property if supplied.
                if (this.jump) {
                    if (!isNaN(this.jump)) {
                        this.jump = [0, this.jump, 0];
                    }
                    this.jump = this.addMover({
                        vector: this.jump,
                        accelerator: true,
                        controlState: "grounded",
                        state: "jumping",
                        instantEvent: "jump",
                        instantDecay: 0.2
                    }).vector;
                }
            },
            
            /**
             * On each "handle-logic" event, this component moves the entity according to the list of movers on the entity.
             * 
             * @method 'handle-logic'
             * @param tick {Object}
             * @param tick.delta {number} The amount of time in milliseconds since the last tick.
             */
            "handle-logic": function (tick) {
                var i = 0,
                    delta    = tick.delta,
                    vect     = tempVector,
                    velocity = this.velocity,
                    position = this.position;
                
                if (this.owner.state.paused) {
                    return;
                }
                
                for (i = 0; i < this.movers.length; i++) {
                    this.movers[i].update(velocity, position, delta, this.grounded);
                }
                
                // Finally, add aggregated velocity to the position
                if (this.grounded) {
                    velocity.multiply(this.friction);
                } else {
                    velocity.multiply(this.drag);
                }
                if (velocity.magnitude() > this.maxMagnitude) {
                    velocity.normalize().multiply(this.maxMagnitude);
                }
                vect.set(velocity).multiply(delta);
                position.add(vect);
                
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
             * @param collisionInfo.direction {Vector} The direction of collision from the entity's position.
             */
            "hit-solid": function (collisionInfo) {
                var s = this.velocity.scalarProjection(collisionInfo.direction),
                    v = tempVector;
                
                if (collisionInfo.direction.dot(this.ground) > 0) {
                    this.grounded = true;
                }
                
                if (v.set(collisionInfo.direction).normalize().multiply(s).dot(this.velocity) > 0) {
                    this.velocity.subtractVector(v);
                }
            }
        },
        
        methods: {
            destroy: function () {
                var i = 0;
                
                for (i = this.movers.length - 1; i >= 0; i--) {
                    this.removeMover(this.movers[i]);
                }
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
