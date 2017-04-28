/**
 * The Entity object acts as a container for components, facilitates communication between components and other game objects, and includes properties set by components to maintain a current state. The entity object serves as the foundation for most of the game objects in the platypus engine.
 *
 * ## JSON Definition Example
     {
         "id": "entity-id",
         // "entity-id" becomes `entity.type` once the entity is created.
      
         "components": [
         // This array lists one or more component definition objects
      
             {"type": "example-component"}
            // The component objects must include a "type" property corresponding to a component to load, but may also include additional properties to customize the component in a particular way for this entity.
         ],
      
         "properties": {
         // This object lists properties that will be attached directly to this entity.
      
             "x": 240
             // For example, `x` becomes `entity.x` on the new entity.
         }
     }
 *
 * @namespace platypus
 * @class Entity
 * @constructor
 * @extends Messenger
 * @param [definition] {Object} Base definition for the entity.
 * @param [definition.id] {Object} This declares the type of entity and will be stored on the Entity as `entity.type` after instantiation.
 * @param [definition.components] {Object} This lists the components that should be attached to this entity.
 * @param [definition.properties] {Object} [definition.properties] This is a list of key/value pairs that are added directly to the Entity as `entity.key = value`.
 * @param [instanceDefinition] {Object} Specific instance definition including properties that override the base definition properties.
 * @param [instanceDefinition.properties] {Object} This is a list of key/value pairs that are added directly to the Entity as `entity.key = value`.
 * @param [callback] {Function} A function to run once all of the components on the Entity have been loaded. The first parameter is the entity itself.
 * @return {Entity} Returns the new entity made up of the provided components.
**/

