import createComponentClass from '../factory.js';

export default (function () {
    const
        cos = Math.cos,
        sin = Math.sin,
        polarToCartesianX = function (m, a) {
            return m * cos(a);
        },
        polarToCartesianY = function (m, a) {
            return m * sin(a);
        };
    
    return createComponentClass(/** @lends platypus.components.LogicRotationalMovement.prototype */{
        id: 'LogicRotationalMovement',

        properties: {
            /**
             * Defines the distance in world units that the entity should be moved per millisecond.
             *
             * @property speed
             * @type Number
             * @default 0.3
             */
            "speed": 0.3,
            
            /**
             * Radian orientation that entity should begin in. Defaults to 0 (facing right).
             *
             * @property angle
             * @type Number
             * @default 0
             */
            "angle": 0,
            
            /**
             * Unit in radians that the angle should change per millisecond.
             *
             * @property degree
             * @type Number
             * @default 1
             */
            "degree": 1
        },

        /**
         * This component changes the (x, y) position of an object according to its current speed and heading. It maintains its own heading information independent of other components allowing it to be used simultaneously with other logic components like [[Logic-Pushable]]. It accepts directional messages that can stand alone, or come from a mapped controller, in which case it checks the `pressed` value of the message before changing its course accordingly.
         *
         * @memberof platypus.components
         * @uses platypus.Component
         * @constructs
         * @listens platypus.Entity#handle-logic
         * @listens platypus.Entity#stop
         * @listens platypus.Entity#go-forward
         * @listens platypus.Entity#go-backward
         * @listens platypus.Entity#rotate
         * @listens platypus.Entity#turn-right
         * @listens platypus.Entity#turn-left
         * @listens platypus.Entity#stop-moving
         * @listens platypus.Entity#stop-turning
         * @fires platypus.Entity#orientation-updated
         */
        initialize: function () {
            var state = this.owner.state;
            
            this.magnitude = 0;
            
            this.state = state;
            state.set('moving', false);
            state.set('turningRight', false);
            state.set('turningLeft', false);
    
            this.owner.orientation  = 0;
            
            this.moving = false;
            this.turningRight = false;
            this.turningLeft = false;
        },

        events: {
            "handle-logic": function (tick) {
                var state = this.state;
                
                if (this.turningRight) {
                    this.angle += this.degree * tick.delta / 15;
                }
        
                if (this.turningLeft) {
                    this.angle -= this.degree * tick.delta / 15;
                }
                
                if (this.moving) {
                    this.owner.x += (polarToCartesianX(this.magnitude, this.angle) * tick.delta);
                    this.owner.y += (polarToCartesianY(this.magnitude, this.angle) * tick.delta);
                }
                
                state.set('moving', this.moving);
                state.set('turningLeft', this.turningLeft);
                state.set('turningRight', this.turningRight);
                
                if (this.owner.orientation !== this.angle * Math.PI / 180) {
                    this.owner.orientation = this.angle * Math.PI / 180;
                    this.owner.triggerEvent('orientation-updated');
                }
            },

            /**
             * This rotates the entity by a delta in radians.
             *
             * @event platypus.Entity#rotate
             * @param angleDelta {Number} The change in angle.
             */
            "rotate": function (angleDelta) {
                this.angle += angleDelta;
            },

            /**
             * On receiving this event, the entity turns right.
             *
             * @event platypus.Entity#turn-right
             * @param [state.pressed] {boolean} If `state` is included, the component checks the value of `pressed`: true causes movement in the triggered direction, false turns off movement in that direction. Note that if no message is included, the only way to stop movement in a particular direction is to trigger `stop` on the entity before progressing in a new orientation.
             */
            "turn-right": function (state) {
                if (state) {
                    this.turningRight = state.pressed;
                } else {
                    this.turningRight = true;
                }
            },

            /**
             * On receiving this event, the entity turns left.
             *
             * @event platypus.Entity#turn-left
             * @param [state.pressed] {boolean} If `state` is included, the component checks the value of `pressed`: true causes movement in the triggered direction, false turns off movement in that direction. Note that if no message is included, the only way to stop movement in a particular direction is to trigger `stop` on the entity before progressing in a new orientation.
             */
            "turn-left": function (state) {
                if (state) {
                    this.turningLeft = state.pressed;
                } else {
                    this.turningLeft = true;
                }
            },

            "go-forward": function (state) {
                if (!state || state.pressed) {
                    this.moving = true;
                    this.magnitude = this.speed;
                } else {
                    this.moving = false;
                }
            },

            "go-backward": function (state) {
                if (!state || state.pressed) {
                    this.moving = true;
                    this.magnitude = -this.speed;
                } else {
                    this.moving = false;
                }
            },

            "stop": function (state) {
                if (!state || state.pressed) {
                    this.moving = false;
                    this.turningLeft = false;
                    this.turningRight = false;
                }
            },

            /**
             * Stops linear motion until movement messages are again received.
             *
             * @event platypus.Entity#stop-moving
             * @param [state.pressed] {Boolean} If `state` is included, the component checks the value of `pressed`: a value of false will not stop the entity.
             */
            "stop-moving": function (state) {
                if (!state || state.pressed) {
                    this.moving = false;
                }
            },

            /**
             * Stops rotational motion until movement messages are again received.
             *
             * @event platypus.Entity#stop-turning
             * @param [state.pressed] {Boolean} If `state` is included, the component checks the value of `pressed`: a value of false will not stop the entity.
             */
            "stop-turning": function (state) {
                if (!state || state.pressed) {
                    this.turningLeft = false;
                    this.turningRight = false;
                }
            }
        },
        
        methods: {
            destroy: function () {
                this.state = null;
            }
        }
    });
}());
