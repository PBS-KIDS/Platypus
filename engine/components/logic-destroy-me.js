/**
 * This component allows an entity to be removed from the stage when "destroy-me" is triggered.
 * 
 * @class "logic-destroy-me" Component
 * @uses Component
 */
(function () {
    "use strict";
    
    return platformer.createComponentClass({    
        id: 'logic-destroy-me',
        
        properties: {
            /**
             * Time in milliseconds after the "destroy-me" message is heard before entity should be removed.
             * 
             * @property delay
             * @type number
             * @default 0
             */
            delay: 0
        },
        
        publicProperties: {
            /**
             * Whether this entity has been destroyed. Typically `false` until a "destroy-me" event has been triggered. Available on the entity as `entity.destroyed`.
             * 
             * @property destroyed
             * @type boolean
             * @default false
             */
            destroyed: false
        },
        
        events: {// These are messages that this component listens for

            /**
             * On a `tick` logic message, the component checks whether it should be removed or not.
             * 
             * @method 'handle-logic'
             * @param message.delta {number} To measure the delay before removal, the component keeps a running count of step lengths.
             */
            "handle-logic": function (tick) {
                var dT = tick.delta;
                if (this.destroyed && !this.owner.state.paused)
                {
                    this.delay -= dT;
                    if (this.delay <= 0) {
                        this.owner.parent.removeEntity(this.owner);
                    }
                }
            },
            
            /**
             * This component will set the entity up for removal on receiving this message.
             * 
             * @method 'destroy-me'
             */
            "destroy-me": function () {
                this.destroyed = true;
            }
                   
        }
    });
}());
