/**
 * This component uses its definition to load an AudioVO component and either a RenderSprite or RenderAnimation component. These work in an interconnected way to render animations corresponding to one or more audio tracks.
 *
 * In addition to its own properties, this component also accepts all properties accepted by either [RenderSprite](platypus.components.RenderSprite.html), [RenderSprite](platypus.components.RenderAnimation.html), and [AudioVO](platypus.components.AudioVO.html) and passes them along when it creates those components.
 *
 * @namespace platypus.components
 * @class VoiceOver
 * @uses platypus.Component
 * @uses platypus.AudioVO
 * @uses platypus.RenderAnimation
 * @uses platypus.RenderSprite
 */
/* global include, platypus */
(function () {
    'use strict';

    var AudioVO = include('platypus.components.AudioVO'),
        RenderAnimation = include('platypus.components.RenderAnimation'),
        RenderSprite = include('platypus.components.RenderSprite'),
        getEventName = function (msg, VO) {
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
                voice = sound.voice;

            if (typeof sound.sound === 'string') {
                definition.sound = sound.sound;
                definition.events = Array.setUp();
            } else {
                for (key in sound.sound) {
                    if (sound.sound.hasOwnProperty(key)) {
                        definition[key] = sound.sound[key];
                    }
                }

                if (definition.events) {
                    definition.events = definition.events.greenSlice();
                } else {
                    definition.events = Array.setUp();
                }
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
            }

            return definition;
        },
        createVO = function (sound, events, message, frameLength) {
            var i = 0,
                definitions = Array.setUp();

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

    return platypus.createComponentClass({
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
             * @default {}
             */
            voiceOverMap: {}
        },

        initialize: function (definition, callback) {
            var i = '',
                componentInits = Array.setUp(),
                audioDefinition     = {
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
                    rotate: definition.rotate,
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
            componentInits.push(componentInit.bind(this, (definition.animation ? RenderAnimation : RenderSprite), animationDefinition));

            for (i in this.voiceOverMap) {
                if (this.voiceOverMap.hasOwnProperty(i)) {
                    audioDefinition.audioMap[i] = createVO(this.voiceOverMap[i], this.animationMap, this.message, this.frameLength);
                }
            }
            componentInits.push(componentInit.bind(this, AudioVO, audioDefinition));

            platypus.Async.setUp(componentInits, callback);

            componentInits.recycle();

            return true;
        },

        events: {
            /**
             * On receiving this message, this component removes itself from the entity. (It creates the [[RenderSprite]] and [[AudioVO]] components in its constructor.)
             *
             * @method 'load'
             */
            "load": function () {
                this.owner.removeComponent(this);
            }
        },
        
        getAssetList: function (component, props, defaultProps) {
            var ss = component.spriteSheet || props.spriteSheet || (defaultProps && defaultProps.spriteSheet);
            
            if (typeof ss === 'string') {
                return platypus.game.settings.spriteSheets[ss].images.greenSlice();
            } else if (ss) {
                return ss.images.greenSlice();
            } else {
                return Array.setUp();
            }
        }
    });
}());
