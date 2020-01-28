/**
 * This component plays audio using the SpringRoll VOPlayer instance. Audio is played by triggering specific messages defined in the audio component definition.
 *
 * @namespace platypus.components
 * @class AudioVO
 * @uses platypus.Component
 * @since 0.6.0
 */
/*global platypus */
import CaptionPlayer from 'springroll';
import Data from '../Data.js';
import Messenger from '../Messenger.js';
import Sound from 'pixi-sound';
import {arrayCache} from '../utils/array.js';
import createComponentClass from '../factory.js';

    /**
     * A class for managing audio by only playing one at a time, playing a list,
     * and even managing captions (Captions library) at the same time.
     *
     * This class borrows heavily from SpringRoll v1 to match the original capabilities exposed for Platypus v1.
     */
class VOPlayer extends Messenger {
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
        if (captions)
        {
            captions.selfUpdate = false;
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
                total += this._soundInstance.progress * this._soundInstance.duration; // progress is aledgedly 0-1 :shrug:
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
        this.game.off("update", this._syncCaptionToSound);
        this.game.off("update", this._updateSilence);
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
        if (this._captions.playing) {
            if (this._soundInstance) {
                this.game.on("update", this._syncCaptionToSound);
            }

            //timer
        } else {
            this.game.on("update", this._updateSilence);
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
        this.game.off("update", this._syncCaptionToSound);
        this.game.off("update", this._updateSilence);

        //if we have captions and an audio instance, set the caption time to the length of the audio
        if (this._captions && this._soundInstance)
        {
            this._captions.seek(this._soundInstance.length);
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
                this.game.on("update", this._updateSilence);
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
    _updateSilence (elapsed) {
        this._timer -= elapsed;

        if (this._timer <= 0)
        {
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
    _syncCaptionToSound (elapsed) {
        if (!this._soundInstance) return;

        this._captions.seek(this._soundInstance.position);
    }

    /**
     * Plays the current audio item and begins preloading the next item.
     * @method _playSound
     * @private
     */
    _playSound () {
        // Only add a sound once
        if (this.trackSound && this._trackedSounds.indexOf(this._currentVO) === -1) {
            this._trackedSounds.push(this._currentVO);
        }

        if (this.assetCache.has(this._currentVO)) {
            this._soundInstance = Sound.play(this._currentVO, this._onSoundFinished);
        } else {
            const arr = arrayCache.setUp(this._currentVO + '.{ogg,mp3}');

            this.assetCache.load(arr, null, () => {
                this._soundInstance = Sound.play(this._currentVO, this._onSoundFinished);
            });

            arrayCache.recycle(arr);
        }

        if (this._captions) {
            this._captions.play(this._currentVO);
            this.game.on("update", this._syncCaptionToSound);
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
        if (this._captions) {
            this._captions.stop();
        }
        this.game.off("update", this._syncCaptionToSound);
        this.game.off("update", this._updateSilence);
        this.voList = null;
        this._timer = 0;
        this._callback = null;

        this._cancelledCallback = null;
        if (c) {
            c();
        }
    }

    /**
     * Unloads all audio this VOPlayer has played. If trackSound is false, this won't do anything.
     * @method unloadSound
     * @public
     */
    unloadSound () {
        for (let i = 0; i < this._trackedSounds.length; i++) {
            Sound.remove(this._trackedSounds[i]);
        }
        this.assetCache.unload(this._trackedSounds);
        this._trackedSounds.length = 0;
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

export default (function () {
    var sortByTime = function (a, b) {
            return a.time - b.time;
        },
        addEvents = function (fromList, toList) {
            var i = 0;
            
            for (i = 0; i < fromList.length; i++) {
                toList.push(Data.setUp(
                    'event', fromList[i].event,
                    'time', fromList[i].time || 0,
                    'message', fromList[i].message
                ));
            }
            
            if (i) {
                toList.sort(sortByTime);
            }
            
            return toList;
        },
        offsetEvents = function (fromList, toList, player) {
            var i = 0,
                offset = player.getElapsed();
            
            for (i = 0; i < fromList.length; i++) {
                toList.push(Data.setUp(
                    'event', fromList[i].event,
                    'time', (fromList[i].time || 0) + offset,
                    'message', fromList[i].message || null
                ));
            }
            
            if (i) {
                toList.sort(sortByTime);
            }
        },
        setupEventList = function (sounds, eventList, player) { // This function merges events from individual sounds into a full list queued to sync with the SpringRoll voPlayer.
            var i = 0,
                soundList = arrayCache.setUp();
            
            // Create alias-only sound list.
            for (i = 0; i < sounds.length; i++) {
                if (sounds[i].sound) {
                    if (sounds[i].events) {
                        soundList.push(offsetEvents.bind(this, sounds[i].events, eventList, player));
                    }
                    soundList.push(sounds[i].sound);
                } else {
                    soundList.push(sounds[i]);
                }
            }
            return soundList;
        },
        onComplete = function (complete, soundList) {
            this.playingAudio = false;
            this.player.unloadSound();
            if (!this.owner.destroyed) {
                this.checkTimeEvents(true);
                
                /**
                 * When an audio sequence is finished playing, this event is triggered.
                 *
                 * @event sequence-complete
                 */
                this.owner.triggerEvent('sequence-complete');
            }
            arrayCache.recycle(soundList);
        },
        playSound = function (soundDefinition, value) {
            var soundList = null,
                eventList = arrayCache.setUp(),
                player = this.player;

            if (typeof soundDefinition === 'string') {
                soundList = arrayCache.setUp(soundDefinition);
            } else if (Array.isArray(soundDefinition)) {
                soundList = setupEventList(soundDefinition, eventList, player);
            } else {
                if (soundDefinition.events) {
                    addEvents(soundDefinition.events, eventList);
                }
                if (Array.isArray(soundDefinition.sound)) {
                    soundList = setupEventList(soundDefinition.sound, eventList, player);
                } else {
                    soundList = arrayCache.setUp(soundDefinition.sound);
                }
            }
            
            if (value && value.events) {
                addEvents(value.events, eventList);
            }

            player.play(soundList, onComplete.bind(this, true, soundList), onComplete.bind(this, false, soundList));

            // Removing `this.eventList` after play call since playing a VO clip could be stopping a currently playing clip with events in progress.
            arrayCache.recycle(this.eventList);
            this.eventList = eventList;
            this.playingAudio = true;
        };
    
    return createComponentClass({
        id: 'AudioVO',
        
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
             *               "events": [{
             *                   "event": "walk-to-the-left",
             *                   "time": 1500
             *               }]
             *               // Optional. Used to specify a list of events to play once the VO begins.
             *           }
             *       }
             *
             * @property audioMap
             * @type Object
             * @default null
             */
            audioMap: null
        },
            
        initialize: function () {
            var key = '';
            
            this.eventList = arrayCache.setUp();
    
            this.playingAudio = false;
            this.player = platypus.game.voPlayer = platypus.game.voPlayer || new VOPlayer(platypus.game, platypus.assetCache); // Create a single instance of the vo player if it doesn't already exist. TODO: may be able to move this to a static variable?
            this.player.trackSound = platypus.supports.iOS;
    
            if (this.audioMap) {
                for (key in this.audioMap) {
                    if (this.audioMap.hasOwnProperty(key)) {

                        /**
                         * Listens for messages specified by the `audioMap` and on receiving them, begins playing corresponding audio clips.
                         *
                         * @method '*'
                         * @param [message.events] {Array} Used to specify the list of events to trigger while playing this audio sequence.
                         */
                        this.addEventListener(key, playSound.bind(this, this.audioMap[key]));
                    }
                }
            }
            
            this.paused = false;
        },

        events: {
            /**
             * On each `handle-render` message, this component checks its list of playing audio clips and stops any clips whose play length has been reached.
             *
             * @method 'handle-render'
             */
            "handle-render": function () {
                if (!this.paused) {
                    this.checkTimeEvents(false);
                }
            },

            /**
             * On receiving this message, audio will stop playing.
             *
             * @method 'stop-audio'
             */
            "stop-audio": function () {
                this.player.stop();
                this.player.voList = []; // Workaround to prevent a Springroll bug wherein stopping throws an error due to `voList` being `null`.
            }
        },
        
        methods: {
            checkTimeEvents: function (finished) {
                var event = null,
                    events = this.eventList,
                    currentTime = 0,
                    owner = this.owner;
                
                if (events && events.length) {
                    currentTime = this.player.getElapsed();

                    while (events.length && (finished || (events[0].time <= currentTime))) {
                        event = events.shift();
                        owner.trigger(event.event, event.message);
                        event.recycle();
                    }
                }
            },

            destroy: function () {
                if (this.playingAudio) {
                    this.player.stop();
                    this.player.voList = []; // Workaround to prevent a Springroll bug wherein stopping throws an error due to `voList` being `null`.
                }
                arrayCache.recycle(this.eventList);
                this.eventList = null;
            }
        }
    });
}());
