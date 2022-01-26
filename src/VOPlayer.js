/* global platypus */
import {arrayCache, greenSlice, greenSplice} from './utils/array.js';
import Data from './Data.js';
import Messenger from './Messenger.js';
import Sound from 'pixi-sound';

/**
 * This class is used to create `platypus.game.voPlayer` and manages playback by only playing one at a time, playing a list, and even handling captions at the same time.
 *
 * This class borrows heavily from SpringRoll v1 to match the original capabilities exposed for Platypus v1.
 *
 * @memberof platypus
 * @extends platypus.Messenger
 * @param {Game} game The game instance for which to play audio.
 * @param {assetManager} assetCache The Platypus assetManager used to load and unload VO clips.
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
         * Preloading next sound.
         * @property {String} preloadingNextSound
         * @private
         */
        this.preloadingNextSound = '';

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
        this.currentlyLoadingAudio = false;
        this.playQueue = arrayCache.setUp();
    }

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
     * The springroll.Captions object used for captions. The developer is responsible for initializing this with a captions dictionary config file and a reference to a text field.
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
     * The duration of the currently playing item of audio/silence in milliseconds. If this is waiting on an audio file to load for the first time, it will be 0, as there is no duration data to give.
     * @property {int} currentDuration
     */
    get currentDuration () {
        if (!this.playing) {
            return 0;
        }

        //active audio
        if (this._soundInstance) {
            return Sound.duration(this._soundInstance.alias);
        } else if (this._currentVO && this._captions) { //captions only
            return this._captions.currentDuration;
        } else { //silence timer
            return this.voList[this._listCounter];
        }
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
                total += Sound.duration(item) * 1000;
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
     * @listens platypus.Game#tick
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
        if (!this.startingNewTrack) {
            if (this.currentlyLoadingAudio) {
                this.playQueue.push(Data.setUp(
                    'idOrList', idOrList,
                    'callback', callback,
                    'cancelledCallback', cancelledCallback
                ));
                return;
            }
            this.startingNewTrack = true;
            this.stop();
            this.startingNewTrack = false;

            this._listCounter = -1;
            if (typeof idOrList === "string") {
                this.voList = arrayCache.setUp(0, idOrList);
            } else {
                this.voList = greenSlice(idOrList);
                this.voList.unshift(0);
            }
            this._callback = callback;
            this._cancelledCallback = cancelledCallback === true ? callback : cancelledCallback;
            this._onSoundFinished();

        } else {
            platypus.debug.warn('VOPlayer: Tried playing a new track while a new track was starting up.');
        }
    }

    /**
     * Callback for when audio/timer is finished to advance to the next item in the list.
     * @method _onSoundFinished
     * @private
     */
    _onSoundFinished () {
        if (this._listCounter >= 0) {
            const currentVO = this._currentVO;

            /**
             * Fired when a new VO, caption, or silence timer completes
             * @event platypus.VOPlayer#end
             * @param {String} currentVO The alias of the VO or caption that has begun, or null if it is a silence timer.
             */
            this.trigger("end", currentVO);
            if (typeof currentVO === "string") {
                this.voList[0] += Sound.duration(currentVO) * 1000;
                this.unloadSound(currentVO);
                greenSplice(this.voList, 1);
                this._listCounter -= 1;
            } else if (typeof this._currentVO === "function") {
                greenSplice(this.voList, 1);
                this._listCounter -= 1;
            } else {
                this.voList[0] += this.voList[1];
                greenSplice(this.voList, 1);
                this._listCounter -= 1;
            }
        } else {
            this._listCounter = 0; // bump past elapsed storage index.
        }
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
            arrayCache.recycle(this.voList);
            this.voList = null;
            if (c) {
                c();
            }
        } else {
            /**
             * Fired when a new VO, caption, or silence timer begins
             * @event platypus.VOPlayer#start
             * @param {String} currentVO The alias of the VO or caption that has begun, or null if it is a silence timer.
             */
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
            play = () => {
                this._soundInstance = Sound.play(this._currentVO, this._onSoundFinished);
                this._soundInstance.volume = this.volume;
                if (this._captions) {
                    this._captions.start(this._currentVO);
                    this.game.on("tick", this._syncCaptionToSound);
                }
                if (this.playQueue.length) { // We need to skip on ahead, because new VO was played while this or a prior one was loading.
                    const
                        vo = greenSplice(this.playQueue, 0);

                    this.play(vo.idOrList, vo.callback, vo.cancelledCallback);

                    vo.recycle();
                } else {
                    for (let i = this._listCounter + 1; i < this.voList.length; ++i) {
                        const next = this.voList[i];
                        if (typeof next === "string") {
                            const
                                arr = arrayCache.setUp({
                                    id: this._currentVO,
                                    src: this._currentVO + '.mp3'
                                });
        
                            this.assetCache.load(arr);
                
                            arrayCache.recycle(arr);

                            if (this.preloadingNextSound) {
                                this.unloadSound(this.preloadingNextSound);
                            }
                            this.preloadingNextSound = next;
                            break;
                        }
                    }
                }
            },
            arr = arrayCache.setUp({
                id: this._currentVO,
                src: this._currentVO + '.mp3'
            }),
            currentVO = this._currentVO;

        this.currentlyLoadingAudio = true;

        this.assetCache.load(arr, null, () => {
            this.currentlyLoadingAudio = false;
            if (this.stoppedWhileLoading) {
                this.stoppedWhileLoading = false;
                if (this.playQueue.length) { // Already more queued up, so we'll roll the stop into it here
                    play();
                } else {
                    play();
                    this.stop();
                }
            } else if (currentVO === this._currentVO) {
                play();
            } else {
                platypus.debug.warn('VOPlayer: Asset loading out of order.');
            }
        });

        arrayCache.recycle(arr);
    }

    /**
     * Stops playback of any audio/timer.
     * @method stop
     * @public
     */
    stop () {
        if (this.currentlyLoadingAudio) {
            this.stoppedWhileLoading = true;
            return;
        }
        const c = this._cancelledCallback;

        this.paused = false;
        if (this._soundInstance) {
            this._soundInstance.stop();
            this.unloadSound(this._currentVO);
            this._soundInstance = null;
        }
        this._currentVO = null;
        if (this._captions && this._captions.activeCaption) {
            this._captions.stop();
        }
        this.game.off("tick", this._syncCaptionToSound);
        this.game.off("tick", this._updateSilence);
        if (this.voList) {
            for (let i = this._listCounter + 1; i < this.voList.length; i++) {
                if (typeof this.voList[i] === 'function') {
                    this.voList[i](); // Make sure all events are triggered.
                }
            }
            this.voList = null;
        }
        this._timer = 0;
        this._callback = null;

        this._cancelledCallback = null;
        if (c) {
            c();
        }
    }

    /**
     * Sets the volume of VO playback.
     *
     * @method setVolume
     * @param {Number} volume
     */
    setVolume (volume) {
        this.volume = volume;
        if (this._soundInstance) {
            this._soundInstance.volume = this.volume;
        }
    }

    /**
     * Whether to mute captions.
     *
     * @method setCaptionMute
     * @param {Boolean} muted
     */
    setCaptionMute (muted) {
        this.captionMute = muted;
        if (this._captions) {
            this._captions.renderer.renderTarget.style.display = muted ? 'none' : 'block';
        }
    }

    /**
     * Unloads an audio track this VOPlayer has played.
     * @method unloadSound
     * @param sound {string} Sound to unload.
     * @public
     */
    unloadSound (sound) {
        const
            assetCache = this.assetCache;

        if (assetCache.delete(sound)) {
            Sound.remove(sound);
        }
    }

    /**
     * Cleans up this VOPlayer.
     * @method destroy
     * @public
     */
    destroy () {
        this.stop();
        this.voList = null;
        this._currentVO = null;
        this._soundInstance = null;
        this._callback = null;
        this._cancelledCallback = null;
        this._captions = null;
    }
};
