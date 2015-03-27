/**
# COMPONENT **logic-teleportee**
This component causes an entity to teleport when receiving a teleport message.

## Dependencies:
- [[collision-basic]] (on entity) - This component triggers "relocate-entity" to perform teleport, for which "collision-basic" listens.
- [[handler-logic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its location.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component updates its location according to its current state.
- **teleport** - Teleports the entity to its set destination.
- **set-destination** - Sets the destination to teleport to in world coordinates.
  - @param message.x, message.y (number) - The position in world coordinates to set the teleport destination to.
- **hit-telepoint** - Sets the destination to the colliding entity's coordinates: useful for checkpoint behavior.
  - @param message ([[Entity]]) - The entity whose coordinates will be the teleport destination.

### Local Broadcasts:
- **relocate-entity** - Broadcasts the new location for the entity.
  - @param message.x, message.y (number) - The position in world coordinates to set the teleport destination to.
- **teleport-complete** - Triggered once the entity has been moved to the new location.

## JSON Definition
    {
      "type": "logic-teleportee"
    }

Requires: ["../vector.js"]
*/
(function(){
	return platformer.createComponentClass({
		id: 'logic-teleportee',
		
		constructor: function(definition){
			this.teleportDestination = new platformer.Vector();
			this.teleportNow = false;
			this.DestinationSet = false;
		},

		events: {// These are messages that this component listens for
			"handle-logic": function(){
				if (this.teleportNow){
					this.owner.trigger('relocate-entity', {position: this.teleportDestination});
					this.teleportNow = false;
					this.owner.trigger('teleport-complete');
				}
			},
			"teleport": function(){
				if (this.destinationSet) {
					this.teleportNow = true;
				}
			},
			"set-destination": function(position){
				this.setDestination(position);
			},
			"hit-telepoint": function(collisionInfo){
				this.setDestination(collisionInfo.entity);
			}
		},
		
		methods: {
			setDestination: function(position){
				this.teleportDestination.set(position.x, position.y);
				this.destinationSet = true;
			}
		}
	});
})();
