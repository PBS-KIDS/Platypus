/**
 * This component listens for certain messages, picks a message from a related list of events, and triggers it. This is useful for adding random behaviors to an entity, such as having an entity say one thing from a list of audio clips. For example, defining this component on an Entity may look like this:
 * 
 *     {
 *       "type": "RandomEvents",
 *       
 *       "events": {
 *       // This is a key/value list of events to listen for, with each event mapping to an array of events to pick from.
 *       
 *         "make-sound": ["scream", "whisper", "talk"]
 *         //on the component receiving the "make-sound" message, it will trigger one of the three possible messages listed here.
 *       }
 *     }
 *     
 * @namespace platypus.components
 * @class RandomEvents
 * @uses platypus.Component
*/
/*global platypus */
export default (function () {
    

    var createTrigger = function (eventList) {
        return function (value, debug) {
            this.owner.trigger(eventList[Math.floor(Math.random() * eventList.length)], value, debug);
        };
    };

    return platypus.createComponentClass({
        id: 'RandomEvents',
        
        initialize: function (definition) {
            var event = '';
            
            if (definition.events) {
                for (event in definition.events) {
                    if (definition.events.hasOwnProperty(event)) {
                        this.addEventListener(event, createTrigger(definition.events[event]));
                    }
                }
            }
        }
    });
}());
