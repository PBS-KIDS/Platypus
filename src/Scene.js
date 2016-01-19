/**
 * This class is instantiated by [Game](platypus.Game.html) and contains one or more entities as layers. Each layer [Entity](platypus.Entity.html) handles a unique aspect of the scene. For example, one layer might contain the game world, while another layer contains the game interface. Generally there is only a single scene loaded at any given moment.
 * ## JSON Definition
 *     {
 *         "layers":[
 *         // Required array listing the entities that should be loaded as scene layers. These can be actual entity JSON definitions as shown in Entity or references to entities by using the following specification.
 * 
 *             {
 *                 "type": "entity-id",
 *                 // This value maps to an entity definition with a matching "id" value as shown in Entity and will load that definition.
 *                 
 *                 "properties": {"x": 400}
 *                 // Optional. If properties are passed in this reference, they override the entity definition's properties of the same name.
 *             }
 *         ]
 *     }
 * @namespace platypus
 * @class Scene
 * @constructor
 * @extends springroll.State
 * @param Stage {PIXI.Container} Object where the scene displays layers.
 * @param {Object} [definition] Base definition for the scene, including one or more layers with both properties, filters, and components as shown above under "JSON Definition Example".
 * @param {String} [definition.id] This declares the id of the scene.
 * @param {Array} [definition.layers] This lists the layers that comprise the scene.
 * @return {Scene} Returns the new scene made up of the provided layers. 
 */
