/**
 * This component allows the entity to contain child entities. It will add several methods to the entity to manage adding and removing entities.
 *
 * @namespace platypus.components
 * @class EntityContainer
 * @extends platypus.Messenger
 * @uses platypus.Component
 */
/**
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
*/
/* global include, platypus */
(function () {
    'use strict';

    var Data = include('platypus.Data'),
        Entity = include('platypus.Entity'),
        childBroadcast = function (event) {
            return function (value, debug) {
                this.triggerOnChildren(event, value, debug);
            };
        };
    
    return platypus.createComponentClass({
        id: 'EntityContainer',
        
        properties: {
            /**
             * An Array listing messages that are triggered on the entity and should be triggered on the children as well.
             *
             * @property childEvents
             * @type Array
             * @default []
             */
            childEvents: []
        },
        
        constructor: (function () {
            var
                entityInit = function (entityDefinition, callback) {
                    this.addEntity(entityDefinition, callback);
                };

            return function (definition, callback) {
                var i = 0,
                    entities = null,
                    events = this.childEvents,
                    entityInits = null;
        
                //saving list of entities for load message
                if (definition.entities && this.owner.entities) { //combine component list and entity list into one if they both exist.
                    entities = definition.entities.concat(this.owner.entities);
                } else {
                    entities = definition.entities || this.owner.entities || null;
                }

                this.owner.entities = this.entities = Array.setUp();
                
                this.childEvents = Array.setUp();
                for (i = 0; i < events.length; i++) {
                    this.addNewPublicEvent(events[i]);
                }
                this.addNewPrivateEvent('peer-entity-added');
                this.addNewPrivateEvent('peer-entity-removed');

                if (entities) {
                    entityInits = Array.setUp();
                    for (i = 0; i < entities.length; i++) {
                        entityInits.push(entityInit.bind(this, entities[i]));
                    }
                    platypus.Async.setUp(entityInits, function () {
                        callback();
                    });
                    entityInits.recycle();
                    return true; // notifies owner that this component is asynchronous.
                } else {
                    return false;
                }
            };
        } ()),
        
        events: {
            /**
             * This message will added the given entity to this component's list of entities.
             *
             * @method 'add-entity'
             * @param entity {platypus.Entity} This is the entity to be added as a child.
             */
            "add-entity": function (entity) {
                this.addEntity(entity);
            },
            
            /**
             * On receiving this message, the provided entity will be removed from the list of child entities.
             *
             * @method 'remove-entity'
             * @param entity {platypus.Entity} The entity to remove.
             */
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
                
                for (i = 0; i < this.childEvents.length; i++) {
                    if (this.childEvents[i] === event) {
                        return false;
                    }
                }
                this.childEvents.push(event);
                /**
                 * Listens for specified messages and on receiving them, re-triggers them on child entities.
                 *
                 * @method '*'
                 * @param message {Object} Accepts a message object that it will include in the new message to be triggered.
                 */
                this.addEventListener(event, childBroadcast(event));
                
                return true;
            },
            
            addNewPrivateEvent: function (event) {
                var x = 0,
                    y = 0;
                
                if (this._listeners[event]) {
                    return false; // event is already added.
                }

                this._listeners[event] = Array.setUp(); //to signify it's been added even if not used
                
                //Listen for message on children
                for (x = 0; x < this.entities.length; x++) {
                    if (this.entities[x]._listeners[event]) {
                        for (y = 0; y < this.entities[x]._listeners[event].length; y++) {
                            this.addChildEventListener(this.entities[x], event, this.entities[x]._listeners[event][y]);
                        }
                    }
                }
                
                return true;
            },
            
            updateChildEventListeners: function (entity) {
                this.removeChildEventListeners(entity);
                this.addChildEventListeners(entity);
            },
            
            addChildEventListeners: function (entity) {
                var y     = 0,
                    event = '';
                
                for (event in this._listeners) {
                    if (this._listeners.hasOwnProperty(event) && entity._listeners[event]) {
                        for (y = 0; y < entity._listeners[event].length; y++) {
                            this.addChildEventListener(entity, event, entity._listeners[event][y]);
                        }
                    }
                }
            },
            
            removeChildEventListeners: function (entity) {
                var i        = 0,
                    events   = null,
                    messages = null;
                
                if (entity.containerListener) {
                    events   = entity.containerListener.events;
                    messages = entity.containerListener.messages;

                    for (i = 0; i < events.length; i++) {
                        this.removeChildEventListener(entity, events[i], messages[i]);
                    }
                    events.recycle();
                    messages.recycle();
                    entity.containerListener.recycle();
                    entity.containerListener = null;
                }
            },
            
            addChildEventListener: function (entity, event, callback) {
                if (!entity.containerListener) {
                    entity.containerListener = Data.setUp(
                        "events", Array.setUp(),
                        "messages", Array.setUp()
                    );
                }
                entity.containerListener.events.push(event);
                entity.containerListener.messages.push(callback);
                this.on(event, callback, callback._priority || 0);
            },
            
            removeChildEventListener: function (entity, event, callback) {
                var i        = 0,
                    events   = entity.containerListener.events,
                    messages = entity.containerListener.messages;
                
                for (i = 0; i < events.length; i++) {
                    if ((events[i] === event) && (!callback || (messages[i] === callback))) {
                        this.off(event, messages[i]);
                    }
                }
            },

            destroy: function () {
                var i = this.entities.length,
                    entity = null;
                
                while (i--) {
                    entity = this.entities[i];
                    this.removeChildEventListeners(entity);
                    entity.destroy();
                }
                this.entities.recycle();
                delete this.owner.entities;
                this.childEvents.recycle();
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
                return null;
            },

            getEntitiesByType: function (type) {
                var i         = 0,
                    selection = null,
                    entities  = Array.setUp();
                
                for (i = 0; i < this.entities.length; i++) {
                    if (this.entities[i].type === type) {
                        entities.push(this.entities[i]);
                    }
                    if (this.entities[i].getEntitiesByType) {
                        selection = this.entities[i].getEntitiesByType(type);
                        entities.union(selection);
                        selection.recycle();
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
            addEntity: function (newEntity, callback) {
                var entity = null,
                    x = 0;
                
                if (newEntity instanceof Entity) {
                    entity = newEntity;
                    if (callback) {
                        callback();
                    }
                } else {
                    if (typeof newEntity === 'string') {
                        entity = new Entity(platypus.game.settings.entities[newEntity], null, callback);
                    } else if (newEntity.id) {
                        entity = new Entity(newEntity, null, callback);
                    } else {
                        entity = new Entity(platypus.game.settings.entities[newEntity.type], newEntity, callback);
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
                var i = this.entities.indexOf(entity);

                if (i >= 0) {
                    this.removeChildEventListeners(entity);
                    this.entities.greenSplice(i);
                    this.triggerEventOnChildren('peer-entity-removed', entity);
                    this.owner.triggerEvent('child-entity-removed', entity);
                    entity.destroy();
                    entity.parent = null;
                    return entity;
                }
                return false;
            },
            
            triggerEventOnChildren: function (event, message, debug) {
                if (this.destroyed) {
                    return 0;
                }
                
                if (!this._listeners[event]) {
                    this.addNewPrivateEvent(event);
                }
                return this.triggerEvent(event, message, debug);
            },

            triggerOnChildren: function (event, message, debug) {
                if (this.destroyed) {
                    return 0;
                }
                
                if (!this._listeners[event]) {
                    this.addNewPrivateEvent(event);
                }
                return this.trigger(event, message, debug);
            }
        },
        
        getAssetList: function (def, props, defaultProps) {
            var i = 0,
                assets = Array.setUp(),
                entities = Array.setUp(),
                arr = null;
            
            if (def.entities) {
                entities.union(def.entities);
            }
            
            if (props && props.entities) {
                entities.union(props.entities);
            } else if (defaultProps && defaultProps.entities) {
                entities.union(defaultProps.entities);
            }

            for (i = 0; i < entities.length; i++) {
                arr = Entity.getAssetList(entities[i]);
                assets.union(arr);
                arr.recycle();
            }
            
            entities.recycle();
            
            return assets;
        }
    }, platypus.Messenger);
}());
