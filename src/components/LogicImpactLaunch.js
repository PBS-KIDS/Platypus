/**
# COMPONENT **LogicImpactLaunch**
This component will cause the entity to move in a certain direction on colliding with another entity.

## Dependencies:
- [[HandlerLogic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its location.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component updates its location according to its current state.
- **impact-launch** - On receiving this message, the component causes the entity's position to change according to the preset behavior.
  - @param collisionInfo.x (number) - Either 1,0, or -1. 1 if we're colliding with an object on our right. -1 if on our left. 0 if not at all.
  - @param collisionInfo.y (number) - Either 1,0, or -1. 1 if we're colliding with an object on our bottom. -1 if on our top. 0 if not at all.
- **hit-solid** - On receiving this message, the component discontinues its impact-launch behavior.
  - @param collisionInfo.y (number) - Either 1,0, or -1. If colliding below, impact-launch behavior ceases.

## JSON Definition:
    {
      "type": "LogicImpactLaunch",
      
      "state": "launching",
      // Optional: This sets the state of the entity while it's being launched. Defaults to "stunned".
      
      "accelerationX": 5,
      "accelerationY": 5,
      // Optional: acceleration entity should have in world units while being launched. Defaults to -0.2 for x and -0.6 for y.
      
      "flipX": true,
      "flipY": true
      // Optional: whether the directions of acceleration should flip according to the direction of the collision. Defaults to false for y and true for x.
    }

*/
/* global platypus */
import Vector from '../Vector.js';
import createComponentClass from '../factory.js';

export default (function () {
    return createComponentClass(/** @lends LogicImpactLaunch.prototype */{
        id: 'LogicImpactLaunch',
        
        properties: {
            accelerationX: -0.3,
            accelerationY: -0.8,
            flipX: true,
            flipY: false
        },
        
        initialize: function (definition) {
            this.stunState = definition.state || "stunned";
            
            this.flipX = this.flipX ? -1 : 1;
            this.flipY = this.flipY ? -1 : 1;

            this.justJumped = false;
            this.stunned = false;
            
            this.state = this.owner.state;
            this.state.set('impact', false);
            this.state.set(this.stunState, false);
        },
        
        events: {
            "component-added": function (component) {
                if (component === this) {
                    if (!this.owner.addMover) {
                        platypus.debug.warn('The "LogicDirectionalMovement" component requires a "Mover" component to function correctly.');
                        return;
                    }

                    this.direction = this.owner.addMover({
                        velocity: [0, 0, 0],
                        orient: false
                    }).velocity;
                    this.vector = Vector.setUp();
                }
            },

            "handle-logic": function () {
                this.state.set('impact', this.justJumped);
                this.state.set(this.stunState, this.stunned);

                if (this.justJumped) {
                    this.direction.setVector(this.vector);
                    this.justJumped = false;
                    this.stunned = true;
                }
            },
            
            "impact-launch": function (collisionInfo) {
                var dx = collisionInfo.x,
                    dy = collisionInfo.y;
                
                if (collisionInfo.entity) {
                    dx = collisionInfo.entity.x - this.owner.x;
                    dy = collisionInfo.entity.y - this.owner.y;
                }

                if (!this.stunned) {
                    this.justJumped = true;
                    if (dx >= 0) {
                        this.vector.x = this.accelerationX;
                    } else if (dx < 0) {
                        this.vector.x = this.accelerationX * this.flipX;
                    }
                    if (dy >= 0) {
                        this.vector.y = this.accelerationY;
                    } else if (dy < 0) {
                        this.vector.y = this.accelerationY * this.flipY;
                    }
                }
            },
            
            "hit-solid": function (collisionInfo) {
                if (this.stunned && (collisionInfo.y > 0)) {
                    this.direction.x = 0;
                    this.direction.y = 0;
                    this.stunned = false;
                }
            }
        },
        
        methods: {
            destroy: function () {
                this.vector.recycle();
                this.state = null;
            }
        }
    });
}());
