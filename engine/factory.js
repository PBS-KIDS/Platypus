/*
 * This file includes a few helper functions to handle component code that is repeated across multiple components.
 */
(function (ns){
	ns.components = {};
	
	ns.createComponentClass = function(componentDefinition){
		var component = function(owner, definition){
			var func = null;
			
			this.owner = owner;
			this.listeners = [];
			this.type = componentDefinition.id;
			
			if(componentDefinition.events){
				for(func in componentDefinition.events){
					this.addListener(func);
				}
			}
			
			if (this.constructor){
				this.constructor(definition);
			}
		},
		func  = null,
		proto = component.prototype;
		
		// Have to copy rather than replace so definition is not corrupted
		proto.constructor = componentDefinition.constructor;
		if(componentDefinition.events){
			for(func in componentDefinition.events){
				proto[func] = componentDefinition.events[func];
			}
		}
		for(func in componentDefinition.methods){
			if(func === 'destroy'){
				proto['___' + func] = componentDefinition.methods[func];
			} else {
				proto[func] = componentDefinition.methods[func];
			}
		}

		proto.toString = function(){
			return "[component " + this.type + "]";
		};

		// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
		proto.destroy = function(){
			this.removeListeners(this.listeners);
			if(this.___destroy){
				this.___destroy();
			}
		};
		
		proto.setProperty = function(property, value){
			this[property] = value;
		};

		proto.addListeners = function(messageIds){
			for(var message in messageIds) this.addListener(messageIds[message]);
		};
	
		proto.removeListeners = function(listeners){
			if(!listeners){
				listeners = this.listeners;
			}
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
		
		ns.components[componentDefinition.id] = component;
	};
})(platformer);