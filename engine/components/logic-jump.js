/**
# COMPONENT **logic-jump**
This component will cause the entity to jump with a certain amount of acceleration for a certain period of time.

## Dependencies:
- [[handler-logic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its location.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component updates its location according to its current state.
- **jump** - On receiving this message, the component causes the entity's position to change according to the preset behavior. Entity must be colliding with ground to jump.
  - @param message.pressed (boolean) - Optional. If `message` is included, the component checks the value of `pressed`: a value of false will not make it jump.
- **air-jump** - On receiving this message, the component causes the entity's position to change according to the preset behavior. Entity will jump regardless of ground contact.
  - @param message.pressed (boolean) - Optional. If `message` is included, the component checks the value of `pressed`: a value of false will not make it jump.
- **hit-solid** - On receiving this message, the component discontinues its jump velocity.
  - @param collisionInfo.x (number) - Either 1,0, or -1. Zeros out the jump velocity if acceleration is in the contrary direction.
  - @param collisionInfo.y (number) - Either 1,0, or -1. Zeros out the jump velocity if acceleration is in the contrary direction.

### Local Broadcasts:
- **just-jumped** - this component will trigger this message when it receives a "jump" message and is able to jump. This is useful for tying in a jump sound.

## JSON Definition:
    {
      "type": "logic-jump",
      
      "velocityX": 0.2,
      "velocityY": -0.7,
      // Initial velocity of the jump. Defaults to -1 for y, 0 for x.
      
      "velocityCapRatio": 0.5
      // determines maximum velocity when jump button is released to allow for variable jump heights. Setting this to 1 removes variable height jumping. Defaults to 0.5, making the cap half of jump velocity.
    }

Requires: ["../vector.js"]
*/
(function(){
	return platformer.createComponentClass({
		id: 'logic-jump',
		constructor: function(definition){
			var x = this.owner.velocityX || definition.velocityX || 0,
			y     = this.owner.velocityY || definition.velocityY || definition.velocity,
			cap   = definition.velocityCapRatio || 0.5;

			if(typeof y !== 'number'){
				y = -1;
			}
			
			this.velocity = new platformer.Vector(x, y, 0);
			this.cap      = this.velocity.copy().scale(cap);
			this.capMagnitude = this.cap.magnitude();
			this.cap.normalize();
			
			platformer.Vector.assign(this.owner, 'velocity', 'dx', 'dy', 'dz');
			
			this.jumping = false;
			this.justJumped = false;
			this.grounded = true;
			
			this.state = this.owner.state;
			this.state.jumping    = false;
			this.state.justJumped = false;
		},
		
		events:{
			"handle-logic": function(resp){
				var v = null,
				s     = 0;
				
				if(this.state.justJumped !== this.justJumped){
					this.state.justJumped = this.justJumped;
				}

				if(this.justJumped){
					this.justJumped = false;
					this.owner.triggerEvent("just-jumped");
					this.owner.velocity.set(this.velocity);
				}
				
				if(this.state.jumping !== this.jumping){
					this.state.jumping = this.jumping;
					
					// This handles variable height jumping by adjusting the jump velocity to the pre-determined cap velocity for jump-button release.
					if(!this.jumping){
						v = new platformer.Vector(this.owner.velocity);
						s = v.scalarProjection(this.velocity);
					    if(s > this.capMagnitude){
							v.subtractVector(this.cap.copy().scale(s - this.capMagnitude));
							this.owner.velocity.set(v);
						}
					}
				}

				this.grounded = false;
			},
			
			"jump": function(state){
				var jumping = false;
				
				if(state){
					jumping = (state.pressed !== false);
				} else {
					jumping = true;
				}

				if(!this.jumping && jumping && this.grounded){
					if(state){
						this.justJumped = (state.triggered !== false);
					} else {
						this.justJumped = true;
					}
					this.jumping = true;
				} else if (this.jumping && !jumping) {
					this.jumping = false;
				}
			},
			
			"air-jump": function(state){
				var jumping = false;
				
				if(state){
					jumping = (state.pressed !== false);
				} else {
					jumping = true;
				}

				if(!this.jumping && jumping){
					this.justJumped = true;
					this.jumping = true;
				} else if (this.jumping && !jumping) {
					this.jumping = false;
				}
			},
			
			"hit-solid": function(collisionInfo){
				if(!this.justJumped){
					if(collisionInfo.y){
						this.owner.dy = 0;
						if(((collisionInfo.y > 0) && (this.velocity.y < 0)) || ((collisionInfo.y < 0) && (this.velocity.y > 0))){
							this.jumping = false;
							this.grounded = true;
						}
					} else if(collisionInfo.x){
						this.owner.dx = 0;
						if(((collisionInfo.x < 0) && (this.velocity.x > 0)) || ((collisionInfo.x > 0) && (this.velocity.x < 0))){
							this.jumping = false;
							this.grounded = true;
						}
					}
				}
				return true;
			}
		}
	});
})();
