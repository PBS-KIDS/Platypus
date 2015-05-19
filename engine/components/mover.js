/**
 * This component handles entity motion via velocity and acceleration changes. This is useful for directional movement, gravity, bounce-back collision reactions, jumping, etc.
 * 
 * @class "mover" Component
 * @uses Component
 */
// Requires: ["motion"]
(function(){
    "use strict";
	
	var tempVector = new platformer.Vector();
	
	return platformer.createComponentClass({
		
		id: 'mover',

		properties: {
			ground: [0, 1]
		},
		
		publicProperties: {
			/**
			 * A list of key/value pairs describing vectors or vector-like objects describing acceleration and velocity on the entity.
			 * 
			 * @property movers
			 * @type Array
			 * @default []
			 */
			movers: [],
			
			/**
			 * The velocity of the entity.
			 * 
			 * @property velocity
			 * @type number|Object|Array|Vector
			 * @default: 0
			 */
			
			/**
			 * 
			 */
			gravity: 0,
			
			jump: 0,
			
			drag: 0.99,
			
			friction: 0.94,
			
			maxMagnitude: Infinity
		},
		
		constructor: function(definition){
			platformer.Vector.assign(this.owner, 'position',  'x',  'y',  'z');
			platformer.Vector.assign(this.owner, 'velocity', 'dx', 'dy', 'dz');

			this.position = this.owner.position;
			this.velocity = this.owner.velocity;
			
			// Copy movers so we're not re-using mover definitions
			this.moversCopy = this.movers;
			this.movers = [];

			this.ground = new platformer.Vector(this.ground);
		},

		events: {
			"component-added": function(component){
				if(component.type === 'motion'){
					this.movers.push(component);
				}
			},
			
			"component-removed": function(component){
				var i = 0;
				
				if(component.type === 'motion'){
					for(i = 0; i < this.motions.length; i++){
						if(component === this.motions[i]){
							this.movers.splice(i, 1);
							break;
						}
					}
				}
			},
			
			"load": function(){
				var i = 0,
				movs  = this.moversCopy;
				
				delete this.moversCopy;				
				for (i = 0; i < movs.length; i++) {
					this.addMover(movs[i]);
				}
				
				// Set up speed property if supplied.
				if(this.speed){
					if(!isNaN(this.speed)){
						this.speed = [this.speed, 0, 0];
					}
					this.speed = this.addMover({
						vector: this.speed,
						controlState: "moving"
					}).vector;
				}

				// Set up gravity property if supplied.
				if(this.gravity){
					if(!isNaN(this.gravity)){
						this.gravity = [0, this.gravity, 0];
					}
					this.gravity = this.addMover({
						vector: this.gravity,
						orient: false,
						accelerator: true,
						event: "gravitate"
					}).vector;
				}
				
				// Set up jump property if supplied.
				if(this.jump){
					if(!isNaN(this.jump)){
						this.jump = [0, this.jump, 0];
					}
					this.jump = this.addMover({
						vector: this.jump,
						accelerator: true,
						controlState: "grounded",
						state: "jumping",
						instantEvent: "jump",
						instantDecay: 0.2
					}).vector;
				}
			},
			
			"handle-logic": function(tick){
				var i = 0,
				delta    = tick.delta,
				vect     = tempVector,
				velocity = this.velocity,
				position = this.position;
				
				if(this.owner.state.paused){
					return;
				}
				
				for (i = 0; i < this.movers.length; i++) {
					this.movers[i].update(velocity, position, delta, this.grounded);
				}
				
				// Finally, add aggregated velocity to the position
				if(this.grounded){
					velocity.multiply(this.friction);
				} else {
					velocity.multiply(this.drag);
				}
				if(velocity.magnitude() > this.maxMagnitude){
					velocity.normalize().multiply(this.maxMagnitude);
				}
				vect.set(velocity).multiply(delta);
				position.add(vect);
				
				if(this.grounded !== this.owner.state.grounded){
					this.owner.state.grounded = this.grounded;
				}
				this.grounded = false;
			},
			
			"hit-solid": function(collisionInfo){
				var s = this.velocity.scalarProjection(collisionInfo.direction),
				v     = tempVector;
				
				if(collisionInfo.direction.dot(this.ground) > 0){
					this.grounded = true;
				}
				
			    if(v.set(collisionInfo.direction).normalize().multiply(s).dot(this.velocity) > 0){
					this.velocity.subtractVector(v);
				}
			},
			
			"add-mover": function(moverDefinition){
				this.addMover(moverDefinition);
			}

		},
		
		methods: {
			destroy: function(){
				var v = "";
				
				for (v in this.movers) {
					this.removeMover(v);
				}
			}
		},
		
		publicMethods: {
			addMover: function(mover){
				var m = this.owner.addComponent(new platformer.components["motion"](this.owner, mover));

				return m;
			},
			
			removeMover: function(m){
				this.owner.removeComponent(m);
			}
		}
	});
})();
