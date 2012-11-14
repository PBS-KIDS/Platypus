platformer.components['change-scene'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.scene = definition.scene;
		this.transition = definition.transition || 'instant';
		this.overrides = definition.overrides || false;
		
		this.addListeners(['new-scene']);
	};
	var proto = component.prototype;
	
	proto['new-scene'] = function(response){
		var resp   = response || this,
		scene      = resp.scene || this.scene,
		transition = resp.transition || this.transition;
		overrides  = resp.overrides  || this.overrides;

		platformer.game.loadScene(scene, transition, overrides);
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
