/**
 * This component changes the [Motion](platypus.components.Motion.html) of an entity according to its current speed and heading. It accepts directional messages that can stand alone, or come from a mapped controller, in which case it checks the `pressed` value of the message before changing its course.
 *
 * @namespace platypus.components
 * @class LogicDirectionalMovement
 * @uses platypus.Component
 */
/* global platypus */
(function () {
    'use strict';
    
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
    
    return platypus.createComponentClass({
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
        
        initialize: function () {
            var state = this.state = this.owner.state;
            
            if (typeof this.speed === 'number') {
                this.speed = [this.speed, 0, 0];
            }
            this.initialVector = platypus.Vector.setUp(this.speed);
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
            /**
             * This method checks to make sure there is a `Mover` component attached and sets up initial heading.
             *
             * @method 'component-added'
             */
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
            
            /**
             * On receiving this message, the component updates its direction of motion according to its current state.
             *
             * @method 'handle-logic'
             */
            "handle-logic": function () {
                var state = this.state,
                    up        = this.up        || this.upLeft || this.downLeft,
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

            /**
             * On receiving this message, this component updates its heading accordingly.
             *
             * @method 'go-down'
             * @param [message.pressed] {Boolean} If `message` is included, the component checks the value of `pressed`: true causes movement in the triggered direction, false turns off movement in that direction. Note that if no message is included, the only way to stop movement in a particular direction is to trigger `stop` on the entity before progressing in a new heading. This allows triggering `up` and `left` in sequence to cause `up-left` movement on the entity.
             */
            "go-down": processDirection('down'),

            /**
             * On receiving this message, this component updates its heading accordingly.
             *
             * @method 'go-south'
             * @param [message.pressed] {Boolean} If `message` is included, the component checks the value of `pressed`: true causes movement in the triggered direction, false turns off movement in that direction. Note that if no message is included, the only way to stop movement in a particular direction is to trigger `stop` on the entity before progressing in a new heading. This allows triggering `up` and `left` in sequence to cause `up-left` movement on the entity.
             */
            "go-south": processDirection('down'),

            /**
             * On receiving this message, this component updates its heading accordingly.
             *
             * @method 'go-down-left'
             * @param [message.pressed] {Boolean} If `message` is included, the component checks the value of `pressed`: true causes movement in the triggered direction, false turns off movement in that direction. Note that if no message is included, the only way to stop movement in a particular direction is to trigger `stop` on the entity before progressing in a new heading. This allows triggering `up` and `left` in sequence to cause `up-left` movement on the entity.
             */
            "go-down-left": processDirection('downLeft'),

            /**
             * On receiving this message, this component updates its heading accordingly.
             *
             * @method 'go-southwest'
             * @param [message.pressed] {Boolean} If `message` is included, the component checks the value of `pressed`: true causes movement in the triggered direction, false turns off movement in that direction. Note that if no message is included, the only way to stop movement in a particular direction is to trigger `stop` on the entity before progressing in a new heading. This allows triggering `up` and `left` in sequence to cause `up-left` movement on the entity.
             */
            "go-southwest": processDirection('downLeft'),

            /**
             * On receiving this message, this component updates its heading accordingly.
             *
             * @method 'go-left'
             * @param [message.pressed] {Boolean} If `message` is included, the component checks the value of `pressed`: true causes movement in the triggered direction, false turns off movement in that direction. Note that if no message is included, the only way to stop movement in a particular direction is to trigger `stop` on the entity before progressing in a new heading. This allows triggering `up` and `left` in sequence to cause `up-left` movement on the entity.
             */
            "go-left": processDirection('left'),

            /**
             * On receiving this message, this component updates its heading accordingly.
             *
             * @method 'go-west'
             * @param [message.pressed] {Boolean} If `message` is included, the component checks the value of `pressed`: true causes movement in the triggered direction, false turns off movement in that direction. Note that if no message is included, the only way to stop movement in a particular direction is to trigger `stop` on the entity before progressing in a new heading. This allows triggering `up` and `left` in sequence to cause `up-left` movement on the entity.
             */
            "go-west": processDirection('left'),

            /**
             * On receiving this message, this component updates its heading accordingly.
             *
             * @method 'go-up-left'
             * @param [message.pressed] {Boolean} If `message` is included, the component checks the value of `pressed`: true causes movement in the triggered direction, false turns off movement in that direction. Note that if no message is included, the only way to stop movement in a particular direction is to trigger `stop` on the entity before progressing in a new heading. This allows triggering `up` and `left` in sequence to cause `up-left` movement on the entity.
             */
            "go-up-left": processDirection('upLeft'),

            /**
             * On receiving this message, this component updates its heading accordingly.
             *
             * @method 'go-northwest'
             * @param [message.pressed] {Boolean} If `message` is included, the component checks the value of `pressed`: true causes movement in the triggered direction, false turns off movement in that direction. Note that if no message is included, the only way to stop movement in a particular direction is to trigger `stop` on the entity before progressing in a new heading. This allows triggering `up` and `left` in sequence to cause `up-left` movement on the entity.
             */
            "go-northwest": processDirection('upLeft'),

            /**
             * On receiving this message, this component updates its heading accordingly.
             *
             * @method 'go-up'
             * @param [message.pressed] {Boolean} If `message` is included, the component checks the value of `pressed`: true causes movement in the triggered direction, false turns off movement in that direction. Note that if no message is included, the only way to stop movement in a particular direction is to trigger `stop` on the entity before progressing in a new heading. This allows triggering `up` and `left` in sequence to cause `up-left` movement on the entity.
             */
            "go-up": processDirection('up'),

            /**
             * On receiving this message, this component updates its heading accordingly.
             *
             * @method 'go-north'
             * @param [message.pressed] {Boolean} If `message` is included, the component checks the value of `pressed`: true causes movement in the triggered direction, false turns off movement in that direction. Note that if no message is included, the only way to stop movement in a particular direction is to trigger `stop` on the entity before progressing in a new heading. This allows triggering `up` and `left` in sequence to cause `up-left` movement on the entity.
             */
            "go-north": processDirection('up'),

            /**
             * On receiving this message, this component updates its heading accordingly.
             *
             * @method 'go-up-right'
             * @param [message.pressed] {Boolean} If `message` is included, the component checks the value of `pressed`: true causes movement in the triggered direction, false turns off movement in that direction. Note that if no message is included, the only way to stop movement in a particular direction is to trigger `stop` on the entity before progressing in a new heading. This allows triggering `up` and `left` in sequence to cause `up-left` movement on the entity.
             */
            "go-up-right": processDirection('upRight'),

            /**
             * On receiving this message, this component updates its heading accordingly.
             *
             * @method 'go-northeast'
             * @param [message.pressed] {Boolean} If `message` is included, the component checks the value of `pressed`: true causes movement in the triggered direction, false turns off movement in that direction. Note that if no message is included, the only way to stop movement in a particular direction is to trigger `stop` on the entity before progressing in a new heading. This allows triggering `up` and `left` in sequence to cause `up-left` movement on the entity.
             */
            "go-northeast": processDirection('upRight'),

            /**
             * On receiving this message, this component updates its heading accordingly.
             *
             * @method 'go-right'
             * @param [message.pressed] {Boolean} If `message` is included, the component checks the value of `pressed`: true causes movement in the triggered direction, false turns off movement in that direction. Note that if no message is included, the only way to stop movement in a particular direction is to trigger `stop` on the entity before progressing in a new heading. This allows triggering `up` and `left` in sequence to cause `up-left` movement on the entity.
             */
            "go-right": processDirection('right'),

            /**
             * On receiving this message, this component updates its heading accordingly.
             *
             * @method 'go-east'
             * @param [message.pressed] {Boolean} If `message` is included, the component checks the value of `pressed`: true causes movement in the triggered direction, false turns off movement in that direction. Note that if no message is included, the only way to stop movement in a particular direction is to trigger `stop` on the entity before progressing in a new heading. This allows triggering `up` and `left` in sequence to cause `up-left` movement on the entity.
             */
            "go-east": processDirection('right'),

            /**
             * On receiving this message, this component updates its heading accordingly.
             *
             * @method 'go-down-right'
             * @param [message.pressed] {Boolean} If `message` is included, the component checks the value of `pressed`: true causes movement in the triggered direction, false turns off movement in that direction. Note that if no message is included, the only way to stop movement in a particular direction is to trigger `stop` on the entity before progressing in a new heading. This allows triggering `up` and `left` in sequence to cause `up-left` movement on the entity.
             */
            "go-down-right": processDirection('downRight'),

            /**
             * On receiving this message, this component updates its heading accordingly.
             *
             * @method 'go-southeast'
             * @param [message.pressed] {Boolean} If `message` is included, the component checks the value of `pressed`: true causes movement in the triggered direction, false turns off movement in that direction. Note that if no message is included, the only way to stop movement in a particular direction is to trigger `stop` on the entity before progressing in a new heading. This allows triggering `up` and `left` in sequence to cause `up-left` movement on the entity.
             */
            "go-southeast": processDirection('downRight'),
            
            /**
             * Stops motion in all directions until movement messages are again received.
             *
             * @method 'stop'
             * @param message.pressed (boolean) - Optional. If `message` is included, the component checks the value of `pressed`: a value of false will not stop the entity.
             */
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
             * @method 'face'
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
             * @method 'accelerate'
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
