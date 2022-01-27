import createComponentClass from '../factory.js';

export default (function () {
    return createComponentClass(/** @lends platypus.components.LogicDestroyMe.prototype */{
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

        /**
         * This component allows an entity to be removed from the stage when "destroy-me" is triggered.
         *
         * @memberof platypus.components
         * @uses platypus.Component
         * @constructs
         * @listens platypus.Entity#destroy-me
         * @listens platypus.Entity#prepare-logic
         */
        initialize: function () {},
        
        events: {
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
             * @event platypus.Entity#destroy-me
             */
            "destroy-me": function () {
                this.destroyed = true;
            }                   
        }
    });
}());
