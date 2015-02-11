/**
# COMPONENT **logic-portal**
A component which changes the scene when activated. When the portal receives an occupied message it sends the entity in that message notifying it. This message is meant to give the entity a chance to activate the portal in the manner it wants. The portal can also be activated by simply telling it to activate.

## Dependencies
- [[handler-logic]] (on entity's parent) - This component listens for a "handle-logic" message it then checks to see if it should change the scene if the portal is activated.
- [[change-scene]] (on entity) - This component listens for the "new-scene" message that the logic-portal sends and actually handles the scene changing.
- [[collision-basic]] (on entity) - Not required, but if we want the 'occupied-portal' call to fire on collision you'll need to have a collision-basic component on the portal.

## Messages

### Listens for:
- **handle-logic** - Checks to see if we should change scene if the portal is activated.
- **occupied-portal** - This message takes an entity and then sends the entity a 'portal-waiting' message. The idea behind this was that you could use it with collision. When an entity gets in front of the portal the collision sends this message, we then tell the entity that collided to do whatever it needs and then it calls back to activate the portal.
  - @param message.entity (entity Object) - The entity that will receive the 'portal-waiting' message.
- **activate-portal** - This message turns the portal on. The next 'handle-logic' call will cause a change of scene.

### Local Broadcasts:
- **new-scene** - Calls the 'change-scene' component to tell it to change scenes.
  - @param object.destination (string) - The id of the scene that we want to go to.

### Peer Broadcasts:
- **portal-waiting** - Informs another object that the portal is waiting on it to send the activate message.
  - @param entity - This is the portal entity. To be used so that the object can communicate with it directly.

## JSON Definition
    {
      "type": "name-of-component",
      "destination" : "level-2"
      //Required - The destination scene to which the portal will take us. In most cases this will come into the portal from Tiled where you'll set a property on the portal you place.
    }
*/
	
(function(){
	return platformer.createComponentClass({
		id: 'logic-portal',
 		constructor: function(definition){
 			var entrants = definition.entrants || definition.entrant;
 			
			this.destination = this.owner.destination || definition.destination;
			this.used = false;
			this.ready = false;
			this.wasReady = false;
			if(entrants){
				this.entrants = {};
				if(Array.isArray(entrants)){
					for (var i = 0; i < entrants.length; i++){
						this.entrants[entrants[i]] = false;
					}
				} else {
					this.entrants[entrants] = false;
				}
			}
		},
		events:{
			"handle-logic": function(){
				if (!this.used && this.activated){
					this.owner.trigger("port-" + this.destination);
					this.used = true;
				} else if(this.ready && !this.wasReady) {
					this.owner.triggerEvent('portal-waiting');
					this.wasReady = true;
				} else if(this.wasReady && !this.ready) {
					this.owner.triggerEvent('portal-not-waiting');
					this.wasReady = false;
				}
				
				this.owner.state.occupied = false;
				this.owner.state.ready = true;
				
				//Reset portal for next collision run.
				for (var i in this.entrants){
					if(this.entrants[i]){
						this.owner.state.occupied = true;
						this.entrants[i] = false;
					} else {
						this.owner.state.ready = false;
					}
				}
				this.ready = false;
			},
			"occupied-portal": function(collision){
				this.entrants[collision.entity.type] = true;
				
				for (var i in this.entrants){
					if(!this.entrants[i]){
						return ;
					}
				}
				
				this.ready = true;
			},
			"activate-portal": function(){
				this.activated = true;
			}
		}
	});
})();
