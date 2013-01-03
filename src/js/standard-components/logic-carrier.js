platformer.components['logic-carrier'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['carry-me', 'release-me']);
		
	};
	var proto = component.prototype;
	
	proto['carry-me'] = function(resp){
		if(!this.owner.trigger('add-collision-entity', resp.entity)){
			// This message wasn't handled, so add a collision-group component and try again!
			this.owner.addComponent(new platformer.components['collision-group'](this.owner, {}));
			this.owner.trigger('add-collision-entity', this.owner);
			this.owner.trigger('add-collision-entity', resp.entity);
		}
	};
	
	proto['release-me'] = function(resp){
		this.owner.trigger('remove-collision-entity', resp.entity);
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
