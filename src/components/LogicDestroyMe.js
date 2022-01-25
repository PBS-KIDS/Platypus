/**
 * This component allows an entity to be removed from the stage when "destroy-me" is triggered.
 *
 * @memberof platypus.components
 * @class LogicDestroyMe
 * @uses platypus.Component
 */
import createComponentClass from '../factory.js';

export default (function () {
    return createComponentClass(/** @lends LogicDestroyMe.prototype */{
        id: 'LogicDestroyMe',
        
        properties: {
            /**
             * Time in milliseconds after the "destroy-me" message is heard before entity should be removed.
             *
             * @property delay
             * @type number
             * @default 0
             */
            delay: 0,

            /**
             * Whether this entity has been destroyed. Typically `false` until a "destroy-me" event has been triggered.
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
             * @method 'prepare-logic'
             * @param message.delta {number} To measure the delay before removal, the component keeps a running count of step lengths.
             */
            "prepare-logic": function (tick) {
                var dT = tick.delta;
                
                if (this.destroyed && !this.owner.state.get('paused')) {
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
