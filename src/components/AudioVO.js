/**
 * This component plays audio using the SpringRoll VOPlayer instance. Audio is played by triggering specific messages defined in the audio component definition.
 * 
 * @namespace platypus.components
 * @class AudioVO
 * @uses platypus.Component
 * @since 0.6.0
 */
/*global include, platypus */
/*jslint plusplus:true */
(function () {
    "use strict";
    
    var Application = include('springroll.Application'), // Import SpringRoll classes
        sortByTime = function (a, b) {
            return a.time - b.time;
        },
        offsetEvents = function (fromList, toList, player) {
            return function () {
                var i = 0,
                    offset = player.getElapsed();
                
                for (i = 0; i < fromList.length; i++) {
                    toList.push({
                        event: fromList[i].event,
                        time: (fromList[i].time || 0) + offset,
                        message: fromList[i].message || null
                    });
                }
                
                if (i) {
                    toList.sort(sortByTime);
                }
            };
        },
        addEvents = function (fromList, toList) {
            var i = 0;
            
            for (i = 0; i < fromList.length; i++) {
                toList.push({
                    event: fromList[i].event,
                    time: fromList[i].time || 0,
                    message: fromList[i].message
                });
            }
            
            if (i) {
                toList.sort(sortByTime);
            }
            
            return toList;
        },
        playSound = function (soundDefinition) {
            var sound      = null,
                eventList  = [],
                isArray = false;
                
            if (typeof soundDefinition === 'string') {
                sound = soundDefinition;
            } else if (Array.isArray(soundDefinition)) {
                sound = soundDefinition;
                isArray = true;
            } else {
                sound = soundDefinition.sound;
                if (soundDefinition.events) {
                    eventList = soundDefinition.events.slice();
                    eventList.sort(sortByTime);
                }
                if (Array.isArray(sound)) {
                    sound = sound;
                    isArray = true;
                } else {
                    sound = soundDefinition.sound;
                }
            }
            
            return function (value) {
                var self        = this,
                    soundList   = null;
                    
                this.eventList = eventList.slice();
                if (value && value.events) {
                    addEvents(value.events, this.eventList);
                }

                if (isArray) {
                    soundList = this.setupEventList(sound);
                } else {
                    soundList = sound;
                }
                                
                this.player.play(soundList, function () {
                    self.onComplete(true);
                }, function () {
                    self.onComplete(false);
                });
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
            
            /**
            * This function merges events from individual sounds into a full list queued to sync with the SpringRoll voPlayer.
            */
            setupEventList: function (sounds) {
                var i = 0,
                    soundList = [];
                
                // Create alias-only sound list.
                for (i = 0; i < sounds.length; i++) {
                    if (sounds[i].sound) {
                        if (sounds[i].events) {
                            soundList.push(offsetEvents(sounds[i].events, this.eventList, this.player));
                        }
                        soundList.push(sounds[i].sound);
                    } else {
                        soundList.push(sounds[i]);
                    }
                }
                return soundList;
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
