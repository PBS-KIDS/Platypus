/**
# COMPONENT **destroy-me**
This component will cause the entity to remove itself from its parent upon receiving a given message.

## Dependencies:
- [[Entity-Container]] (on entity's parent) - This component requires the entity to have `entity.parent` defined as the entity containing this entity. This is commonly provided by an [[Entity-Container]] on the parent entity.

## Messages

### Listens for:
- **destroy-me** - On receiving this message, the component removes this entity from the parent, which typically destroys the entity.
- **[Message specified in definition]** - An alternative message can be specified in the JSON definition that will also cause the entity's removal.

## JSON Definition:
    {
      "type": "destroy-me",
      
      "message": "hit-by-wrench",
      // Optional: If specified, this message will cause the entity to be removed in addition to a "destroy-me" message.
      
      "delay": 250
      // Optional: Time in milliseconds before entity should be destroyed. If not defined, it is instantaneous.
    }
*/
platformer.components['destroy-me'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['destroy-me']);
		
		if(definition.message){
			this.addListener(definition.message);
			this[definition.message] = this['destroy-me'];
		}
		
		this.destroyed = false;
		this.delay = definition.delay || 0;
	};
	var proto = component.prototype;
	
	proto['destroy-me'] = function(){
		var self = this;
		if(!this.destroyed){
			setTimeout(function(){
				self.owner.parent.removeEntity(self.owner);
			}, this.delay);
		}
		this.destroyed = true;
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
