platformer.components['logic-button'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];
		
		// Create object to send with messages here so it's not recreated each time.
		this.message = {
			state: definition.state || 'released'
		};

		if(definition.toggle){
			this.toggle = true;
			this.addListener('mouseup');
		} else {
			this.addListeners(['mousedown','mouseup']);
		}
		
		this.addListeners(['layer:logic', 'pressed', 'released']);
	};
	var proto = component.prototype;
	
	proto['mousedown'] = proto['pressed'] = function(){
		this.message.state = 'pressed';
	};
	
	proto['mouseup'] = function(){
		if(this.toggle){
			this.message.state = (this.message.state === 'released')?'pressed':'released';
		} else {
			this.message.state = 'released';
		}
	};
	
	proto['released'] = function(){
		this.message.state = 'released';
	};
	
	proto['layer:logic'] = function(resp){
		this.owner.trigger('logical-state', this.message);
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