/*global include, platypus */
platypus.Entity = (function () {
    'use strict';
    
    var Data = include('platypus.Data'),
        StateMap = include('platypus.StateMap'),
        componentInit = function (Component, componentDefinition, callback) {
            this.addComponent(new Component(this, componentDefinition, callback));
        },
        entityIds = {},
        entity = function (definition, instanceDefinition, callback) {
            var i                    = 0,
                componentDefinition  = null,
                componentInits       = Array.setUp(),
                def                  = Data.setUp(definition),
                componentDefinitions = def.components,
                defaultProperties    = Data.setUp(def.properties),
                instance             = Data.setUp(instanceDefinition),
                instanceProperties   = Data.setUp(instance.properties),
                savedEvents          = Array.setUp(),
                savedMessages        = Array.setUp();

            // Set properties of messenger on this entity.
            platypus.Messenger.call(this);

            this.components  = Array.setUp();
            this.type = def.id || 'none';

            this.id = instance.id || instanceProperties.id;
            if (this.id) { // check to make sure auto-ids don't overlap.
                if (this.id.search(this.type + '-') === 0) {
                    i = parseInt(this.id.substring(this.id.search('-') + 1), 10);
                    if (!isNaN(i) && (!entityIds[this.type] || (entityIds[this.type] <= i))) {
                        entityIds[this.type] = i + 1;
                    }
                }
            } else {
                if (!entityIds[this.type]) {
                    entityIds[this.type] = 0;
                }
                this.id = this.type + '-' + entityIds[this.type];
                entityIds[this.type] += 1;
            }

            this.setProperty(defaultProperties); // This takes the list of properties in the JSON definition and appends them directly to the object.
            this.setProperty(instanceProperties); // This takes the list of options for this particular instance and appends them directly to the object.
            this.on('set-property', function (keyValuePairs) {
                this.setProperty(keyValuePairs);
            }.bind(this));

            this.state = StateMap.setUp(this.state); //starts with no state information. This expands with boolean value properties entered by various logic components.
            this.lastState = StateMap.setUp(); //This is used to determine if the state of the entity has changed.
            
            this.trigger = this.triggerEvent = function (event, message) {
                savedEvents.push(event);
                savedMessages.push(message);

                return -1; // Message has not been delivered yet.
            };
            
            if (componentDefinitions) {
                for (i = 0; i < componentDefinitions.length; i++) {
                    componentDefinition = componentDefinitions[i];
                    if (componentDefinition) {
                        if (platypus.components[componentDefinition.type]) {
                            componentInits.push(componentInit.bind(this, platypus.components[componentDefinition.type], componentDefinition));
                        } else {
                            platypus.debug.warn('Entity "' + this.type + '": Component "' + componentDefinition.type + '" is not defined.', componentDefinition);
                        }
                    }
                }
            }
            platypus.Async.setUp(componentInits, function () {
                // Trigger saved events that were being fired during component addition.
                delete this.trigger;
                delete this.triggerEvent;
                for (i = 0; i < savedEvents.length; i++) {
                    this.trigger(savedEvents[i], savedMessages[i]);
                }
                savedEvents.recycle();
                savedMessages.recycle();

                /**
                 * The entity triggers `load` on itself once all the properties and components have been attached, notifying the components that all their peer components are ready for messages.
                 *
                 * @event load
                 */
                this.triggerEvent('load');

                if (callback) {
                    callback(this);
                }
            }.bind(this));
            
            componentInits.recycle();
            def.recycle();
            defaultProperties.recycle();
            instance.recycle();
            instanceProperties.recycle();
        },
        proto = entity.prototype = new platypus.Messenger();
    
    /**
    * Returns a string describing the entity.
    *
    * @method toString
    * @return {String} Returns the entity type as a string of the form "[Entity entity-type]".
    **/
    proto.toString = function () {
        return "[Entity " + this.type + "]";
    };
    
    /**
    * Returns a JSON object describing the entity.
    *
    * @method toJSON
    * @param includeComponents {Boolean} Whether the returned JSON should list components. Defaults to `false` to condense output since components are generally defined in `platypus.game.settings.entities`, but may be needed for custom-constructed entities not so defined.
    * @return {Object} Returns a JSON definition that can be used to recreate the entity.
    * @since 0.11.0
    **/
    proto.toJSON = function (includeComponents) {
        var components = this.components,
            definition = {
                properties: {
                    id: this.id,
                    state: this.state.toJSON()
                }
            },
            i = 0,
            json = null,
            properties = definition.properties;
        
        if (includeComponents) {
            definition.id = this.type;
            definition.components = [];
        } else {
            definition.type = this.type;
        }

        for (i = 0; i < components.length; i++) {
            json = components[i].toJSON(properties);
            if (includeComponents && json) {
                definition.components.push(json);
            }
        }

        return definition;
    };
    
    /**
    * Attaches the provided component to the entity.
    *
    * @method addComponent
    * @param {platypus.Component} component Must be an object that functions as a Component.
    * @return {platypus.Component} Returns the same object that was submitted.
    **/
    proto.addComponent = function (component) {
        this.components.push(component);

        /**
         * The entity triggers `component-added` on itself once a component has been attached, notifying other components of their peer component.
         *
         * @event component-added
         * @param {platypus.Component} component The added component.
         * @param {String} component.type The type of component.
         **/
        this.triggerEvent('component-added', component);
        return component;
    };
    
    /**
    * Removes the mentioned component from the entity.
    *
    * @method removeComponent
    * @param {Component} component Must be a [[Component]] attached to the entity.
    * @return {Component} Returns the same object that was submitted if removal was successful; otherwise returns false (the component was not found attached to the entity).
    **/
    proto.removeComponent = function (component) {
        var i = 0;
        
        /**
         * The entity triggers `component-removed` on itself once a component has been removed, notifying other components of their peer component's removal.
         *
         * @event component-removed
         * @param {Component} component The removed component.
         * @param {String} component.type The type of component.
         **/
        if (typeof component === 'string') {
            for (i = 0; i < this.components.length; i++) {
                if (this.components[i].type === component) {
                    component = this.components[i];
                    this.components.greenSplice(i);
                    this.triggerEvent('component-removed', component);
                    component.destroy();
                    return component;
                }
            }
        } else {
            for (i = 0; i < this.components.length; i++) {
                if (this.components[i] === component) {
                    this.components.greenSplice(i);
                    this.triggerEvent('component-removed', component);
                    component.destroy();
                    return component;
                }
            }
        }
        
        return false;
    };
    
    /**
    * This method sets one or more properties on the entity.
    *
    * @param {Object} properties A list of key/value pairs to set as properties on the entity.
    * @method setProperty
    **/
    proto.setProperty = function (properties) {
        var index = '';
        
        for (index in properties) { // This takes a list of properties and appends them directly to the object.
            if (properties.hasOwnProperty(index)) {
                this[index] = properties[index];
            }
        }
    };
    
    /**
    * This method removes all components from the entity.
    *
    * @method destroy
    **/
    proto.messengerDestroy = proto.destroy;
    proto.destroy = function () {
        var components = this.components,
            i = components.length;
        
        if (!this._destroyed) {
            while (i--) {
                components[i].destroy();
            }
            components.recycle();
            
            this.state.recycle();
            this.state = null;
            
            this.lastState.recycle();
            this.lastState = null;
            
            this.messengerDestroy();
        }
    };
    
    /**
     * Returns all of the assets required for this Entity. This method calls the corresponding method on all components to determine the list of assets.
     *
     * @method getAssetList
     * @param definition {Object} The definition for the Entity.
     * @param properties {Object} Properties for this instance of the Entity.
     * @return {Array} A list of the necessary assets to load.
     */
    entity.getAssetList = function (def, props) {
        var i = 0,
            component = null,
            arr = null,
            assets = null,
            definition = null;
        
        if (def.type) {
            definition = platypus.game.settings.entities[def.type];
            if (!definition) {
                platypus.debug.warn('Entity "' + def.type + '": This entity is not defined.', def);
                return assets;
            }
            return entity.getAssetList(definition, def.properties);
        }
        
        assets = Array.setUp();

        for (i = 0; i < def.components.length; i++) {
            component = def.components[i] && def.components[i].type && platypus.components[def.components[i].type];
            if (component) {
                arr = component.getAssetList(def.components[i], def.properties, props);
                assets.union(arr);
                arr.recycle();
            }
        }
        
        return assets;
    };
    
    /**
     * Returns all of the assets required for this Entity. This method calls the corresponding method on all components to determine the list of assets.
     *
     * @method getLateAssetList
     * @param definition {Object} The definition for the Entity.
     * @param data {Object} Scene data that affects asset list.
     * @return {Array} A list of the necessary assets to load.
     */
    entity.getLateAssetList = function (def, props, data) {
        var i = 0,
            component = null,
            arr = null,
            assets = null;
        
        if (def.type) {
            return entity.getLateAssetList(platypus.game.settings.entities[def.type], props, data);
        }
        
        assets = Array.setUp();

        for (i = 0; i < def.components.length; i++) {
            component = def.components[i] && def.components[i].type && platypus.components[def.components[i].type];
            if (component) {
                arr = component.getLateAssetList(def.components[i], def.properties, props, data);
                assets.union(arr);
                arr.recycle();
            }
        }
        
        return assets;
    };
    
    return entity;
}());
