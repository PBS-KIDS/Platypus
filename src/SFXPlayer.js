/**
 * This component plays sfx audio and manages Springroll volume changes.
 *
 * @namespace platypus
 * @class SFXPlayer
 */
/* global platypus */
import {arrayCache, greenSplice} from './utils/array.js';
import Sound from 'pixi-sound';

export default class SFXPlayer {
    constructor () {
        this.volume = 1;
        this.player = Sound;
        this.playingAudio = arrayCache.setUp();
        this.sounds = arrayCache.setUp();
    }

    /**
     * Plays a sound.
     *
     * @param {String} sound Sound Id to play.
     * @param {Object} data PixiSound data to inform sound playback.
     * @return {pixiSound.MediaInstance} The media instance of the playing sound.
     * @public
     */
    play (sound, data) {
        const
            audio = this.player.play(sound, data);

        audio.initialVolume = audio.volume;
        audio.set('volume', audio.initialVolume * this.volume);
        this.playingAudio.push(audio);
        this.sounds.push(sound);
        audio.on('end', () => {
            const index = this.playingAudio.indexOf(audio);

            greenSplice(this.playingAudio, index);
            greenSplice(this.sounds, index);
        });

        return audio;
    }

    /**
     * Plays a sound.
     *
     * @param {pixiSound.MediaInstance} audio Audio to stop.
     * @public
     */
    stop (audio) {
        const index = this.playingAudio.indexOf(audio);

        audio.stop();
        if (index >= 0) {
            greenSplice(this.playingAudio, index);
            greenSplice(this.sounds, index);
        } else {
            platypus.debug.warn('SFXPlayer: Did not find "' + audio.soundId + '"');
        }
    }

    /**
     * Sets volume on all playing sound effects.
     *
     * @param {Number} volume A value between 0-1 to set volume on all playing sound effects.
     * @public
     */
    setVolume (volume) {
        const
            playingAudio = this.playingAudio;

        this.volume = volume;
        for (let i = 0; i < playingAudio.length; i++) {
            const
                audio = playingAudio[i];

            audio.set('volume', audio.initialVolume * this.volume);
        }
    }

    /**
     * Cleans up this SFXPlayer.
     * @method destroy
     * @public
     */
    destroy () {
        arrayCache.recycle(this.playingAudio);
        this.playingAudio = null;
        arrayCache.recycle(this.sounds);
        this.sounds = null;
    }
};
