/***********************************
 TODO: Change the component name!
 **********************************/
platformer.components['ec-template'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		/**************************************************
		 TODO: Add message ids that this component is listening for here.
		 	
		 	e.g.
		 	this.addListeners(['load']);
		 *************************************************/
		this.addListeners([/*MESSAGE IDS HERE!*/]);
	};
	var proto = component.prototype;
	
	/*********************************************************************
	 TODO: Add functions that handle the various messages. There should be a corresponding function for each 
	       listener added above. 
		
		e.g.
		proto['load'] = function(resp){
			// Run loading code here
		};
	**********************************************************************/
	
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
