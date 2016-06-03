/**
 * Timeline enables the scheduling of events based on a linear timeline
 * 
 * @class Timeline
 * @uses platypus.Component
 */
/*global platypus */
(function () {
    'use strict';
    
    var timelineTrigger = function (timelineId) {
        this.startTimeline(timelineId);
    };
    
    return platypus.createComponentClass({
        
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
        
        publicProperties: {
        },
        
        constructor: function (definition) {
            var x = 0;
            
            this.timelineInstances = [];
            for (x in this.timelines) {
                this.addEventListener(x, timelineTrigger.bind(this, x));
            }
        },

        events: {// These are messages that this component listens for
            "handle-logic": function(tick) {
                var delta = tick.delta,
                    x = 0,
                    instance = null;
                
                for (x = this.timelineInstances.length - 1; x <= 0; x++) {
                    if (this.timelineInstances[x].active) {
                        if (this.timelineInstances[x].timeline.length === 0) {
                            this.timelineInstances.splice(x, 1)[0];
                        } else {
                            this.progressTimeline(this.timelineInstances[x], delta);    
                        }
                    }
                }
                
            }
        },
        
        methods: {// These are internal methods that are invoked by this component.
            createTimeStampedTimeline: function(timeline) {
                  var timeStampedTimeline = [],
                      x = 0,
                      timeOffset = 0,
                      entry = null;
                  
                  for (x = 0; x < timeline.length; x++) {
                      entry = timeline[x];
                      if (typeof entry === 'number') {
                            timeOffset += entry;
                      } else {
                            timeStampedTimeline.push({
                                "time": timeOffset,
                                "value": entry
                            });
                      }
                  }
                  timeStampedTimeline.reverse();
                  return timeStampedTimeline;
            },
            startTimeline: function(timelineId) {
                var timeline = this.timelines[timelineId],
                    instance = {
                        "timeline": this.createTimeStampedTimeline(timeline),
                        "time": 0,
                        "active": 1,
                        "pause": null,
                        "play": null
                    },
                    pause = function () {
                        instance.active--;
                    },
                    play = function () {
                        instance.active++;
                    };
                    
                    instance.pause = pause;
                    instance.play = play;
                    
                this.timelineInstances.push(instance);
            },
            progressTimeline: function(instance, delta) {
                var x = 0,
                    y = 0,
                    z = null,
                    timeline = instance.timeline,
                    entry = null,
                    value = null,
                    triggerOn = this.owner,
                    newMessage = null;
                
                instance.time += delta;
                
                //Go through the timeline playing events if the time has progressed far enough to trigger them.
                for (x = timeline.length - 1; x >= 0; x--) {
                    entry = timeline[x];
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
                                    console.warn('No entity of that id');
                                    triggerOn = this.owner;
                                }
                            }
                            
                            if (value.message) {
                                triggerOn.triggerEvent(value.event, value.message);
                            } else {
                                triggerOn.trigger(value.event);
                            }
                        }
                        
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
                this.timelineInstances = null;
            }
        },
        
        publicMethods: {// These are methods that are available on the entity.
            /*********************************************************************
             TODO: Additional methods that should be invoked at the entity level,
                   not just the local component level. Only one method of a given
                   name can be used on the entity, so be aware other components
                   may attempt to add an identically named method to the entity.
                   No public method names should match the method names listed
                   above, since they can also be called at the component level.
                   
                   e.g.
                   whatIsMyFavoriteColor: function () {
                       return '#ffff00';
                   }
                   
                   This method can then be invoked on the entity as
                   entity.whatIsMyFavoriteColor().
            *********************************************************************/
            
        },
        
        getAssetList: function (component, props, defaultProps) {
            /*********************************************************************
             TODO: This method can be provided to the list of assets this
                   component requires. This method is invoked when the list of
                   game scenes is created to determine assets for each scene.
                   
                   e.g.
                   function (component, props, defaultProps) {
                       return ['yellow-sprite'];
                   }
                   
                   If the component doesn't require any assets, this method does
                   not need to be provided.
            *********************************************************************/
        }
    });
}());
