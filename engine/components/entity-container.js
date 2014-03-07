/**
# COMPONENT **entity-container**
This component allows the entity to contain child entities. It will add several methods to the entity to manage adding and removing entities.

## Dependencies
- **[[Messenger]] - Entity uses `messenger` in its prototypal chain to enable event handling.

## Messages

### Listens for:
- **load** - This component waits until all other entity components are loaded before it begins adding children entities. This allows other entity components to listen to entity-added messages and handle them if necessary.
- **add-entity** - This message will added the given entity to this component's list of entities.
  - @param message ([[Entity]] object) - Required. This is the entity to be added as a child.
- **remove-entity** - On receiving this message, the provided entity will be removed from the list of child entities.
  - @param message ([[Entity]] object) - Required. The entity to remove.
- **[Messages specified in definition]** - Listens for specified messages and on receiving them, re-triggers them on child entities.
  - @param message (object) - accepts a message object that it will include in the new message to be triggered.

### Local Broadcasts:
- **child-entity-added** - This message is triggered when a new entity has been added to the list of children entities.
  - @param message ([[Entity]] object) - The entity that was just added.
- **child-entity-removed** - This message is triggered when an entity has been removed from the list of children entities.
  - @param message ([[Entity]] object) - The entity that was just removed.

### Child Broadcasts:
- **peer-entity-added** - This message is triggered when a new entity has been added to the parent's list of children entities.
  - @param message ([[Entity]] object) - The entity that was just added.
- **peer-entity-removed** - This message is triggered when an entity has been removed from the parent's list of children entities.
  - @param message ([[Entity]] object) - The entity that was just removed.
- **[Messages specified in definition]** - Listens for specified messages and on receiving them, re-triggers them on child entities.
  - @param message (object) - sends the message object received by the original message.

## Entity Methods:
- **addEntity** -  This method will add the provided entity to this component's list of entities.
  - @param entity ([[Entity]] object) - Required. This is the entity to be added as a child.
  - @return entity ([[Entity]] object) - Returns the entity that was just added.
- **removeEntity** - This method will remove the provided entity from the list of child entities.
  - @param message ([[Entity]] object) - Required. The entity to remove.
  - @return entity ([[Entity]] object | false) - Returns the entity that was just removed. If the entity was not foudn as a child, `false` is returned, indicated that the provided entity was not a child of this entity.
- **getEntitiesByType** - This method will return all child entities (including grandchildren) that match the provided type.
  - @param type (string) - Required. The entity type to find.
  - @return entities (Array of [[Entity]] objects) - Returns the entities that match the specified entity type.
- **getEntityById** - This method will return the first child entity it finds with a matching id (including grandchildren).
  - @param id (string) - Required. The entity id to find.
  - @return entity ([[Entity]] object) - Returns the entity that matches the specified entity id.
- **triggerOnChildren** - This method is used by both internal components and external entities to trigger messages on the child entities.
  - @param event (variant) - This is the message(s) to process. This can be a string, an object containing an "event" property (and optionally a "message" property, overriding the value below), or an array of the same.
  - @param value (variant) - This is a message object or other value to pass along to component functions.
  - @param debug (boolean) - This flags whether to output message contents and subscriber information to the console during game development. A "value" object parameter (above) will also set this flag if value.debug is set to true.
  - @return integer - The number of handlers for the triggered message: this is useful for determining how many child entities care about a given message.
- **triggerEvent** - This method is used by both internal components and external entities to trigger messages on the child entities.
  - @param event (string) - This is the message to process.
  - @param value (variant) - This is a message object or other value to pass along to component functions.
  - @param debug (boolean) - This flags whether to output message contents and subscriber information to the console during game development. A "value" object parameter (above) will also set this flag if value.debug is set to true.
  - @return integer - The number of handlers for the triggered message: this is useful for determining how many child entities care about a given message.

## JSON Definition:
    {
      "type": "entity-container",
      
      "entities": [{"type": "hero"}, {"type": "tile"}],
      // Optional. "entities" is an Array listing entity definitions to specify entities that should be added as children when this component loads.
      
      "childEvents": ["tokens-flying", "rules-updated"],
      // Optional. "childEvents" lists messages that are triggered on the entity and should be triggered on the children as well.
      
      "aliases": {
      // Optional. To prevent function name conflicts on the entity, you can provide alternatives here.
      
          "addEntity": "addFruit"
          //This causes entity.addFruit() to be created on the entity rather than the default entity.addEntity().
      }
    }
*/
(function(){
	var childBroadcast = function(event){
		return function(value, debug){
			this.triggerOnChildren(event, value, debug);
		};
	};
	
	return platformer.createComponentClass({
		id: 'entity-container',
		
		constructor: function(definition){
			var self = this;
	
			this.entities = [];
			
			 //saving list of entities for load message
			this.definedEntities = null;
			if(definition.entities && this.owner.entities){ //combine component list and entity list into one if they both exist.
				this.definedEntities = definition.entities.concat(this.owner.entities);
			} else {
				this.definedEntities = definition.entities || this.owner.entities || null;
			}
			
			this.owner.entities     = self.entities;
			
			this.childEvents = [];
			if(definition.childEvents){
				for(var event in definition.childEvents){
					this.addNewPublicEvent(definition.childEvents[event]);
				}
			}
			this.addNewPrivateEvent('peer-entity-added');
			this.addNewPrivateEvent('peer-entity-removed');
		},
		
		events:{
			"load": function(){
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
		
						this.addEntity(new platformer.classes.entity(entities[i].id?entities[i]:platformer.game.settings.entities[entities[i].type], definition));
					}
				}
			},
			
			"add-entity": function (entity) {
				this.addEntity(entity);
			},
			
			"remove-entity": function (entity) {
				this.removeEntity(entity);
			},
			
			"child-entity-updated": function (entity) {
				this.updateChildEventListeners(entity);
			}
		},
		
		methods:{
			addNewPublicEvent: function(event){
				this.addNewPrivateEvent(event);
				
				// Listen for message on owner
				for(var i = 0; i < this.childEvents.length; i++){
					if(this.childEvents[i] === event){
						return false;
					}
				}
				this.childEvents.push(event);
				this.addEventListener(event, childBroadcast(event));
			},
			
			addNewPrivateEvent: function(event){
				if(this.messages[event]){
					return false; // event is already added.
				}

				this.messages[event] = []; //to signify it's been added even if not used
				
				//Listen for message on children
				for (var x = 0; x < this.entities.length; x++) {
					if(this.entities[x].messages[event]){
						for (var y = 0; y < this.entities[x].messages[event].length; y++) {
							this.addChildEventListener(this.entities[x], event, this.entities[x].messages[event][y].callback, this.entities[x].messages[event][y].scope);
						}
					}
				}
			},
			
			updateChildEventListeners: function(entity){
				this.removeChildEventListeners(entity);
				this.addChildEventListeners(entity);
			},
			
			addChildEventListeners: function(entity){
				var event = '';
				
				for (event in this.messages) {
					if(entity.messages[event]){
						for (var y = 0; y < entity.messages[event].length; y++) {
							this.addChildEventListener(entity, event, entity.messages[event][y].callback, entity.messages[event][y].scope);
						}
					}
				}
			},
			
			removeChildEventListeners: function(entity){
				var events = null,
				messages = null;
				
				if(entity.containerListener){
					events = entity.containerListener.events;
					messages   = entity.containerListener.messages;
					for(var i = 0; i < events.length; i++){
						this.removeChildEventListener(entity, events[i], messages[i]);
					}
					entity.containerListener = null;
				}
			},
			
			addChildEventListener: function(entity, event, callback, scope){
				if(!entity.containerListener){
					entity.containerListener = {
						events: [],
						messages: []
					};
				}
				entity.containerListener.events.push(event);
				entity.containerListener.messages.push(callback);
				this.bind(event, callback, scope);
			},
			
			removeChildEventListener: function(entity, event, callback){
				var events = entity.containerListener.events,
				messages   = entity.containerListener.messages;
				for(var i = 0; i < events.length; i++){
					if((events[i] === event) && (!callback || (messages[i] === callback))){
						this.unbind(event, messages[i]);
					}
				}
			},

			destroy: function(){
				for (var i in this.entities){
					this.removeChildEventListeners(this.entities[i]);
					this.entities[i].destroy();
				}
				this.entities.length = 0;
			}
		},
		
		publicMethods: {
			getEntityById: function(id){
				var i = 0,
				selection = null;
				
				for(; i < this.entities.length; i++){
					if(this.entities[i].id === id){
						return this.entities[i];
					}
					if(this.entities[i].getEntityById){
						selection = this.entities[i].getEntityById(id);
						if(selection){
							return selection;
						};
					}
				}
				return undefined;
			},

			getEntitiesByType: function(type){
				var i     = 0,
				selection = null,
				entities  = [];
				
				for(; i < this.entities.length; i++){
					if(this.entities[i].type === type){
						entities.push(this.entities[i]);
					}
					if(this.entities[i].getEntitiesByType){
						selection = this.entities[i].getEntitiesByType(type);
						if(selection){
							entities = entities.concat(selection);
						};
					}
				}
				return entities;
			},

			addEntity: function(entity){
				entity.parent = this.owner;
				entity.trigger('adopted');
				
				for (var x = 0; x < this.entities.length; x++) {
					if(!entity.triggerEvent('peer-entity-added', this.entities[x])){
						break;
					}
				}
				
				this.triggerEventOnChildren('peer-entity-added', entity);

				this.addChildEventListeners(entity);
				this.entities.push(entity);
				this.owner.trigger('child-entity-added', entity);
				return entity;
			},
			
			removeEntity: function(entity){
				for (var x = 0; x < this.entities.length; x++){
				    if(this.entities[x] === entity){
						this.removeChildEventListeners(entity);
				    	this.entities.splice(x, 1);
						this.triggerEventOnChildren('peer-entity-removed', entity);
				    	entity.parent = null;
						this.owner.trigger('child-entity-removed', entity);
				    	entity.destroy();
					    return entity;
				    }
			    }
			    return false;
			},
			
			triggerEventOnChildren: function(event, message, debug){
				if(!this.messages[event]){
					this.addNewPrivateEvent(event);
				}
				return this.triggerEvent(event, message, debug);
			},
			triggerOnChildren: function(event, message, debug){
				if(!this.messages[event]){
					this.addNewPrivateEvent(event);
				}
				return this.trigger(event, message, debug);
			}
		}
	}, platformer.classes.messenger);
})();
