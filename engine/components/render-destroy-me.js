/**
# COMPONENT **render-destroy-me**
This component will destroy the entity once an animation has finished. This is useful for explosions or similar animations where the entity is no longer needed once the animation completes.

## Dependencies:
- [[render-sprite]] (component on entity) - This component listens for the "animation-complete" event triggered by render-sprite.

### Listens for:
- **animation-complete** - On receiving this message, the component match the animation id with its animation id setting and destroy the entity if they match.
  - @param animationId (string) - animation id for the animation that just finished.

## JSON Definition:
    {
      "type": "render-destroy-me",
      
      "animationId": "bigExplosion"
      //This or animationIds Required. String identifying the animation that should destroy this entity on its completion.
      
      "animationIds": ["bigExplosion", "lessBigExplosion"]
      //This or animationIds Required. Array of Strings identifying the animations that should destroy this entity on their completion.
    }
*/
(function(){
	return platformer.createComponentClass({
		id: 'render-destroy-me',

		constructor: function(definition){
			this.animationIds = null;
			
			if (definition.animationId) {
				this.animationIds = [definition.animationId];
			} else if (definition.animationIds) {
				this.animationIds = definition.animationIds;
			}
		},

		events: {// These are messages that this component listens for
			"animation-ended": function(id){
				if(this.animationIds){
					for (var x = 0; x < this.animationIds.length; x++) {
						if (this.animationIds[x] == id) {
							this.owner.parent.removeEntity(this.owner);
							break;
						}
					}
				} else {
					this.owner.parent.removeEntity(this.owner);
				}
			}
		}
	});
})();
