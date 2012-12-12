/**
# COMPONENT **logic-gravity**
A component that causes the object to move according to a specified gravity.

## Dependencies
- [[Handler-Logic]] (on entity's parent) - This component listens for a "handle-logic" message. It then moves the entity according to the gravitational forces.
- [[Collision-Basic]] (on entity) - Not required if this object doesn't collide with things. This component listens for the message 'hit-solid' from the collision-basic component.

## Messages

### Listens for:
- **handle-logic** - Accelerates and moves the objects according to the gravity set. Objects will not move faster than the max velocity set. Though this only velocity attributable to gravity.
  > @param resp.deltaT (number) - The time since the last tick.
- **hit-solid** - Received when we collide with an object is solid to the entity. We stop the movement in the direction of that object.
  > @param collisionInfo.x (number) - Either 1,0, or -1. 1 if we're colliding with an object on our right. -1 if on our left. 0 if not at all. 
  > @param collisionInfo.y (number) - Either 1,0, or -1. 1 if we're colliding with an object on our bottom. -1 if on our top. 0 if not at all. 

## JSON Definition
    {
      "type": "logic-pushable",
      "velocityX" : 0,
      //Optional - The starting x velocity of the entity. Defaults to 0.
	  "velocityY" : 0,
	  //Optional - The starting y velocity of the entity. Defaults to 0.
	  "maxVelocityX" : 3,
	  //Optional - The max x velocity attributed to the entity by gravity. Defaults to 3.
	  "maxVelocityY" : 3, 
	  //Optional - The max y velocity attributed to the entity by gravity. Defaults to 3.
	  "maxVelocity" : 3, 
	  //Optional - The max velocity attributed to the entity by gravity in both x and y. This is superseded by the specific maxVelocityX and maxVelocityY values. Defaults to 3.
	  "xGravity" : 0,
	  //Optional - The gravitational acceleration in units/millisecond that the entity moves in x. Defaults to 0.
	  "yGravity" : .01,
	  //Optional - The gravitational acceleration in units/millisecond that the entity moves in y. Defaults to .01.
	  "gravity" : 0
	  //Optional - The gravitational acceleration in units/millisecond that the entity moves in y. This is superseded by the specific yGravity. Defaults to .01.
    }
*/

platformer.components['logic-gravity'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		var self = this;
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['handle-logic', 'hit-solid']);
		
		this.vX = definition.velocityX || 0; 
		this.vY = definition.velocityY || 0;
		this.maxVX = definition.maxVelocityX || definition.maxVelocity || 3;
		this.maxVY = definition.maxVelocityY || definition.maxVelocity || 3;
		this.yGravity = definition.gravity || definition.yGravity || .01;
		this.xGravity = definition.xGravity || 0;
	};
	var proto = component.prototype;
	
	proto['handle-logic'] = function(resp){
		var deltaT = resp.deltaT;
		
		this.vY += this.yGravity * deltaT;
		if (this.vY > this.maxVY)
		{
			this.vY = this.maxVY;
		}
		this.vX += this.xGravity * deltaT;
		if (this.vX > this.maxVX)
		{
			this.vX = this.maxVX;
		}
		
		this.owner.x += (this.vX * deltaT);
		this.owner.y += (this.vY * deltaT);
	};
	
	proto['hit-solid'] = function(collisionInfo){
		if(((collisionInfo.y > 0) && (this.vY > 0)) || ((collisionInfo.y < 0) && (this.vY < 0))){
			this.vY = 0;
		} else if(((collisionInfo.y < 0) && (this.vX < 0)) || ((collisionInfo.x > 0) && (this.vX > 0))){
			this.vX = 0;
		}
		return true;
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.owner = undefined;
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/

	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value, debug){
			self[messageId](value, debug);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();
