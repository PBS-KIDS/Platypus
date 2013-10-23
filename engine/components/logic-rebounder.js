/**
# COMPONENT **name-of-component**
Summarize the purpose of this component here.

## Dependencies
- [[Required-Component]] - List other components that this component requires to function properly on an entity.

## Messages

### Listens for:
- **received-message-label** - List all messages that this component responds to here.
  > @param message-object-property (type) - under each message label, list message object properties that are optional or required.

### Local Broadcasts:
- **local-message-label** - List all messages that are triggered by this component on this entity here.
  > @param message-object-property (type) - under each message label, list message object properties that are optional or required.

### Peer Broadcasts:
- **peer-message-label** - List all messages that are triggered by this component on other entities here.
  > @param message-object-property (type) - under each message label, list message object properties that are optional or required.

## JSON Definition
    {
      "type": "name-of-component"
      // List all additional parameters and their possible values here.
    }
*/
(function(){
	return platformer.createComponentClass({
		id: 'logic-rebounder',
		
		constructor: function(definition){
			this.owner.dx = 0;
			this.owner.dy = 0;
			this.owner.mass = this.owner.mass || definition.mass || 1;
			this.elasticity = definition.elasticity || .8;
			
			this.v = new platformer.classes.vector2D(0,0);
			this.incidentVector = new platformer.classes.vector2D(0,0); 
			
			this.staticCollisionOccurred = false;
			this.nonStaticCollisionOccurred = false;
			
			this.hitThisTick = [];
			this.otherVelocityData = null;
			this.otherV = new platformer.classes.vector2D(0,0);
			this.otherVelocityData = [];
			
		},

		events: {// These are messages that this component listens for
			"handle-logic": function (resp) {
				this.hitThisTick = [];
				this.otherVelocityData = [];
			},
			"hit-static": function (collData) {
				var magnitude = 0;
				
				this.v.set(this.owner.dx, this.owner.dy);
				this.incidentVector.set(collData.direction.x, collData.direction.y);
				
				magnitude = this.v.scalarProjection(this.incidentVector);
				if (!isNaN(magnitude))
				{
					this.incidentVector.scale(magnitude * (1 + this.elasticity));
					this.v.subtractVector(this.incidentVector);
				}
				
				this.owner.dx = this.v.x;
				this.owner.dy = this.v.y;
			},
			"hit-non-static": function (collData) {
				var other = collData.entity;
				var otherVSet = false;
				
				var collisionMagnitude = 0;
				var relevantMagnitude = 0;
				
				var relevantV = 0;
				var otherRelevantV = 0;
				
				var reboundV = 0;
				
				for (var x = 0; x < this.hitThisTick.length; x++) {
					if (other === this.hitThisTick[x]) {
						return;
					}
				}
				this.hitThisTick.push(other);
				
				for (var x = 0; x < this.otherVelocityData.length; x++) {
					if (other === this.otherVelocityData[x].entity) {
						this.otherV.set(this.otherVelocityData[x].vX, this.otherVelocityData[x].vY);
						otherVSet = true;
						break;
					}
				}
				
				if (!otherVSet) {
					this.otherV.set(other.dx, other.dy);
					other.triggerEvent('share-velocity', this.owner);
				}
				
				this.v.set(this.owner.dx, this.owner.dy);
				this.incidentVector.set(collData.direction.x, collData.direction.y);
				
				
				relevantV = this.v.scalarProjection(this.incidentVector);
				relevantV = (isNaN(relevantV)) ? 0 : relevantV;
				otherRelevantV = this.otherV.scalarProjection(this.incidentVector);
				otherRelevantV = (isNaN(otherRelevantV)) ? 0 : otherRelevantV;
				
				reboundV = (relevantV * (this.owner.mass - other.mass) + 2 * other.mass * otherRelevantV) / (this.owner.mass + other.mass);
				
				this.incidentVector.scale(reboundV - relevantV);
				
				/*
				relevantMag = this.v.scalarProjection(this.incidentVector) * this.owner.mass;
				relevantMag = (isNaN(relevantMag)) ? 0 : relevantMag;
				otherRelevantMag = this.otherV.scalarProjection(this.incidentVector) * other.mass;
				otherRelevantMag = (isNaN(otherRelevantMag)) ? 0 : otherRelevantMag;
				
				collisionMagnitude = (relevantMag - otherRelevantMag);
				
				collisionMagnitude /= this.owner.mass;
				
				this.incidentVector.scale(collisionMagnitude  *(this.elasticity));
				*/
				
				this.owner.dx += this.incidentVector.x;
				this.owner.dy += this.incidentVector.y;
				
			},
			"share-velocity": function (other) {
				this.otherVelocityData.push({entity: other, vX: other.dx, vY: other.dy});
			}
		},
		
		methods: {// These are methods that are called by this component.
			destroy: function () {
				this.v = null;
				this.otherV = null;
				this.incidentVector = null;
				this.hitThisTick = null;
			}	
		},
		
		publicMethods: {// These are methods that are available on the entity.

		}
	});
})();
