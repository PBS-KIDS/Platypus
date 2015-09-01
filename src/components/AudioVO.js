/**
 * This component plays audio using the SpringRoll VOPlayer instance. Audio is played by triggering specific messages defined in the audio component definition.
 * 
 * @namespace platypus.components
 * @class AudioVO
 * @uses Component
 * @since tbd
 */
/*global include, platypus */
/*jslint plusplus:true */
(function () {
    "use strict";
    
    var Application = include('springroll.Application'), // Import SpringRoll classes
        sortByTime = function (a, b) {
            return a.time - b.time;
        },
        addEvents = function (fromList, toList) {
            var i = 0;
            
            if (fromList) {
                for (i = 0; i < fromList.length; i++) {
                    toList.push({
                        event: fromList[i].event,
                        time: fromList[i].time || 0,
                        message: fromList[i].message
                    });
                }
            }
            return toList;
        },
        
        /**
         * This function merges events from individual sounds into a full list queued to sync with the SpringRoll voPlayer.
         */
        setupEvents = function (sounds, fullList) {
            var i = 0,
                player = Application.instance.sound,
                soundList = [];
            
            // Adding a function on the beginning of the play list so that time events can be set according to preloaded audio durations, since `getDuration` won't work for audio that has yet to load.
            soundList.push(function () {
                var i = 0,
                    j = 0,
                    events = null,
                    sound = null,
                    time = 0;
                
                for (i = 0; i < sounds.length; i++) {
                    if (typeof sounds[i] === 'string') {
                        sound = sounds[i];
                        time += player.getDuration(sound);
                    } else if (sounds[i].sound) {
                        sound  = sounds[i].sound;
                        events = sounds[i].events;
                        if (events) {
                            for (j = 0; j < events.length; j++) {
                                fullList.push({
                                    event: events[j].event,
                                    message: events[j].message,
                                    time: time + events[j].time
                                });
                            }
                        }
                        time += player.getDuration(sound);
                    }
                }
                fullList.sort(sortByTime);
            });
            
            // Create alias-only sound list.
            for (i = 0; i < sounds.length; i++) {
                if (sounds[i].sound) {
                    soundList.push(sounds[i].sound);
                } else {
                    soundList.push(sounds[i]);
                }
            }
            return soundList;
        },
        playSound = function (soundDefinition) {
            var sound      = null,
                eventList  = [];
                
            if (typeof soundDefinition === 'string') {
                sound = soundDefinition;
            } else if (Array.isArray(soundDefinition)) {
                sound = setupEvents(soundDefinition, eventList);
            } else {
                sound = soundDefinition.sound;
                if (soundDefinition.events) {
                    eventList = soundDefinition.events.slice();
                }
                if (Array.isArray(sound)) {
                    sound = setupEvents(sound, eventList);
                } else {
                    sound = soundDefinition.sound;
                }
            }
            
            return function (value) {
                var self        = this;

                this.player.play(sound, function () {
                    self.onComplete(true);
                }, function () {
                    self.onComplete(false);
                });
                
                this.eventList = eventList;
                if (value && value.events) {
                    addEvents(value.events, this.eventList);
                }
                this.eventList.sort(sortByTime);
            };
        };
    
    return platypus.createComponentClass({
        id: 'AudioVO',
        
        properties: {
            /**
             * Use the audioMap property object to map messages triggered with audio clips to play. At least one audio mapping should be included for audio to play. Here is an example audioMap object:
             * 
             *       {
             *           "message-triggered": "audio-id",
             *           // This simple form is useful to listen for "message-triggered" and play "audio-id" using default audio properties.
             * 
             *           "another-message": {
             *           // To specify audio properties, instead of mapping the message to an audio id string, map it to an object with one or more of the properties shown below. Many of these properties directly correspond to SoundJS play parameters.
             * 
             *               "sound": "another-audio-id",
             *               // Required. This is the audio clip to play when "another-message" is triggered.
             * 
             *               "events": [{
             *                   "event": "walk-to-the-left",
             *                   "time": 1500
             *               }]
             *               // Optional. Used to specify a list of events to play once the VO begins.
             *           }
             *       }
             * 
             * @property audioMap
             * @type Object
             * @default null
             */
            audioMap: null
        },
            
        constructor: function (definition) {
            var key = '';
            
            this.eventList = [];
    
            this.player = Application.instance.voPlayer;
    
            if (definition.audioMap) {
                for (key in definition.audioMap) {
                    if (definition.audioMap.hasOwnProperty(key)) {

                        /**
                         * Listens for messages specified by the `audioMap` and on receiving them, begins playing corresponding audio clips.
                         * 
                         * @method '*'
                         * @param [message.events] {Array} Used to specify the list of events to trigger while playing this audio sequence.
                         */
                        this.addEventListener(key, playSound(definition.audioMap[key]));
                    }
                }
            }
            
            this.paused = false;
        },

        events: {
            /**
             * On each `handle-render` message, this component checks its list of playing audio clips and stops any clips whose play length has been reached.
             * 
             * @method 'handle-render'
             */
            "handle-render": function () {
                if (this.paused) {
                    return;
                }
                
                this.checkTimeEvents(false);
            },

            /**
             * On receiving this message, audio will stop playing.
             * 
             * @method 'stop-audio'
             */
            "stop-audio": function () {
                this.player.stop();
            }
        },
        
        methods: {
            checkTimeEvents: function (finished) {
                var events      = this.eventList,
                    currentTime = 0;
                
                if (events && events.length) {
                    currentTime = this.player.getElapsed();

                    while (events.length && (finished || (events[0].time <= currentTime))) {
                        this.owner.trigger(events[0].event, events[0].message);
                        events.splice(0, 1);
                    }
                }
            },
        
            onComplete: function (successful) {
                this.checkTimeEvents(true);
                
                /**
                 * When an audio sequence is finished playing, this event is triggered.
                 * 
                 * @event sequence-complete
                 */
                this.owner.triggerEvent('sequence-complete');
            },
            
            destroy: function () {
                this.player.stop();
            }
        }
    });
}());
