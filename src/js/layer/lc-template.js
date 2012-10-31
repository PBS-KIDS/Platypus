/***********************************
 TODO: Change the component name!
 **********************************/
platformer.components['lc-template'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		
		/**************************************************
		 TODO: Add message ids that need to be called in this component every tick
		 	
		 	e.g.
		 	this.tickMessages = ['render'];
		 *************************************************/
		this.tickMessages = [/*MESSAGE IDS HERE!*/];
		
		/**************************************************
		 TODO: Add message ids this component is listening for here
		 	
		 	e.g.
		 	this.addListeners(['child-entity-added','render']);
		 *************************************************/
		this.addListeners([/*MESSAGE IDS HERE!*/]);  
		
	};
	var proto = component.prototype; 

	/*********************************************************************
	 TODO: Add functions to handle the various messages 
	
		e.g.
		proto['render'] = function(){
			for (var x = 0; x < this.entities.length; x++)
			{
				this.entities[x].trigger('render');
			}
		};
	**********************************************************************/
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.entities.length = 0;
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
