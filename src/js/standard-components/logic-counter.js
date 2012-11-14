platformer.components['logic-counter'] = (function(){
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
	};
	var proto = component.prototype;
	
	proto['change-count'] = function(data){
		this.count = data.count;
		this.owner.trigger('refresh-count', this.count);
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
