/**
 * This component plays audio using the SpringRoll Sound instance. Audio is played in one of two ways, by triggering specific messages defined in the audio component definition or using an audio map which plays sounds when the entity enters specified states.
 *
 * @namespace platypus.components
 * @class AudioSFX
 * @uses platypus.Component
 * @since 0.6.0
 */
/* global platypus */
import {arrayCache, greenSplice} from '../utils/array.js';
import Data from '../Data.js';
import Sound from 'pixi-sound';
import StateMap from '../StateMap.js';
import createComponentClass from '../factory.js';

export default (function () {
    var defaultSettings = {
            interrupt: 0,
            delay: 0,
            offset: 0,
            loop: 0,
            volume: 1,
            pan: 0,
            mute: false,
            paused: false,
            speed: 1,
            playthrough: false
        },
        playSound = function (soundDefinition, channel) {
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
                attributes = {
                    channel: channel
                };
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
                    paused: soundDefinition.paused,
                    channel: channel,
                    speed: soundDefinition.speed,
                    playthrough: soundDefinition.playthrough
                };
            }

            return function (value) {
                let data = null;

                value = value || attributes;
                
                data = Data.setUp(
                    "interrupt", value.interrupt || attributes.interrupt || defaultSettings.interrupt,
                    "delay",     value.delay     || attributes.delay  || defaultSettings.delay,
                    "loop",      value.loop      || attributes.loop   || defaultSettings.loop,
                    "loops",     value.loop      || attributes.loop   || defaultSettings.loop, // SoundJS 2.0 listens for this
                    "offset",    value.offset    || attributes.offset || defaultSettings.offset,
                    "volume",    (typeof value.volume !== 'undefined') ? value.volume : ((typeof attributes.volume !== 'undefined') ? attributes.volume : defaultSettings.volume),
                    "pan",       value.pan       || attributes.pan    || defaultSettings.pan,
                    "mute",      value.mute      || attributes.mute   || defaultSettings.mute,
                    "paused",    value.paused    || attributes.paused || defaultSettings.paused,
                    "channel",    value.channel    || attributes.channel || defaultSettings.channel,
                    "speed",    (typeof value.speed !== 'undefined') ? value.speed : ((typeof attributes.speed !== 'undefined') ? attributes.speed : defaultSettings.speed),
                    "playthrough", value.playthrough || attributes.playthrough || defaultSettings.playthrough
                );
                data.audio = this.player.play(sound, data);
                if (data.pan) {
                    data.audio.filters = [
                        new Sound.filters.StereoFilter(data.audio.pan)
                    ];
                }
                if (data.volume) {
                    data.audio.volume = data.volume;
                }
                if (data.speed) {
                    data.audio.speed = data.speed;
                }
                if (data.playthrough) {
                    data.audio.playthrough = true;
                }
                data.audio.on('end', completed.bind(this, data));
                
                if (data.audio) {
                    data.audio.soundId = sound;
                    this.activeAudioClips.push(data.audio);

                    if (data.audio.playState === 'playFailed') {
                        // Let's try again - maybe it was a loading issue.
                        const
                            wait = function (event) {
                                if (event.id === sound) {
                                    data.audio.play(data);
                                    Sound.off('fileload', wait);
                                }
                            };

                        Sound.on('fileload', wait);
                    }
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
    
    return createComponentClass({
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
             *               "speed": 0.75,
             *               // Optional. Used to specify how fast to play audio. Default is 1 (100% speed).
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

            channel: '',
            
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
            
            if (this.channel) {/*
                if (!platypus.game.audioChannels) { // Monkey-patch to add per-channel volume
                    const wasi = createjs.WebAudioSoundInstance;

                    platypus.game.audioChannels = {};

                    wasi.prototype._beginPlaying = function (playProps) {
                        if (playProps.channel) {
                            if (!platypus.game.audioChannels[playProps.channel]) {
                                const gain = platypus.game.audioChannels[playProps.channel] = wasi.context.createGain();
                                gain.connect(wasi.destinationNode);
                            }
                            this.destinationNode = platypus.game.audioChannels[playProps.channel];
                        } else {
                            this.destinationNode = wasi.destinationNode;
                        }
                        createjs.AbstractSoundInstance.prototype._beginPlaying.call(this, playProps);
                    };
                    
                    wasi.prototype._handleSoundReady = function () {
                        var dur = this._duration * 0.001,
                            pos = Math.min(Math.max(0, this._position) * 0.001, dur);

                        this.gainNode.connect(this.destinationNode);  // this line can cause a memory leak.  Nodes need to be disconnected from the audioDestination or any sequence that leads to it.

                        this.sourceNode = this._createAndPlayAudioNode((wasi.context.currentTime - dur), pos);
                        this._playbackStartTime = this.sourceNode.startTime - pos;

                        this._soundCompleteTimeout = setTimeout(this._endedHandler, (dur - pos) * 1000);

                        if (this._loop !== 0) {
                            this._sourceNodeNext = this._createAndPlayAudioNode(this._playbackStartTime, 0);
                        }
                    };
                }*/ //TODO: Need to implement channels.
            }
            
            this.activeAudioClips = arrayCache.setUp();
    
            this.state = this.owner.state;
            this.stateChange = false;
            
            this.player = platypus.game.sfxPlayer;
    
            if (this.audioMap) {
                if (this.stateBased) {
                    this.checkStates = arrayCache.setUp();
                }
                for (key in this.audioMap) {
                    if (this.audioMap.hasOwnProperty(key)) {
                        sound = this.audioMap[key];
                        playClip = playSound(sound, this.channel);
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
                         * @param message.speed (float) - Optional. Used to specify how fast to play audio. Default is 1.
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
            },

            /**
             * This message sets the speed of playing audio.
             *
             * @method 'set-speed'
             * @param speed {Number} A number that sets the speed.
             * @param [soundId] {String} If an soundId is provided, that particular sound instance's speed is set. Otherwise all audio speed is changed.
             */
            "set-speed": function (speed, soundId) {
                var id = soundId || '',
                    handler = function (spd, clip) {
                        if (clip) {
                            clip.speed = spd;
                        }
                    };

                if (soundId) {
                    this.handleClip(id, handler.bind(null, speed));
                } else {
                    this.getAllClips(handler.bind(null, speed));
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
                                } else {
                                    clips[i].stop();
                                    greenSplice(clips, i);
                                }
                            }
                        }
                    } else {
                        while (i--) {
                            if (playthrough || clips[i].playthrough) {
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
                    greenSplice(clips, i);
                }
                instance.stop();
            },
            
            removeClip: function (audioClip) {
                var i = this.activeAudioClips.indexOf(audioClip);

                if (i >= 0) {
                    greenSplice(this.activeAudioClips, i);
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
                arrayCache.recycle(this.activeAudioClips);
                this.activeAudioClips = null;
                
                this.state = null;

                if (c) {
                    i = c.length;
                    while (i--) {
                        ci = c[i];
                        ci.states.recycle();
                        ci.recycle();
                    }
                    arrayCache.recycle(c);
                    this.checkStates = null;
                }
            }
        },
        
        getAssetList: function (component, props, defaultProps) {
            var key = '',
                preload = arrayCache.setUp(),
                audioMap = component.audioMap || props.audioMap || defaultProps.audioMap;
            
            for (key in audioMap) {
                if (audioMap.hasOwnProperty(key)) {
                    const item = (audioMap[key].sound || audioMap[key]) + '.{ogg,mp3}';
                    if (preload.indexOf(item) === -1) {
                        preload.push(item);
                    }
                }
            }

            return preload;
        }
    });
}());
