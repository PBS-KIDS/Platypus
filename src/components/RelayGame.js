/**
 * This component listens for specified local entity messages and re-broadcasts them at the scene level.
 *
 * @namespace platypus.components
 * @class RelayGame
 * @uses platypus.Component
 */
/*global platypus */
(function () {
    'use strict';

    var broadcast = function (event) {
        return function (value, debug) {
            platypus.game.currentScene.triggerOnChildren(event, value, debug);
        };
    };
    
    return platypus.createComponentClass({
        id: 'RelayGame',
        
        properties: {
            /**
             * This is an object of key/value pairs. The keys are events this component is listening for locally, and the value is the event to be broadcast to the scene. The value can also be an array of events to be fired on the scene.
             *
             *      "events": {
             *          "sleeping": "good-night",
             *          "awake": ["alarm", "get-up"]
             *      }
             *
             * @property events
             * @type Object
             * @default {}
             */
            events: {}
        },

        constructor: function () {
            var event = '';
            
            // Messages that this component listens for and then broadcasts to all layers.
            for (event in this.events) {
                if (this.events.hasOwnProperty(event)) {
                    this.addEventListener(event, broadcast(this.events[event]));
                }
            }
        }
    });
}());
