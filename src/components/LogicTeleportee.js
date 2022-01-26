/**
### Local Broadcasts:
- **teleport-complete** - Triggered once the entity has been moved to the new location.

## JSON Definition
    {
      "type": "LogicTeleportee"
    }
*/
import Vector from '../Vector.js';
import createComponentClass from '../factory.js';

export default (function () {
    return createComponentClass(/** @lends platypus.components.LogicTeleportee.prototype */{
        id: 'LogicTeleportee',
        
        /**
         * This component causes an entity to teleport when receiving a teleport message.
         *
         * @memberof platypus.components
         * @uses platypus.Component
         * @constructs
         * @param {*} definition 
         * @listens platypus.Entity#handle-logic
         * @fires platypus.Entity#relocate-entity
         */
        initialize: function () {
            this.teleportDestination = Vector.setUp();
            this.teleportNow = false;
            this.DestinationSet = false;
            this.message = {
                position: this.teleportDestination
            };
        },

        events: {// These are messages that this component listens for
            "handle-logic": function () {
                if (this.teleportNow) {
                    this.owner.triggerEvent('relocate-entity', this.message);
                    this.teleportNow = false;
                    this.owner.triggerEvent('teleport-complete');
                }
            },
            "teleport": function () {
                if (this.destinationSet) {
                    this.teleportNow = true;
                }
            },
            "set-destination": function (position) {
                this.setDestination(position);
            },
            "hit-telepoint": function (collisionInfo) {
                this.setDestination(collisionInfo.entity);
            }
        },
        
        methods: {
            setDestination: function (position) {
                this.teleportDestination.setXYZ(position.x, position.y, this.owner.z);
                this.destinationSet = true;
            },
            
            destroy: function () {
                this.teleportDestination.recycle();
            }
        }
    });
}());
