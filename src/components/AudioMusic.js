/**
 * This component plays music or background ambiance.
 *
 * @namespace platypus.components
 * @class AudioMusic
 * @uses platypus.Component
 */
/* global platypus */
import {arrayCache, greenSplice} from '../utils/array.js';
import TweenJS from '@tweenjs/tween.js';
import createComponentClass from '../factory.js';

const
    Tween = TweenJS.Tween,
    tracks = {}; // List of actively-playing tracks.

export default createComponentClass({
    id: 'AudioMusic',
    
    properties: {
        /**
         * Use the tracks property object to handle playing tracks or new tracks to load. Here is an example audioMap object:
         *       {
         *           "audio-1": "audio-id",
         *
         *           "audio-2": {
         *               "sound": "another-audio-id",
         *               // Required. This is the audio clip to loop.
         *
         *               "volume": 0.75,
         *               // Optional. Used to specify how loud to play audio on a range from 0 (mute) to 1 (full volume). Default is 1.
         *
         *               "fade": 1000
         *               // Optional. How long to fade to selected volume.
         *           }
         *       }
         *
         * Any tracks already playing and not defined here will fade out.
         *
         * @property tracks
         * @type Object
         * @default null
         */
        tracks: null
    },
        
    initialize: function () {
        const fadeOuts = arrayCache.setUp();
        let fade = 1000;

        this.player = platypus.game.musicPlayer;
        
        for (const key in tracks) {
            if (tracks.hasOwnProperty(key)) {
                fadeOuts.push(key);
            }
        }
    
        if (this.tracks) {
            for (const key in this.tracks) {
                if (this.tracks.hasOwnProperty(key)) {
                    const fadeOut = fadeOuts.indexOf(key),
                        trackProperties = this.tracks[key];
                    
                    let sound = tracks[key],
                        tween = null;

                    if (fadeOut >= 0) {
                        greenSplice(fadeOuts, fadeOut);
                    } else { // gotta load it because it's not there!
                        sound = tracks[key] = this.player.play(trackProperties.sound || trackProperties, {
                            loop: Infinity,
                            volume: trackProperties.fade ? 0 : (typeof trackProperties.volume === 'number' ? trackProperties.volume : 1),
                            initialVolume: typeof trackProperties.volume === 'number' ? trackProperties.volume : 1
                        });
                    }

                    if (trackProperties.fade) {
                        tween = new Tween(sound);
                        tween.to({
                            volume: (typeof trackProperties.volume === 'number' ? trackProperties.volume : 1) * this.player.volume
                        }, trackProperties.fade);
                        tween.start();

                        // default to what is being used for defined sounds to handle undefined sounds.
                        fade = trackProperties.fade;
                    }
                }
            }
        }

        fadeOuts.forEach((value) => {
            const sound = tracks[value],
                tween = new Tween(sound);

            tween.to({
                volume: 0
            }, fade);
            tween.onComplete(() => {
                this.player.stop(sound);
                //sound.unload();
            });
            delete tracks[value];
            tween.start();
        });
    },

    getAssetList: function (component, props, defaultProps) {
        var key = '',
            preload = arrayCache.setUp(),
            tracks = component.tracks || props.tracks || defaultProps.tracks;
        
        if (tracks) {
            for (key in tracks) {
                if (tracks.hasOwnProperty(key)) {
                    const item = (tracks[key].sound || tracks[key]) + '.mp3';
                    if (preload.indexOf(item) === -1) {
                        preload.push(item);
                    }
                }
            }
        }

        return preload;
    }
});
