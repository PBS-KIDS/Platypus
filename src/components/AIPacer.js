import createComponentClass from '../factory.js';

export default (function () {
    return createComponentClass(/** @lends platypus.components.AIPacer.prototype */{
        id: "AIPacer",
        
        properties: {
            /**
             * This determines the direction of movement. Can be "horizontal", "vertical", or "both".
             *
             * @property movement
             * @type String
             * @default "both"
             */
            movement: 'both',
            
            /**
             * This sets the initial direction of movement. Defaults to "up", or "left" if movement is horizontal.
             *
             * @property direction
             * @type String
             * @default "up"
             */
            direction: null
        },
        
        /**
         * This component acts as a simple AI that will reverse the movement direction of an object when it collides with something.
         *
         * @memberof platypus.components
         * @uses platypus.Component
         * @constructs
         * @listens platypus.Entity#handle-ai
         * @listens platypus.Entity#turn-around
         * @fires platypus.Entity#stop
         * @fires platypus.Entity#go-left
         * @fires platypus.Entity#go-right
         * @fires platypus.Entity#go-down
         * @fires platypus.Entity#go-up
         */
        initialize: function () {
            this.lastDirection    = '';
            this.currentDirection = this.direction || ((this.movement === 'horizontal') ? 'left' : 'up');
        },
        
        events: {
            "handle-ai": function () {
                if (this.currentDirection !== this.lastDirection) {
                    this.lastDirection = this.currentDirection;
                    
                    /**
                     * Stops motion in all directions until movement messages are again received.
                     *
                     * @event platypus.Entity#stop
                     * @param {boolean} [message.pressed] If `message` is included, the component checks the value of `pressed`: a value of false will not stop the entity.
                     */
                    this.owner.triggerEvent('stop');
                    
                    /**
                     * Triggers this event when the entity is moving right and collides with something.
                     *
                     * @event platypus.Entity#go-left
                     */
                    /**
                     * Triggers this event when the entity is moving left and collides with something.
                     *
                     * @event platypus.Entity#go-right
                     */
                    /**
                     * Triggers this event when the entity is moving up and collides with something.
                     *
                     * @event platypus.Entity#go-down
                     */
                    /**
                     * Triggers this event when the entity is moving down and collides with something.
                     *
                     * @event platypus.Entity#go-up
                     */
                    this.owner.triggerEvent('go-' + this.currentDirection);
                }
            },
            
            /**
             * On receiving this message, the component will check the collision side and re-orient itself accordingly.
             *
             * @event platypus.Entity#turn-around
             * @param collisionInfo {platypus.CollisionData} Uses direction of collision to determine whether to turn around.
             */
            "turn-around": function (collisionInfo) {
                if ((this.movement === 'both') || (this.movement === 'horizontal')) {
                    if (collisionInfo.x > 0) {
                        this.currentDirection = 'left';
                    } else if (collisionInfo.x < 0) {
                        this.currentDirection = 'right';
                    }
                }
                if ((this.movement === 'both') || (this.movement === 'vertical')) {
                    if (collisionInfo.y > 0) {
                        this.currentDirection = 'up';
                    } else if (collisionInfo.y < 0) {
                        this.currentDirection = 'down';
                    }
                }
            }
        }
    });
}());
