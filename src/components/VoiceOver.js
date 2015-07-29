/**
# COMPONENT **voice-over**
This component uses its definition to load two other components (Audio and RenderSprite) who work in an interconnected way to render animations corresponding to one or more audio tracks.

## Dependencies
- [[RenderSprite]] - This component creates a `RenderSprite` component to handle facial movements corresponding to an audio track.
- [[Audio]] - This component creates an `Audio` component to handle playing a voice-over track and trigger events to update the facial rendering.

## Messages

### Listens for:
- **load** - On receiving this message, this component removes itself from the entity. (It creates the [[RenderSprite]] and [[Audio]] components in its constructor.)

## JSON Definition
    {
      "type": "voice-over"
      
      "frameLength": 200,
      // Optional. Specifies how long a described voice-over frame should last. Default is 100 milliseconds.
      
      "messagePrefix": "i-say",
      // Optional. Specifies the prefix that messages between the render and Audio components should use. This will cause the audio to trigger events like "i-say-w" and "i-say-a" (characters listed in the animationMap), that the RenderSprite uses to show the proper frame. Defaults to "voice-over".
      
      "animationMap": {
        "default": "mouth-closed"
        // Required. Specifies animation of default position.
        
        "w": "mouth-o",
        "a": "mouth-aah",
        "t": "mouth-t"
        // Optional. Also list single characters that should map to a given voice-over animation frame.
      }
      
      "voiceoverMap": {
        "message-triggered": [{
          "sound": "audio-id",
          // Required. This is the audio clip to play when "message-triggered" is triggered. It may be a string as shown or an object of key/value pairs as described in an [[audio]] component definition.
          
          "voice": "waat"
          // Optional. This string defines the voice-over sequence according to the frames defined above. Each character lasts the length specified by "frameLength" above. If not specified, voice will be the default frame.
        }]
      }
      
      "spriteSheet": {
      //Required. Defines an EaselJS sprite sheet to use for rendering. See http://www.createjs.com/Docs/EaselJS/SpriteSheet.html for the full specification.

          "images": ["example0", "example1"],
          //Required: An array of ids of the images from the asset list in config.js.
          
          "frames": {
          //Required: The dimensions of the frames on the image and how to offset them around the entity position. The image is automatically cut up into pieces based on the dimensions. 
              "width":  100,
            "height": 100,
            "regY":   100,
            "regX":   50
          },
          
          "animations":{
          //Required: The list of animation ids and the frames that make up that animation. The speed determines how long each frame plays. There are other possible parameters. Additional parameters and formatting info can be found in createJS.
            "mouth-o":   0,
            "mouth-aah": 1,
            "mouth-t":   2,
            "mouth-closed": {"frames": [3, 4, 5], "speed": 4}
          }
      }
      
      //This component also accepts all parameters accepted by either [[RenderSprite]] or [[Audio]] and passes them along when it creates those components.
    }
    
Requires: ["Audio", "RenderSprite"]
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
        id: 'voice-over',
        
        constructor: function (definition) {
            var i = '',
                audioDefinition     = {
                    audioMap: {},
                    preventOverlaps: definition.preventOverlaps,
                    channel: definition.channel,
                    priority: definition.priority,
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
            
            this.message = (definition.messagePrefix || 'voice-over') + '-';
            
            for (i in definition.animationMap) {
                if (definition.animationMap.hasOwnProperty(i)) {
                    animationDefinition.animationMap[getEventName(this.message, i)] = definition.animationMap[i];
                }
            }
            animationDefinition.animationMap['default'] = definition.animationMap['default'];
            this.owner.addComponent(new platypus.components.RenderSprite(this.owner, animationDefinition));

            for (i in definition.voiceoverMap) {
                if (definition.voiceoverMap.hasOwnProperty(i)) {
                    audioDefinition.audioMap[i] = createVO(definition.voiceoverMap[i], definition.animationMap, this.message, definition.frameLength || 100);
                }
            }
            this.owner.addComponent(new platypus.components.Audio(this.owner, audioDefinition));
        },

        events: {// These are messages that this component listens for
            "load": function (resp) {
                this.owner.removeComponent(this);
            }
        }
    });
}());
