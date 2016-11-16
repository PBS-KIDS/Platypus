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
 *         ],
 *
 *         "assets": []
 *         // Optional list of assets this scene requires.
 *     }
 * @namespace platypus
 * @class Scene
 * @constructor
 * @extends springroll.State
 * @param Stage {PIXI.Container} Object where the scene displays layers.
 * @param {Object} [definition] Base definition for the scene, including one or more layers with both properties, filters, and components as shown above under "JSON Definition Example".
 * @param {String} [definition.id] This declares the id of the scene.
 * @param {Array} [definition.layers] This lists the layers that comprise the scene.
 * @param {Array} [definition.assets] This lists the assets that this scene requires.
 * @return {Scene} Returns the new scene made up of the provided layers.
 */
/* global extend, include, platypus */
platypus.Scene = (function () {
    'use strict';
    
    var Data = include('platypus.Data'),
        Entity = include('platypus.Entity'),
        PIXIAnimation = include('platypus.PIXIAnimation'),
        State  = include('springroll.State'),
        fn = /^(?:\w+:\/{2}\w+(?:\.\w+)*\/?)?(?:[\/.]*?(?:[^?]+)?\/)?(?:([^\/?]+)\.(\w+))(?:\?\S*)?$/,
        filterAssets = (function () {
            var isDuplicate = function (id, preload) {
                var j = preload.length;

                while (j--) {
                    if (preload[j].id === id) {
                        return true;
                    }
                }

                return false;
            };

            return function (assets, preload) {
                var asset = null,
                    cache = platypus.game.app.assetManager.cache._cache,
                    filteredAssets = Array.setUp(),
                    i = assets.length;

                while (i--) {
                    asset = formatAsset(assets[i]);
                    if (cache[asset.id] || isDuplicate(asset.id, preload)) {
                        asset.recycle();
                    } else {
                        filteredAssets.push(asset);
                    }
                }

                return filteredAssets;
            };
        }()),
        formatAsset = function (asset) {
            var match = asset.match(fn),
                a = Data.setUp(
                    'id', asset,
                    'src', asset
                );
            
            //TODO: Make this behavior less opaque.
            if (match) {
                a.id = match[1];
            } else {
                platypus.debug.warn('Scene: A listed asset should provide the entire file path since version 0.9.0.');
            }
            
            return a;
        },
        unloadAssets = function (lateAssets) {
            this.app.unload(lateAssets);
            lateAssets.recycle();
        },
        layerInit = function (layerDefinition, properties, callback) {
            this.layers.push(new Entity(layerDefinition, {
                properties: properties
            }, callback));
        },
        loadScene = function () {
            var i = 0,
                key = '',
                layerInits = Array.setUp(),
                layers = this.layerDefinitions,
                supportedLayer = true,
                layerDefinition = false,
                properties = null,
                messages = null;

            this.stillLoading = true;
            this.stillEntering = true;
            this.storeMessages = true;
            this.storedMessages = Array.setUp();
            this.layers = Array.setUp();
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
                    layerInits.push(layerInit.bind(this, layerDefinition, properties));
                }
            }

            platypus.Async.setUp(layerInits, function () {
                platypus.debug.olive('Scene loaded: ' + this.id);
                
                /**
                 * This event is triggered on the layers once the Scene is finished loading.
                 *
                 * @event 'scene-loaded'
                 * @param data {Object} A list of key-value pairs of data sent into this Scene from the previous Scene.
                 */
                this.triggerOnChildren('scene-loaded', this.data);
                
                // Go ahead and load base textures to the GPU to prevent intermittent lag later. - DDD 3/18/2016
                PIXIAnimation.preloadBaseTextures(this.app.display.renderer);

                this.stillLoading = false;
                if (!this.stillEntering) {
                    this.sceneLive();
                }
            }.bind(this));

            // This allows the layer to gather messages that are triggered as it is loading and deliver them to all the layers once all the layers are in place.
            messages = this.storedMessages;
            this.storeMessages = false;
            for (i = 0; i < messages.length; i++) {
                this.triggerOnChildren(messages[i].message, messages[i].value);
            }
            messages.recycle();
            this.storedMessages = null;

            layerInits.recycle();
        },
        loading = function (definition, assets) {
            var lateAssets = this.getLateAssetList(definition);
            
            if (lateAssets.length) {
                assets.union(lateAssets);
                this.once('exit', unloadAssets.bind(this, lateAssets));
            } else {
                lateAssets.recycle();
            }
        },
        Scene  = function (panel, definition) {
            var assets = null;
            
            State.call(this, panel, definition.options);
            
            assets = this.getAssetList(definition);

            this.id = definition.id;
            this.preload.union(assets);
            this.layerDefinitions = definition.layers;
            this.storeMessages = false;
            this.storedMessages = null;
            this.stage = panel;
            this.layers = null;
            this.assets = definition.assets || null;
            this.stillLoading = false;
            this.stillEntering = false;
            
            // If the scene has dynamically added assets such as level data
            this.on('loading', loading.bind(this, definition));

            // Load scene
            this.on('loaded', loadScene);
            
            assets.recycle();
        },
        proto = extend(Scene, State);
        
    /**
     * Triggers "scene-live" on the Scene layers once the Scene is finished loading and the transition into the Scene has finished.
     *
     * @method enterDone
     */
    proto.enterDone = function () {
        this.stillEntering = false;
        if (!this.stillLoading) {
            this.sceneLive();
        }
    };

    proto.sceneLive = function () {
        platypus.game.currentScene = this;
        platypus.debug.olive('Scene live: ' + this.id);
        
        /**
         * This event is triggered on the layers once the Scene is finished loading and the transition into the Scene has finished.
         *
         * @event 'scene-live'
         * @param data {Object} A list of key-value pairs of data sent into this Scene from the previous Scene.
         */
        this.triggerOnChildren('scene-live', this.data);
    };
    
    /**
     * Triggers 'scene-ended' on the layer.
     *
     * @method exitStart
     */
    proto.exitStart = function () {
        platypus.debug.olive('Scene ending: ' + this.id);
        
        /**
         * This event is triggered on the layers once the Scene is over.
         *
         * @event 'scene-ended'
         * @param data {Object} A list of key-value pairs of data sent into this Scene from the previous Scene.
         * @since 0.7.1
         */
        this.triggerOnChildren('scene-ended', this.data);
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
        return null;
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
            entities  = Array.setUp();
        
        for (i = 0; i < this.layers.length; i++) {
            if (this.layers[i].type === type) {
                entities.push(this.layers[i]);
            }
            if (this.layers[i].getEntitiesByType) {
                selection = this.layers[i].getEntitiesByType(type);
                entities.union(selection);
                selection.recycle();
            }
        }
        return entities;
    };

