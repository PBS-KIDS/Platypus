/**
# COMPONENT **logic-bullet**
This component creates an entity and propels it away. This is useful for casting, firing, tossing, and related behaviors.

## Dependencies:
- [[handler-logic]] (on entity's parent) - This component listens for a logic tick message to determine whether it should be spawning bullets or not.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component checks its current state to decide whether to spawn bullet entities.
- **fire, [equivalent message]** - creates a bullet entity on the following tick message.
  > @param message.pressed (boolean) - Optional. If `message` is included, the component checks the value of `pressed`: false results in no bullets being created.

## JSON Definition
    {
      "type": "logic-bullet"
      // List all additional parameters and their possible values here.

      "bullet": "wet-noodle",
      // Required: string identifying the type of entity to create as a bullet.
      
      "state": "tossing",
      // Optional. The entity state that should be true while bullet entities are being created. Defaults to "firing".
      
      "speed": 4,
      // Optional. The velocity with which the bullet entity should start. Initial direction is determined by this entity's facing states ("top", "right", etc).
      
      "offsetX": 45,
      "offsetY": -20,
      // Optional. Location relative to the entity where the bullet should be located once created. Defaults to (0, 0).
      
      "message": "release-noodle",
      // Optional. Alternative message triggered on entity that should trigger "fire" behavior.
    }
*/
(function(){
	return platformer.createComponentClass({
		
		id: 'logic-bullet',
		
		constructor: function(definition){
			this.state = this.owner.state;
			this.stateName = definition.state || 'firing';
			this.entityClass = platformer.settings.entities[definition.bullet];
			this.speed = definition.speed || this.owner.speed || 0;

			this.state[this.stateName] = false;
			this.bulletPosition = {
				x:0,
				y:0,
				dx: 0,
				dy: 0
			};
			this.bulletProperties = {
				properties: this.bulletPosition
			};
			
			this.offsetX = definition.offsetX || 0;
			this.offsetY = definition.offsetY || 0;
			
			this.firing = false;
			
			if(definition.message){
				this.addListener(definition.message);
				this[definition.message] = this['fire'];
			}
		},

		events: {// These are messages that this component listens for
			"handle-logic": function(){
				var offset = 0,
				state      = this.state;
				
				if(this.firing){
					this.bulletPosition.x = this.owner.x;
					this.bulletPosition.y = this.owner.y;
					
					offset = this.offsetX;
					if(state.left){
						offset *= -1;
					}
					this.bulletPosition.x += offset;
					
					offset = this.offsetY;
					if(state.top){
						offset *= -1;
					}
					this.bulletPosition.y += offset;
					
					if(this.speed){
						if(state.top){
							this.bulletPosition.dy = -this.speed;
						} else if (state.bottom) {
							this.bulletPosition.dy = this.speed;
						} else {
							delete this.bulletPosition.dy;
						}
						if(state.left){
							this.bulletPosition.dx = -this.speed;
						} else if (state.right) {
							this.bulletPosition.dx = this.speed;
						} else {
							delete this.bulletPosition.dx;
						}
					}
					
					this.owner.parent.addEntity(new platformer.classes.entity(this.entityClass, this.bulletProperties));
				}
				
				if(state[this.stateName] !== this.firing){
					state[this.stateName] = this.firing;
				}

				this.firing = false;
			},
			"fire": function(value){
				this.firing = !value || (value.pressed !== false);
			}
		}
	});
})();
