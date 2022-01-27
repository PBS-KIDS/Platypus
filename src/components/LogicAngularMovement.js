import {arrayCache} from '../utils/array.js';
import createComponentClass from '../factory.js';

export default (function () {
    return createComponentClass(/** @lends platypus.components.LogicAngularMovement.prototype */{
        
        id: 'LogicAngularMovement',
        
        properties: {
            /**
             * The max velocity.
             *
             * @property maxVelocity
             * @type Number
             * @default 3
             */
            maxVelocity: 3,

            /**
             * The rate of acceleration.
             *
             * @property acceleration
             * @type Number
             * @default 0.01
             */
            acceleration: 0.01,

            /**
             * The offset between the rotation value of the entity and the rotation of the art.
             *
             * @property visualOffset
             * @type Number
             * @default 0
             */
            visualOffset: 0,

            /**
             * The starting heading at which the entity will accelerate. In radians.
             *
             * @property startAngle
             * @type Number
             * @default 0
             */
            startAngle: 0
        },

        publicProperties: {

        },

        /**
         * This component moves the entity in the direction of an internally stored angle value. When moving, the entity constantly accelerates the entity in a direction up to a max velocity.
         *
         * @memberof platypus.components
         * @uses platypus.Component
         * @constructs
         * @listens platypus.Entity#handle-logic
         * @listens platypus.Entity#move
         * @listens platypus.Entity#set-angle
         * @listens platypus.Entity#set-max-velocity
         * @listens platypus.Entity#stop
         */
        initialize: function () {
            this.angle     = this.startAngle;
            this.v         = arrayCache.setUp(0, 0);
            this.moving    = false;
            this.piOverTwo = Math.PI / 2;
            this.owner.rotation = this.owner.rotation || this.visualOffset;
        },

        events: {
            "handle-logic": function (tick) {
                var PI  = Math.PI,
                    sin = Math.sin,
                    cos = Math.cos,
                    min = Math.min,
                    max = Math.max,
                    delta        = tick.delta,
                    currentAngle = 0;
                
                if (this.moving) {
                    this.v[0] += this.acceleration * cos(this.angle) * delta;
                    this.v[1] += this.acceleration * sin(this.angle) * delta;
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
                            currentAngle = PI + currentAngle;
                        }
                    }
                    if (this.v[0] >= 0) {
                        this.v[0] = min(this.v[0], this.maxVelocity * cos(currentAngle));
                    } else {
                        this.v[0] = max(this.v[0], this.maxVelocity * cos(currentAngle));
                    }
                    if (this.v[1] >= 0) {
                        this.v[1] = min(this.v[1], this.maxVelocity * sin(currentAngle));
                    } else {
                        this.v[1] = max(this.v[1], this.maxVelocity * sin(currentAngle));
                    }
                    
                    this.owner.x += this.v[0];
                    this.owner.y += this.v[1];

                    this.owner.rotation = (currentAngle * (180 / PI)) + this.visualOffset;
                }
            },
            /**
             * Sets the internal heading angle in the component.
             *
             * @event platypus.Entity#set-angle
             * @param angle {Number} The value you want to set the angle to.
             */
            "set-angle": function (angle) {
                this.angle = angle;
            },

            /**
             * Start the entity accelerating toward the heading angle.
             *
             * @event platypus.Entity#move
             */
            "move": function () {
                this.moving = true;
            },

            "stop": function () {
                this.moving = false;
                this.v[0] = 0;
                this.v[1] = 0;
            },

            /**
             * Set the max velocity.
             *
             * @event platypus.Entity#set-max-velocity
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
