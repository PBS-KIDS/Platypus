/**
# COMPONENT **chaff**
This component will destroy the entity once an animation has finished. This is useful for explosions or similar animations where the entity is no longer needed once the animation completes.

## Dependencies:
- [[Render-Animation]] (component on entity) - This component listens for the "animation-complete" event triggered by render-animation.

### Listens for:
- **animation-complete** - On receiving this message, the component match the animation id with its animation id setting and destroy the entity if they match.
  > @param animationId (string) - animation id for the animation that just finished.

## JSON Definition:
    {
      "type": "chaff",
      
      "animationId": "bigExplosion"
      // Required string identifying the animation that should destroy this entity on its completion.
    }
*/
(function(){
	return platformer.createComponentClass({
		id: 'chaff',

		constructor: function(definition){
			this.animationId = definition.animationId || '';
		},

		events: {// These are messages that this component listens for
			"animation-ended": function(animationId){
				if(!this.animationId || this.animationId == animationId) {
					this.owner.parent.removeEntity(this.owner);
				}
			}
		}
	});
})();
