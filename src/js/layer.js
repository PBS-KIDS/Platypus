gws.classes.layer = (function(){
	var layer = function(definition, rootElement){
		var componentDefinitions = definition.components,
		componentDefinition = undefined;
		
		this.rootElement = rootElement;
		this.components = [];
		this.tickMessages = [];
		this.messages   = [];
		this.entities = [];
		
		for (var index in componentDefinitions){
			componentDefinition = componentDefinitions[index];
			this.addComponent(new gws.components[componentDefinition.type || componentDefinition.id](this, componentDefinition));
		}
		
		if(definition.entities){
			for (var x = 0; x < definition.entities.length; x++)
			{
				 this.addEntity(new gws.classes.entity(gws.settings.entities[definition.entities[x].type], definition.entities[x]));
			}
		}
		
		this.trigger('load');
	},
	proto = layer.prototype;
	
	proto.tick = function(){
		for(var message in this.tickMessages){
			this.trigger(this.tickMessages[message]);
		}
	};
	
	proto.addComponent = function(component){
		var alreadyListed = false,
		i = 0,
		j = 0;
		this.components.push(component);
	    if(component.tickMessages){ //component wants to hear these messages every tick
	    	for (i in component.tickMessages){
	    		alreadyListed = false;
	    		for (j in this.tickMessages){
	    			if(component.tickMessages[i] === this.tickMessages[j]){
	    				alreadyListed = true;
	    			}
	    		}
	    		if(!alreadyListed){
	    			this.tickMessages.push(component.tickMessages[i]);
	    		}
	    	}
	    }
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
	
	proto.bind = function(message, func){
		if(!this.messages[message]) this.messages[message] = [];
		this.messages[message].push(func);
	};
	
	proto.unbind = function(message, func){
		if(!this.messages[message]) this.messages[message] = [];
		for (var messageIndex in this.messages[message]){
			if(this.messages[message][messageIndex] === func){
				this.messages[message].splice(messageIndex,1);
				break;
			}
		}
	};
	
	proto.trigger = function(message, value){
		if(this.messages[message]){
			for (messageIndex in this.messages[message]){
				this.messages[message][messageIndex](value);
			}
		}
	};
	
	proto.addEntity = function (entity) {
		this.entities.push(entity);
		this.trigger('entity-added', entity);
	};
	
	proto.removeEntity = function (entity) {
		for (var x = 0; x < this.entities.length; x++){
		    if(this.entities[x] === entity){
		    	this.entities.splice(x, 1);
		    	entity.destroy();
			    return entity;
		    }
	    }
	    return false;
	};
	
	return layer;
})();