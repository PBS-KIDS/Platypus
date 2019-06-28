/**
 * This component plays audio using the SpringRoll Sound instance. Audio is played in one of two ways, by triggering specific messages defined in the audio component definition or using an audio map which plays sounds when the entity enters specified states.
 *
 * @namespace platypus.components
 * @class AudioSFX
 * @uses platypus.Component
 * @since 0.6.0
 */
/*global include, createjs, platypus */
(function () {
    'use strict';
    
    var Data = include('platypus.Data'),
        StateMap = include('platypus.StateMap'),
        defaultSettings = {
            interrupt: createjs.Sound.INTERRUPT_ANY, //INTERRUPT_ANY, INTERRUPT_EARLY, INTERRUPT_LATE, or INTERRUPT_NONE
            delay: 0,
            offset: 0,
            loop: 0,
            volume: 1,
            pan: 0,
            mute: false,
            paused: false
        },
        playSound = function (soundDefinition) {
            var sound      = '',
                attributes = null,
                completed  = function (data/*, cancelled*/) {
                    if (data.audio && !this.owner.destroyed) {
                        //clean up active clips
                        this.removeClip(data.audio);
                        
                        /**
                         * When a sound effect is finished playing, this event is triggered.
                         *
                         * @event clip-complete
                         */
                        this.owner.triggerEvent('clip-complete');
                    }
                    data.recycle();
                };
            
            if (typeof soundDefinition === 'string') {
                sound      = soundDefinition;
                attributes = {};
            } else {
                sound      = soundDefinition.sound;
                attributes = {
                    interrupt: soundDefinition.interrupt,
                    delay: soundDefinition.delay,
                    offset: soundDefinition.offset,
                    loop: soundDefinition.loop,
                    volume: soundDefinition.volume,
                    pan: soundDefinition.pan,
                    startTime: soundDefinition.startTime,
                    duration: soundDefinition.duration,
                    mute: soundDefinition.mute,
                    paused: soundDefinition.paused
                };
            }

            return function (value) {
                var data = null;

                value = value || attributes;
                
                data = Data.setUp(
                    "interrupt", value.interrupt || attributes.interrupt || defaultSettings.interrupt,
                    "delay",     value.delay     || attributes.delay  || defaultSettings.delay,
                    "loop",      value.loop      || attributes.loop   || defaultSettings.loop,
                    "offset",    value.offset    || attributes.offset || defaultSettings.offset,
                    "volume",    (typeof value.volume !== 'undefined') ? value.volume : ((typeof attributes.volume !== 'undefined') ? attributes.volume : defaultSettings.volume),
                    "pan",       value.pan       || attributes.pan    || defaultSettings.pan,
                    "mute",      value.mute      || attributes.mute   || defaultSettings.mute,
                    "paused",    value.paused    || attributes.paused || defaultSettings.paused
                );
                data.complete = completed.bind(this, data);
                data.audio = this.player.play(sound, data);
                
                if (data.audio) {
                    data.audio.soundId = sound;
                    this.activeAudioClips.push(data.audio);
                }
            };
        },
        stateAudioPlay = function (checkData, audioId, play, state) {
            var active = state.includes(checkData.states);

            if (active !== checkData.playing) {
                if (active) {
                    play();
                } else {
                    this.stopAudio(audioId, this.forcePlaythrough);
                }
                checkData.playing = active;
            }
        };
    
    return platypus.createComponentClass({
        id: 'AudioSFX',
        
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
             *               "pan": -0.25
             *               // Optional. Used to specify the pan of audio on a range of -1 (left) to 1 (right). Default is 0.
             *           }
             *       }
             *
             * @property audioMap
             * @type Object
             * @default null
             */
            audioMap: null,
            
            /**
             * Determines whether a sound that's started should play through completely regardless of entity state changes.
             *
             * @property forcePlayThrough
             * @type boolean
             * @default true
             */
            forcePlayThrough: true,

            /**
             * Optional. Specifies whether this component should listen to events matching the animationMap to animate. Set this to true if the component should animate for on events.
             *
             * @property eventBased
             * @type Boolean
             * @default true
             * @since 0.7.5
             */
            eventBased: true,

            /**
             * Optional. Specifies whether this component should listen to changes in the entity's state that match the animationMap to animate. Set this to true if the component should animate based on this.owner.state.
             *
             * @property stateBased
             * @type Boolean
             * @default false
             * @since 0.7.5 - Defaults to `true` prior to version 0.9.0
             */
            stateBased: false
        },
            
        initialize: function (definition) {
            var key      = '',
                playClip = null,
                sound    = null;
            
            this.activeAudioClips = Array.setUp();
    
            this.state = this.owner.state;
            this.stateChange = false;
            
            this.player = platypus.game.app.sound;
    
            if (definition.audioMap) {
                if (this.stateBased) {
                    this.checkStates = Array.setUp();
                }
                for (key in definition.audioMap) {
                    if (definition.audioMap.hasOwnProperty(key)) {
                        sound = definition.audioMap[key];
                        playClip = playSound(sound);
                        if (sound.sound) {
                            sound = sound.sound;
                        }
                        
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
                        if (this.eventBased) {
                            this.addEventListener(key, playClip);
                        }
                        if (this.stateBased) {
                            this.addStateCheck(key, sound, playClip);
                        }
                    }
                }
            }
            
            this.paused          = false;
        },

        events: {
            /**
             * On each `handle-render` message, this component checks its list of playing audio clips and stops any clips whose play length has been reached.
             *
             * @method 'handle-render'
             */
            "handle-render": function () {
                var i = 0,
                    cs = null,
                    state = this.state;
                
                if (this.paused) {
                    return;
                }
                
                if (this.stateBased && this.stateChange) {
                    cs = this.checkStates;
                    i = cs.length;
                    while (i--) {
                        cs[i].check(state);
                    }
                    this.stateChange = false;
                }
            },
             
            /**
             * This component listens for changes to the entity state and tests the current state of the entity against the audio map. If a match is found, the matching audio clip is played.
             *
             * @method 'state-changed'
             */
            "state-changed": function () {
                this.stateChange = true;
            },

            /**
             * On receiving this message, the audio will mute if unmuted, and unmute if muted.
             *
             * @method 'toggle-mute'
             * @param audioId {String} If an audioId is provided, that particular sound instance is toggled. Otherwise all audio is toggled from mute to unmute or vice versa.
             */
            "toggle-mute": function (audioId) {
                this.handleClip(audioId, function (clip) {
                    if (clip) {
                        if (clip.unmuted) {
                            clip.volume = clip.unmuted;
                            delete clip.unmuted;
                        } else {
                            clip.unmuted = clip.volume;
                            clip.volume = 0;
                        }
                    }
                });
            },

            /**
             * On receiving this message, audio will stop playing.
             *
             * @method 'stop-audio'
             * @param audioId {String} If an audioId is provided, that particular sound instance is stopped. Otherwise all audio is stopped.
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
             * @method 'mute-audio'
             * @param audioId {String} If an audioId is provided, that particular sound instance will mute. Otherwise all audio is muted.
             */
            "mute-audio": function (audioId) {
                this.handleClip(audioId, function (clip) {
                    if (clip) {
                        clip.unmuted = clip.volume;
                        clip.volume = 0;
                    }
                });
            },

            /**
             * On receiving this message all audio will unmute, or a particular sound instance will unmute if an id is specified.
             *
             * @method 'unmute-audio'
             * @param audioId {String} If an audioId is provided, that particular sound instance will unmute. Otherwise all audio is unmuted.
             */
            "unmute-audio": function (audioId) {
                this.handleClip(audioId, function (clip) {
                    if (clip) {
                        clip.volume = clip.unmuted;
                        delete clip.unmuted;
                    }
                });
            },

            /**
             * On receiving this message all audio will pause, or a particular sound instance will pause if an id is specified.
             *
             * @method 'pause-audio'
             * @param audioId {String} If an audioId is provided, that particular sound instance will pause. Otherwise all audio is paused.
             */
            "pause-audio": function (audioId) {
                this.handleClip(audioId, function (clip) {
                    if (clip) {
                        clip.pause();
                    }
                });
            },

            /**
             * On receiving this message all audio will unpause, or a particular sound instance will unpause if an id is specified.
             *
             * @method 'unpause-audio'
             * @param audioId {String} If an audioId is provided, that particular sound instance will unpause. Otherwise all audio is unpaused.
             */
            "unpause-audio": function (audioId) {
                this.handleClip(audioId, function (clip) {
                    if (clip) {
                        clip.unpause();
                    }
                });
            },
             
            /**
             * This message sets the volume of playing audio.
             *
             * @method 'set-pan'
             * @param pan {Number} A number from -1 to 1 that sets the pan.
             * @param [soundId] {String} If an soundId is provided, that particular sound instance's pan is set.
             * @since 0.11.3
             */
            "set-pan": function (pan, soundId) {
                var id = soundId || '',
                    handler = function (pan, clip) {
                        if (clip) {
                            clip.pan = pan;
                        }
                    };

                if (soundId) {
                    this.handleClip(id, handler.bind(null, pan));
                } else {
                    this.getAllClips(handler.bind(null, pan));
                }
            },
             
            /**
             * This message sets the volume of playing audio.
             *
             * @method 'set-volume'
             * @param volume {Number} A number from 0 to 1 that sets the volume.
             * @param [soundId] {String} If an soundId is provided, that particular sound instance's volume is set. Otherwise all audio volume is changed.
             */
            "set-volume": function (volume, soundId) {
                var id = soundId || '',
                    handler = function (vol, clip) {
                        if (clip) {
                            clip.volume = vol;
                        }
                    };

                if (soundId) {
                    this.handleClip(id, handler.bind(null, volume));
                } else {
                    this.getAllClips(handler.bind(null, volume));
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
            
            stopAudio: (function () {
                var
                    loopFunc = function (instance) {
                        this.stopAudioInstance(instance.currentTarget);
                    };
                
                return function (audioId, playthrough) {
                    var clips = this.activeAudioClips,
                        func = loopFunc.bind(this),
                        i = clips.length;
                    
                    if (audioId) {
                        while (i--) {
                            if (clips[i].soundId === audioId) {
                                if (clips[i].playthrough || playthrough) {
                                    clips[i].addEventListener('loop', func);
                                } else {
                                    clips[i].stop();
                                    clips.greenSplice(i);
                                }
                            }
                        }
                    } else {
                        while (i--) {
                            if (playthrough || clips[i].playthrough) {
                                clips[i].addEventListener('loop', func);
                            } else {
                                clips[i].stop();
                            }
                        }
                        clips.length = 0;
                    }
                };
            }()),
            
            stopAudioInstance: function (instance) {
                var clips = this.activeAudioClips,
                    i     = clips ? clips.indexOf(instance) : -1;
                
                if (i >= 0) {
                    clips.greenSplice(i);
                }
                instance.stop();
            },
            
            removeClip: function (audioClip) {
                var i = this.activeAudioClips.indexOf(audioClip);

                if (i >= 0) {
                    this.activeAudioClips.greenSplice(i);
                }
            },
            
            addStateCheck: function (key, value, play) {
                var states = StateMap.setUp(key),
                    checkData = Data.setUp(
                        "states", states,
                        "playing", false
                    );
                
                checkData.check = stateAudioPlay.bind(this, checkData, value, play.bind(this));
                this.checkStates.push(checkData);
            },
            
            destroy: function () {
                var c = this.checkStates,
                    ci = null,
                    i = 0;
                
                this.stopAudio();
                this.activeAudioClips.recycle();
                this.activeAudioClips = null;
                
                this.state = null;

                if (c) {
                    i = c.length;
                    while (i--) {
                        ci = c[i];
                        ci.states.recycle();
                        ci.recycle();
                    }
                    c.recycle();
                    this.checkStates = null;
                }
            }
        }
    });
}());
