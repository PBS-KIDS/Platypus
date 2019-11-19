/**
 * This component allows the entity to initiate a change from the current scene to another scene.
 *
 * @namespace platypus.components
 * @class SceneChanger
 * @extends platypus.Component
 */
/* global platypus */
import Data from '../Data.js';
import createComponentClass from '../factory.js';

export default (function () {
    return createComponentClass({
        id: 'SceneChanger',
        
        properties: {
            /**
             * Optional, but must be provided by a "new-scene" parameter if not defined here. This causes a "new-scene" event to load this scene.
             *
             * @property scene
             * @type String
             * @default ""
             */
            scene: "",

            /**
             * An object containing key/value pairs of information that should be passed into the new scene on the new scene's "scene-loaded" and "scene-live" events.
             *
             * @property persistentData
             * @type platypus.Data|Object
             * @default null
             */
            persistentData: null
        },
        
        initialize: function () {
            this.persistentData = Data.setUp(this.persistentData);
        },

        events: {
            /**
             * On receiving this message, a new scene is loaded according to provided parameters or previously determined component settings.
             *
             * @method 'new-scene'
             * @param message.scene {String} This is a label corresponding with a predefined scene.
             * @param message.persistentData {Object} Any values that should be passed to the next scene on the new scene's "scene-loaded" and "scene-live" events.
             */
            "new-scene": function (response) {
                var resp       = response || this,
                    scene      = resp.scene || this.scene,
                    data       = resp.persistentData || this.persistentData;
            
                platypus.game.loadScene(scene, data);
            },

            /**
             * On receiving this message, a scene value is stored, waiting for a `new-scene` to make the transition.
             *
             * @method 'set-scene'
             * @param scene {String} This is a label corresponding with a predefined scene.
             */
            "set-scene": function (scene) {
                this.scene = scene;
            },

            /**
             * On receiving this message, persistent data is stored, waiting for a `new-scene` to make the transition.
             *
             * @method 'set-persistent-scene-data'
             * @param persistentData {Object} Any values that should be passed to the next scene via the "scene-loaded" and "scene-live" events.
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
