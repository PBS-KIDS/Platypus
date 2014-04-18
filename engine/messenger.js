/**
# CLASS messenger
The Messenger object facilitates communication between components and other game objects. Messenger is currently used by [[Entity]] and [[entity-container]].

## Messages

### Local Broadcasts:
- **load** - The entity triggers `load` on itself once all the properties and components have been attached, notifying the components that all their peer components are ready for messages.

## Methods
- **[constructor]** - Returns a new Messenger object.
  - @return messenger - returns a newly instantiated messenger.
- **bind** - Used by components to bind handler functions to triggered events. 
  - @param event (string) - This is the message being listened for.
  - @param func (function) - This is the function that will be run when the message is triggered.
- **toString** - Returns a string describing the messenger.
  - @return string - Returns the type as a string of the form "[messenger object]".
- **trigger** - This method is used by both internal components and external entities to trigger messages. When triggered, messenger checks through bound handlers to run as appropriate.
  - @param event (variant) - This is the message(s) to process. This can be a string, an object containing an "event" property (and optionally a "message" property, overriding the value below), or an array of the same.
  - @param value (variant) - This is a message object or other value to pass along to event handler.
  - @param debug (boolean) - This flags whether to output message contents and subscriber information to the console during game development. A "value" object parameter (above) will also set this flag if value.debug is set to true.
  - @return integer - The number of handlers for the triggered message.
- **triggerEvent** - This method is used by both internal components and external entities to trigger messages on this entity. When triggered, entity checks through bound handlers to run as appropriate.
  - @param event (string) - This is the message to process.
  - @param value (variant) - This is a message object or other value to pass along to handlers.
  - @param debug (boolean) - This flags whether to output message contents and subscriber information to the console during game development. A "value" object parameter (above) will also set this flag if value.debug is set to true.
  - @return integer - The number of handlers for the triggered message.
- **unbind** - Used to unbind handler functions.
  - @param event (string) - This is the message the component is currently listening to.
  - @param func (function) - This is the function that was attached to the message.
- **getMessageIds** - This method returns all the messages that this entity is concerned about.
  - @return Array - An array of strings listing all the messages for which this messenger has handlers.
*/
platformer.Messenger = (function(){
	var messenger = function (){
		this.messages    = {};
		this.loopCheck   = [];
		this.unbindLater = [];
	},
	proto = messenger.prototype;
	
	proto.toString = function(){
		return "[messenger Object]";
	};
	
	proto.bind = function(event, callback, scope){
		if(!this.messages[event]) this.messages[event] = [];
		this.messages[event].push({callback: callback, scope: scope});
	};
	
	proto.unbind = function(event, func){
		var found = false, j = 0;
		
		if(this.loopCheck.length){
			for(j = 0; j < this.loopCheck.length; j++){
				if(this.loopCheck[j] === event){
					found = true;
					break;
				}
			}
		}
			
		if(found){ //We're currently busy triggering messages like this, so we shouldn't remove message handlers until we're finished.
			this.unbindLater.push({event: event, func: func});
		} else {
			this.safelyUnbind(event, func);
		}
	};

	proto.safelyUnbind = function(event, func){
		if(!this.messages[event]) this.messages[event] = [];
		for (var x in this.messages[event]){
			if(this.messages[event][x].callback === func){
				this.messages[event].splice(x,1);
				break;
			}
		}
	};
	
	// This handles multiple event structures: "", [], and {}
	proto.trigger = function(events, message, debug){
		var i = 0, count = 0;
		
		if(typeof events === 'string') {
			return this.triggerEvent(events, message, debug);
		} else if (Array.isArray(events)) {
			for (; i < events.length; i++){
				count += this.trigger(events[i], message, debug);
			}
			return count;
		} else if (events.event) {
			return this.triggerEvent(events.event, events.message || message, debug);
		} else {
			console.warn('Event incorrectly formatted: must be string, array, or object containing an "event" property.');
			return 0;
		}
	};
	
	// This handles string events only
	proto.triggerEvent = function(event, value, debug){
		var i = 0, j = 0, debugCount = 0;
		
		// Debug logging.
		if(this.debug || debug || (value && value.debug)){
			if(this.messages[event] && this.messages[event].length){
				console.log('Entity "' + this.type + '": Event "' + event + '" has ' + this.messages[event].length + ' subscriber' + ((this.messages[event].length>1)?'s':'') + '.', value);
			} else {
				console.warn('Entity "' + this.type + '": Event "' + event + '" has no subscribers.', value);
			}
			
			for (i = 0; i < this.loopCheck.length; i++){
				if(this.loopCheck[i] === event){
					debugCount += 1;
					if(debugCount > 5){
						throw "Endless loop detected for '" + event + "'.";
					} else {
						console.warn("Event '" + event + "' is nested inside another '" + event + "' event.");
					}
				}
			}
			i = 0;
		}

		this.loopCheck.push(event);
		if(this.messages[event]){
			for (i = 0; i < this.messages[event].length; i++){
				this.messages[event][i].callback.call(this.messages[event][i].scope || this, value, debug);
			}
		}
		this.loopCheck.length = this.loopCheck.length - 1;
		
		if(!this.loopCheck.length && this.unbindLater.length){
			for(j = 0; j < this.unbindLater.length; j++){
				this.safelyUnbind(this.unbindLater[j].event, this.unbindLater[j].func);
			}
			this.unbindLater.length = 0;
		}
		
		return i;
	};
	
	proto.getMessageIds = function(){
		var events = [];
		for (var event in this.messages){
			events.push(event);
		}
		return events;
	};
	
	proto.copyEventHandlers = function(event){
		return this.messages[events] || null;
	};
	
	return messenger;
})();