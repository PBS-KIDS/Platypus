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
	
	proto.trigger = function(messageId, value){
		var i = 0;
		if(this.debug || (value && value.debug)){
			if(this.messages[messageId] && this.messages[messageId].length){
				console.log('Entity "' + this.type + '": Event "' + messageId + '" has ' + this.messages[messageId].length + ' subscriber' + ((this.messages[messageId].length>1)?'s':'') + '.', value);
			} else {
				console.warn('Entity "' + this.type + '": Event "' + messageId + '" has no subscribers.', value);
			}
		}
		if(this.messages[messageId]){
			for (i = 0; i < this.messages[messageId].length; i++){
				this.messages[messageId][i](value);
			}
		}
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