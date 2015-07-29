/**
 * This component acts as a simple AI that will reverse the movement direction of an object when it collides with something.
 * 
 * @namespace platypus.components
 * @class AIPacer
 * @uses Component
 */
/*global platypus */
(function () {
    "use strict";

    return platypus.createComponentClass({
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
        
        constructor: function (definition) {
            this.lastDirection    = '';
            this.currentDirection = this.direction || ((this.movement === 'horizontal') ? 'left' : 'up');
        },
        
        events: {
            /**
             * This AI listens for a step message triggered by its entity parent in order to perform its logic on each tick.
             * 
             * @method 'handle-ai'
             */
            "handle-ai": function () {
                if (this.currentDirection !== this.lastDirection) {
                    this.lastDirection = this.currentDirection;
                    
                    /**
                     * Triggers this event prior to changing direction.
                     * 
                     * @event 'stop'
                     */
                    this.owner.triggerEvent('stop');
                    
                    /**
                     * Triggers this event when the entity is moving right and collides with something.
                     * 
                     * @event 'go-left'
                     */
                    /**
                     * Triggers this event when the entity is moving left and collides with something.
                     * 
                     * @event 'go-right'
                     */
                    /**
                     * Triggers this event when the entity is moving up and collides with something.
                     * 
                     * @event 'go-down'
                     */
                    /**
                     * Triggers this event when the entity is moving down and collides with something.
                     * 
                     * @event 'go-up'
                     */
                    this.owner.triggerEvent('go-' + this.currentDirection);
                }
            },
            
            /**
             * On receiving this message, the component will check the collision side and re-orient itself accordingly.
             * 
             * @method 'turn-around'
             * @param message {CollisionData} Uses direction of collision to determine whether to turn around.
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
