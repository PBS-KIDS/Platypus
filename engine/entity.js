/**
# CLASS entity
The Entity object acts as a container for components, facilitates communication between components and other game objects, and includes properties set by components to maintain a current state. The entity object serves as the foundation for most of the game objects in the Platformer engine.

## Dependencies
- **[[Messenger]] - Entity uses `messenger` in its prototypal chain to enable event handling.

## Messages

### Local Broadcasts:
- **load** - The entity triggers `load` on itself once all the properties and components have been attached, notifying the components that all their peer components are ready for messages.

## Methods
- **[constructor]** - Returns a new Entity object based on the definitions provided.
  - @param definition (object) - Base definition for the entity, includes properties and components as shown below under "JSON definition".
  - @param instanceDefinition (object) - Specific instance definition including properties that override the base definition properties.
  - @return entity - returns the new entity made up of the provided components. 
- **addComponent** - Attaches the provided component to the entity.
  - @param component (object) - Must be an object that functions as a [[Component]].
  - @return component - Returns the same object that was submitted.
- **removeComponent** - Removes the mentioned component from the entity.
  - @param component (object) - Must be a [[Component]] attached to the entity.
  - @return component|false - Returns the same object that was submitted if removal was successful; otherwise returns false (the component was not found attached to the entity).
- **bind** - Used by components to bind handler functions to triggered events on the entity. 
  - @param event (string) - This is the message for which the component is listening.
  - @param func (function) - This is the function that will be run when the message is triggered.
- **toString** - Returns a string describing the entity.
  - @return string - Returns the entity type as a string of the form "[entity entity-type]".
- **trigger** - This method is used by both internal components and external entities to trigger messages on this entity. When triggered, entity checks through bound handlers to run component functions as appropriate.
  - @param event (variant) - This is the message(s) to process. This can be a string, an object containing an "event" property (and optionally a "message" property, overriding the value below), or an array of the same.
  - @param value (variant) - This is a message object or other value to pass along to component functions.
  - @param debug (boolean) - This flags whether to output message contents and subscriber information to the console during game development. A "value" object parameter (above) will also set this flag if value.debug is set to true.
  - @return integer - The number of handlers for the triggered message: this is useful for determining whether the entity cares about a given message.
- **triggerEvent** - This method is used by both internal components and external entities to trigger messages on this entity. When triggered, entity checks through bound handlers to run component functions as appropriate.
  - @param event (string) - This is the message to process.
  - @param value (variant) - This is a message object or other value to pass along to component functions.
  - @param debug (boolean) - This flags whether to output message contents and subscriber information to the console during game development. A "value" object parameter (above) will also set this flag if value.debug is set to true.
  - @return integer - The number of handlers for the triggered message: this is useful for determining whether the entity cares about a given message.
- **unbind** - Used by components to unbind handler functions on the entity, typically called when a component is removed from the entity.
  - @param event (string) - This is the message the component is currently listening to.
  - @param func (function) - This is the function that was attached to the message.
- **getMessageIds** - This method returns all the messages that this entity is concerned about.
  - @return Array - An array of strings listing all the messages for which this entity has handlers.
- **destroy** - This method removes all components from the entity.

## JSON Definition:
    {
      "id": "entity-id",
      // "entity-id" becomes `entity.type` once the entity is created.
      
      "components": [
      // This array lists one or more component definition objects
      
        {"type": "example-component"}
        // The component objects must include a "type" property corresponding to a component to load, but may also include additional properties to customize the component in a particular way for this entity.
      ],
      
      "properties": [
      // This array lists properties that will be attached directly to this entity.
      
        "x": 240
        // For example, `x` becomes `entity.x` on the new entity.
      ],
      
      "filters": {
      // Filters are only used by top level entities loaded by the scene and are not used by the entity directly. They determine whether an entity should be loaded on a particular browser according to browser settings.
      
        "includes": ["touch"],
        // Optional. This filter specifies that this entity should be loaded on browsers/devices that support a touch interface. More than one setting can be added to the array.

        "excludes": ["multitouch"]
        // Optional. This filter specifies that this entity should not be loaded on browsers/devices that do not support a multitouch interface. More than one setting can be added to the array.
      }
    }
*/
platformer.classes.entity = (function(){
	var entityIds = {},
	entity = function (definition, instanceDefinition){
		var self             = this,
		index                = undefined,
		componentDefinition  = undefined,
		def                  = definition || {},
		componentDefinitions = def.components || [],
		defaultProperties    = def.properties || {},
		instance             = instanceDefinition || {},
		instanceProperties   = instance.properties || {};
		
		// Set properties of messenger on this entity.
		platformer.classes.messenger.call(this);
		
		self.components  = [];
		self.type = def.id || 'none';
		
		self.id = instanceDefinition.id;
		if(!self.id){
			if(!entityIds[self.type]){
				entityIds[self.type] = 0;
			}
			self.id = self.type + '-' + entityIds[self.type];
			entityIds[self.type] += 1;
		}

		this.setProperty(defaultProperties); // This takes the list of properties in the JSON definition and appends them directly to the object.
		this.setProperty(instanceProperties); // This takes the list of options for this particular instance and appends them directly to the object.
		this.bind('set-property', function(keyValuePairs){
			self.setProperty(keyValuePairs);
		});
		
		if(!self.state){
			self.state = {}; //starts with no state information. This expands with boolean value properties entered by various logic components.
		}
		self.lastState = {}; //This is used to determine if the state of the entity has changed.
		
		for (index in componentDefinitions){
			componentDefinition = componentDefinitions[index];
			if(platformer.components[componentDefinition.type]){
				self.addComponent(new platformer.components[componentDefinition.type](self, componentDefinition));
			} else {
				console.warn("Component '" + componentDefinition.type + "' is not defined.", componentDefinition);
			}
		}
		
		self.trigger('load');
	};
	var proto = entity.prototype = new platformer.classes.messenger();
	
	proto.toString = function(){
		return "[entity " + this.type + "]";
	};
	
	proto.addComponent = function(component){
	    this.components.push(component);
	    return component;
	};
	
	proto.removeComponent = function(component){
		var index = '';
		
		if(typeof component === 'string'){
		    for (index in this.components){
			    if(this.components[index].type === component){
			    	component = this.components[index];
			    	this.components.splice(index, 1);
			    	component.destroy();
				    return component;
			    }
		    }
		} else {
		    for (index in this.components){
			    if(this.components[index] === component){
			    	this.components.splice(index, 1);
			    	component.destroy();
				    return component;
			    }
		    }
		}
		
	    return false;
	};
	
	proto.setProperty = function(keyValuePairs){
		var index = '';
		
		for (index in keyValuePairs){ // This takes a list of properties and appends them directly to the object.
			this[index] = keyValuePairs[index];
		}
	};
	
	proto.destroy = function(){
		for (var x in this.components) {
			this.components[x].destroy();
		}
		this.components.length = 0;
	};
	
	return entity;
})();