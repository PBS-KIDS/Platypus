/**
# COMPONENT **EntityContainer**
This component allows the entity to contain child entities. It will add several methods to the entity to manage adding and removing entities.

## Dependencies
- **[[Messenger]] - Entity uses `Messenger` in its prototypal chain to enable event handling.

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
      "type": "EntityContainer",
      
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

/*
 * Requires: ["../Messenger.js"]
 */
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    var childBroadcast = function (event) {
        return function (value, debug) {
            this.triggerOnChildren(event, value, debug);
        };
    };
    
    return platypus.createComponentClass({
        id: 'EntityContainer',
        
        constructor: function (definition) {
            var self  = this,
                event = '';
    
            this.entities = [];
            
             //saving list of entities for load message
            this.definedEntities = null;
            if (definition.entities && this.owner.entities) { //combine component list and entity list into one if they both exist.
                this.definedEntities = definition.entities.concat(this.owner.entities);
            } else {
                this.definedEntities = definition.entities || this.owner.entities || null;
            }
            
            this.owner.entities     = self.entities;
            
            this.childEvents = [];
            if (definition.childEvents) {
                for (event in definition.childEvents) {
                    if (definition.childEvents.hasOwnProperty(event)) {
                        this.addNewPublicEvent(definition.childEvents[event]);
                    }
                }
            }
            this.addNewPrivateEvent('peer-entity-added');
            this.addNewPrivateEvent('peer-entity-removed');
        },
        
        events: {
            "load": function () {
                // putting this here so all other components will have been loaded and can listen for "entity-added" calls.
                var i          = 0,
                    entities   = this.definedEntities;
                
                this.definedEntities = null;
                
                if (entities) {
                    for (i = 0; i < entities.length; i++) {
                        this.addEntity(entities[i]);
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
        
        methods: {
            addNewPublicEvent: function (event) {
                var i = 0;
                
                this.addNewPrivateEvent(event);
                
                // Listen for message on owner
                for (i = 0; i < this.childEvents.length; i++) {
                    if (this.childEvents[i] === event) {
                        return false;
                    }
                }
                this.childEvents.push(event);
                this.addEventListener(event, childBroadcast(event));
            },
            
            addNewPrivateEvent: function (event) {
                var x = 0,
                    y = 0;
                
                if (this.messages[event]) {
                    return false; // event is already added.
                }

                this.messages[event] = []; //to signify it's been added even if not used
                
                //Listen for message on children
                for (x = 0; x < this.entities.length; x++) {
                    if (this.entities[x].messages[event]) {
                        for (y = 0; y < this.entities[x].messages[event].length; y++) {
                            this.addChildEventListener(this.entities[x], event, this.entities[x].messages[event][y].callback, this.entities[x].messages[event][y].scope);
                        }
                    }
                }
            },
            
            updateChildEventListeners: function (entity) {
                this.removeChildEventListeners(entity);
                this.addChildEventListeners(entity);
            },
            
            addChildEventListeners: function (entity) {
                var y     = 0,
                    event = '';
                
                for (event in this.messages) {
                    if (this.messages.hasOwnProperty(event) && entity.messages[event]) {
                        for (y = 0; y < entity.messages[event].length; y++) {
                            this.addChildEventListener(entity, event, entity.messages[event][y].callback, entity.messages[event][y].scope);
                        }
                    }
                }
            },
            
            removeChildEventListeners: function (entity) {
                var i        = 0,
                    events   = null,
                    messages = null,
                    scopes   = null;
                
                if (entity.containerListener) {
                    events   = entity.containerListener.events;
                    messages = entity.containerListener.messages;
                    scopes   = entity.containerListener.scopes;
                    for (i = 0; i < events.length; i++) {
                        this.removeChildEventListener(entity, events[i], messages[i], scopes[i]);
                    }
                    entity.containerListener = null;
                }
            },
            
            addChildEventListener: function (entity, event, callback, scope) {
                if (!entity.containerListener) {
                    entity.containerListener = {
                        events: [],
                        messages: [],
                        scopes: []
                    };
                }
                entity.containerListener.events.push(event);
                entity.containerListener.messages.push(callback);
                entity.containerListener.scopes.push(scope);
                this.bind(event, callback, scope);
            },
            
            removeChildEventListener: function (entity, event, callback, scope) {
                var i        = 0,
                    events   = entity.containerListener.events,
                    messages = entity.containerListener.messages,
                    scopes   = entity.containerListener.scopes;
                
                for (i = 0; i < events.length; i++) {
                    if ((events[i] === event) && (!callback || (messages[i] === callback)) && (!scope || (scopes[i] === scope))) {
                        this.unbind(event, messages[i], scopes[i]);
                    }
                }
            },

            destroy: function () {
                var i = 0;
                
                for (i = 0; i < this.entities.length; i++) {
                    this.removeChildEventListeners(this.entities[i]);
                    this.entities[i].destroy();
                }
                this.entities.length = 0;
            }
        },
        
        publicMethods: {
            getEntityById: function (id) {
                var i         = 0,
                    selection = null;
                
                for (i = 0; i < this.entities.length; i++) {
                    if (this.entities[i].id === id) {
                        return this.entities[i];
                    }
                    if (this.entities[i].getEntityById) {
                        selection = this.entities[i].getEntityById(id);
                        if (selection) {
                            return selection;
                        }
                    }
                }
                return undefined;
            },

            getEntitiesByType: function (type) {
                var i         = 0,
                    selection = null,
                    entities  = [];
                
                for (i = 0; i < this.entities.length; i++) {
                    if (this.entities[i].type === type) {
                        entities.push(this.entities[i]);
                    }
                    if (this.entities[i].getEntitiesByType) {
                        selection = this.entities[i].getEntitiesByType(type);
                        if (selection) {
                            entities = entities.concat(selection);
                        }
                    }
                }
                return entities;
            },

            /**
             * This method adds an entity to the owner's group. If an entity definition or a reference to an entity definition is provided, the entity is created and then added to the owner's group.
             *
             * @method addEntity
             * @param newEntity {platypus.Entity|Object|String} Specifies the entity to add. If an object with a "type" property is provided or a String is provided, this component looks up the entity definition to create the entity.
             * @param [newEntity.type] {String} If an object with a "type" property is provided, this component looks up the entity definition to create the entity.
             * @param [newEntity.properties] {Object} A list of key/value pairs that sets the initial properties on the new entity.
             * @return {platypus.Entity} The entity that was just added.
             */
            addEntity: function (newEntity) {
                var entity = null,
                    x = 0;
                
                if (newEntity instanceof platypus.Entity) {
                    entity = newEntity;
                } else {
                    if (typeof newEntity === 'string') {
                        entity = new platypus.Entity(platypus.game.settings.entities[newEntity]);
                    } else if (newEntity.id) {
                        entity = new platypus.Entity(newEntity);
                    } else {
                        entity = new platypus.Entity(platypus.game.settings.entities[newEntity.type], newEntity);
                    }
                    this.owner.triggerEvent('entity-created', entity);
                }
                
                entity.parent = this.owner;
                entity.triggerEvent('adopted', entity);
                
                for (x = 0; x < this.entities.length; x++) {
                    if (!entity.triggerEvent('peer-entity-added', this.entities[x])) {
                        break;
                    }
                }
                this.triggerEventOnChildren('peer-entity-added', entity);

                this.addChildEventListeners(entity);
                this.entities.push(entity);
                this.owner.triggerEvent('child-entity-added', entity);
                return entity;
            },
            
            removeEntity: function (entity) {
                var x = 0;

                for (x = 0; x < this.entities.length; x++) {
                    if (this.entities[x] === entity) {
                        this.removeChildEventListeners(entity);
                        this.entities.splice(x, 1);
                        this.triggerEventOnChildren('peer-entity-removed', entity);
                        this.owner.triggerEvent('child-entity-removed', entity);
                        entity.destroy();
                        entity.parent = null;
                        return entity;
                    }
                }
                return false;
            },
            
            triggerEventOnChildren: function (event, message, debug) {
                if (!this.messages[event]) {
                    this.addNewPrivateEvent(event);
                }
                return this.triggerEvent(event, message, debug);
            },
            triggerOnChildren: function (event, message, debug) {
                if (!this.messages[event]) {
                    this.addNewPrivateEvent(event);
                }
                return this.trigger(event, message, debug);
            }
        }
    }, platypus.Messenger);
}());