/*global extend, platypus */
/*jslint plusplus:true */
platypus.Scene = (function () {
    "use strict";
    
    var Entity = include('platypus.Entity'),
        State  = include('springroll.State'),
        fn = /([\w-]+)\.(\w)$/,
        formatAsset = function (asset) {
            var match = asset.match(fn),
                a = {
                    id: asset,
                    src: asset
                };
            
            //TODO: Make this behavior less opaque.
            if (match) {
                a.id = match[1];
            } else {
                a.src = 'assets/images/' + asset + '.png';
            }
            
            return a;
        },
        Scene  = function (panel, definition) {
            State.call(this, panel, definition.options);
            
            this.id = definition.id;
            this.preload.union(this.getAssetList(definition));
            this.layerDefinitions = definition.layers;
            this.storeMessages = false;
            this.storedMessages = [];
            this.stage = panel;
            this.layers = [];
            
            // If the scene has dynamically added assets such as level data
            this.on('loading', function (assets) {
                var lateAssets = this.getLateAssetList(definition);
                
                if (lateAssets.length) {
                    assets.union(lateAssets);
                    
                    this.on('exit', function (lateAssets) {
                        this.app.unload(lateAssets);
                        lateAssets = null;
                    }.bind(this, lateAssets));
                }
            }.bind(this));
            
            this.on('loaded', function () {
                var i = 0,
                    key = '',
                    layers = this.layerDefinitions,
                    supportedLayer = true,
                    layerDefinition = false,
                    properties = null,
                    messages = null;

                this.storeMessages = true;
                for (i = 0; i < layers.length; i++) {
                    layerDefinition = layers[i];
                    properties = {stage: this.stage, parent: this};
                    if (layerDefinition.properties) {
                        for (key in layerDefinition.properties) {
                            if (layerDefinition.properties.hasOwnProperty(key)) {
                                properties[key] = layerDefinition.properties[key];
                            }
                        }
                    }

                    if (layerDefinition.type) { // this layer should be loaded from an entity definition rather than this instance
                        layerDefinition = platypus.game.settings.entities[layerDefinition.type];
                    }

                    supportedLayer = true;
                    if (layerDefinition.filter) {
                        if (layerDefinition.filter.includes) {
                            supportedLayer = false;
                            for (key in layerDefinition.filter.includes) {
                                if (layerDefinition.filter.includes.hasOwnProperty(key) && platypus.supports[layerDefinition.filter.includes[key]]) {
                                    supportedLayer = true;
                                }
                            }
                        }
                        if (layerDefinition.filter.excludes) {
                            for (key in layerDefinition.filter.excludes) {
                                if (layerDefinition.filter.excludes.hasOwnProperty(key) && platypus.supports[layerDefinition.filter.excludes[key]]) {
                                    supportedLayer = false;
                                }
                            }
                        }
                    }
                    if (supportedLayer) {
                        this.layers.push(new platypus.Entity(layerDefinition, {
                            properties: properties
                        }));
                    }
                }
                // This allows the layer to gather messages that are triggered as it is loading and deliver them to all the layers once all the layers are in place.
                messages = this.storedMessages;
                this.storeMessages = false;
                for (i = 0; i < messages.length; i++) {
                    this.triggerOnChildren(messages[i].message, messages[i].value);
                }
                messages.length = 0;

                if (platypus.game.settings.debug) {
                    console.log('Scene loaded: ' + this.id);
                }
            
                /**
                 * This event is triggered on the layers once the Scene is finished loading.
                 * 
                 * @event 'scene-loaded'
                 * @param data {Object} A list of key-value pairs of data sent into this Scene from the previous Scene.
                 */
                this.triggerOnChildren('scene-loaded', this.data);
            }.bind(this));
        },
        proto = extend(Scene, State);
        
    /**
     * Triggers "scene-live" on the Scene layers once the Scene is finished loading and the transition into the Scene has finished.
     * 
     * @method enterDone
     */
    proto.enterDone = function () {
        platypus.game.currentScene = this;
        if (platypus.game.settings.debug) {
            console.log('Scene live: ' + this.id);
        }
        
        /**
         * This event is triggered on the layers once the Scene is finished loading and the transition into the Scene has finished.
         * 
         * @event 'scene-live'
         * @param data {Object} A list of key-value pairs of data sent into this Scene from the previous Scene.
         */
        this.triggerOnChildren('scene-live', this.data);
    };
    
    /**
     * Logs the end of the Scene to the console in debug mode.
     * 
     * @method exitStart
     */
    proto.exitStart = function () {
        if (platypus.game.settings.debug) {
            console.log('Scene ending: ' + this.id);
        }
    };
    
/**
 * This method is used by external objects to trigger messages on the layers as well as internal entities broadcasting messages across the scope of the scene.
 * 
 * @method triggerOnChildren
 * @param {String} eventId This is the message to process.
 * @param {*} event This is a message object or other value to pass along to component functions.
 **/
    proto.triggerOnChildren = function (eventId, event) {
        var i = 0;
        
        if (this.storeMessages) {
            this.storedMessages.push({
                message: eventId,
                value: event
            });
        } else {
            for (i = 0; i < this.layers.length; i++) {
                this.layers[i].trigger(eventId, event);
            }
        }
    };
    
/**
 * This method will return the first entity it finds with a matching id.
 * 
 * @method getEntityById
 * @param {string} id The entity id to find.
 * @return {Entity} Returns the entity that matches the specified entity id.
 **/
    proto.getEntityById = function (id) {
        var i = 0,
            selection = null;
        
        for (i = 0; i < this.layers.length; i++) {
            if (this.layers[i].id === id) {
                return this.layers[i];
            }
            if (this.layers[i].getEntityById) {
                selection = this.layers[i].getEntityById(id);
                if (selection) {
                    return selection;
                }
            }
        }
        return undefined;
    };

/**
 * This method will return all game entities that match the provided type.
 * 
 * @method getEntitiesByType
 * @param {String} type The entity type to find.
 * @return entities {Array} Returns the entities that match the specified entity type.
 **/
    proto.getEntitiesByType = function (type) {
        var i = 0,
            selection = null,
            entities  = [];
        
        for (i = 0; i < this.layers.length; i++) {
            if (this.layers[i].type === type) {
                entities.push(this.layers[i]);
            }
            if (this.layers[i].getEntitiesByType(type)) {
                selection = this.layers[i].getEntitiesByType(type);
                if (selection) {
                    entities = entities.concat(selection);
                }
            }
        }
        return entities;
    };

/**
 * This method destroys all the layers in the scene.
 * 
 * @method destroy
 * @deprecated since 0.7.0 - Use the `exit` method in line with SpringRoll State methods.
 **/

/**
 * This method destroys all the layers in the scene.
 * 
 * @method exit
 **/
    proto.destroy = proto.exit = function () {
        var i = 0;
        
        for (i = 0; i < this.layers.length; i++) {
            this.layers[i].destroy();
        }
        this.layers.length = 0;
        
        platypus.game.currentScene = null;
    };
    
    /**
     * Returns all of the assets required for the Scene. This method calls the corresponding method on all entities to determine the list of assets.
     * 
     * @method getAssetList
     * @param definition {Object} The definition for the Scene.
     * @return {Array} A list of the necessary assets to load.
     */
    proto.getAssetList = function (def) {
        var i = 0,
            assets = [];
        
        for (i = 0; i < def.layers.length; i++) {
            assets.union(Entity.getAssetList(def.layers[i]));
        }
        
        for (i = 0; i < assets.length; i++) {
            assets[i] = formatAsset(assets[i]);
        }
        
        return assets;
    };
    
    /**
     * Returns all of the dynamic assets required for the Scene.
     * 
     * @method getLateAssetList
     * @return {Array} A list of the necessary assets to load.
     */
    proto.getLateAssetList = function (def) {
        var i = 0,
            assets = [];
        
        for (i = 0; i < def.layers.length; i++) {
            assets.union(Entity.getLateAssetList(def.layers[i], null, this.data));
        }
        
        for (i = 0; i < assets.length; i++) {
            assets[i] = formatAsset(assets[i]);
        }
        
        return assets;
    };
    
    return Scene;
}());
