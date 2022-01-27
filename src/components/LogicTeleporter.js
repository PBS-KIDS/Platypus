/**
### Listens for:
- **teleport-entity** - On receiving this message, the component will fire `teleport` on the colliding entity, sending this.destination. The colliding entity must handle the `teleport` message and relocate itself.
  - @param message.x (integer) - uses `x` to determine if collision occurred on the left (-1) or right (1) of this entity.
  - @param message.y (integer) - uses `y` to determine if collision occurred on the top (-1) or bottom (1) of this entity.
  - @param message.entity (object) - triggers a `teleport` message on `entity`.

### Peer Broadcasts:
- **teleport** - On receiving a `teleport-entity` message, if the colliding entity is colliding on the teleporter's facing side, this message is triggered on the colliding entity.
  - @param message (object) - sends the destination entity as the message object, the x and y coordinates being the most important information for the listening entity.

## JSON Definition:
    {
      "type": "LogicTeleporter",
      
      "facing": "up",
      // Optional: "up", "down", "left", or "right". Will only trigger "teleport" if colliding entity collides on the facing side of this entity. If nothing is specified, all collisions fire a "teleport" message on the colliding entity.
      
      "teleportId": "Destination entity's linkId property"
      // Required: String that matches the "linkId" property of the destination entity. This destination entity is passed on a "teleport" message so teleporting entity knows where to relocate.
    }

*/
import createComponentClass from '../factory.js';

export default (function () {
    return createComponentClass(/** @lends platypus.components.LogicTeleporter.prototype */{
        id: 'LogicTeleporter',

        /**
         * This component listens for redirected collision messages and fires a message on the colliding entity to specify where the colliding entity should relocate itself.
         * 
         * @memberof platypus.components
         * @uses platypus.Component
         * @constructs
         * @param {*} definition
         * @listens platypus.Entity#peer-entity-added
         */
        initialize: function (definition) {
            
            this.destination = null;
            this.linkId = this.owner.teleportId || definition.teleportId;
            this.facing = this.owner.facing || definition.facing || false; //TODO: Should probably deprecate this in favor of orientation. - DDD 3/2/2016
        
            if (this.facing) {
                this.owner.state.set('facing-' + this.facing, true);
            }
        },

        events: {// These are messages that this component listens for
            "peer-entity-added": function (entity) {
                if (!this.destination && (entity.linkId === this.linkId)) {
                    this.destination = entity;
                }
            },
    
            "teleport-entity": function (collisionInfo) {
                switch (this.facing) {
                case 'up':
                    if (collisionInfo.y < 0) {
                        collisionInfo.entity.triggerEvent('teleport', this.destination);
                    }
                    break;
                case 'right':
                    if (collisionInfo.x > 0) {
                        collisionInfo.entity.triggerEvent('teleport', this.destination);
                    }
                    break;
                case 'down':
                    if (collisionInfo.y > 0) {
                        collisionInfo.entity.triggerEvent('teleport', this.destination);
                    }
                    break;
                case 'left':
                    if (collisionInfo.x < 0) {
                        collisionInfo.entity.triggerEvent('teleport', this.destination);
                    }
                    break;
                default:
                    collisionInfo.entity.triggerEvent('teleport', this.destination);
                    break;
                }
            }
        },
        
        methods: {// These are methods that are called on the component
            "destroy": function () {
                this.destination = null;
            }
        }
        
    });
}());