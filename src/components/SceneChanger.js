/* global platypus */
import Data from '../Data.js';
import createComponentClass from '../factory.js';

export default (function () {
    return createComponentClass(/** @lends platypus.components.SceneChanger.prototype */{
        id: 'SceneChanger',
        
        properties: {
            /**
             * Optional, but must be provided by a "new-scene" parameter if not defined here. This causes a "new-scene" event to load this set of layers.
             *
             * @property loadLayers
             * @type Array
             * @default null
             */
            loadLayers: null,

            /**
             * Optional. This causes a "new-scene" event to load this scene.
             *
             * @property scene
             * @type String
             * @default ""
             */
            scene: "",

            /**
             * Optional, but must be provided by a "new-scene" parameter if not defined here. This causes a "new-scene" event to unload these layers.
             *
             * @property unloadLayers
             * @type Array
             * @default null
             */
            unloadLayers: null,

            /**
             * An object containing key/value pairs of information that should be passed into the new layers on the new layers' "layer-loaded" and "layer-live" events.
             *
             * @property persistentData
             * @type platypus.Data|Object
             * @default null
             */
            persistentData: null
        },
        
        /**
         * This component allows the entity to initiate a change from the current scene to another scene.
         *
         * @memberof platypus.components
         * @extends platypus.Component
         * @constructs
         * @listens platypus.Entity#new-scene
         * @listens platypus.Entity#set-scene
         * @listens platypus.Entity#set-persistent-scene-data
         */
        initialize: function () {
            this.persistentData = Data.setUp(this.persistentData);
        },

        events: {
            /**
             * On receiving this message, a new scene is loaded according to provided parameters or previously determined component settings.
             *
             * @event platypus.Entity#new-scene
             * @param message.load {String} This is a label corresponding with a predefined layer.
             * @param message.persistentData {Object} Any values that should be passed to the layers' "layer-loaded" and "layer-live" events.
             */
            "new-scene": function (response) {
                const
                    loadLayers = (response && response.loadLayers) || this.loadLayers,
                    scene      = (response && response.scene) || this.scene,
                    unloadLayers = (response && response.unloadLayers) || this.unloadLayers,
                    data = (response && response.persistentData) || this.persistentData;
            
                if (unloadLayers && unloadLayers.length) {
                    for (let i = 0; i < unloadLayers.length; i++) {
                        platypus.game.unload(unloadLayers[i]);
                    }
                }

                if (loadLayers && loadLayers.length) {
                    platypus.game.load(loadLayers, data);
                }

                if (scene) {
                    platypus.game.loadScene(scene, data);
                }
            },

            /**
             * On receiving this message, a scene value is stored, waiting for a `new-scene` to make the transition.
             *
             * @event platypus.Entity#set-scene
             * @param scene {String} This is a label corresponding with a predefined scene.
             */
            "set-scene": function (scene) {
                this.scene = scene;
            },

            /**
             * On receiving this message, persistent data is stored, waiting for a `new-scene` to make the transition.
             *
             * @event platypus.Entity#set-persistent-scene-data
             * @param persistentData {Object} Any values that should be passed to the next scene via the "layer-loaded" and "layer-live" events.
             */
            "set-persistent-scene-data": function (data) {
                var thisData = this.persistentData,
                    key = '';
                
                for (key in data) {
                    if (data.hasOwnProperty(key)) {
                        thisData[key] = data[key];
                    }
                }
            }
        },
        
        methods: {
            destroy: function () {
                //data.recycle() - can't do this here since it may be in use by the next scene.
            }
        }
    });
}());
