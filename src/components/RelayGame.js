/**
 * This component listens for specified local entity messages and re-broadcasts them at the scene level.
 *
 * @namespace platypus.components
 * @class RelayGame
 * @uses Component
 */
/*global platypus */
(function () {
    "use strict";

    var broadcast = function (event) {
        return function (value, debug) {
            platypus.game.currentScene.trigger(event, value, debug);
        };
    };
    
    return platypus.createComponentClass({
        id: 'RelayGame',
        
        properties: {
            /**
             * This is an object of key/value pairs. The keys are events this component is listening for locally, the value is the event to be broadcast to the scene. The value can also be an array of events to be fired on the scene.
             *
             *      "events": {
             *          "sleeping": "good-night",
             *          "awake": ["alarm", "get-up"]
             *      }
             *
             * @property events
             * @type Object
             * @default null
             */
            events: null
        },

        publicProperties: {

        },

        constructor: function (definition) {
            var event = '';
            
            // Messages that this component listens for and then broadcasts to all layers.
            if (this.events) {
                for (event in this.events) {
                    if (this.events.hasOwnProperty(event)) {
                        this.addEventListener(event, broadcast(this.events[event]));
                    }
                }
            }
        }
    });
}());
