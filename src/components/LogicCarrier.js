/**
# COMPONENT **LogicCarrier**
This component allows this entity carry other entities with which it collides. Entities that this component should carry need to have a [[Logic-Portable]] component attached to notify this entity that they are portable.

## Dependencies:
- [[Collision-Group]] - This component will attach a [[Collision-Group]] to this entity if it does not already have this component. `LogicCarrier` uses a collision group to resolve its portable peers' collisions with itself before other world collisions are handled.
- [[Logic-Portable]] (on portable peer entity) - This component listens for 'carry-me' and 'release-me', commonly triggered by [[Logic-Portable]] on a colliding peer entity.

## Messages

### Listens for:
- **load** - On receiving this message, the component ensures that it has a peer collision group component, and adds one if not.
- **carry-me** - On receiving this message, the component triggers `add-collision-entity` on the entity to add the peer entity to its collision group.
  - @param message.entity ([[Entity]]) - Required. The peer entity requesting to be carried.
- **release-me** - On receiving this message, the component triggers `remove-collision-entity` on the entity to remove the peer entity from its collision group.
  - @param message.entity ([[Entity]]) - Required. The peer entity requesting to be released.

### Local Broadcasts
- **add-collision-entity** - On receiving a `carry-me` message, this component triggers this message to add the portable peer to the collision group.
  - @param message ([[Entity]]) - The entity being added to the collision group.
- **remove-collision-entity** - On receiving a `release-me` message, this component triggers this message to remove the portable peer to the collision group.
  - @param message ([[Entity]]) - The entity being removed from the collision group.

## JSON Definition:
    {
      "type": "LogicCarrier"
      // This component has no customizable properties.
    }
    
Requires: ["CollisionGroup"]
*/
/*global platypus */
(function () {
    'use strict';

    return platypus.createComponentClass({
        id: 'LogicCarrier',
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
}());
