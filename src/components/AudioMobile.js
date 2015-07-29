/**
 * Activates audio on mobile devices by handling asset loading after a user interaction. This component should be included on the same entity as the asset loader and have a DOMElement component to capture the user interaction.
 * 
 * Example "progress-bar" entity that could use this component:

    {
        "id": "progress-bar",
        "components":[{
            "type": "AudioMobile"
        },{
            "type": "asset-loader",
            "progressBar": "progress-bar",
            "automatic": false
        },{
            "type": "DOMElement",
            "id": "mobile-start",
            "innerHTML": "Play",
            "className": "mobile-start",
            "updateClassName": true,
            "ontouchstart": "activate-audio"
        },{
            "type": "DOMElement",
            "id": "progress-bar-container",
            "updateClassName": true
        },{
            "type": "DOMElement",
            "id": "progress-bar",
            "parent": "progress-bar-container"
        },{
            "type": "SceneChanger",
            "scene": "menu",
            "aliases": {"complete": "new-scene"}
        }]
    }

To make the mobile-start button appear on mobile devices, the CSS might look something like this:

    .mobile-start {
      display: none;
      position: absolute;
      top: 11em;
      left: 50%;
      width: 3em;
      text-align: center;
      margin-left: -1.5em;
      background: rgba(255,255,255,0.4);
      cursor: pointer;
    }
    
    .mobile-start.mobile {
      display: block;
    }
    
    #progress-bar-container {
      position: absolute;
      text-align: center;
      width: 4.6em;
      top: 11em;
      height: 0.75em;
      left: 50%;
      margin-left: -2.3em;
      background: #000;
    }
    
    #progress-bar-container.mobile {
      display: none;
    }
    
    #progress-bar {
      left: 0;
      top: 0;
      position: absolute;
      height: 100%;
      width: 0;
      background: #fff;
    }

 * 
 * @namespace platypus.components
 * @class AudioMobile
 * @uses Component
 */
/*global console, createjs, platypus */
(function () {
    "use strict";

    return platypus.createComponentClass({
        
        id: 'AudioMobile',
        
        properties: {
            /**
             * The SoundJS audio id for the audio clip to be enabled for future play-back.
             * 
             * @property audioId
             * @type String
             * @default "audio-sprite"
             */
            audioId: "audio-sprite"
        },
        
        constructor: function (definition) {
            this.iOSaudioAPIfix = platypus.supports.iOS && platypus.supports.audioAPI;
        },

        events: {
            /**
             * On hearing this event, this component will trigger "load-assets" on non-mobile devices.
             * 
             * @method 'load'
             */
            "load": function () {
                if (platypus.supports.mobile && !this.iOSaudioAPIfix) {
                    this.owner.state.mobile = true;
                    if ((platypus.supports.android || platypus.supports.iOS) && !platypus.supports.audioAPI) {
                        /**
                         * This event is triggered if the mobile device does not support the Web Audio API. This is useful if audio behavior should be augmented in some way when this is the case.
                         * 
                         * @event 'low-quality-audio'
                         */
                        this.owner.triggerEvent('low-quality-audio');
                    }
                } else {
                    /**
                     * This message is triggered automatically when not on a mobile device. Otherwise it triggers when "activate-audio" has been triggered.
                     * 
                     * @event 'load-assets'
                     */
                    this.owner.triggerEvent('load-assets');
                }
            },
            
            /**
             * On hearing this event, this component will play audio on iOS devices to force audio file download and then trigger "load-assets".
             * 
             * @method 'activate-audio'
             */
            "activate-audio": function () {
                var audio    = platypus.assets[this.audioId].asset,
                    instance = null;
                
                if (!this.iOSaudioAPIfix) {
                    if (audio && platypus.supports.iOS && !platypus.supports.audioAPI) {
                        delete platypus.assets[this.audioId];
                        
                        audio.data.channels = 1;
                        audio.src = audio.src.replace('ogg', 'm4a');
                        createjs.Sound.registerSounds([audio]);
                        
                        instance = createjs.Sound.play(this.audioId);
                        console.log('Initializing iOS fallback audio.');
                        if (instance.playState === 'playSucceeded') {
                            instance.stop();
                        }
                    }
                    
                    this.owner.state.mobile = false;
                    this.owner.triggerEvent('load-assets');
                    this.firstTime = false;
                } else {
                    instance = createjs.Sound.play(this.audioId);
                    console.log('Initializing iOS audio.');
                    if (instance.playState === 'playSucceeded') {
                        instance.stop();
                    }
                    /**
                     * This message is triggered once everything is loaded to go to the next scene.
                     * 
                     * @event 'new-scene'
                     */
                    this.owner.triggerEvent('new-scene');
                }
            },
            
            /**
             * On hearing this event, this component will load the next scene.
             * 
             * @method 'complete'
             */
            "complete": function () {
                if (this.iOSaudioAPIfix) {
                    this.owner.state.mobile = true;
                } else {
                    this.owner.triggerEvent('new-scene');
                }
            }
        }
    });
}());
