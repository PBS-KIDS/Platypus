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
 * @extends platypus.Messenger
 * @param Stage {PIXI.Container} Object where the scene displays layers.
 * @param {Object} [definition] Base definition for the scene, including one or more layers with both properties and components as shown above under "JSON Definition Example".
 * @param {String} [definition.id] This declares the id of the scene.
 * @param {Array} [definition.layers] This lists the layers that comprise the scene.
 * @param {Array} [definition.assets] This lists the assets that this scene requires.
 * @return {Scene} Returns the new scene made up of the provided layers.
 */
/* global createjs, platypus */
import {arrayCache, greenSlice, greenSplice, union} from './utils/array.js';
import Async from './Async.js';
import Data from './Data.js';
import Entity from './Entity.js';
import Messenger from './Messenger.js';
import PIXIAnimation from './PIXIAnimation.js';
import {Sound} from '@createjs/soundjs';

export default (function () {
    var fn = /^(?:\w+:\/{2}\w+(?:\.\w+)*\/?)?(?:[\/.]*?(?:[^?]+)?\/)?(?:([^\/?]+)\.(\w+))(?:\?\S*)?$/,
        folders = {
            png: 'images',
            jpg: 'images',
            jpeg: 'images',
            ogg: 'audio',
            mp3: 'audio',
            m4a: 'audio',
            wav: 'audio'
        },
        addAsset = function (event) {
            platypus.assetCache.set(event.item.id, event.result);
        },
        unloadAssets = function (lateAssets) {
            var i = lateAssets.length,
                id = '',
                img = null,
                lateAsset = null;

            while (i--) {
                lateAsset = lateAssets[i];
                id = lateAsset.id;
                img = platypus.assetCache.get(id);
                img.src = '';
                platypus.assetCache.delete(id);
                lateAsset.recycle();
            }
            
            arrayCache.recycle(lateAssets);
        },
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
                    cache = platypus.assetCache,
                    filteredAssets = arrayCache.setUp(),
                    i = assets.length;

                while (i--) {
                    asset = formatAsset(assets[i]);
                    if (cache.get(asset.id) || isDuplicate(asset.id, preload)) {
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
                    'src', (platypus.game.options[folders[match[2].toLowerCase()]] || '') + asset
                );
            
            //TODO: Make this behavior less opaque.
            if (match) {
                a.id = match[1];
            } else {
                platypus.debug.warn('Scene: A listed asset should provide the entire file path.');
            }
            
            return a;
        },
        releaseHold = function (callback) {
            var holds = this.holds;

            holds.count -= 1;
            if (!holds.count) { // All holds have been released
                holds.recycle();
                this.holds = null;
                callback();
            }
        },
        layerInit = function (layerDefinition, properties, callback) {
            this.layers.push(new Entity(layerDefinition, {
                properties: properties
            }, callback));
        },
        loadScene = function (callback) {
            var i = 0,
                key = '',
                layerInits = arrayCache.setUp(),
                layers = this.layerDefinitions,
                supportedLayer = true,
                layerDefinition = false,
                properties = null,
                messages = null;
                
            this.holds = Data.setUp('count', 1, 'release', releaseHold.bind(this, callback));
            this.storeMessages = true;
            this.storedMessages = arrayCache.setUp();
            this.layers = arrayCache.setUp();

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

            Async.setUp(layerInits, function () {
                var holds = this.holds;

                platypus.debug.olive('Scene loaded: ' + this.id);
                
                /**
                 * This event is triggered on the layers once the Scene is finished loading.
                 *
                 * @event 'scene-loaded'
                 * @param data {Object} A list of key-value pairs of data sent into this Scene from the previous Scene.
                 * @param holds {platypus.Data} An object that handles any holds on before making the scene live.
                 * @param holds.count {Number} The number of holds to wait for before triggering "scene-live"
                 * @param holds.release {Function} The method to trigger to let the scene loader know that one hold has been released.
                 */
                this.triggerOnChildren('scene-loaded', this.data, holds);
                
                // Go ahead and load base textures to the GPU to prevent intermittent lag later. - DDD 3/18/2016
                PIXIAnimation.preloadBaseTextures(platypus.game.renderer);

                holds.release(); // Release initial hold. This triggers "scene-live" immediately if no holds have been placed by the "scene-loaded" event.
            }.bind(this));

            // This allows the layer to gather messages that are triggered as it is loading and deliver them to all the layers once all the layers are in place.
            messages = this.storedMessages;
            this.storeMessages = false;
            for (i = 0; i < messages.length; i++) {
                this.triggerOnChildren(messages[i].message, messages[i].value);
            }
            arrayCache.recycle(messages);
            this.storedMessages = null;

            arrayCache.recycle(layerInits);
        },
        loading = function (definition, callback) {
            var lateAssets = this.getLateAssetList(definition),
                assets = greenSlice(this.preload),
                queue = null,
                i = 0,
                sounds = this.unloadSounds = arrayCache.setUp(),
                src = '';

            if (lateAssets.length) {
                union(assets, lateAssets);
                this.unloadAssets = unloadAssets.bind(this, lateAssets);
            } else {
                arrayCache.recycle(lateAssets);
            }

            i = assets.length;
            while (i--) {
                src = assets[i].src || assets[i];
                src = src.substring(src.lastIndexOf('.')).toLowerCase();
                if (src === '.ogg' || src === '.mp3' || src === '.wav') {
                    sounds.push(greenSplice(assets, i));
                }
            }

            if (sounds.length) {
                Sound.registerSounds(sounds);
            }

            if (assets.length) {
                queue = new createjs.LoadQueue();
                queue.on('fileload', addAsset);
                queue.on('complete', loadScene.bind(this, callback));
                queue.loadManifest(assets);
            } else {
                loadScene.call(this, callback);
            }
        };

    class Scene extends Messenger {
        constructor (panel, definition) {
            var assets = null;

            super();
            
            this.preload = (definition && definition.options && definition.options.preload) || [];

            assets = this.getAssetList(definition);

            this.id = definition.id;
            union(this.preload, assets);
            this.layerDefinitions = definition.layers;
            this.storeMessages = false;
            this.storedMessages = null;
            this.stage = panel;
            this.layers = null;
            this.assets = definition.assets || null;
            this.holds = null;
            
            // If the scene has dynamically added assets such as level data
            this.on('load-scene', loading.bind(this, definition));
            this.on('show-scene', this.sceneLive.bind(this));
            this.on('exit-scene', this.exitStart.bind(this));

            arrayCache.recycle(assets);
        }
        
        sceneLive () {
            platypus.game.currentScene = this;
            platypus.game.stage.addChild(this.stage);
            platypus.debug.olive('Scene live: ' + this.id);
            
            /**
             * This event is triggered on the layers once the Scene is finished loading.
             *
             * @event 'scene-live'
             * @param data {Object} A list of key-value pairs of data sent into this Scene from the previous Scene.
             */
            this.triggerOnChildren('scene-live', this.data);
        }
        
        /**
         * Triggers 'scene-ended' on the layer.
         *
         * @method exitStart
         */
        exitStart (callback) {
            platypus.debug.olive('Scene ending: ' + this.id);
            
            /**
             * This event is triggered on the layers once the Scene is over.
             *
             * @event 'scene-ended'
             * @param data {Object} A list of key-value pairs of data sent into this Scene from the previous Scene.
             * @since 0.7.1
             */
            this.triggerOnChildren('scene-ended', this.data);
            platypus.game.stage.removeChild(this.stage);

            this.exit();

            callback();
        }
        
        /**
         * This method is used by external objects to trigger messages on the layers as well as internal entities broadcasting messages across the scope of the scene.
         *
         * @method triggerOnChildren
         * @param {String} eventId This is the message to process.
         * @param {*} event This is a message object or other value to pass along to component functions.
         **/
        triggerOnChildren (eventId, event) {
            var i = 0;
            
            if (this.storeMessages) {
                this.storedMessages.push({
                    message: eventId,
                    value: event
                });
            } else {
                for (i = 0; i < this.layers.length; i++) {
                    this.layers[i].trigger.apply(this.layers[i], arguments);
                }
            }
        }
        
        /**
         * This method will return the first entity it finds with a matching id.
         *
         * @method getEntityById
         * @param {string} id The entity id to find.
         * @return {Entity} Returns the entity that matches the specified entity id.
         **/
        getEntityById (id) {
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
        }

        /**
         * This method will return all game entities that match the provided type.
         *
         * @method getEntitiesByType
         * @param {String} type The entity type to find.
         * @return entities {Array} Returns the entities that match the specified entity type.
         **/
        getEntitiesByType (type) {
            var i = 0,
                selection = null,
                entities  = arrayCache.setUp();
            
            for (i = 0; i < this.layers.length; i++) {
                if (this.layers[i].type === type) {
                    entities.push(this.layers[i]);
                }
                if (this.layers[i].getEntitiesByType) {
                    selection = this.layers[i].getEntitiesByType(type);
                    union(entities, selection);
                    arrayCache.recycle(selection);
                }
            }
            return entities;
        }

        /**
         * This method destroys all the layers in the scene.
         *
         * @method exit
         **/
        exit () {
            var i = 0;
            
            for (i = 0; i < this.layers.length; i++) {
                this.layers[i].destroy();
            }
            arrayCache.recycle(this.layers);
            this.layers = null;
            
            // Unload all base textures to prep for next scene
            PIXIAnimation.unloadBaseTextures();

            if (this.unloadSounds.length) {
                Sound.removeSounds(this.unloadSounds);
                arrayCache.recycle(this.unloadSounds);
                this.unloadSounds = null;
            }

            if (this.unloadAssets) {
                this.unloadAssets();
                this.unloadAssets = null;
            }

            platypus.game.currentScene = null;
        }

        /**
         * Don't use the state object after this
         * @method destroy
         */
        destroy () {
            // Only destroy once!
            if (this._destroyed) return;

            this.trigger('destroy');

            this.app = null;
            this.scaling = null;
            this.sound = null;
            this.voPlayer = null;
            this.config = null;
            this.scalingItems = null;
            this.assets = null;
            this.preload = null;
            this.panel = null;
            this.manager = null;
            this._destroyed = true;
            this._onEnterProceed = null;
            this._onLoadingComplete = null;

            super.destroy();
        };
        
        /**
         * Returns all of the assets required for the Scene. This method calls the corresponding method on all entities to determine the list of assets. It ignores assets that have already been preloaded.
         *
         * @method getAssetList
         * @param definition {Object} The definition for the Scene.
         * @return {Array} A list of the necessary assets to load.
         */
        getAssetList (def) {
            var i = 0,
                arr = null,
                assets = arrayCache.setUp();
            
            if (def.assets) {
                union(assets, def.assets);
            }
            
            for (i = 0; i < def.layers.length; i++) {
                arr = Entity.getAssetList(def.layers[i]);
                union(assets, arr);
                arrayCache.recycle(arr);
            }
            
            arr = filterAssets(assets, this.preload);
            arrayCache.recycle(assets);
            
            return arr;
        }
        
        /**
         * Returns all of the dynamic assets required for the Scene.
         *
         * @method getLateAssetList
         * @return {Array} A list of the necessary assets to load.
         */
        getLateAssetList (def) {
            var i = 0,
                arr = null,
                assets = arrayCache.setUp();
            
            for (i = 0; i < def.layers.length; i++) {
                arr = Entity.getLateAssetList(def.layers[i], null, this.data);
                union(assets, arr);
                arrayCache.recycle(arr);
            }
            
            arr = filterAssets(assets, this.preload);
            arrayCache.recycle(assets);
            
            return arr;
        }
    }

    return Scene;
}());
