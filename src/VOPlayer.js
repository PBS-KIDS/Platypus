/**
 * This component plays audio using the SpringRoll VOPlayer instance. Audio is played by triggering specific messages defined in the audio component definition.
 *
 * @namespace platypus
 * @class VOPlayer
 */
import Messenger from './Messenger.js';
import Sound from 'pixi-sound';
import {arrayCache} from './utils/array.js';

    /**
     * A class for managing audio by only playing one at a time, playing a list,
     * and even managing captions (Captions library) at the same time.
     *
     * This class borrows heavily from SpringRoll v1 to match the original capabilities exposed for Platypus v1.
     */
export default class VOPlayer extends Messenger {
    constructor (game, assetCache) {
        super();

        this.game = game;
        this.assetCache = assetCache;

        //Bound method calls
        this._onSoundFinished = this._onSoundFinished.bind(this);
        this._updateSilence = this._updateSilence.bind(this);
        this._syncCaptionToSound = this._syncCaptionToSound.bind(this);

        /**
         * An Array used when play() is called to avoid creating lots of Array objects.
         * @property {Array} _listHelper
         * @private
         */
        this._listHelper = [];

        /**
         * If the VOPlayer should keep a list of all audio it plays for unloading
         * later. Default is false.
         * @property {Boolean} trackSound
         * @public
         */
        this.trackSound = false;

        /**
         * If the sound is currently paused. Setting this has no effect - use pause()
         * and resume().
         * @property {Boolean} paused
         * @public
         * @readOnly
         */
        this.paused = false;

        /**
         * The current list of audio/silence times/functions.
         * Generally you will not need to modify this.
         * @property {Array} voList
         * @public
         */
        this.voList = null;

        /**
         * The current position in voList.
         * @property {int} _listCounter
         * @private
         */
        this._listCounter = 0;

        /**
         * The current audio alias being played.
         * @property {String} _currentVO
         * @private
         */
        this._currentVO = null;

        /**
         * The current audio instance being played.
         * @property {SoundInstance} _soundInstance
         * @private
         */
        this._soundInstance = null;

        /**
         * The callback for when the list is finished.
         * @property {Function} _callback
         * @private
         */
        this._callback = null;

        /**
         * The callback for when the list is interrupted for any reason.
         * @property {Function} _cancelledCallback
         * @private
         */
        this._cancelledCallback = null;

        /**
         * A list of audio file played by this, so that they can be unloaded later.
         * @property {Array} _trackedSounds
         * @private
         */
        this._trackedSounds = [];

        /**
         * A timer for silence entries in the list, in milliseconds.
         * @property {int} _timer
         * @private
         */
        this._timer = 0;

        /**
         * The captions object
         * @property {springroll.Captions} _captions
         * @private
         */
        this._captions = null;

        this.volume = 1;
        this.captionMute = true;
    }

    /**
     * Fired when a new VO, caption, or silence timer begins
     * @event start
     * @param {String} currentVO The alias of the VO or caption that has begun, or null if it is
     *                           a silence timer.
     */

    /**
     * Fired when a new VO, caption, or silence timer completes
     * @event end
     * @param {String} currentVO The alias of the VO or caption that has begun, or null if it is
     *                           a silence timer.
     */

    /**
     * If VOPlayer is currently playing (audio or silence).
     * @property {Boolean} playing
     * @public
     * @readOnly
     */
    get playing () {
        return this._currentVO !== null || this._timer > 0;
    }

    /**
     * The current VO alias that is playing, even if it is just a caption. If a silence timer
     * is running, currentVO will be null.
     * @property {Boolean} currentVO
     * @public
     * @readOnly
     */
    get currentVO () {
        return this._currentVO;
    }

    /**
     * The springroll.Captions object used for captions. The developer is responsible
     * for initializing this with a captions dictionary config file and a reference
     * to a text field.
     * @property {Captions} captions
     * @public
     */
    set captions (captions) {
        this._captions = captions;
        if (captions) {
            captions.selfUpdate = false;
            this.setCaptionMute(this.captionMute);
        }
    }

    get captions () {
        return this._captions;
    }

    /**
     * The amount of time elapsed in the currently playing item of audio/silence in milliseconds
     * @property {int} currentPosition
     */
    get currentPosition () {
        if (!this.playing) return 0;
        //active audio
        if (this._soundInstance)
            return this._soundInstance.position;
        //captions only
        else if (this._currentVO)
            return this._timer;
        //silence timer
        else
            return this.voList[this._listCounter] - this._timer;
    }

