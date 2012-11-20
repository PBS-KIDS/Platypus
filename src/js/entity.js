/**
# CLASS entity
This class comprises the core structure of every object in the [[Game]]. Starting with an entity, various components are added to it to build a specific object. As such, there is very little functionality in the entity itself apart from functions and pieces allowing for addition and removal of components and communication between components.

## Messages

### Local Broadcasts:
- **load** - The entity triggers `load` on itself once all the properties and components have been attached, notifying the components that all their peer components are ready for messages.

## Methods
- **[constructor]** - Creates an object from the entity class and attaches both properties and components as provided by the parameters.
  > @param definition (object) - Base definition for the entity, including both properties and components as shown below under "JSON definition".
  > @param instanceDefinition (object) - Specific instance definition including properties that override the base definition properties.
  > @return entity - returns the new entity made up of the provided components. 
- **addComponent** - Attaches the provided component to the entity.
  > @param component (object) - Must be an object that functions as a [[Component]].
- > @return component - Returns the same object that was submitted.
- **removeComponent** - Removes the mentioned component from the entity.
  > @param component (object) - Must be a [[Component]] attached to the entity.
- > @return component|false - Returns the same object that was submitted if removal was successful; otherwise returns false (the component was not found attached to the entity).
- **bind** - Used by components' to bind handler functions to triggered events on the entity. 
  > @param messageId (string) - This is the message for which the component is listening.
  > @param func (function) - This is the function that will be run when the message is triggered.
- **unbind** - Used by components' to unbind handler functions on the entity, typically called when a component is removed from the entity.
  > @param messageId (string) - This is the message the component is currently listening to.
  > @param func (function) - This is the function that was attached to the message.
- **trigger** - This method is used by both internal components and external entities to trigger messages on this entity. When triggered, entity checks through bound handlers to run component functions as appropriate.
  > @param messageId (string) - This is the message to process.
  > @param value (variant) - This is a message object or other value to pass along to component functions.
  > @param debug (boolean) - This flags whether to output message contents and subscriber information to the console during game development. A "value" object parameter (above) will also set this flag if value.debug is set to true.
  > @return integer - The number of handlers for the triggered message: this is useful for determining whether the entity cares about a given message.
- **getMessageIds** - This method returns all the messages that this entity is concerned about.
  > @return Array - An array of strings listing all the messages for which this entity has handlers.
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
	var entity = function(definition, instanceDefinition){
		var self             = this,
		index                = undefined,
		componentDefinition  = undefined,
		def                  = definition || {},
		componentDefinitions = def.components || [],
		defaultProperties    = def.properties || {},
		instance             = instanceDefinition || {},
		instanceProperties   = instance.properties || {};
		
		self.components = [];
		self.messages   = [];
		self.loopCheck  = [];
		self.type = def.id;

		for (index in defaultProperties){ // This takes the list of properties in the JSON definition and appends them directly to the object.
			self[index] = defaultProperties[index];
		}
		for (index in instanceProperties){ // This takes the list of options for this particular instance and appends them directly to the object.
			self[index] = instanceProperties[index];
		}
		
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
	var proto = entity.prototype;
	
	proto.addComponent = function(component){
	    this.components.push(component);
	    return component;
	};
	
	proto.removeComponent = function(component){
	    for (var index in this.components){
		    if(this.components[index] === component){
		    	this.components.splice(index, 1);
		    	component.destroy();
			    return component;
		    }
	    }
	    return false;
	};
	
	proto.bind = function(messageId, func){
		if(!this.messages[messageId]) this.messages[messageId] = [];
		this.messages[messageId].push(func);
	};
	
	proto.unbind = function(messageId, func){
		if(!this.messages[messageId]) this.messages[messageId] = [];
		for (var x in this.messages[messageId]){
			if(this.messages[messageId][x] === func){
				this.messages[messageId].splice(x,1);
				break;
			}
		}
	};
	
	proto.trigger = function(messageId, value, debug){
		var i = 0;
		if(this.debug || debug || (value && value.debug)){
			if(this.messages[messageId] && this.messages[messageId].length){
				console.log('Entity "' + this.type + '": Event "' + messageId + '" has ' + this.messages[messageId].length + ' subscriber' + ((this.messages[messageId].length>1)?'s':'') + '.', value);
			} else {
				console.warn('Entity "' + this.type + '": Event "' + messageId + '" has no subscribers.', value);
			}
		}
		for (i = 0; i < this.loopCheck.length; i++){
			if(this.loopCheck[i] === messageId){
				throw "Endless loop detected for '" + messageId + "'.";
			}
		}
		i = 0;
		this.loopCheck.push(messageId);
		if(this.messages[messageId]){
			for (i = 0; i < this.messages[messageId].length; i++){
				this.messages[messageId][i](value, debug);
			}
		}
		this.loopCheck.length = this.loopCheck.length - 1; 
		return i;
	};
	
	proto.getMessageIds = function(){
		var messageIds = [];
		for (var messageId in this.messages){
			messageIds.push(messageId);
		}
		return messageIds;
	};
	
	proto.destroy = function(){
		for (var x in this.components)
		{
			this.components[x].destroy();
		}
		this.components.length = 0;
	};
	
	return entity;
})();