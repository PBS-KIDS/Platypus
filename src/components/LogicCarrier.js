/* global platypus */
import createComponentClass from '../factory.js';

export default (function () {
    return createComponentClass(/** @lends LogicCarrier.prototype */{
        id: 'LogicCarrier',
        /**
         * This component allows this entity carry other entities with which it collides. Entities that this component should carry need to have a [[Logic-Portable]] component attached to notify this entity that they are portable.
         *
         * @memberof platypus.components
         * @uses platypus.Component
         * @constructs
         * @listens platypus.Entity#load
         */
        initialize: function () {},
        events: {
            "load": function () {
                /**
                 * On receiving a `carry-me` message, this component triggers this message to add the portable peer to the collision group.
                 *
                 * @event 'add-collision-entity'
                 * @param entity {platypus.Entity} The entity being added to the collision group.
                 */
                if (!this.owner.triggerEvent('add-collision-entity', this.owner)) {
                    // This message wasn't handled, so add a CollisionGroup component and try again!
                    this.owner.addComponent(new platypus.components.CollisionGroup(this.owner, {}));
                    this.owner.triggerEvent('add-collision-entity', this.owner);
                }
            },

            /**
             * On receiving this message, the component triggers `add-collision-entity` on the entity to add the peer entity to its collision group.
             *
             * @method 'carry-me'
             * @param message.entity {platypus.Entity} The peer entity requesting to be carried.
             */
            "carry-me": function (resp) {
                this.owner.triggerEvent('add-collision-entity', resp.entity);
            },

            /**
             * On receiving this message, the component triggers `remove-collision-entity` on the entity to remove the peer entity from its collision group.
             *
             * @method 'carry-me'
             * @param message.entity {platypus.Entity} The peer entity requesting to be released.
             */
            "release-me": function (resp) {
                /**
                 * On receiving a `release-me` message, this component triggers this message to remove the portable peer to the collision group.
                 *
                 * @event 'remove-collision-entity'
                 * @param entity {platypus.Entity} The entity being removed from the collision group.
                 */
                this.owner.triggerEvent('remove-collision-entity', resp.entity);
            }
        }
    });
}());