    /**
     * The duration of the currently playing item of audio/silence in milliseconds. If this is
     * waiting on an audio file to load for the first time, it will be 0, as there is no duration
     * data to give.
     * @property {int} currentDuration
     */
    get currentDuration () {
        if (!this.playing) return 0;
        //active audio
        if (this._soundInstance)
            return Sound.duration(this._soundInstance.alias);
        //captions only
        else if (this._currentVO && this._captions)
            return this._captions.currentDuration;
        //silence timer
        else
            return this.voList[this._listCounter];
    }

    /**
     * Calculates the amount of time elapsed in the current playlist of audio/silence.
     * @method getElapsed
     * @return {int} The elapsed time in milliseconds.
     */
    getElapsed () {
        let index = 0,
            total = 0;

        if (!this.voList)
        {
            return 0;
        }

        for (let i = 0; i < this._listCounter; ++i) {
            const item = this.voList[i];
            if (typeof item === "string") {
                total += Sound.duration(item);
            }
            else if (typeof item === "number")
            {
                total += item;
            }
        }

        //get the current item
        index = this._listCounter;
        if (index < this.voList.length) {
            const item = this.voList[index];
            if (typeof item === "string") {
                if (this._soundInstance) {
                    total += this._soundInstance._elapsed * 1000;
                } // Otherwise it's not yet loaded so progress is `0`
            } else if (typeof item === "number") {
                total += item - this._timer;
            }
        }
        return total;
    }

    /**
     * Pauses the current VO, caption, or silence timer if the VOPlayer is playing.
     * @method pause
     * @public
     */
    pause () {
        if (this.paused || !this.playing) return;

        this.paused = true;

        if (this._soundInstance)
            this._soundInstance.pause();
        
        //remove any update callback
        this.game.off("tick", this._syncCaptionToSound);
        this.game.off("tick", this._updateSilence);
    }

    /**
     * Resumes the current VO, caption, or silence timer if the VOPlayer was paused.
     * @method resume
     * @public
     */
    resume () {
        if (!this.paused) return;

        this.paused = false;
        if (this._soundInstance)
            this._soundInstance.resume();
        //captions for solo captions or VO
        if (this._captions.activeCaption) {
            if (this._soundInstance) {
                this.game.on("tick", this._syncCaptionToSound);
            }

            //timer
        } else {
            this.game.on("tick", this._updateSilence);
        }
    }

    /**
     * Plays a single audio alias, interrupting any current playback.
     * Alternatively, plays a list of audio files, timers, and/or functions.
     * Audio in the list will be preloaded to minimize pauses for loading.
     * @method play
     * @public
     * @param {String|Array} idOrList The alias of the audio file to play or the
     * array of items to play/call in order.
     * @param {Function} [callback] The function to call when playback is complete.
     * @param {Function|Boolean} [cancelledCallback] The function to call when playback
     * is interrupted with a stop() or play() call. If this value is a boolean
     * <code>true</code> then callback will be used instead.
     */
    play (idOrList, callback, cancelledCallback) {
        this.stop();

        //Handle the case where a cancel callback starts
        //A new VO play. Inline VO call should take priority
        //over the cancelled callback VO play.
        if (this.playing)
        {
            this.stop();
        }

        this._listCounter = -1;
        if (typeof idOrList === "string") {
            this._listHelper.length = 0;
            this._listHelper[0] = idOrList;
            this.voList = this._listHelper;
        } else {
            this.voList = idOrList;
        }
        this._callback = callback;
        this._cancelledCallback = cancelledCallback === true ? callback : cancelledCallback;
        this._onSoundFinished();
    }

    /**
     * Callback for when audio/timer is finished to advance to the next item in the list.
     * @method _onSoundFinished
     * @private
     */
    _onSoundFinished () {
        if (this._listCounter >= 0)
            this.trigger("end", this._currentVO);
        //remove any update callback
        this.game.off("tick", this._syncCaptionToSound);
        this.game.off("tick", this._updateSilence);

        //if we have captions and an audio instance, set the caption time to the length of the audio
        if (this._captions && this._captions.activeCaption && this._soundInstance) {
            const activeCaption = this._captions.activeCaption;
            
            activeCaption.lineIndex = activeCaption.lines.length;
        }
        this._soundInstance = null; //clear the audio instance
        this._listCounter++; //advance list

        //if the list is complete
        if (this._listCounter >= this.voList.length) {
            const c = this._callback;

            if (this._captions) {
                this._captions.stop();
            }
            this._currentVO = null;
            this._cancelledCallback = null;

            this._callback = null;
            if (c) {
                c();
            }
        } else {
            this._currentVO = this.voList[this._listCounter];
            if (typeof this._currentVO === "string") {
                //If the sound doesn't exist, then we play it and let it fail,
                //an error should be shown and playback will continue
                this._playSound();
                this.trigger("start", this._currentVO);
            } else if (typeof this._currentVO === "function") {
                this._currentVO(); //call function
                this._onSoundFinished(); //immediately continue
            } else {
                this._timer = this._currentVO; //set up a timer to wait
                this._currentVO = null;
                this.game.on("tick", this._updateSilence);
                this.trigger("start", null);
            }
        }
    }

