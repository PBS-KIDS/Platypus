/* global platypus */
import {arrayCache, greenSplice} from '../utils/array.js';
import Data from '../Data.js';
import createComponentClass from '../factory.js';

export default (function () {
    var pause = function () {
            this.active--;
        },
        play = function () {
            this.active++;
        },
        timelineTrigger = function (timelineId) {
            this.timelineInstances.push(this.createTimeStampedTimeline(this.timelines[timelineId]));
        },
        updateLogic = function (tick) {
            var delta = tick.delta,
                instance = null,
                instances = this.timelineInstances,
                i = instances.length;
            
            while (i--) {
                instance = instances[i];
                if (instance.remove) {
                    greenSplice(instances, i);
                    arrayCache.recycle(instance.timeline);
                    instance.recycle();
                } else if (instance.active) {
                    if (instance.timeline.length === 0) {
                        greenSplice(instances, i);
                        arrayCache.recycle(instance.timeline);
                        instance.recycle();
                    } else {
                        this.progressTimeline(instance, delta);
                    }
                }
            }
        };
    
    return createComponentClass(/** @lends platypus.components.Timeline.prototype */{
        
        id: 'Timeline',
        
        properties: {
            /**
             * Defines the set of timelines. Triggering the key for one of the events will run the timeline. A timeline can contain three different types integers >= 0, strings, and objects. Integers are interpreted as waits and define
             * pauses between events. Strings are intepreted as event calls. Objects can contain several parameters: entity, event, message. The entity is the id of the entity that
             * the event will be fired on. The event can be a string or array. If a string, it will call that event on the entity or owner. If an array, the value will be passed
             * to the event handling system.
             *
             *  "timelines": {
             *      "sample-timeline-1": [
             *          500,
             *          "sample-event",
             *          {"event": "sample-event", "message": "sample-message"},
             *          {"entity": "entity-id-to-trigger-event-on", "event": "sample-event"},
             *          {"event": ["sample-event", "sample-event-2", {"event": "sample-event-3", "message": "sample-message"}]},
             *      ],
             *      "sample-timeline-2": [
             *          200,
             *          "sample-event"
             *      ]
             * }
             *
             * @property timelines
             * @type Object
             * @default {}
             */
            "timelines": {}
        },
        
        /**
         * Timeline enables the scheduling of events based on a linear timeline
         *
         * @memberof platypus.components
         * @uses platypus.Component
         * @constructs
         * @listens platypus.Entity#handle-logic
         * @listens platypus.Entity#stop-active-timelines
         */
        initialize: function () {
            var x = 0;
            
            this.timelineInstances = arrayCache.setUp();
            for (x in this.timelines) {
                if (this.timelines.hasOwnProperty(x)) {
                    this.addEventListener(x, timelineTrigger.bind(this, x));
                }
            }
        },

        events: {
            "handle-logic": updateLogic,

            /**
             * Stops all timelines.
             *
             * @event platypus.Entity#stop-active-timelines
             */
            "stop-active-timelines": function () {
                var instances = this.timelineInstances,
                    i = instances.length;

                while (i--) {
                    instances[i].remove = true;
                }
            }
        },
        
        methods: {
            createTimeStampedTimeline: function (timeline) {
                var timeStampedTimeline = arrayCache.setUp(),
                    x = 0,
                    timeOffset = 0,
                    entry = null;
                
                for (x = 0; x < timeline.length; x++) {
                    entry = timeline[x];
                    if (typeof entry === 'number') {
                        timeOffset += entry;
                    } else {
                        timeStampedTimeline.push(Data.setUp(
                            "time", timeOffset,
                            "value", entry
                        ));
                    }
                }
                timeStampedTimeline.reverse();
                return Data.setUp(
                    "timeline", timeStampedTimeline,
                    "time", 0,
                    "active", 1,
                    "pause", pause,
                    "play", play,
                    "remove", false
                );
            },
            progressTimeline: function (instance, delta) {
                var timeline = instance.timeline,
                    i = timeline.length,
                    entry = null,
                    value = null,
                    triggerOn = this.owner;
                
                instance.time += delta;
                
                //Go through the timeline playing events if the time has progressed far enough to trigger them.
                while (i--) {
                    entry = timeline[i];
                    if (entry.time <= instance.time) {
                        value = entry.value;
                        if (typeof value === 'string') {
                            this.owner.triggerEvent(value);
                        } else {
                            if (value.entity) {
                                if (this.owner.getEntityById) {
                                    triggerOn = this.owner.getEntityById(value.entity);
                                } else {
                                    triggerOn = this.owner.parent.getEntityById(value.entity);
                                }
                                
                                if (!triggerOn) {
                                    platypus.debug.warn('No entity of that id');
                                    triggerOn = this.owner;
                                }
                            }
                            
                            if (value.message) {
                                triggerOn.triggerEvent(value.event, value.message);
                            } else {
                                triggerOn.trigger(value.event);
                            }
                        }
                        
                        entry.recycle();
                        timeline.pop(); //Remove the entry.
                        if (!instance.active) {
                            return; //We bail until the callback.
                        }
                    } else {
                        return;
                    }
                    
                    entry = null;
                    value = null;
                    triggerOn = this.owner;
                }
            },
            destroy: function () {
                var instance = null,
                    instances = this.timelineInstances,
                    i = instances.length;
                
                while (i--) {
                    instance = instances[i];
                    arrayCache.recycle(instance.timeline);
                    instance.recycle();
                }
                arrayCache.recycle(instances);
                this.timelineInstances = null;
            }
        }
    });
}());