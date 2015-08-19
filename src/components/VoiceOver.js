/**
 * This component uses its definition to load Audio and RenderSprite components who work in an interconnected way to render animations corresponding to one or more audio tracks.
 *
 * In addition to its own properties, this component also accepts all properties accepted by either [[RenderSprite]] or [[Audio]] and passes them along when it creates those components.
 *
 * @namespace platypus.components
 * @class VoiceOver
 * @uses Component
 */
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    var getEventName = function (msg, VO) {
            if (VO === ' ') {
                return msg + 'default';
            } else {
                return msg + VO;
            }
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
                definition.events = [];
            } else {
                for (key in sound.sound) {
                    if (sound.sound.hasOwnProperty(key)) {
                        definition[key] = sound.sound[key];
                    }
                }

                if (definition.events) {
                    definition.events = definition.events.slice();
                } else {
                    definition.events = [];
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
                definitions = [],
                definition = null;

            if (!events[' ']) {
                events[' '] = events['default'];
            }

            if (Array.isArray(sound)) {
                for (i = 0; i < sound.length; i++) {
                    definitions.push(createAudioDefinition(sound[i], events, message, frameLength));
                }
                definition = definitions.splice(0, 1)[0];
                definition.next = definitions;
                return definition;
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
             * @default "VoiceOver"
             */
            messagePrefix: "VoiceOver",

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

        constructor: function (definition) {
            var i = '',
                audioDefinition     = {
                    audioMap: {},
                    voiceOver: definition.voiceOver,
                    aliases:  definition.aliases
                },
                animationDefinition = {
                    spriteSheet:   definition.spriteSheet,
                    acceptInput:   definition.acceptInput,
                    scaleX:        definition.scaleX,
                    scaleY:        definition.scaleY,
                    rotate:        definition.rotate,
                    mirror:        definition.mirror,
                    flip:          definition.flip,
                    hidden:        definition.hidden,
                    animationMap:  {},
                    pins:          definition.pins,
                    pinTo:         definition.pinTo,
                    aliases:       definition.aliases
                };
            
            this.message = this.messagePrefix + '-';
            
            for (i in this.animationMap) {
                if (this.animationMap.hasOwnProperty(i)) {
                    animationDefinition.animationMap[getEventName(this.message, i)] = this.animationMap[i];
                }
            }
            animationDefinition.animationMap['default'] = this.animationMap['default'];
            this.owner.addComponent(new platypus.components.RenderSprite(this.owner, animationDefinition));

            for (i in this.voiceOverMap) {
                if (this.voiceOverMap.hasOwnProperty(i)) {
                    audioDefinition.audioMap[i] = createVO(this.voiceOverMap[i], this.animationMap, this.message, this.frameLength);
                }
            }
            this.owner.addComponent(new platypus.components.Audio(this.owner, audioDefinition));
        },

        events: {
            /**
             * On receiving this message, this component removes itself from the entity. (It creates the [[RenderSprite]] and [[Audio]] components in its constructor.)
             *
             * @method 'load'
             */
            "load": function () {
                this.owner.removeComponent(this);
            }
        }
    });
}());