    /**
     * The update callback used for silence timers.
     * This method is bound to the VOPlayer instance.
     * @method _updateSilence
     * @private
     * @param {int} elapsed The time elapsed since the previous frame, in milliseconds.
     */
    _updateSilence (tick) {
        this._timer -= tick.delta;

        if (this._timer <= 0) {
            this._onSoundFinished();
        }
    }

    /**
     * The update callback used for updating captions with active audio.
     * This method is bound to the VOPlayer instance.
     * @method _syncCaptionToSound
     * @private
     * @param {int} elapsed The time elapsed since the previous frame, in milliseconds.
     */
    _syncCaptionToSound (tick) {
        if (!this._soundInstance) return;

        this._captions.update(tick.delta / 1000);
    }

    /**
     * Plays the current audio item and begins preloading the next item.
     * @method _playSound
     * @private
     */
    _playSound () {
        const
            currentVO = this._currentVO;

        // Only add a sound once
        if (this.trackSound && this._trackedSounds.indexOf(this._currentVO) === -1) {
            this._trackedSounds.push(this._currentVO);
        }

        if (this.assetCache.has(this._currentVO)) {
            this._soundInstance = Sound.play(this._currentVO, this._onSoundFinished);
            this._soundInstance.volume = this.volume;
        } else {
            const arr = arrayCache.setUp({
                id: this._currentVO,
                src: this._currentVO + '.{ogg,mp3}'
            });

            this.assetCache.load(arr, null, () => {
                if (currentVO === this._currentVO) { // so we don't interrupt vo started while this one was loading.
                    this._soundInstance = Sound.play(this._currentVO, this._onSoundFinished);
                    this._soundInstance.volume = this.volume;
                }
            });

            arrayCache.recycle(arr);
        }

        if (this._captions) {
            this._captions.start(this._currentVO);
            this.game.on("tick", this._syncCaptionToSound);
        }

        for (let i = this._listCounter + 1; i < this.voList.length; ++i) {
            const next = this.voList[i];
            if (typeof next === "string") {
                if (!this.assetCache.has(next)) {
                    const arr = arrayCache.setUp(next + '.{ogg,mp3}');

                    this.assetCache.load(arr);
        
                    arrayCache.recycle(arr);
                }
                break;
            }
        }
    }

    /**
     * Stops playback of any audio/timer.
     * @method stop
     * @public
     */
    stop () {
        const c = this._cancelledCallback;

        this.paused = false;
        if (this._soundInstance) {
            this._soundInstance.stop();
            this._soundInstance = null;
        }
        this._currentVO = null;
        if (this._captions && this._captions.activeCaption) {
            this._captions.stop();
        }
        this.game.off("tick", this._syncCaptionToSound);
        this.game.off("tick", this._updateSilence);
        this.voList = null;
        this._timer = 0;
        this._callback = null;

        this._cancelledCallback = null;
        if (c) {
            c();
        }
    }

    setVolume (volume) {
        this.volume = volume;
        if (this._soundInstance) {
            this._soundInstance.volume = this.volume;
        }
    }

    setCaptionMute (muted) {
        this.captionMute = muted;
        if (this._captions) {
            this._captions.renderer.renderTarget.style.display = muted ? 'none' : 'block';
        }
    }

    /**
     * Unloads all audio this VOPlayer has played. If trackSound is false, this won't do anything.
     * @method unloadSound
     * @public
     */
    unloadSound () {
        const
            assetCache = this.assetCache,
            _trackedSounds = this._trackedSounds;

        for (let i = 0; i < _trackedSounds.length; i++) {
            const trackedSound = _trackedSounds[i];

            // We only remove if this is the only remaining requested instance of this audio.
            if (assetCache.delete(trackedSound)) {
                Sound.remove(trackedSound);
            }
        }
        _trackedSounds.length = 0;
    }

    /**
     * Cleans up this VOPlayer.
     * @method destroy
     * @public
     */
    destroy () {
        this.stop();
        this.voList = null;
        this._listHelper = null;
        this._currentVO = null;
        this._soundInstance = null;
        this._callback = null;
        this._cancelledCallback = null;
        this._trackedSounds = null;
        this._captions = null;
    }
};
