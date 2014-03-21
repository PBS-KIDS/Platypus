/*
 * This file includes a few helper functions to handle component code that is repeated across multiple components.
 * See ec-template.js for an example componentDefinition that can be sent into this component class factory.
 */
(function (ns){
	ns.components = {};
	
	ns.createComponentClass = function(componentDefinition, prototype){
		var	component = function(owner, definition){
			var func = null,
			name     = '';
			
			// if prototype provided, set up its properties here.
			if(prototype){
				prototype.call(this);
			}
			
			this.owner = owner;
			this.listener = {
				events: [],
				messages: []
			};
			this.publicMethods = {};
			this.type = componentDefinition.id;
			
			if(componentDefinition.events){
				for(func in componentDefinition.events){
					this.addEventListener(func, componentDefinition.events[func]);
					if(definition.aliases){
						for (var alias in definition.aliases){
							if(definition.aliases[alias] === func){
								this.addEventListener(alias, componentDefinition.events[func]);
							}
						}
					}
				}
			}
			
			if(componentDefinition.publicMethods){
				for(func in componentDefinition.publicMethods){
					name = func;
					if(definition.aliases){
						for (var alias in definition.aliases){
							if(definition.aliases[alias] === func){
								name = alias;
							}
						}
					}
					this.addMethod(name, componentDefinition.publicMethods[func]);
				}
			}
						
			if (this.constructor){
				this.constructor(definition);
			}
		},
		func  = null,
		proto = component.prototype;
		
		if(prototype){ //absorb template prototype if it exists.
			proto = component.prototype = new prototype();
		}
		
		// Have to copy rather than replace so definition is not corrupted
		proto.constructor = componentDefinition.constructor;

		if (componentDefinition.methods) for(func in componentDefinition.methods){
			if(func === 'destroy'){
				proto['___' + func] = componentDefinition.methods[func];
			} else {
				proto[func] = componentDefinition.methods[func];
			}
		}
		if (componentDefinition.publicMethods) for(func in componentDefinition.publicMethods){
			proto[func] = componentDefinition.publicMethods[func];
		}

		proto.toString = function(){
			return "[component " + this.type + "]";
		};

		// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
		proto.destroy = function(){
			for(func in this.publicMethods){
				this.removeMethod(func);
			}

			this.removeEventListeners();
			if(this.___destroy){
				this.___destroy();
			}
		};
		
		proto.setProperty = function(property, value){
			this[property] = value;
		};

		proto.addListeners = function(){
			console.warn('Component "' + this.type + '": "component.addListeners()" is deprecated. Use "component.addEventListener()".');
		};
		proto.addListener = function(){
			console.warn('Component "' + this.type + '": "component.addListener()" is deprecated. Use "component.addEventListener()".');
		};
		proto.removeListeners = function(){
			console.warn('Component "' + this.type + '": "component.removeListeners()" is deprecated. Use "component.removeEventListeners()".');
		};
		proto.removeListener = function(){
			console.warn('Component "' + this.type + '": "component.removeListener()" is deprecated. Use "component.removeEventListener()".');
		};
	
		proto.removeEventListeners = function(listeners){
			var events = null,
			messages = null;
			
			if(!listeners){
				events   = this.listener.events;
				messages = this.listener.messages;
				for(var i = 0; i < events.length; i++){
					this.removeEventListener(events[i], messages[i]);
				}
			} else {
				events   = listeners;
				for(var i = 0; i < events.length; i++){
					this.removeEventListener(events[i]);
				}
			}
		};
		
		proto.addEventListener = function(event, callback){
			this.listener.events.push(event);
			this.listener.messages.push(callback);
			this.owner.bind(event, callback, this);
		};
		
		proto.addMethod = function(name, func){
			var self = this;
			
			if(this.owner[name]){
				console.warn(owner.type + ': Entity already has a method called "' + name + '". Method not added.');
			} else {
				this.owner[name] = function(){
					return func.apply(self, arguments);
				};
				this.publicMethods[name] = func;
			}
		};
	
		proto.removeEventListener = function(event, callback){
			var events = this.listener.events,
			messages   = this.listener.messages;
			for(var i = 0; i < events.length; i++){
				if((events[i] === event) && (!callback || (messages[i] === callback))){
					this.owner.unbind(event, messages[i]);
				}
			}
		};
		
		proto.removeMethod = function(name){
			if(!this.owner[name]){
				console.warn(owner.type + ': Entity does not have a method called "' + name + '".');
			} else {
				delete this.owner[name];
			}
			delete this.publicMethods[name];
		};

		ns.components[componentDefinition.id] = component;
	};
})(platformer);