platformer.components['logic-button'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['layer:logic', 'go-left', 'go-right']);
		
		this.leftMax = 10;
		this.rightMax = 100;
		this.direction = 0;
	};
	var proto = component.prototype;
	
	proto['go-left'] = function (state) {
		if(state.pressed){
			this.direction = -1; 
		} else {
			this.direction = 0; 
		}
	};
	
	proto['go-right'] = function (state) {
		if(state.pressed){
			this.direction = 1; 
		} else {
			this.direction = 0; 
		}
	};
	
	proto['layer:logic'] = function(obj){
		if (this.direction)
		{
			this.owner.x += this.direction;
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
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();
