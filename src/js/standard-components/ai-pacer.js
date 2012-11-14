/**
# COMPONENT **ai-pacer**

## Description:
This component listens for collision messages and fires a message on itself to change its movement direction.

## Dependencies:
- **collision-basic** (on entity) - This component listens for collision messages on the entity.
- **logic-directional-movement** (on entity) - This component receives triggered messages from this component and moves the entity accordingly.
- **handler-ai** (on entity's parent) - This component listens for an ai "tick" message to orderly perform its control logic.

## Messages

### Listens for:
- **handle-ai** - This AI listens for a step message triggered by its entity parent in order to perform its logic on each tick.
- **turn-around** - On receiving this message, the component will check the collision side and re-orient itself accordingly.
  > @param message.x (integer) - uses `x` to determine if collision occurred on the left (-1) or right (1) of this entity.
  > @param message.y (integer) - uses `y` to determine if collision occurred on the top (-1) or bottom (1) of this entity.

### Local Broadcasts:
- **stop** - Triggered by this component before triggering another direction.
- **go-down**, **go-left**, **go-up**, **go-right** - Triggered in response to an entity colliding from the opposing side.

## JSON Definition:
    {
      "type": "ai-pacer",
      
      "movement": "horizontal",
      // Optional: "vertical", "horizontal", or "both". If nothing is specified, entity changes direction when colliding from any direction ("both").
      
      "direction": "up"
      // Optional: "up", "right", "down", or "left". This specifies the initial direction of movement. Defaults to "up", or "left" if `movement` is horizontal.
    }
*/
platformer.components['ai-pacer'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['handle-ai', 'turn-around']);
		
		this.movement         = definition.movement  || 'both';
		this.lastDirection    = '';
		this.currentDirection = definition.direction || ((this.movement === 'horizontal')?'left':'up');
	};
	var proto = component.prototype;
	
	proto['handle-ai'] = function(obj){
		if(this.currentDirection !== this.lastDirection){
			this.lastDirection = this.currentDirection;
			this.owner.trigger('stop');
			this.owner.trigger('go-' + this.currentDirection);
		}
	};
	
	proto['turn-around'] = function(collisionInfo){
		if ((this.movement === 'both') || (this.movement === 'horizontal')){
			if(collisionInfo.x > 0){
				this.currentDirection = 'left';
			} else if (collisionInfo.x < 0) {
				this.currentDirection = 'right';
			}
		} 
		if ((this.movement === 'both') || (this.movement === 'vertical')){
			if(collisionInfo.y > 0){
				this.currentDirection = 'up';
			} else if (collisionInfo.y < 0) {
				this.currentDirection = 'down';
			}
		} 
	};
	
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
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
