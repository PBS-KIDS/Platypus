/* global platypus */
import createComponentClass from '../factory.js';

export default createComponentClass(/** @lends platypus.components.LogicCarrier.prototype */{
    
    id: 'LogicCarrier',
    
    /**
     * This component allows this entity carry other entities with which it collides. Entities that this component should carry need to have a [[Logic-Portable]] component attached to notify this entity that they are portable.
     *
     * @memberof platypus.components
     * @uses platypus.Component
     * @constructs
     * @listens platypus.Entity#load
     * @listens platypus.Entity#carry-me
     * @listens platypus.Entity#release-me
     * @fires platypus.Entity#add-collision-entity
     * @fires platypus.Entity#remove-collision-entity
     */
    initialize: function () {},

    events: {
        "load": function () {
            if (!this.owner.triggerEvent('add-collision-entity', this.owner)) {
                // This message wasn't handled, so add a CollisionGroup component and try again!
                this.owner.addComponent(new platypus.components.CollisionGroup(this.owner, {}));
                this.owner.triggerEvent('add-collision-entity', this.owner);
            }
        },

        "carry-me": function (resp) {
            this.owner.triggerEvent('add-collision-entity', resp.entity);
        },

        "release-me": function (resp) {
            this.owner.triggerEvent('remove-collision-entity', resp.entity);
        }
    }
});
