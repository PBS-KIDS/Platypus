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
	var setMagnitude = function(direction, magnitude){
		return (direction / Math.abs(direction)) * magnitude;
	};
	
	return platformer.createComponentClass({
		id: 'logic-pushable',
		constructor: function(definition){
			this.yPush = definition.push || definition.yPush || 0;
			this.xPush = definition.push || definition.xPush || .1;
			if(definition.roll){
				this.radius = definition.radius || this.owner.radius || ((this.owner.width || this.owner.height || 2) / 2);
				this.owner.orientation = this.owner.orientation || 0;
			} else {
				this.radius = 0;
			}
			this.currentPushX = 0;
			this.currentPushY = 0;
			this.lastX = this.owner.x;
			this.lastY = this.owner.y;
			this.pushers = [];
		},
		events:{
			"handle-logic": function(resp){
				var delta = resp.delta;
				
				if(this.currentPushY){
					this.owner.y += setMagnitude(this.currentPushY, this.yPush * delta);
					this.currentPushY = 0;
				}
				if(this.currentPushX){
					this.owner.x += setMagnitude(this.currentPushX, this.xPush * delta);
					this.currentPushX = 0;
				}
				if((this.lastX !== this.owner.x) || (this.lastY !== this.owner.y)){
					if(this.radius){
						this.owner.orientation += (this.owner.x + this.owner.y - this.lastX - this.lastY) / this.radius;
					}
					this.lastX = this.owner.x;
					this.lastY = this.owner.y;
				}
				for(var i = 0; i < this.pushers.length; i++){
					this.pushers[i].triggerEvent('pushed', this.owner);
				}
				this.pushers.length = 0;
			},
			"push-entity": function(collisionInfo){
				var x = (collisionInfo.x || 0),
				y     = (collisionInfo.y || 0);
				
				this.currentPushX -= x;
				this.currentPushY -= y;
				if((this.yPush && y) || (this.xPush && x)){
					this.pushers.push(collisionInfo.entity);
				}
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
