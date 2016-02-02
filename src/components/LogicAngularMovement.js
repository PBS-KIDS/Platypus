/**
 * This component moves the entity in the direction of an internally stored angle value. When moving, the entity constantly accelerates the entity in a direction up to a max velocity.
 *
 * @namespace platypus.components
 * @class LogicAngularMovement
 * @uses platypus.Component
 */

/*global platypus */
(function () {
    "use strict";

    return platypus.createComponentClass({
        
        id: 'LogicAngularMovement',
        
        properties: {
            /**
             * The max velocity.
             *
             * @property maxVelocity
             * @type Number
             * @default 3
             */
            maxVelocity : 3,

            /**
             * The rate of acceleration.
             *
             * @property acceleration
             * @type Number
             * @default 0.01
             */
            acceleration : 0.01,

            /**
             * The offset between the rotation value of the entity and the rotation of the art.
             *
             * @property visualOffset
             * @type Number
             * @default 0
             */
            visualOffset : 0,

            /**
             * The starting heading at which the entity will accelerate. In radians.
             *
             * @property startAngle
             * @type Number
             * @default 0
             */
            startAngle : 0
        },

        publicProperties: {

        },

        constructor: function (definition) {
            this.angle     = this.startAngle;
            this.v         = Array.setUp(0, 0);
            this.moving    = false;
            this.piOverTwo = Math.PI / 2;
            this.owner.rotation = this.owner.rotation || this.visualOffset;
        },

        events: {

            /**
             * Updates the position, velocity, and rotation of the entity
             *
             * @method 'handle-logic'
             * @param tick {Object} The tick data.
             */
            "handle-logic": function (tick) {
                var delta        = tick.delta,
                    currentAngle = 0;
                
                if (this.moving) {
                    this.v[0] += this.acceleration * Math.cos(this.angle) * delta;
                    this.v[1] += this.acceleration * Math.sin(this.angle) * delta;
                    if (this.v[0] === 0) {
                        if (this.v[1] > 0) {
                            currentAngle = this.piOverTwo;
                        } else if (this.v[1] < 0) {
                            currentAngle = -this.piOverTwo;
                        } else {
                            currentAngle = this.angle;
                        }
                    } else {
                        currentAngle = Math.atan(this.v[1] / this.v[0]);
                        if (this.v[0] < 0) {
                            currentAngle = Math.PI + currentAngle;
                        }
                    }
                    if (this.v[0] >= 0) {
                        this.v[0] = Math.min(this.v[0], this.maxVelocity * Math.cos(currentAngle));
                    } else {
                        this.v[0] = Math.max(this.v[0], this.maxVelocity * Math.cos(currentAngle));
                    }
                    if (this.v[1] >= 0) {
                        this.v[1] = Math.min(this.v[1], this.maxVelocity * Math.sin(currentAngle));
                    } else {
                        this.v[1] = Math.max(this.v[1], this.maxVelocity * Math.sin(currentAngle));
                    }
                    
                    this.owner.x += this.v[0];
                    this.owner.y += this.v[1];

                    this.owner.rotation = (currentAngle * (180 / Math.PI)) + this.visualOffset;
                }
            },
            /**
             * Sets the internal heading angle in the component.
             *
             * @method 'set-angle'
             * @param angle {Number} The value you want to set the angle to.
             */
            "set-angle": function (angle) {
                this.angle = angle;
            },
            /**
             * Start the entity accelerating toward the heading angle.
             *
             * @method 'move'
             */
            "move": function () {
                this.moving = true;
            },
            /**
             * Stops the movement toward the heading angle.
             *
             * @method 'stop'
             */
            "stop": function () {
                this.moving = false;
                this.v[0] = 0;
                this.v[1] = 0;
            },
            /**
             * Set the max velocity.
             *
             * @method 'set-max-velocity'
             * @param newMaxV {Number} The max velocity value.
             */
            "set-max-velocity": function (newMaxV) {
                this.maxVelocity = newMaxV;
            }
        },
        
        methods: {
            destroy: function () {
                this.v.recycle();
            }
        }
    });
}());
