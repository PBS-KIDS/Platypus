/**
# COMPONENT **name-of-component**

## Description
Summarize the purpose of this component here.

## Dependencies
- **required-component** - List other components that this component requires to function properly on an entity.

## Messages

### Listens for:
- **received-message-label** - List all messages that this component responds to here.
  > @param message-object-property (type) - under each message label, list message object properties that are optional or required.

### Local Broadcasts:
- **local-message-label** - List all messages that are triggered by this component on this entity here.
  > @param message-object-property (type) - under each message label, list message object properties that are optional or required.

### Peer Broadcasts:
- **peer-message-label** - List all messages that are triggered by this component on other entities here.
  > @param message-object-property (type) - under each message label, list message object properties that are optional or required.

## JSON Definition
    {
      "type": "name-of-component"
      // List all additional parameters and their possible values here.
    }
*/
platformer.components['name-of-component'] = (function(){ //TODO: Change the name of the component!
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
