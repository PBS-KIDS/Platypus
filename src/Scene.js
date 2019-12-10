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
/* global platypus */
import {arrayCache, greenSlice, union} from './utils/array.js';
import Async from './Async.js';
import Data from './Data.js';
import Entity from './Entity.js';
import {Loader} from 'pixi.js';
import Messenger from './Messenger.js';
import PIXIAnimation from './PIXIAnimation.js';

export default (function () {
    var releaseHold = function (callback) {
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
            
            arrayCache.recycle(assets);
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
    }

    return Scene;
}());
