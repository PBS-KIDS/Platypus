/**
# COMPONENT **entity-container**
This component allows the entity to contain child entities. It will add several methods to the entity to manage adding and removing entities.

## Messages

### Listens for:
- **load** - This component waits until all other entity components are loaded before it begins adding children entities. This allows other entity components to listen to entity-added messages and handle them if necessary.
- **add-entity** - This message will added the given entity to this component's list of entities.
  > @param message ([[Entity]] object) - Required. This is the entity to be added as a child.
- **remove-entity** - On receiving this message, the provided entity will be removed from the list of child entities.
  > @param message ([[Entity]] object) - Required. The entity to remove.
- **[Messages specified in definition]** - Listens for specified messages and on receiving them, re-triggers them on child entities.
  > @param message (object) - accepts a message object that it will include in the new message to be triggered.

### Local Broadcasts:
- **child-entity-added** - This message is triggered when a new entity has been added to the list of children entities.
  > @param message ([[Entity]] object) - The entity that was just added.
- **child-entity-removed** - This message is triggered when an entity has been removed from the list of children entities.
  > @param message ([[Entity]] object) - The entity that was just removed.

### Child Broadcasts:
- **peer-entity-added** - This message is triggered when a new entity has been added to the parent's list of children entities.
  > @param message ([[Entity]] object) - The entity that was just added.
- **peer-entity-removed** - This message is triggered when an entity has been removed from the parent's list of children entities.
  > @param message ([[Entity]] object) - The entity that was just removed.
- **[Messages specified in definition]** - Listens for specified messages and on receiving them, re-triggers them on child entities.
  > @param message (object) - sends the message object received by the original message.

## Methods:
- **AddEntity** -  This method will add the provided entity to this component's list of entities.
  > @param entity ([[Entity]] object) - Required. This is the entity to be added as a child.
  > @return entity ([[Entity]] object) - Returns the entity that was just added.
- **removeEntity** - This method will remove the provided entity from the list of child entities.
  > @param message ([[Entity]] object) - Required. The entity to remove.
  > @return entity ([[Entity]] object | false) - Returns the entity that was just removed. If the entity was not foudn as a child, `false` is returned, indicated that the provided entity was not a child of this entity.

## JSON Definition:
    {
      "type": "entity-container",
      
      "entities": [{"type": "hero"}, {"type": "tile"}],
      // Optional. "entities" is an Array listing entity definitions to specify entities that should be added as children when this component loads.
      
      "childEvents": ["tokens-flying", "rules-updated"]
      // Optional. "childEvents" lists messages that are triggered on the entity and should be triggered on the children as well.
    }
*/
platformer.components['entity-container'] = (function(){
	var childBroadcast = function(event){
		if(typeof event === 'string'){
			return function(value, debug){
				for (var x = 0; x < this.entities.length; x++)
				{
					this.entities[x].trigger(event, value, debug);
				}
			};
		} else {
			return function(value, debug){
				for (var e in event){
					for (var x = 0; x < this.entities.length; x++)
					{
						this.entities[x].trigger(event[e], value, debug);
					}
				}
			};
		}
	},
	component = function(owner, definition){
		var self = this;

		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['load', 'add-entity', 'remove-entity']);

		this.entities = [];
		this.definedEntities = definition.entities; //saving for load message
		
		this.owner.entities     = self.entities;
		this.owner.addEntity    = function(entity){return self.addEntity(entity);};
		this.owner.removeEntity = function(entity){return self.removeEntity(entity);};
		
		if(definition.childEvents){
			for(var event in definition.childEvents){
				this[definition.childEvents[event]] = childBroadcast(definition.childEvents[event]);
				this.addListener(definition.childEvents[event]);
			}
		}
	},
	proto = component.prototype;
	
	proto['load'] = function(){
		// putting this here so all other components will have been loaded and can listen for "entity-added" calls.
		var i    = 0,
		j        = 0,
		k        = 0,
		entities = this.definedEntities,
		definition = null;
		
		this.definedEntities = false;
		
		if(entities){
			for (i = 0; i < entities.length; i++)
			{
				definition = {properties:{parent: this.owner}};
				for (j in entities[i]){
					if (j === 'properties'){
						for (k in entities[i].properties){
							definition.properties[k] = entities[i].properties[k];
						}
					} else {
						definition[j] = entities[i][j];
					}
				}

				this.addEntity(new platformer.classes.entity(entities[i].id?entities[i]:platformer.settings.entities[entities[i].type], definition));
			}
		}
	};
	
	proto.addEntity = proto['add-entity'] = function (entity) {   
		entity.parent = this.owner;
		entity.trigger('adopted');
		for (var x = 0; x < this.entities.length; x++)
		{
			entity.trigger('peer-entity-added', this.entities[x]);
		}
		
		for (var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger('peer-entity-added', entity);
		}
		this.entities.push(entity);
		this.owner.trigger('child-entity-added', entity);
		return entity;
	};
	
	proto.removeEntity = proto['remove-entity'] = function (entity) {
		for (var x = 0; x < this.entities.length; x++){
		    if(this.entities[x] === entity){
				for (var y = 0; y < this.entities.length; y++){
					if(x !== y){
						this.entities[y].trigger('peer-entity-removed', entity);
					}
				}
		    	entity.parent = null;
		    	this.entities.splice(x, 1);
				this.owner.trigger('child-entity-removed', entity);
		    	entity.destroy();
			    return entity;
		    }
	    }
	    return false;
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		for (var i in this.entities){
			this.entities[i].destroy();
		}
		this.entities.length = 0;
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
