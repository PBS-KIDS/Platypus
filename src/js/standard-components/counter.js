/**
# COMPONENT **counter**
A simple component that keeps count of something and sends messages each time the count changes.

## Messages

### Listens for:
- **change-count** - Changes the count to the given value.
  > @param data.count (number) - The new count value.
- **[change-count message from definition]** - If the entity has multiple counters, you can define a message specific to each counter that will be translated into a change-count call within the object.
  > @param data.count (number) - The new count value.

### Local Broadcasts:
- **update-content** - A call used to notify other components that the count has changed.
  > @param message.text (string) - The count.
  
## JSON Definition
    {
      "type": "counter",
      
      "message" : "coin-change-count"
      //Optional - An alternate message to change-count. Used in the case that you have two counters on the same entity and want to talk to a specific one.
    }
*/

platformer.components['counter'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.count = 0;
		if(definition.message)
		{
			this.addListener(definition.message);
			this[definition.message] = this['change-count'];
		}
		this.addListeners(['change-count']);
		
		this.message = {
		    text: ''
		};
	};
	var proto = component.prototype;
	
	proto['change-count'] = function(data){
		this.count = data.count;
		this.message.text = '' + this.count;
		this.owner.trigger('update-content', this.message);
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
