/* global platypus */
import Vector from '../Vector.js';
import createComponentClass from '../factory.js';

export default (function () {
    var processDirection = function (direction) {
            return function (state) {
                this[direction] = !state || (state.pressed !== false);
            };
        },
        doNothing = function () {},
        rotate = {
            x: function (heading, lastHeading) {
                if (heading !== lastHeading) {
                    if (((heading > 180) && (lastHeading <= 180)) || ((heading <= 180) && (lastHeading > 180))) {
                        this.owner.triggerEvent('transform', 'vertical');
                    }
                }
            },
            y: function (heading, lastHeading) {
                if (heading !== lastHeading) {
                    if (((heading > 90 && heading <= 270) && (lastHeading <= 90 || lastHeading > 270)) || ((heading <= 90 || heading > 270) && (lastHeading > 90 && lastHeading <= 270))) {
                        this.owner.triggerEvent('transform', 'horizontal');
                    }
                }
            },
            z: function (heading, lastHeading) {
                if (heading !== lastHeading) {
                    this.owner.triggerEvent('replace-transform', 'rotate-' + heading);
                }
            }
        };
    
    return createComponentClass(/** @lends platypus.components.LogicDirectionalMovement.prototype */{
        id: 'LogicDirectionalMovement',
        
        properties: {
            /**
             * Defines the axis around which the entity should be transformed. Defaults to "y" for platforming behavior. Use "z" for top-down behavior.
             *
             * @property axis
             * @type String
             * @default "y"
             */
            axis: 'y',

            /**
             * Defines the distance in world units that the entity should be moved per millisecond.
             *
             * @property speed
             * @type Number
             * @default 0.3
             */
            speed: 0.3
        },
        
        /**
         * This component changes the [Motion](platypus.components.Motion.html) of an entity according to its current speed and heading. It accepts directional messages that can stand alone, or come from a mapped controller, in which case it checks the `pressed` value of the message before changing its course.
         *
         * @memberof platypus.components
         * @uses platypus.Component
         * @constructs
         * @listens platypus.Entity#accelerate
         * @listens platypus.Entity#component-added
         * @listens platypus.Entity#face
         * @listens platypus.Entity#handle-logic
         * @listens platypus.Entity#stop
         * @listens platypus.Entity#go-down
         * @listens platypus.Entity#go-south
         * @listens platypus.Entity#go-down-left
         * @listens platypus.Entity#go-southwest
         * @listens platypus.Entity#go-left
         * @listens platypus.Entity#go-west
         * @listens platypus.Entity#go-up-left
         * @listens platypus.Entity#go-northwest
         * @listens platypus.Entity#go-up
         * @listens platypus.Entity#go-north
         * @listens platypus.Entity#go-up-right
         * @listens platypus.Entity#go-northeast
         * @listens platypus.Entity#go-right
         * @listens platypus.Entity#go-east
         * @listens platypus.Entity#go-down-right
         * @listens platypus.Entity#go-southeast
         * @fires platypus.Entity#replace-transform
         * @fires platypus.Entity#transform
         */
        initialize: function () {
            var state = this.state = this.owner.state;
            
            if (typeof this.speed === 'number') {
                this.speed = [this.speed, 0, 0];
            }
            this.initialVector = Vector.setUp(this.speed);
            this.reorient = rotate[this.axis];
            if (!this.reorient) {
                this.reorient = doNothing;
            }
            
            this.moving = state.set('moving', false);
            this.left   = state.set('left', false);
            this.right  = state.set('right', false);
            this.up     = state.set('up', false);
            this.down   = state.set('down', false);

            this.upLeft = false;
            this.upRight = false;
            this.downLeft = false;
            this.downRight = false;
            
            this.heading = 0;
            this.owner.heading = this.owner.heading || 0;
        },
        events: {
            "component-added": function (component) {
                if (component === this) {
                    if (!this.owner.addMover) {
                        platypus.debug.warn('The "LogicDirectionalMovement" component requires a "Mover" component to function correctly.');
                        return;
                    }

                    this.direction = this.owner.addMover({
                        velocity: this.speed,
                        drag: 0,
                        friction: 0,
                        stopOnCollision: false,
                        orient: false,
                        aliases: {
                            "moving": "control-velocity"
                        }
                    }).velocity;
                    
                    if (this.owner.heading !== this.heading) {
                        this.direction.setVector(this.initialVector).rotate((this.owner.heading / 180) * Math.PI);
                        this.heading = this.owner.heading;
                    }
                    
                    this.owner.triggerEvent('moving', this.moving);
                }
            },
            
            "handle-logic": function () {
                var state = this.state,
                    up        = this.up        || this.upLeft || this.upRight,
                    upLeft    = this.upLeft    || (this.up   && this.left),
                    left      = this.left      || this.upLeft || this.downLeft,
                    downLeft  = this.downLeft  || (this.down && this.left),
                    down      = this.down      || this.downLeft || this.downRight,
                    downRight = this.downRight || (this.down && this.right),
                    right     = this.right     || this.upRight || this.downRight,
                    upRight   = this.upRight   || (this.up   && this.right);
                
                if ((left && right) || (up && down)) {
                    this.moving = false;
                } else if (upLeft) {
                    this.moving = true;
                    this.heading = 225;
                } else if (upRight) {
                    this.moving = true;
                    this.heading = 315;
                } else if (downLeft) {
                    this.moving = true;
                    this.heading = 135;
                } else if (downRight) {
                    this.moving = true;
                    this.heading = 45;
                } else if (left) {
                    this.moving = true;
                    this.heading = 180;
                } else if (right) {
                    this.moving = true;
                    this.heading = 0;
                } else if (up) {
                    this.moving = true;
                    this.heading = 270;
                } else if (down) {
                    this.moving = true;
                    this.heading = 90;
                } else {
                    this.moving = false;
                    
                    // This is to retain the entity's direction even if there is no movement. There's probably a better way to do this since this is a bit of a retrofit. - DDD
                    switch (this.heading) {
                    case 270:
                        up = true;
                        break;
                    case 90:
                        down = true;
                        break;
                    case 180:
                        left = true;
                        break;
                    case 225:
                        up = true;
                        left = true;
                        break;
                    case 315:
                        up = true;
                        right = true;
                        break;
                    case 135:
                        down = true;
                        left = true;
                        break;
                    case 45:
                        down = true;
                        right = true;
                        break;
                    case 0:
                    default:
                        right = true;
                        break;
                    }
                }
                
                if (this.owner.heading !== this.heading) {
                    this.direction.setVector(this.initialVector).rotate((this.heading / 180) * Math.PI);
                    this.reorient(this.heading, this.owner.heading);
                    this.owner.heading = this.heading;
                }
                
                //TODO: possibly remove the separation of this.state.direction and this.direction to just use state?
                if (state.get('moving') !== this.moving) {
                    this.owner.triggerEvent('moving', this.moving);
                    state.set('moving', this.moving);
                }

                state.set('up', up);
                state.set('right', right);
                state.set('down', down);
                state.set('left', left);
            },

            "go-down": processDirection('down'),

            "go-south": processDirection('down'),

            "go-down-left": processDirection('downLeft'),

            "go-southwest": processDirection('downLeft'),

            "go-left": processDirection('left'),

            "go-west": processDirection('left'),

            "go-up-left": processDirection('upLeft'),

            "go-northwest": processDirection('upLeft'),

            "go-up": processDirection('up'),

            "go-north": processDirection('up'),

            "go-up-right": processDirection('upRight'),

            "go-northeast": processDirection('upRight'),

            "go-right": processDirection('right'),

            "go-east": processDirection('right'),

            "go-down-right": processDirection('downRight'),

            "go-southeast": processDirection('downRight'),
            
            "stop": function (state) {
                if (!state || (state.pressed !== false)) {
                    this.left = false;
                    this.right = false;
                    this.up = false;
                    this.down = false;
                    this.upLeft = false;
                    this.upRight = false;
                    this.downLeft = false;
                    this.downRight = false;
                }
            },
            
            /**
             * Set the direction the entity should face while stopped.
             *
             * @event platypus.Entity#face
             * @param direction {String} A value such as "north" or "left" to point the entity in a particular direction.
             */
            "face": (function () {
                var headings = {
                    up: 270,
                    north: 270,
                    down: 90,
                    south: 90,
                    left: 180,
                    west: 180,
                    right: 0,
                    east: 0,
                    "up-left": 225,
                    northwest: 225,
                    "up-right": 315,
                    northeast: 315,
                    "down-left": 135,
                    southwest: 135,
                    "down-right": 45,
                    southeast: 45
                };
                
                return function (direction) {
                    this.heading = headings[direction] || 0;
                };
            }()),
            
            /**
             * Changes the velocity of the Entity when in motion.
             *
             * @event platypus.Entity#accelerate
             * @param velocity {Number|platypus.Vector} The magnitude or Vector to multiply the current velocity by.
             */
            "accelerate": function (velocity) {
                this.initialVector.normalize().multiply(velocity);
                this.direction.normalize().multiply(velocity);
            }
        },
        
        methods: {
            destroy: function () {
                this.initialVector.recycle();
                this.state = null;
            }
        }
    });
}());
