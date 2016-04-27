/**
 * This component listens for specified local entity messages and re-broadcasts them on its parent entity.
 *
 * @namespace platypus.components
 * @class RelayParent
 * @uses platypus.Component
 */
/*global platypus */
(function () {
    'use strict';

    var broadcast = function (event) {
        return function (value, debug) {
            if (this.owner.parent) {
                this.owner.parent.trigger(event, value, debug);
            }
        };
    };
    
    return platypus.createComponentClass({
        id: 'RelayParent',
        
        properties: {
            /**
             * This is an object of key/value pairs. The keys are events this component is listening for locally, and the value is the event to be broadcast on the parent. The value can also be an array of events to be triggered on the parent.
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
            
            // Messages that this component listens for and then broadcasts to parent.
            for (event in this.events) {
                if (this.events.hasOwnProperty(event)) {
                    this.addEventListener(event, broadcast(this.events[event]));
                }
            }
        }
    });
}());
