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
                this[direction] = (typeof state === 'undefined') || (state && (state.pressed !== false));
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
            heading: 0,
            
            /**
             * This determines which Entity states should cause directional movement to pause.
             * 
             * @property pause
             * @type String|Array
             * @default null
             */
            pause: null,
            
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
            if (!isNaN(this.speed)) {
                this.speed = [this.speed, 0, 0];
            }
            this.initialVector = new platypus.Vector(this.speed);
            this.reorient = rotate[this.axis];
            if (!this.reorient) {
                this.reorient = doNothing;
            }
            
            if (this.pause && (typeof this.pause === 'string')) {
                this.pause = [this.pause];
            }

            this.state = this.owner.state;
            this.state.moving = false;
            this.state.left = false;
            this.state.right = false;
            this.state.up = false;
            this.state.down = false;

            this.moving = false;
            this.left = false;
            this.right = false;
            this.up = false;
            this.down = false;
            this.upLeft = false;
            this.upRight = false;
            this.downLeft = false;
            this.downRight = false;
            this.facing = 'right';
            
            this.owner.heading = 0;
        },
        events: {
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
                
                if (this.isPaused()) {
                    return;
                }
                
                if (up && down) {
                    this.moving = false;
                } else if (left && right) {
                    this.moving = false;
                } else if (upLeft) {
                    this.moving = true;
                    this.facing = 'up-left';
                    this.heading = 225;
                } else if (upRight) {
                    this.moving = true;
                    this.facing = 'up-right';
                    this.heading = 315;
                } else if (downLeft) {
                    this.moving = true;
                    this.facing = 'down-left';
                    this.heading = 135;
                } else if (downRight) {
                    this.moving = true;
                    this.facing = 'down-right';
                    this.heading = 45;
                } else if (left) {
                    this.moving = true;
                    this.facing = 'left';
                    this.heading = 180;
                } else if (right) {
                    this.moving = true;
                    this.facing = 'right';
                    this.heading = 0;
                } else if (up) {
                    this.moving = true;
                    this.facing = 'up';
                    this.heading = 270;
                } else if (down) {
                    this.moving = true;
                    this.facing = 'down';
                    this.heading = 90;
                } else {
                    this.moving = false;
                    
                    // This is to retain the entity's direction even if there is no movement. There's probably a better way to do this since this is a bit of a retrofit. - DDD
                    switch (this.facing) {
                    case 'up':
                        up = true;
                        break;
                    case 'down':
                        down = true;
                        break;
                    case 'left':
                        left = true;
                        break;
                    case 'right':
                        right = true;
                        break;
                    case 'up-left':
                        up = true;
                        left = true;
                        break;
                    case 'up-right':
                        up = true;
                        right = true;
                        break;
                    case 'down-left':
                        down = true;
                        left = true;
                        break;
                    case 'down-right':
                        down = true;
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

//TODO: expand this documentation:          
/*
### Listens for:
- **[directional message]** - Directional messages include `go-down`, `go-south`, `go-down-left`, `go-southwest`, `go-left`, `go-west`, `go-up-left`, `go-northwest`, `go-up`, `go-north`, `go-up-right`, `go-northeast`, `go-right`, `go-east`, `go-down-right`, and `go-southeast`. On receiving one of these messages, the entity adjusts its movement heading.
  - @param message.pressed (boolean) - Optional. If `message` is included, the component checks the value of `pressed`: true causes movement in the triggered direction, false turns off movement in that direction. Note that if no message is included, the only way to stop movement in a particular direction is to trigger `stop` on the entity before progressing in a new heading. This allows triggering `up` and `left` in sequence to cause `up-left` movement on the entity.
- **stop** - Stops motion in all directions until movement messages are again received.
  - @param message.pressed (boolean) - Optional. If `message` is included, the component checks the value of `pressed`: a value of false will not stop the entity.
*/
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
            
            "accelerate": function (velocity) {
                this.initialVector.normalize().multiply(velocity);
                this.direction.normalize().multiply(velocity);
            }
        },
        methods: {
            isPaused: function () {
                var i = 0,
                    state = this.owner.state;
                
                if (this.pause) {
                    for (i = 0; i < this.pause.length; i++) {
                        if (state[this.pause[i]]) {
                            return true;
                        }
                    }
                }
                
                return false;
            }
        }
    });
}());
