/**
 * The factory takes in component definitions and creates component classes that can be used to create components by entities. See ec-template.js for an example componentDefinition that can be sent into this component class factory.
 * 
 * @class Component
 * @static
 */
(function (ns){
	"use strict";
	
	var setupProperty = function(property, component, owner){
		Object.defineProperty(component, property, {
		    get: function(){
		        return owner[property];
		    },
		    set: function(value){
		    	owner[property] = value;
		    },
		    enumerable: true
		});
	};
		
	ns.components = {};
	
	/**
	 * This factory method takes in a component definition and creates a class from it. It adds properties and methods that are common to all components so that component definitions can focus on unique properties and methods.
	 * 
	 * @method createComponentClass
	 * @param componentDefinition {Object} A list of key/value pairs that describe the component's behavior.
	 * @param [prototype] {Object} A prototype that this component extends.
	 */
	ns.createComponentClass = function(componentDefinition, Prototype){
		var	component = function(owner, definition){
			var prop = null,
			func     = null,
			name     = '';
			
			// if prototype provided, set up its properties here.
			if(Prototype){
				Prototype.call(this);
			}
			
			this.owner = owner;
			this.listener = {
				events: [],
				messages: []
			};
			this.publicMethods = {};
			this.type = componentDefinition.id;
			
			// Set up properties, prioritizing component settings, entity settings, and finally defaults.
			if(componentDefinition.properties){
				for(prop in componentDefinition.properties){
					if(typeof definition[prop] !== 'undefined'){
						this[prop] = definition[prop];
					} else if(typeof this.owner[prop] !== 'undefined') {
						this[prop] = this.owner[prop];
					} else {
						this[prop] = componentDefinition.properties[prop];
					}
				}
			}
			
			// These component properties are equivalent with `entity.property`
			if(componentDefinition.publicProperties){
				for(prop in componentDefinition.publicProperties){
					setupProperty(prop, this, owner);
					if(typeof definition[prop] !== 'undefined'){
						this[prop] = definition[prop];
					} else if(typeof this.owner[prop] !== 'undefined') {
						this[prop] = this.owner[prop];
					} else {
						this[prop] = componentDefinition.publicProperties[prop];
					}
				}
			}
			
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
		
		if(Prototype){ //absorb template prototype if it exists.
			proto = component.prototype = new Prototype();
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
			
			// Handle component's destroy method before removing messaging and methods.
			if(this.___destroy){
				this.___destroy();
			}
			
			// Now remove event listeners and methods.
			for(func in this.publicMethods){
				this.removeMethod(func);
			}
			this.removeEventListeners();
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
				console.warn(this.owner.type + ': Entity already has a method called "' + name + '". Method not added.');
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
					this.owner.unbind(event, messages[i], this);
				}
			}
		};
		
		proto.removeMethod = function(name){
			if(!this.owner[name]){
				console.warn(this.owner.type + ': Entity does not have a method called "' + name + '".');
			} else {
				delete this.owner[name];
			}
			delete this.publicMethods[name];
		};

		ns.components[componentDefinition.id] = component;
	};
})(platformer);