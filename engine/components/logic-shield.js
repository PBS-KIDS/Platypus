/**
# COMPONENT **logic-shield**
This component creates an entity and connects it with the current entity. This is useful for entities that have a one-to-one relationship with a given entity and must move as if connected to the host entity.

## Dependencies:
- [[handler-logic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its location.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component updates its location according to its current state.
- **wield-shield** - creates and connects the shield entity to this entity.
  - @param message.pressed (boolean) - Optional. If `message` is included, the component checks the value of `pressed`: false causes a "drop-shield" behavior.
- **drop-shield** - Removes shield entity from this entity and destroys it.

## JSON Definition
    {
      "type": "logic-shield",

      "shield": "cardboard-box",
      // Required: string identifying the type of entity to create as a shield.
      
      "state": "covered",
      // Optional. The entity state that should be true while shield is in place. Defaults to "shielded".
      
      "offsetX": 45,
      "offsetY": -20
      // Optional. Location relative to the entity where the shield should be located once created. Defaults to (0, 0).
    }
*/
(function(){
	var linkId = 0;
	
	return platformer.createComponentClass({
		
		id: 'logic-shield',
		
		constructor: function(definition){
			this.state = this.owner.state;
			this.stateName = definition.state || 'shielded';
			this.entityClass = platformer.game.settings.entities[definition.shield];

			if(!this.owner.linkId){
				this.owner.linkId = 'shield-link-' + linkId++;
			}
			
			this.state[this.stateName] = false;
			this.shieldPosition = {
				x:0,
				y:0,
				dx: 0,
				dy: 0,
				linkId: this.owner.linkId
			};
			this.shieldProperties = {
				properties: this.shieldPosition
			};
			
			this.offsetX = definition.offsetX || 0;
			this.offsetY = definition.offsetY || 0;
			
			this.shield = null;
			this.wieldShield = false;
		},

		events: {// These are messages that this component listens for
			"handle-logic": function(){
				var offset = 0,
				state = this.state;
				
				if(this.wieldShield){
					if(!this.shield){
						this.shieldPosition.x = this.owner.x;
						this.shieldPosition.y = this.owner.y;
						this.shield = this.owner.parent.addEntity(new platformer.classes.entity(this.entityClass, this.shieldProperties));
					}
					
					this.shield.x = this.owner.x;
					offset = this.offsetX;
					if(state.left){
						offset *= -1;
						this.shield.orientation = Math.PI;
					} else if(state.right){
						this.shield.orientation = 0;
					}
					this.shield.x += offset;
					
					this.shield.y = this.owner.y;
					offset = this.offsetY;
					if(state.top){
						offset *= -1;
						this.shield.orientation = Math.PI / 2;
					} else if(state.bottom) {
						this.shield.orientation = -Math.PI / 2;
					}
					this.shield.y += offset;
				} else if(this.shield){
					this.owner.parent.removeEntity(this.shield);
					this.shield = null;
				}
				
				if(state[this.stateName] !== this.wieldShield){
					state[this.stateName] = this.wieldShield;
				}
			},
			"wield-shield": function(value){
				this.wieldShield = !value || (value.pressed !== false);
			},
			"drop-shield": function(){
				this.wieldShield = false;
			}
		},
		
		methods:{
			destroy: function(){
				this.state[this.stateName] = false;
				if(this.shield){
					this.owner.parent.removeEntity(this.shield);
					this.shield = null;
				}
			}			
		}
	});
})();