/**
 * This method destroys all the layers in the scene.
 *
 * @method exit
 **/
    proto.exit = function () {
        var i = 0;
        
        for (i = 0; i < this.layers.length; i++) {
            this.layers[i].destroy();
        }
        this.layers.recycle();
        this.layers = null;
        
        platypus.game.currentScene = null;
    };
    
    /**
     * Returns all of the assets required for the Scene. This method calls the corresponding method on all entities to determine the list of assets. It ignores assets that have already been preloaded.
     *
     * @method getAssetList
     * @param definition {Object} The definition for the Scene.
     * @return {Array} A list of the necessary assets to load.
     */
    proto.getAssetList = function (def) {
        var i = 0,
            arr = null,
            assets = Array.setUp();
        
        if (def.assets) {
            assets.union(def.assets);
        }
        
        for (i = 0; i < def.layers.length; i++) {
            arr = Entity.getAssetList(def.layers[i]);
            assets.union(arr);
            arr.recycle();
        }
        
        arr = filterAssets(assets, this.preload);
        assets.recycle();
        
        return arr;
    };
    
    /**
     * Returns all of the dynamic assets required for the Scene.
     *
     * @method getLateAssetList
     * @return {Array} A list of the necessary assets to load.
     */
    proto.getLateAssetList = function (def) {
        var i = 0,
            arr = null,
            assets = Array.setUp();
        
        for (i = 0; i < def.layers.length; i++) {
            arr = Entity.getLateAssetList(def.layers[i], null, this.data);
            assets.union(arr);
            arr.recycle();
        }
        
        arr = filterAssets(assets, this.preload);
        assets.recycle();
        
        return arr;
    };

    return Scene;
}());
