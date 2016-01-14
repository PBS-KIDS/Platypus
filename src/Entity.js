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
      
         "properties": [
         // This array lists properties that will be attached directly to this entity.
      
             "x": 240
             // For example, `x` becomes `entity.x` on the new entity.
         ],
      
         "filters": {
         // Filters are only used by top level entities loaded by the scene and are not used by the entity directly. They determine whether an entity should be loaded on a particular browser according to browser settings.
      
             "includes": ["touch"],
             // Optional. This filter specifies that this entity should be loaded on browsers/devices that support a touch interface. More than one setting can be added to the array.

             "excludes": ["mobile"]
             // Optional. This filter specifies that this entity should not be loaded on mobile browsers/devices that. More than one setting can be added to the array.
         }
     }
 * 
 * @namespace platypus
 * @class Entity
 * @constructor
 * @extends Messenger
 * @param {Object} [definition] Base definition for the entity.
 * @param {Object} [definition.id] This declares the type of entity and will be stored on the Entity as `entity.type` after instantiation.
 * @param {Object} [definition.components] This lists the components that should be attached to this entity.
 * @param {Object} [definition.properties] This is a list of key/value pairs that are added directly to the Entity as `entity.key = value`.
 * @param {Object} [instanceDefinition] Specific instance definition including properties that override the base definition properties.
 * @return {Entity} Returns the new entity made up of the provided components. 
**/

/*global console, platypus */
/*jslint plusplus:true */
platypus.Entity = (function () {
    "use strict";
    
    var entityIds = {},
        union = function (a, b) {
            var i = 0,
                j = 0,
                aL = a.length,
                bL = b.length,
                found = false;
                
            for (i = 0; i < bL; i++) {
                found = false;
                for (j = 0; j < aL; j++) {
                    if (b[i] === a[j]) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    a.push(b[i]);
                }
            }
        },
        entity = function (definition, instanceDefinition) {
            var i                    = 0,
                componentDefinition  = null,
                def                  = definition || {},
                componentDefinitions = def.components || [],
                defaultProperties    = def.properties || {},
                instance             = instanceDefinition || {},
                instanceProperties   = instance.properties || {};

            // Set properties of messenger on this entity.
            platypus.Messenger.call(this);

            this.components  = [];
            this.type = def.id || 'none';

            this.id = instance.id || instanceProperties.id;
            if (!this.id) {
                if (!entityIds[this.type]) {
                    entityIds[this.type] = 0;
                }
                this.id = this.type + '-' + entityIds[this.type];
                entityIds[this.type] += 1;
            }

            this.setProperty(defaultProperties); // This takes the list of properties in the JSON definition and appends them directly to the object.
            this.setProperty(instanceProperties); // This takes the list of options for this particular instance and appends them directly to the object.
            this.bind('set-property', function (keyValuePairs) {
                this.setProperty(keyValuePairs);
            }.bind(this));

            if (!this.state) {
                this.state = {}; //starts with no state information. This expands with boolean value properties entered by various logic components.
            }
            this.lastState = {}; //This is used to determine if the state of the entity has changed.

            for (i = 0; i < componentDefinitions.length; i++) {
                componentDefinition = componentDefinitions[i];
                if (platypus.components[componentDefinition.type]) {
                    this.addComponent(new platypus.components[componentDefinition.type](this, componentDefinition));
                } else {
                    console.warn("Component '" + componentDefinition.type + "' is not defined.", componentDefinition);
                }
            }

            /**
             * The entity triggers `load` on itself once all the properties and components have been attached, notifying the components that all their peer components are ready for messages.
             *
             * @event load
             */
            this.triggerEvent('load');
        },
        proto = entity.prototype = new platypus.Messenger();
    
    /**
    * Returns a string describing the entity.
    *
    * @method toString
    * @return {String} Returns the entity type as a string of the form "[entity entity-type]".
    **/
    proto.toString = function () {
        return "[entity " + this.type + "]";
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
                    this.components.splice(i, 1);
                    this.triggerEvent('component-removed', component);
                    component.destroy();
                    return component;
                }
            }
        } else {
            for (i = 0; i < this.components.length; i++) {
                if (this.components[i] === component) {
                    this.components.splice(i, 1);
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
        var i = 0;
        
        for (i = 0; i < this.components.length; i++) {
            this.components[i].destroy();
        }
        this.components.length = 0;
        this.messengerDestroy();
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
            assets = [];
        
        if (def.type) {
            return entity.getAssetList(platypus.game.settings.entities[def.type], def.properties);
        }

        for (i = 0; i < def.components.length; i++) {
            component = platypus.components[def.components[i].type];
            if (component) {
                union(assets, component.getAssetList(def.components[i], def.properties, props));
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
            assets = [];
        
        if (def.type) {
            return entity.getLateAssetList(platypus.game.settings.entities[def.type], props, data);
        }

        for (i = 0; i < def.components.length; i++) {
            component = platypus.components[def.components[i].type];
            if (component) {
                union(assets, component.getLateAssetList(def.components[i], def.properties, props, data));
            }
        }
        
        return assets;
    };
    
    return entity;
}());
