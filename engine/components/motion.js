/* global platformer */
/**
 * This component works in tandem with the [`mover`]("mover"%20Component.html) component by adding a vector of motion to the entity. This component is typically created by `mover` and doesn't need to be added separately.
 * 
 * @class "motion" Component
 * @uses Component
 */
(function(){
    "use strict";
	
	var tempVector = new platformer.Vector(),
	prepUpdate = function(func){
		return function(velocity, position, delta, grounded){
			if(this.accelerator){
				this.resultant = velocity;
			} else {
				this.resultant = position;
			}
			this.update = func;
			this.update(velocity, position, delta, grounded);
		};
	},
	isTrue = function(){
		return true;
	},
	createController = function(self, definition){
		var active = self.active,
		enact = true,
		ready = true,
		getActiveState = isTrue,
		getInstantState = isTrue,
		state = self.owner.state,
		controlState = definition.controlState,
		instantState = definition.instantState;
		
		if(controlState){
			getActiveState = function(){
				return state[controlState];
			};
		}
		
		if(definition.event){
			self.addEventListener(definition.event, function(control){
				active = (control && (control.pressed !== false));
			});
		}
		
		if(definition.instantEvent || instantState){
			if(instantState){
				getInstantState = function(){
					return state[instantState];
				};
			}
		
			if(definition.instantEvent){
				enact = false;
				self.addEventListener(definition.instantEvent, function(control){
					enact = (control && (control.pressed !== false));
				});
			}
			
			self.update = prepUpdate(function(velocity, position, delta, grounded){
				var state = getInstantState();
				
				this.active = active && getActiveState();
				
				if(ready && enact && this.active && state){
					ready = false; // to insure a single instance until things are reset
					this.move(1);
				} else if(!ready && !(enact && state)){
					ready = true;
					this.decay();
				}
			});
		} else {
			self.update = prepUpdate(function(velocity, position, delta, grounded){
				this.active = active && getActiveState();				
				if(this.active){
					this.move(delta);
				}
			});
		}
	};
	
	return platformer.createComponentClass({
		
		id: 'motion',

		properties: {
			orient: true,
			accelerator: false,
			active: true,
			maxMagnitude: Infinity,
			event: "",
			controlState: "",
			instantEvent: "",
			instantState: "",
			instantDecay: null,
			vector: 0
		},
		
		publicProperties: {
		},
		
		constructor: function(definition){
			this.vector = new platformer.Vector(this.vector);
			this.triggered = false;
			
			if(!isNaN(this.instantDecay)){
				this.capMagnitude = this.vector.magnitude() * this.instantDecay;
			} else {
				this.capMagnitude = -1;
			}
			
			createController(this, definition);
			
			if(this.orient){ // Orient vectors in case the entity is in a transformed position.
				this.owner.triggerEvent('orient-vector', this.vector);
			}
		},

		events: {
		},
		
		methods: {
			move: function(delta){
				if(this.vector.magnitude() > this.maxMagnitude){
					this.vector.normalize().multiply(this.maxMagnitude);
				}
				this.resultant.add(tempVector.set(this.vector).multiply(delta));
			},
			
			// This handles things like variable height jumping by adjusting the jump velocity to the pre-determined cap velocity for jump-button release.
			decay: function(){
				var s = null;
				
				if(this.capMagnitude >= 0){
					s = tempVector.set(this.resultant).scalarProjection(this.vector);
				    if(s > this.capMagnitude){
						this.resultant.subtractVector(tempVector.set(this.vector).normalize().scale(s - this.capMagnitude));
					}
				}
			},
			
			destroy: function(){
				if(this.orient){
					this.owner.triggerEvent('remove-vector', this.vector);
				}
			}
		},
		
		publicMethods: {
		}
	});
})();
