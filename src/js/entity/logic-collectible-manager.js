platformer.components['logic-collectible-manager'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['load', 'peer-entity-added', 'gem-collected']);
		
		this.gemsCollected;
		this.gemTotal;
	};
	var proto = component.prototype;
	
	proto['load'] = function(resp){
		
	};
	
	proto['peer-entity-added'] = function(entity){
		if(entity.type == 'gem')
		{
			this.gemTotal++;
			//this.owner.trigger('logic-gem-added', {total: this.gemTotal});
		}
	};
	
	proto['gem-collected'] = function(resp){
		this.gemsCollected++;
		this.owner.trigger('logic-gem-collected', {count: this.gemsCollected});
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
