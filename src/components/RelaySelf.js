/**
 * This component listens for specified local entity messages and re-broadcasts them on itself as other messages.
 *
 * @memberof platypus.components
 * @class RelaySelf
 * @uses platypus.Component
 */
import createComponentClass from '../factory.js';

export default (function () {
    var trigger = function () {
        var owner = this.owner;
        
        owner.trigger.apply(owner, arguments);
    };

    return createComponentClass(/** @lends platypus.components.RelaySelf.prototype */{
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
             * @default null
             */
            events: null
        },

        initialize: function () {
            var event = '',
                events = this.events;
            
            // Messages that this component listens for and then triggers on itself as a renamed message - useful as a logic place-holder for simple entities.
            if (events) {
                for (event in events) {
                    if (events.hasOwnProperty(event)) {
                        this.addEventListener(event, trigger.bind(this, events[event]));
                    }
                }
            }
        }
    });
}());
