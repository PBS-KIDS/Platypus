/**
# COMPONENT **logic-pushable**
A component that enables an entity to be pushed.

## Dependencies
- [[handler-logic]] (on entity's parent) - This component listens for a "handle-logic" message. It then moves the entity if it's being pushed.
- [[collision-basic]] (on entity) - This component listens for messages from the collision-basic component. In particular 'hit-solid' and 'push-entity' are coming from collision. 

## Messages

### Listens for:
- **handle-logic** - Checks to see if we're being pushed. If so, we get pushed. Then resets values.
  - @param resp.delta (number) - The time since the last tick.
- **push-entity** - Received when we collide with an object that can push us. We resolve which side we're colliding on and set up the currentPushX and currentPushY values so we'll move on the handle-logic call.
  - @param collisionInfo.x (number) - Either 1,0, or -1. 1 if we're colliding with an object on our right. -1 if on our left. 0 if not at all. 
  - @param collisionInfo.y (number) - Either 1,0, or -1. 1 if we're colliding with an object on our bottom. -1 if on our top. 0 if not at all.
- **hit-solid** - Called when the entity collides with a solid object. Stops the object from being pushed further in that direction.
  - @param collisionInfo.x (number) - Either 1,0, or -1. 1 if we're colliding with an object on our right. -1 if on our left. 0 if not at all. 
  - @param collisionInfo.y (number) - Either 1,0, or -1. 1 if we're colliding with an object on our bottom. -1 if on our top. 0 if not at all.

## JSON Definition
    {
      "type": "logic-pushable",
       "xPush" : .01,
	  //Optional - The distance per millisecond this object can be pushed in x. Defaults to .01.
	  "yPush" : .01,
	  //Optional - The distance per millisecond this object can be pushed in y. Defaults to .01.
	  "push" : .01
	  //Optional - The distance per millisecond this object can be pushed in x and y. Overwritten by the more specific values xPush and yPush. Defaults to .01.
    }
*/

	
(function(){
	return platformer.createComponentClass({
		id: 'logic-pushable',
		constructor: function(definition){
			this.vX = 0; 
			this.vY = 0;
			this.yPush = definition.push || definition.yPush || 0;
			this.xPush = definition.push || definition.xPush || .01;
			this.currentPushX = 0;
			this.currentPushY = 0;
		},
		events:{
			"handle-logic": function(resp){
				var delta = resp.delta;
				if(this.currentPushY){
					this.vY += (this.currentPushY / Math.abs(this.currentPushY)) * this.yPush * delta;
				}
				if(this.currentPushX){
					this.vX += (this.currentPushX / Math.abs(this.currentPushX)) * this.xPush * delta;
				}
				
				this.owner.x += (this.vX * delta);
				this.owner.y += (this.vY * delta);
				
				this.currentPushX = 0;
				this.currentPushY = 0;
				this.vX = 0;
				this.vY = 0;
			},
			"push-entity": function(collisionInfo){
				this.currentPushX -= (collisionInfo.x || 0);
				this.currentPushY -= (collisionInfo.y || 0);
			},
			"hit-solid": function(collisionInfo){
				if(((collisionInfo.y > 0) && (this.vY > 0)) || ((collisionInfo.y < 0) && (this.vY < 0))){
					this.vY = 0;
				} else if(((collisionInfo.x < 0) && (this.vX < 0)) || ((collisionInfo.x > 0) && (this.vX > 0))){
					this.vX = 0;
				}
				return true;
			}
		}
	});
})();
