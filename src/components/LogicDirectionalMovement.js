/**
 * This component changes the [Motion](platypus.components.Motion.html) of an entity according to its current speed and heading. It accepts directional messages that can stand alone, or come from a mapped controller, in which case it checks the `pressed` value of the message before changing its course.
 * @namespace platypus.components
 * @class LogicDirectionalMovement
 * @uses platypus.Component
 */
/*global console */
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";
    
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
        
        constructor: function (definition) {
            var state = this.state = this.owner.state;
            
            if (!isNaN(this.speed)) {
                this.speed = [this.speed, 0, 0];
            }
            this.initialVector = new platypus.Vector(this.speed);
            this.reorient = rotate[this.axis];
            if (!this.reorient) {
                this.reorient = doNothing;
            }
            
            this.moving = state.moving = false;
            this.left   = state.left   = false;
            this.right  = state.right  = false;
            this.up     = state.up     = false;
            this.down   = state.down   = false;

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
                        console.warn('The "LogicDirectionalMovement" component requires a "Mover" component to function correctly.');
                        return;
                    }

                    this.direction = this.owner.addMover({
                        vector: this.speed,
                        event: "moving",
                        orient: false
                    }).vector;
                    
                    if (this.owner.heading !== this.heading) {
                        this.direction.set(this.initialVector).rotate((this.owner.heading / 180) * Math.PI);
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
                var up        = this.up        || this.upLeft || this.downLeft,
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
                    this.direction.set(this.initialVector).rotate((this.heading / 180) * Math.PI);
                    this.reorient(this.heading, this.owner.heading);
                    this.owner.heading = this.heading;
                }
                
                //TODO: possibly remove the separation of this.state.direction and this.direction to just use state?
                if (this.state.moving !== this.moving) {
                    this.owner.triggerEvent('moving', this.moving);
                    this.state.moving = this.moving;
                }

                if (this.state.up !== up) {
                    this.state.up = up;
                }
                if (this.state.right !== right) {
                    this.state.right = right;
                }
                if (this.state.down !== down) {
                    this.state.down = down;
                }
                if (this.state.left !== left) {
                    this.state.left = left;
                }
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
             * Changes the velocity of the Entity when in motion.
             * 
             * @method 'accelerate'
             * @param velocity {Number|platypus.Vector} The magnitude or Vector to multiply the current velocity by.
             */
            "accelerate": function (velocity) {
                this.initialVector.normalize().multiply(velocity);
                this.direction.normalize().multiply(velocity);
            }
        }
    });
}());
