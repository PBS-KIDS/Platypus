platformer.components['broadcast-events'] = (function(){
	var broadcast = function(event){
		return function(value){
			platformer.game.currentScene.trigger(event, value);
		};
	}, 
	component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for and then broadcasts to all layers.
		// Make sure it does not receive and broadcast matching messages or an infinite loop will result.
		this.listeners = [];
		if(definition.events){
			for(var event in definition.events){
				this[event] = broadcast(definition.events[event]);
				this.addListener(event);
			}
		}
		
	},
	proto = component.prototype;
	
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
