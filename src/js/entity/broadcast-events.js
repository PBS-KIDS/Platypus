/*
 * Component "broadcast-events"
 * 
 * Notes: Make sure that this component is never set up to receive and broadcast matching messages or an infinite loop will result.
 */
platformer.components['broadcast-events'] = (function(){
	var gameBroadcast = function(event){
		if(typeof event === 'string'){
			return function(value){
				platformer.game.currentScene.trigger(event, value);
			};
		} else {
			return function(value){
				for (var e in event){
					platformer.game.currentScene.trigger(event[e], value);
				}
			};
		}
	};
	
	var parentBroadcast = function(event){
		if(typeof event === 'string'){
			return function(value){
				if(this.owner.parent)
				{
					this.owner.parent.trigger(event, value);
				}
				
			};
		} else {
			return function(value){
				for (var e in event){
					this.owner.parent.trigger(event[e], value);
				}
			};
		}
	};
	
	var entityBroadcast = function(event){
		if(typeof event === 'string'){
			return function(value){
				this.owner.trigger(event, value);
			};
		} else {
			return function(value){
				for (var e in event){
					this.owner.trigger(event[e], value);
				}
			};
		}
	};
	var component = function(owner, definition){
		this.owner = owner;

		// Messages that this component listens for and then broadcasts to all layers.
		this.listeners = [];
		if(definition.events){
			for(var event in definition.events){
				this[event] = gameBroadcast(definition.events[event]);
				this.addListener(event);
			}
		}
		
		if(definition.parentEvents){
			for(var event in definition.parentEvents){
				this[event] = parentBroadcast(definition.parentEvents[event]);
				this.addListener(event);
			}
		}
		
		// Messages that this component listens for and then triggers on itself as a renamed message - useful as a logic place-holder for simple entities.
		if(definition.renameEvents){
			for(var event in definition.renameEvents){
				this[event] = entityBroadcast(definition.renameEvents[event]);
				this.addListener(event);
			}
		}
	};
	var proto = component.prototype;
	
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
