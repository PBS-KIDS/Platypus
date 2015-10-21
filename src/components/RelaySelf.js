/**
 * This component listens for specified local entity messages and re-broadcasts them on itself as other messages.
 *
 * @namespace platypus.components
 * @class RelaySelf
 * @uses platypus.Component
 */
/*global platypus */
(function () {
    "use strict";

    var broadcast = function (event) {
        return function (value, debug) {
            this.owner.trigger(event, value, debug);
        };
    };
    
    return platypus.createComponentClass({
        id: 'RelaySelf',
        
        properties: {
            /**
             * This is an object of key/value pairs. The keys are events this component is listening for locally, the value is the new event to be broadcast on this entity. The value can also be an array of events to be fired.
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
            
            // Messages that this component listens for and then triggers on itself as a renamed message - useful as a logic place-holder for simple entities.
            for (event in this.events) {
                if (this.events.hasOwnProperty(event)) {
                    this.addEventListener(event, broadcast(this.events[event]));
                }
            }
        }
    });
}());
