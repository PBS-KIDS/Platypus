/* global platypus */
import {arrayCache, greenSlice} from '../utils/array.js';
import Async from '../Async.js';
import AudioVO from './AudioVO.js';
import RenderSprite from './RenderSprite.js';
import createComponentClass from '../factory.js';

export default (function () {
    var getEventName = function (msg, VO) {
            if (VO === ' ') {
                return msg + 'default';
            } else {
                return msg + VO;
            }
        },
        componentInit = function (Component, definition, callback) {
            this.owner.addComponent(new Component(this.owner, definition, callback));
        },
        createAudioDefinition = function (sound, events, message, frameLength) {
            var i          = 0,
                key        = '',
                definition = {},
                time       = 0,
                lastFrame  = '',
                thisFrame  = '',
                voice = sound.voice,
                mouthCues = sound.mouthCues;

            if (typeof sound === 'string') {
                definition.sound = sound;
                definition.events = arrayCache.setUp();
            } else if (typeof sound.sound === 'string') {
                definition.sound = sound.sound;
                if (sound.events) {
                    definition.events = greenSlice(sound.events);
                } else {
                    definition.events = arrayCache.setUp();
                }
            } else {
                for (key in sound.sound) {
                    if (sound.sound.hasOwnProperty(key)) {
                        definition[key] = sound.sound[key];
                    }
                }

                if (definition.events) {
                    definition.events = greenSlice(definition.events);
                } else {
                    definition.events = arrayCache.setUp();
                }
            }

            if (!voice && !mouthCues && platypus.game.settings.mouthCues) {
                mouthCues = platypus.game.settings.mouthCues[definition.sound] || platypus.game.settings.mouthCues[definition.sound.substring(definition.sound.lastIndexOf('/') + 1)];
            }

            if (voice) {
                voice += ' ';

                for (i = 0; i < voice.length; i++) {
                    thisFrame = voice[i];
                    if (thisFrame !== lastFrame) {
                        lastFrame = thisFrame;
                        definition.events.push({
                            "time": time,
                            "event": getEventName(message, thisFrame)
                        });
                    }
                    time += frameLength;
                }
            } else if (mouthCues) {
                for (i = 0; i < mouthCues.length; i++) {
                    thisFrame = mouthCues[i];
                    definition.events.push({
                        "time": thisFrame.start * 1000,
                        "event": getEventName(message, thisFrame.value)
                    });
                    time += frameLength;
                }
            }

            return definition;
        },
        createVO = function (sound, events, message, frameLength) {
            var i = 0,
                definitions = arrayCache.setUp();

            if (!events[' ']) {
                events[' '] = events.default;
            }

            if (Array.isArray(sound)) {
                for (i = 0; i < sound.length; i++) {
                    if (typeof sound[i] === 'number') {
                        definitions.push(sound[i]);
                    } else {
                        definitions.push(createAudioDefinition(sound[i], events, message, frameLength));
                    }
                }
                return definitions;
            } else {
                return createAudioDefinition(sound, events, message, frameLength);
            }
        };

    return createComponentClass(/** @lends platypus.components.VoiceOver.prototype */{
        id: 'VoiceOver',
        
        properties: {
            /**
             * Sets the pairing between letters in the voice-over strings and the animation frame to play.
             *
             *       "animationMap": {
             *         "default": "mouth-closed"
             *         // Required. Specifies animation of default position.
             *
             *         "w": "mouth-o",
             *         "a": "mouth-aah",
             *         "t": "mouth-t"
             *         // Optional. Also list single characters that should map to a given voice-over animation frame.
             *       }
             *
             * @property animationMap
             * @type Object
             * @default: {"default": "default"}
             */
            animationMap: {"default": "default"},

            /**
             * Specifies the type of component to add to handle VO lip-sync animation.
             *
             * @property renderComponent
             * @type String
             * @default 'renderSprite'
             */
            renderComponent: '',

            /**
             * Specifies how long a described voice-over frame should last in milliseconds.
             *
             * @property frameLength
             * @type Number
             * @default 100
             */
            frameLength: 100,

            /**
             * Specifies the prefix that messages between the render and Audio components should use. This will cause the audio to trigger events like "i-say-w" and "i-say-a" (characters listed in the animationMap), that the RenderSprite uses to show the proper frame.
             *
             * @property messagePrefix
             * @type String
             * @default ""
             */
            messagePrefix: "",

            /**
             * This maps events to audio clips and voice over strings.
             *
             *      "voiceOverMap": {
             *          "message-triggered": [{
             *              "sound": "audio-id",
             *              // Required. This is the audio clip to play when "message-triggered" is triggered. It may be a string as shown or an object of key/value pairs as described in an [[audio]] component definition.
             *              "voice": "waat"
             *              // Optional. This string defines the voice-over sequence according to the frames defined by animationMap. Each character lasts the length specified by "frameLength" above. If not specified, voice will be the default frame.
             *          }]
             *      }
             *
             * @property voiceOverMap
             * @type Object
             * @default null
             */
            voiceOverMap: null,

            /**
             * This generates voice over maps. An array of specifications for batches of voice maps to generate. Includes basic properties that can add a prefix to the event name, initial delay before the audio, and an onEnd event that fires when the voice over completes.
             *
             *      "generatedVoiceOverMap": [{
             *          "eventPrefix": "vo-" //Optional. Defaults to "vo-". Is prefixed to the audio file name to create the event to call to trigger to VO.
             *          "initialDelay": 0 //Optional. Defaults to 0. An intial audio delay before the VO starts. Useful to prevent audio from triggering as a scene is loading.
             *          "onEndEvent": "an-event" //Optional. Defaults to "". This event fires when the VO completes.
             *          "endEventTime": 500 //Optional. Defaults to 99999. When the onEnd event fires.
             *          "audio": ["audio-0", "audio-1", "audio-2"] //Required. An array of strings that coorespond to the audio files to create a VOMap for, or a key/value list of id to audio path pairings.
             *      }]
             * 
             *      A generated VO Map is equivalent to this structure:
             * 
             *      "prefix-audio-0": [
             *          500, //initialDelay
             *          {
             *              "sound": {
             *                  "sound": "audio-0", //the audio string
             *                  "events": [
             *                      {
             *                          "event": "on-end-event", //onEndEvent
             *                          "time": 99999
             *                      }
             *                  ]
             *              }
             *          }
             *      ],
             *
             * @property generatedVoiceOverMap
             * @type Object[]
             * @default null
             */
            generatedVoiceOverMaps: null

        },

        /**
         * This component uses its definition to load an AudioVO component and a RenderSprite component. These work in an interconnected way to render animations corresponding to one or more audio tracks.
         *
         * In addition to its own properties, this component also accepts all properties accepted by [RenderSprite](platypus.components.RenderSprite.html) and [AudioVO](platypus.components.AudioVO.html) and passes them along when it creates those components.
         *
         * @memberof platypus.components
         * @uses platypus.Component
         * @uses platypus.AudioVO
         * @uses platypus.RenderSprite
         * @constructs
         * @listens platypus.Entity#load
         */
        initialize: function (definition, callback) {
            var i = '',
                x = 0,
                y = 0,
                componentInits = arrayCache.setUp(),
                audioDefinition = {
                    audioMap: {},
                    aliases: definition.aliases
                },
                animationDefinition = {
                    acceptInput: definition.acceptInput,
                    aliases: definition.aliases,
                    animation: definition.animation,
                    animationMap: {},
                    eventBased: true, // VO triggers events for changing lip-sync frames.
                    flip: definition.flip,
                    hidden: definition.hidden,
                    interactive: definition.interactive,
                    mask: definition.mask,
                    mirror: definition.mirror,
                    offsetZ: definition.offsetZ,
                    regX: definition.regX,
                    regY: definition.regY,
                    restart: definition.restart,
                    scaleX: definition.scaleX,
                    scaleY: definition.scaleY,
                    spriteSheet: definition.spriteSheet,
                    stateBased: definition.stateBased || false
                };

            if (this.messagePrefix) {
                this.message = this.messagePrefix + '-';
            } else {
                this.message = '';
            }
            
            for (i in this.animationMap) {
                if (this.animationMap.hasOwnProperty(i)) {
                    animationDefinition.animationMap[getEventName(this.message, i)] = this.animationMap[i];
                }
            }
            animationDefinition.animationMap.default = this.animationMap.default;
            if (this.renderComponent) {
                componentInits.push(componentInit.bind(this, platypus.components[this.renderComponent], animationDefinition));
            } else {
                componentInits.push(componentInit.bind(this, RenderSprite, animationDefinition));
            }

            if (!this.voiceOverMap) {
                this.voiceOverMap = {};
            }

            if (this.generatedVoiceOverMaps) {
                const
                    createMapping = (key, path, voBatch) => {
                        if (!this.voiceOverMap[key]) {
                            const
                                delay = voBatch.initialDelay || 0,
                                endEventTime = voBatch.endEventTime || 99999,
                                onEnd = voBatch.onEndEvent || "";

                            this.voiceOverMap[key] = [
                                delay,
                                {
                                    "sound": {
                                        "sound": path,
                                        "events": [
                                            {
                                                "event": onEnd,
                                                "time": endEventTime
                                            }
                                        ]
                                    }
                                }
                            ];
                        }
                    };

                for (y = 0; y < this.generatedVoiceOverMaps.length; y++) {
                    const
                        voBatch = this.generatedVoiceOverMaps[y],
                        prefix = voBatch.eventPrefix || "vo-",
                        audios = voBatch.audio;

                    if (Array.isArray(audios)) {
                        for (x = 0; x < audios.length; x++) {
                            const audio = audios[x];
                            createMapping(`${prefix}${audio}`, audio, voBatch);
                        }
                    } else {
                        for (const key in audios) {
                            if (audios.hasOwnProperty(key)) {
                                createMapping(`${prefix}${key}`, audios[key], voBatch);
                            }
                        }
                    }
                }
            }

            for (i in this.voiceOverMap) {
                if (this.voiceOverMap.hasOwnProperty(i)) {
                    audioDefinition.audioMap[i] = createVO(this.voiceOverMap[i], this.animationMap, this.message, this.frameLength);
                }
            }
            componentInits.push(componentInit.bind(this, AudioVO, audioDefinition));

            Async.setUp(componentInits, callback);

            arrayCache.recycle(componentInits);

            return true;
        },

        events: {
            "load": function () {
                this.owner.removeComponent(this);
            }
        },
        
        getAssetList: function (component, props, defaultProps) {
            var ss = component.spriteSheet || props.spriteSheet || (defaultProps && defaultProps.spriteSheet);
            
            if (typeof ss === 'string') {
                return greenSlice(platypus.game.settings.spriteSheets[ss].images);
            } else if (ss) {
                return greenSlice(ss.images);
            } else {
                return arrayCache.setUp();
            }
        }
    });
}());
