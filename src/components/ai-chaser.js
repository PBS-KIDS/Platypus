/**
 * This component acts as a simple AI that will chase another entity.
 *
 * @class "ai-chaser" Component
 * @uses Component
 */
/*global console, platypus */
(function () {
    "use strict";
    
    var tempVect = new platypus.Vector();

    return platypus.createComponentClass({
        
        id: 'ai-chaser',
        
        properties: {
            /**
             * Sets whether the speed property should enact acceleration upon the entity rather than velocity.
             * 
             * @property accelerate
             * @type boolean
             * @default false
             */
            accelerate: false,
            
            /**
             * Whether the entity is in a chasing state.
             * 
             * @property chasing
             * @type boolean
             * @default true
             */
            chasing: true
        },
        
        publicProperties: {
            /**
             * Sets the velocity of the entity. This property is accessible on the entity as `entity.speed`.
             * 
             * @property speed
             * @type number
             * @default 0.3
             */
            speed: 0.3
        },
        
        constructor: function (definition) {
            this.target = this.owner.target || null;
            this.offset = new platypus.Vector(0, 0);
        },

        events: {// These are messages that this component listens for
            /**
             * This component listens for this event to initialize movement.
             * 
             * @method 'load'
             */
            "load": function () {
                if (!this.owner.addMover) {
                    console.warn('The "ai-chaser" component requires a "mover" component to function correctly.');
                    return;
                }
                
                this.direction = this.owner.addMover({
                    vector: [this.speed, 0, 0],
                    event: "chase",
                    accelerator: this.accelerate
                }).vector;
            },
        
            /**
             * This AI listens for a step message triggered by its entity parent in order to perform its logic on each tick.
             * 
             * @method 'handle-ai'
             */
            "handle-ai": function () {
                var v = tempVect,
                    m = 0,
                    c = false;

                if (this.target && this.chasing) {
                    v.set(this.offset).add(this.target.position).subtractVector(this.owner.position);
                    m = v.magnitude(2);

                    if (m) {
                        c = true;
                        this.direction.set(v).normalize().multiply(this.speed);
                    }
                }
                
                if (c !== this.owner.state.chasing) {
                    this.owner.state.chasing = c;
                    /**
                     * This event is triggered whenever the entity begins chasing another entity or stops chasing another entity.
                     * 
                     * @event 'chase'
                     * @param chasing {boolean} Whether the entity is chasing another entity.
                     */
                    this.owner.triggerEvent('chase', c);
                }
            },
            
            /**
             * On receiving this message, the component will change its target and begin chasing the new entity.
             * 
             * @method 'set-target'
             * @param entity {Entity} Sets this entity's target to the provided entity.
             */
            "set-target": function (entity) {
                this.target = entity;
                this.offset.x = 0;
                this.offset.y = 0;
            },
            
            /**
             * On receiving this message, the component will change its target offset.
             * 
             * @method 'set-target-offset'
             * @param offset {Object|Vector} Sets the chased entity's offset to the provided offset.
             * @param offset.x {number} The offset along the x-axis.
             * @param offset.y {number} The offset along the y-axis.
             */
            "set-target-offset": function (offset) {
                this.offset.x = offset.x;
                this.offset.y = offset.y;
            },
            
            /**
             * On receiving this message, the component will begin chasing the entity.
             * 
             * @method 'start-chasing'
             * @param [entity] {Entity} Sets the entity if it's provided.
             */
            "start-chasing": function (entity) {
                if (entity) {
                    this.target = entity;
                }
                this.chasing = true;
            },
            
            /**
             * On receiving this message, the component will cease chasing the entity.
             * 
             * @method 'stop-chasing'
             */
            "stop-chasing": function () {
                this.chasing = false;
            }
        },
        
        methods: {// These are methods that are called on the component
            destroy: function () {
                this.target = null;
            }
        }
    });
}());