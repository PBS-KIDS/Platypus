/**
# COMPONENT **LogicRebounder**
This component works with `CollisionBasic` to cause entities to bounce away on solid collisions.

## Dependencies
- [[CollisionBasic]] - Relies on collision messages to perform rebounding movement.

## Messages

### Listens for:
- **handle-logic** - On receiving this message, `LogicRebounder` clears its stored collision information.
- **hit-static** - On receiving this message, `LogicRebounder` rebounds.
  - @param message.direction (2d vector) - This is the direction in which the collision occurred, tangental to the impact interface.
- **hit-non-static** - On receiving this message, `LogicRebounder` rebounds.
  - @param message.direction (2d vector) - This is the direction in which the collision occurred, tangental to the impact interface.
  - @param message.entity ([[entity]]) - This is the entity with which this entity is colliding.
- **share-velocity** - On receiving this message, `LogicRebounder` stores collision information.
  - @param entity ([[entity]]) - This is the entity with which this entity is colliding.

### Peer Broadcasts:
- **share-velocity** - This component triggers this message to prevent double collision calls.
  - @param entity ([[entity]]) - This entity.

## JSON Definition
    {
      "type": "LogicRebounder",
      
      "mass": 12,
      // Optional. Relative size of the entity. Defaults to 1.
      
      "elasticity": 0.4
      // Optional. Bounciness of the entity. Defaults to 0.8.
    }

Requires: ["../Vector.js"]
*/
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    return platypus.createComponentClass({
        id: 'LogicRebounder',
        
        constructor: function (definition) {
            platypus.Vector.assign(this.owner, 'velocity', 'dx', 'dy', 'dz');

            this.owner.mass = this.owner.mass || definition.mass || 1;
            this.elasticity = definition.elasticity || 0.8;
            
            this.v = new platypus.Vector(0, 0, 0);
            this.incidentVector = new platypus.Vector(0, 0, 0);
            
            this.staticCollisionOccurred = false;
            this.nonStaticCollisionOccurred = false;
            
            this.hitThisTick = [];
            this.otherV = new platypus.Vector(0, 0, 0);
            this.otherVelocityData = [];
        },

        events: {// These are messages that this component listens for
            "handle-logic": function (resp) {
                this.hitThisTick = [];
                this.otherVelocityData.length = 0;
            },
            "hit-static": function (collData) {
                var magnitude = 0,
                    other = collData.entity,
                    x = 0;

                for (x = 0; x < this.hitThisTick.length; x++) {
                    if (other === this.hitThisTick[x]) {
                        return;
                    }
                }
                this.hitThisTick.push(other);
                
                this.v.set(this.owner.velocity);
                this.incidentVector.set(collData.direction);
                
                magnitude = this.v.scalarProjection(this.incidentVector);
                if (!isNaN(magnitude)) {
                    this.incidentVector.scale(magnitude * (1 + this.elasticity));
                    this.v.subtractVector(this.incidentVector);
                }
                
                this.owner.velocity.set(this.v);
            },
            "hit-non-static": function (collData) {
                var x = 0,
                    other          = collData.entity,
                    otherVSet      = false,
                    relevantV      = 0,
                    otherRelevantV = 0,
                    reboundV       = 0;
                
                for (x = 0; x < this.hitThisTick.length; x++) {
                    if (other === this.hitThisTick[x]) {
                        return;
                    }
                }
                this.hitThisTick.push(other);
                
                for (x = 0; x < this.otherVelocityData.length; x++) {
                    if (other === this.otherVelocityData[x].entity) {
                        this.otherV.set(this.otherVelocityData[x].velocity);
                        otherVSet = true;
                        break;
                    }
                }
                
                if (!otherVSet) {
                    this.otherV.set(other.velocity);
                    other.triggerEvent('share-velocity', this.owner);
                }
                
                this.v.set(this.owner.velocity);
                this.incidentVector.set(collData.direction);
                
                
                relevantV = this.v.scalarProjection(this.incidentVector);
                relevantV = (isNaN(relevantV)) ? 0 : relevantV;
                otherRelevantV = this.otherV.scalarProjection(this.incidentVector);
                otherRelevantV = (isNaN(otherRelevantV)) ? 0 : otherRelevantV;
                
                reboundV = (relevantV * (this.owner.mass - other.mass) + 2 * other.mass * otherRelevantV) / (this.owner.mass + other.mass);
                
                this.incidentVector.scale(reboundV - relevantV);
                
                this.owner.velocity.set(this.incidentVector);
                
            },
            "share-velocity": function (other) {
                this.otherVelocityData.push({entity: other, velocity: new platypus.Vector(other.velocity)});
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
}());
