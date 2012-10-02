gws.components['collision-hero'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['load', 'layer:collision']);
		this.owner.AABB = definition.AABB || [0, 0, 16, 16]; //offsetX, offsetY, width, height
		this.owner.collisionType = definition.collisionType || 'solid';
		this.owner.collidesWith = definition.collidesWith || [];
	};
	var proto = component.prototype;
	
	
	proto['load'] = function(resp){
		
	};
	
	proto['layer:resolve-collision'] = function(entity){
		switch (entity.type)
		{
		case 'block':
			console.log(this.owner.type + ': There is a collision!');
			break;
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
