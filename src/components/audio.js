/**
 * This component plays audio using [SoundJS](http://www.createjs.com/Docs/SoundJS/module_SoundJS.html). Audio is played in one of two ways, by triggering specific messages defined in the audio component definition or using an audio map which plays sounds when the entity enters specified states (like [[RenderSprite]]).
 * 
 * @namespace platypus.components
 * @class Audio
 * @uses Component
 */
/*global console, createjs, platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    var channels = {},
        defaultSettings = {
            interrupt: createjs.Sound.INTERRUPT_ANY, //INTERRUPT_ANY, INTERRUPT_EARLY, INTERRUPT_LATE, or INTERRUPT_NONE
            delay:     0,
            offset:    0,
            loop:      0,
            volume:    1,
            pan:       0,
            mute:      false,
            paused:    false,
            next:      false,
            events:    false
        },
        audioInProgress = function (channel) {
            var i    = '',
                list = channels[channel];

            if (!list || !list.length) {
                return false;
            }
            for (i in list) {
                if (list.hasOwnProperty(i) && list[i].priorityTrack) {
                    return list[i].priorityTrack;
                }
            }
            return false;
        },
        sortByTime = function (a, b) {
            return a.time - b.time;
        },
        playSound = function (soundDefinition) {
            var i          = 0,
                sound      = '',
                property   = '',
                attributes = null;
            
            if (typeof soundDefinition === 'string') {
                sound      = soundDefinition;
                attributes = {};
            } else if (Array.isArray(soundDefinition)) {
                if (typeof soundDefinition[0] === 'string') {
                    sound      = soundDefinition[0];
                    attributes = {next: []};
                } else {
                    sound      = soundDefinition[0].sound;
                    attributes = {};
                    for (property in soundDefinition[0]) {
                        if (soundDefinition[0].hasOwnProperty(property)) {
                            attributes[property] = soundDefinition[0][property];
                        }
                    }
                    if (attributes.next) {
                        attributes.next = attributes.next.slice();
                    } else {
                        attributes.next = [];
                    }
                }
                for (i = 1; i < soundDefinition.length; i++) {
                    attributes.next.push(soundDefinition[i]);
                }
            } else {
                sound      = soundDefinition.sound;
                attributes = {
                    interrupt: soundDefinition.interrupt,
                    delay:     soundDefinition.delay,
                    offset:    soundDefinition.offset,
                    loop:      soundDefinition.loop,
                    volume:    soundDefinition.volume,
                    pan:       soundDefinition.pan,
                    startTime: soundDefinition.startTime,
                    duration:  soundDefinition.duration,
                    mute:      soundDefinition.mute,
                    paused:    soundDefinition.paused,
                    next:      soundDefinition.next,
                    events:    soundDefinition.events
                };
            }

            return function (value) {
                var i           = 0,
                    self        = this,
                    audio       = null,
                    next        = false,
                    events      = false,
                    willOverlap = audioInProgress(this.channel);

                if ((this.preventOverlaps !== 'ignore') && willOverlap) {
                    if (this.priority >= willOverlap.priority) {
                        willOverlap.component.stopAudio();
                    } else if (this.preventOverlaps === 'append') {
                        willOverlap.next.push(soundDefinition);
                        return;
                    } else {
                        return;
                    }
                }

                value = value || attributes;
                if (value.stop) {
                    this.stopAudio(sound, value.playthrough);
                } else {
                    audio = createjs.Sound.createInstance(sound, value.startTime || attributes.startTime || null, value.duration || attributes.duration || null);

                    // Adding object on to SoundInstance for delayed playback and storing properties apart from instance due to channel overrides.
                    audio.options = {
                        interrupt:  value.interrupt || attributes.interrupt || defaultSettings.interrupt,
                        delay:      value.delay     || attributes.delay  || defaultSettings.delay,
                        loop:       value.loop      || attributes.loop   || defaultSettings.loop,
                        offset:     value.offset    || attributes.offset || defaultSettings.offset,
                        volume:     (typeof value.volume !== 'undefined') ? value.volume : ((typeof attributes.volume !== 'undefined') ? attributes.volume : defaultSettings.volume),
                        pan:        value.pan       || attributes.pan    || defaultSettings.pan,
                        mute:       value.mute      || attributes.mute   || defaultSettings.mute,
                        paused:     value.paused    || attributes.paused || defaultSettings.paused
                    };

                    next          = value.next      || attributes.next   || defaultSettings.next;
                    events        = value.events    || attributes.events || defaultSettings.events;

                    if (!this.mixer.paused && !this.channelSettings.paused && !audio.options.paused) {
                        audio.play(audio.options);
                    } else {
                        audio.options.unplayed = true;
                    }
                    this.setChannelSettings(audio);

                    if (this.preventOverlaps && (this.preventOverlaps !== 'ignore')) {
                        this.priorityTrack = {
                            audio: audio,
                            component: this,
                            priority: this.priority,
                            next: next || []
                        };
                    }

                    if (events) {
                        audio.sequenceEvents = [];
                        for (i = 0; i < events.length; i++) {
                            audio.sequenceEvents.push({
                                event: events[i].event,
                                time: events[i].time || 0,
                                message: events[i].message
                            });
                        }
                        audio.sequenceEvents.sort(sortByTime);
                    }

                    audio.addEventListener('complete', function () {
                        self.onComplete(audio, next);
                    });

                    if (audio.playState === 'playFailed') {
                        if (this.owner.debug) {
                            console.warn('Unable to play "' + sound + '".', audio);
                        }
                        this.onComplete(audio, next);
                    } else {
                        audio.soundId = sound;
                        this.activeAudioClips.push(audio);
                    }
                }
            };
        },
        createTest = function (testStates, audio, play) {
            var states = testStates.replace(/ /g, '').split(',');
            if (testStates === 'default') {
                return function (state) {
                    play.call(this);
                    return testStates;
                };
            } else {
                return function (state) {
                    var i = 0;

                    for (i = 0; i < states.length; i++) {
                        if (!state[states[i]]) {
                            return false;
                        }
                    }
                    play.call(this);
                    return testStates;
                };
            }
        };
    
    return platypus.createComponentClass({
        id: 'audio',
        
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
             *               "interrupt": "none",
             *               // Optional. Can be "any", "early", "late", or "none". Determines how to handle the audio when it's already playing but a new play request is received. Default is "any".
             *           
             *               "delay": 500,
             *               // Optional. Time in milliseconds to wait before playing audio once the message is received. Default is 0.
             * 
             *               "offset": 1500,
             *               // Optional. Time in milliseconds determining where in the audio clip to begin playback. Default is 0.
             * 
             *               "length": 2500,
             *               // Optional. Time in milliseconds to play audio before stopping it. If 0 or not specified, play continues to the end of the audio clip.
             * 
             *               "loop": 4,
             *               // Optional. Determines how many more times to play the audio clip once it finishes. Set to -1 for an infinite loop. Default is 0.
             * 
             *               "volume": 0.75,
             *               // Optional. Used to specify how loud to play audio on a range from 0 (mute) to 1 (full volume). Default is 1.
             * 
             *               "pan": -0.25,
             *               // Optional. Used to specify the pan of audio on a range of -1 (left) to 1 (right). Default is 0.
             * 
             *               "next": ["audio-id"]
             *               // Optional. Used to specify a list of audio clips to play once this one is finished.
             *           }
             *       }
             * 
             * @property audioMap
             * @type Object
             * @default null
             */
            audioMap: null,
            
            /**
             * Sets what channel this audio component should play on. This is useful when coupled with the [[AudioMixer]] component to handle sounds in bulk.
             * 
             * @property channel
             * @type String
             * @default "default"
             */
            channel: 'default',
            
            /**
             * Determines whether a sound that's started should play through completely regardless of entity state changes.
             * 
             * @property forcePlayThrough
             * @type boolean
             * @default true
             */
            forcePlayThrough: true,
            
            /**
             * Determines whether and how a playing sound can be interrupted by higher priority sounds on the same channel.
             * 
             * @property preventOverlaps
             * @type String
             * @default ""
             */
            preventOverlaps: '',
            
            /**
             * Sets the priority of this component's audio. Priority determines what plays and what's interrupted when multiple sounds are triggered.
             * 
             * @property priority
             * @type number
             * @default 0
             */
            priority: 0
        },
            
        constructor: function (definition) {
            var key      = '',
                playClip = null;
            
            this.activeAudioClips = [];
    
            this.state = this.owner.state;
            this.stateChange = false;
            this.currentState = false;
    
            if (definition.audioMap) {
                this.checkStates = [];
                for (key in definition.audioMap) {
                    if (definition.audioMap.hasOwnProperty(key)) {
                        playClip = playSound(definition.audioMap[key]);
                        
                        /**
                         * Listens for messages specified by the `audioMap` and on receiving them, begins playing corresponding audio clips. Audio play message can optionally include several parameters, many of which correspond with SoundJS play parameters.
                         * 
                         * @method '*'
                         * @param message.interrupt (string) - Optional. Can be "any", "early", "late", or "none". Determines how to handle the audio when it's already playing but a new play request is received. Default is "any".
                         * @param message.delay (integer) - Optional. Time in milliseconds to wait before playing audio once the message is received. Default is 0.
                         * @param message.offset (integer) - Optional. Time in milliseconds determining where in the audio clip to begin playback. Default is 0.
                         * @param message.length (integer) - Optional. Time in milliseconds to play audio before stopping it. If 0 or not specified, play continues to the end of the audio clip.
                         * @param message.loop (integer) - Optional. Determines how many more times to play the audio clip once it finishes. Set to -1 for an infinite loop. Default is 0.
                         * @param message.volume (float) - Optional. Used to specify how loud to play audio on a range from 0 (mute) to 1 (full volume). Default is 1.
                         * @param message.pan (float) - Optional. Used to specify the pan of audio on a range of -1 (left) to 1 (right). Default is 0.
                         * @param message.next (string) - Optional. Used to specify the next audio clip to play once this one is complete.
                         */
                        this.addEventListener(key, playClip);
                        this.checkStates.push(createTest(key, definition.audioMap[key], playClip));
                    }
                }
            }
            
            if (this.preventOverlaps && (this.preventOverlaps !== 'ignore')) {
                if (!channels[this.channel]) {
                    channels[this.channel] = [];
                }
                channels[this.channel].push(this);
            }
            
            this.priorityTrack = null;
            
            if (!platypus.game.audioMixer) {
                platypus.game.audioMixer = {
                    channels: {},
                    paused: false,
                    getChannel: function (id) {
                        if (!this.channels[id]) {
                            this.channels[id] = {
                                volume: 1,
                                mute: false,
                                paused: false,
                                pan: 0,
                                update: 0
                            };
                        }

                        return this.channels[id];
                    }
                };
            }
            this.mixer           = platypus.game.audioMixer;
            this.channelSettings = this.mixer.getChannel(this.channel);
            this.channelUpdate   = this.channelSettings.update;
            this.paused          = this.mixer.paused;
        },

        events: {
            /**
             * On each `handle-render` message, this component checks its list of playing audio clips and stops any clips whose play length has been reached.
             * 
             * @method 'handle-render'
             */
            "handle-render": function () {
                var self      = this,
                    i         = 0,
                    audioClip = null;
                
                if (this.paused !== this.mixer.paused) {
                    this.paused = this.mixer.paused;
                    this.getAllClips(function (clip) {
                        self.setChannelSettings(clip);
                    });
                    // Avoid potential channel check below since we've already handled this for the global pause.
                    this.channelUpdate = this.channelSettings.update;
                }
                if (this.paused) {
                    return;
                }
                
                if (this.channelUpdate !== this.channelSettings.update) {
                    //Channel settings have changed.
                    this.channelUpdate = this.channelSettings.update;
                    
                    this.getAllClips(function (clip) {
                        self.setChannelSettings(clip);
                    });
                }
                
                this.getAllClips(function (clip) {
                    self.checkTimeEvents(clip);
                });

                if (this.stateChange) {
                    if (this.checkStates) {
                        if (this.currentState) {
                            this.stopAudio(this.currentState.soundId, this.forcePlaythrough);
                        }
                        this.currentState = false;
                        for (i = 0; i < this.checkStates.length; i++) {
                            audioClip = this.checkStates[i].call(this, this.state);
                            if (audioClip) {
                                this.currentState = audioClip;
                                break;
                            }
                        }
                    }
                    this.stateChange = false;
                }
            },
             
            /**
             * This component listens for logical state changes and tests the current state of the entity against the audio map. If a match is found, the matching audio clip is played.
             * 
             * @method 'logical-state'
             */
            "logical-state": function () {
                this.stateChange = true;
            },

            /**
             * On receiving this message, the audio will mute if unmuted, and unmute if muted.
             * 
             * @param audioId {String} If an audioId is provided, that particular sound instance is toggled. Otherwise all audio is toggled from mute to unmute or vice versa.
             * @method 'toggle-mute'
             */
            "toggle-mute": function (audioId) {
                var self = this;

                this.handleClip(audioId, function (clip) {
                    if (clip) {
                        clip.options.mute = !clip.options.mute;
                        self.setChannelSettings(clip);
                    }
                });
            },

            /**
             * On receiving this message, audio will stop playing.
             * 
             * @param audioId {String} If an audioId is provided, that particular sound instance is stopped. Otherwise all audio is stopped.
             * @method 'stop-audio'
             */
            "stop-audio": function (audioId) {
                if (!audioId) {
                    this.stopAudio();
                } else if (typeof audioId === 'string') {
                    this.stopAudio(audioId);
                } else {
                    this.stopAudio(audioId.audioId || false, audioId.playthrough || false);
                }
            },

            /**
             * On receiving this message all audio will mute, or a particular sound instance will mute if an id is specified.
             * 
             * @param audioId {String} If an audioId is provided, that particular sound instance will mute. Otherwise all audio is muted.
             * @method 'mute-audio'
             */
            "mute-audio": function (audioId) {
                var self = this;

                this.handleClip(audioId, function (clip) {
                    if (clip) {
                        clip.options.mute = true;
                        self.setChannelSettings(clip);
                    }
                });
            },

            /**
             * On receiving this message all audio will unmute, or a particular sound instance will unmute if an id is specified.
             * 
             * @param audioId {String} If an audioId is provided, that particular sound instance will unmute. Otherwise all audio is unmuted.
             * @method 'unmute-audio'
             */
            "unmute-audio": function (audioId) {
                var self = this;

                this.handleClip(audioId, function (clip) {
                    if (clip) {
                        clip.options.mute = false;
                        self.setChannelSettings(clip);
                    }
                });
            },

            /**
             * On receiving this message all audio will pause, or a particular sound instance will pause if an id is specified.
             * 
             * @param audioId {String} If an audioId is provided, that particular sound instance will pause. Otherwise all audio is paused.
             * @method 'pause-audio'
             */
            "pause-audio": function (audioId) {
                var self = this;

                this.handleClip(audioId, function (clip) {
                    if (clip) {
                        clip.options.paused = true;
                        self.setChannelSettings(clip);
                    }
                });
            },

            /**
             * On receiving this message all audio will unpause, or a particular sound instance will unpause if an id is specified.
             * 
             * @param audioId {String} If an audioId is provided, that particular sound instance will unpause. Otherwise all audio is unpaused.
             * @method 'unpause-audio'
             */
            "unpause-audio": function (audioId) {
                var self = this;

                this.handleClip(audioId, function (clip) {
                    if (clip) {
                        clip.options.paused = false;
                        self.setChannelSettings(clip);
                    }
                });
            },
             
            /**
             * This message sets the volume of playing audio.
             * 
             * @param audioId {String} If an audioId is provided, that particular sound instance's volume is set. Otherwise all audio volume is changed.
             * @method 'set-volume'
             */
            "set-volume": function (volume) {
                var self    = this,
                    vol     = 0,
                    handler = function (clip) {
                        clip.options.volume = vol;
                        self.setChannelSettings(clip);
                    };

                if (typeof volume === 'number') {
                    vol = volume;
                    this.getAllClips(handler);
                } else if (volume.volume) {
                    vol = volume.volume;
                    this.handleClip(volume.soundId, handler);
                }
            }
        },
        
        methods: {
            handleClip: function (audioId, handler) {
                if (typeof audioId === 'string') {
                    this.getClipById(audioId, handler);
                } else {
                    this.getAllClips(handler);
                }
            },
            
            getClipById: function (id, onGet) {
                var i     = 0,
                    clips = this.activeAudioClips;
                
                for (i = 0; i < clips.length; i++) {
                    if (clips[i].soundId === id) {
                        if (onGet) {
                            onGet(clips[i]);
                        }
                        return clips[i];
                    }
                }
                
                if (onGet) {
                    onGet(null);
                }

                return null;
            },
            
            getAllClips: function (onGet) {
                var i     = 0,
                    clips = this.activeAudioClips;
                
                if (onGet) {
                    for (i = 0; i < clips.length; i++) {
                        onGet(clips[i]);
                    }
                }

                return clips;
            },
            
            setChannelSettings: function (clip) {
                var channel = this.channelSettings,
                    pause   = (this.mixer.paused || channel.paused || clip.options.paused);
                
                clip.setMute(clip.options.mute || channel.mute);
                clip.setPan((clip.options.pan + channel.pan) / 2);
                clip.setVolume(clip.options.volume * channel.volume);
                if (clip.paused !== pause) {
                    if (pause) {
                        clip.pause();
                    } else {
                        clip.resume();
                    }
                } else if (!pause && clip.options.unplayed) {
                    delete clip.options.unplayed;
                    clip.play(clip.options);
                }
            },
            
            stopAudio: function (audioId, playthrough) {
                var i        = 0,
                    clips    = this.activeAudioClips,
                    self     = this,
                    loopFunc = function (instance) {
                        self.stopAudioInstance(instance.currentTarget);
                    };
                
                if (audioId) {
                    for (i = clips.length - 1; i >= 0; i--) {
                        if (clips[i].soundId === audioId) {
                            if (playthrough) {
                                clips[i].addEventListener('loop', loopFunc);
                            } else {
                                clips[i].stop();
                                clips.splice(i, 1);
                                if (this.priorityTrack && (clips[i] === this.priorityTrack.audio)) {
                                    this.priorityTrack = null;
                                }
                            }
                        }
                    }
                } else {
                    if (playthrough) {
                        for (i = 0; i < clips.length; i++) {
                            clips[i].addEventListener('loop', loopFunc);
                        }
                    } else {
                        for (i = 0; i < this.activeAudioClips.length; i++) {
                            clips[i].stop();
                        }
                        clips.length = 0;
                        this.priorityTrack = null;
                    }
                }
            },
            
            stopAudioInstance: function (instance) {
                var i     = 0,
                    clips = this.activeAudioClips;
                
                for (i = clips.length - 1; i >= 0; i--) {
                    if (clips[i] === instance) {
                        clips[i].stop();
                        clips.splice(i, 1);
                        if (this.priorityTrack && (clips[i] === this.priorityTrack.audio)) {
                            this.priorityTrack = null;
                        }
                    }
                }
            },
            
            checkTimeEvents: function (audioClip, finished) {
                var events      = audioClip.sequenceEvents,
                    currentTime = 0;
                
                if (events && events.length) {
                    currentTime = audioClip.getPosition();

                    while (events.length && (finished || (events[0].time <= currentTime))) {
                        this.owner.trigger(events[0].event, events[0].message);
                        events.splice(0, 1);
                    }
                }
            },
        
            onComplete: function (audioClip, next) {
                //clean up active clips
                this.removeClip(audioClip);
                
                this.checkTimeEvents(audioClip, true);
                
                /**
                 * When a single audio clip is finished playing, this event is triggered.
                 * 
                 * @event clip-complete
                 */
                this.owner.triggerEvent('clip-complete');
                
                if (this.priorityTrack && (audioClip === this.priorityTrack.audio)) {
                    next = this.priorityTrack.next;
                    this.priorityTrack = null;
                }
                
                if (next && next.length) {
                    if (typeof next === 'string') {
                        (playSound(next)).call(this);
                    } else {
                        var arr = next.slice();
                        arr.splice(0, 1);
                        if (arr.length > 0) {
                            (playSound(next[0])).call(this, {'next': arr});
                        } else {
                            (playSound(next[0])).call(this);
                        }
                    }
                } else {
                    /**
                     * When an audio sequence is finished playing, this event is triggered.
                     * 
                     * @event sequence-complete
                     */
                    this.owner.triggerEvent('sequence-complete');
                }
            },
            
            removeClip: function (audioClip) {
                var i = 0;

                for (i = 0; i < this.activeAudioClips.length; i++) {
                    if (this.activeAudioClips[i] === audioClip) {
                        this.activeAudioClips.splice(i, 1);
                        break;
                    }
                }
            },
            
            destroy: function () {
                var i = '';

                this.stopAudio();
                if (this.preventOverlaps) {
                    for (i in channels[this.channel]) {
                        if (channels[this.channel][i] === this) {
                            channels[this.channel].splice(i, 1);
                            break;
                        }
                    }
                }
            }
        }
    });
}());
