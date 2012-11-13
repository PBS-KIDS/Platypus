platformer.components['logic-briar'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		var self = this;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['load', 'peer-entity-added', 'caught-hero']);
		
		this.owner.flower = undefined;
	};
	var proto = component.prototype;
	
	
	proto['load'] = function(resp){
		this.owner.trigger('logical-state', {state: 'bottom'});
	};
	
	proto['peer-entity-added'] = function(entity){
		if(entity.type == 'flower')
		{
			if(entity.linkId == this.owner.linkId)
			{
				this.owner.flower = entity;
			}
		}
	};
	
	
	
	proto['caught-hero'] = function(collisionInfo){
		if(collisionInfo.y < 0)
		{
			collisionInfo.entity.trigger('teleport', {x: this.owner.flower.x, y: this.owner.flower.y});
		} else if (collisionInfo.y > 0) {
			collisionInfo.entity.trigger('set-velocity', {vY: 0});
		}
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.owner.flower = undefined;
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
