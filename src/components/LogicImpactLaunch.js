/* global platypus */
import Vector from '../Vector.js';
import createComponentClass from '../factory.js';

export default (function () {
    return createComponentClass(/** @lends platypus.components.LogicImpactLaunch.prototype */{
        id: 'LogicImpactLaunch',
        
        properties: {
            /**
             * Acceleration in X entity should have in world units while being launched.
             *
             * @property accelerationX
             * @type number
             * @default -0.3
             */
            accelerationX: -0.3,

            /**
             * Acceleration in Y entity should have in world units while being launched.
             *
             * @property accelerationY
             * @type number
             * @default -0.8
             */
            accelerationY: -0.8,

            /**
             * Whether X acceleration should flip according to the direction of the collision.
             *
             * @property flipX
             * @type boolean
             * @default true
             */
            flipX: true,

            /**
             * Whether Y acceleration should flip according to the direction of the collision.
             *
             * @property flipY
             * @type boolean
             * @default false
             */
            flipY: false,

            /**
             * This sets the state of the entity while it's being launched. Defaults to "stunned".
             *
             * @property state
             * @type string
             * @default "stunned"
             */
             state: "stunned"
        },
        
        /**
         * This component will cause the entity to move in a certain direction on colliding with another entity.
         *
         * @memberof platypus.components
         * @uses platypus.Component
         * @constructs
         * @listens platypus.Entity#component-added
         * @listens platypus.Entity#handle-logic
         * @listens platypus.Entity#hit-solid
         */
        initialize: function (definition) {
            this.stunState = definition.state || "stunned";
            
            this.flipX = this.flipX ? -1 : 1;
            this.flipY = this.flipY ? -1 : 1;

            this.justJumped = false;
            this.stunned = false;
            
            this.state = this.owner.state;
            this.state.set('impact', false);
            this.state.set(this.stunState, false);
        },
        
        events: {
            "component-added": function (component) {
                if (component === this) {
                    if (!this.owner.addMover) {
                        platypus.debug.warn('The "LogicDirectionalMovement" component requires a "Mover" component to function correctly.');
                        return;
                    }

                    this.direction = this.owner.addMover({
                        velocity: [0, 0, 0],
                        orient: false
                    }).velocity;
                    this.vector = Vector.setUp();
                }
            },

            "handle-logic": function () {
                this.state.set('impact', this.justJumped);
                this.state.set(this.stunState, this.stunned);

                if (this.justJumped) {
                    this.direction.setVector(this.vector);
                    this.justJumped = false;
                    this.stunned = true;
                }
            },
            
            "impact-launch": function (collisionInfo) {
                var dx = collisionInfo.x,
                    dy = collisionInfo.y;
                
                if (collisionInfo.entity) {
                    dx = collisionInfo.entity.x - this.owner.x;
                    dy = collisionInfo.entity.y - this.owner.y;
                }

                if (!this.stunned) {
                    this.justJumped = true;
                    if (dx >= 0) {
                        this.vector.x = this.accelerationX;
                    } else if (dx < 0) {
                        this.vector.x = this.accelerationX * this.flipX;
                    }
                    if (dy >= 0) {
                        this.vector.y = this.accelerationY;
                    } else if (dy < 0) {
                        this.vector.y = this.accelerationY * this.flipY;
                    }
                }
            },
            
            "hit-solid": function (collisionInfo) {
                if (this.stunned && (collisionInfo.y > 0)) {
                    this.direction.x = 0;
                    this.direction.y = 0;
                    this.stunned = false;
                }
            }
        },
        
        methods: {
            destroy: function () {
                this.vector.recycle();
                this.state = null;
            }
        }
    });
}());
