/**
 * This component is typically added to an entity automatically by a render component. It handles mapping entity states to playable animations.
 *
 * @class StateRender
 * @uses platypus.Component
 * @since 0.9.0
 */
/*global include, platypus */
(function () {
    'use strict';
    
    var StateMap = include('platypus.StateMap'),
        defaultTest = function (animation) {
            return animation;
        },
        stateTest = function (animation, states, ownerState) {
            if (ownerState.includes(states)) {
                return animation;
            }
            return false;
        },
        createTest = function (testStates, animation) {
            if (testStates === 'default') {
                return defaultTest.bind(null, animation);
            } else {
                //TODO: Better clean-up: Create a lot of these without removing them later... DDD 2/5/2016
                return stateTest.bind(null, animation, StateMap.setUp(testStates));
            }
        };

    return platypus.createComponentClass({
        id: 'StateRender',

        properties: {
            /**
             * An object containg key-value pairs that define a mapping from entity states to the animation that should play. The list is processed from top to bottom, so the most important actions should be listed first (for example, a jumping animation might take precedence over an idle animation). If not specified, an 1-to-1 animation map is created from the list of animations in the sprite sheet definition using the animation names as the keys.
             *
             *  "animationMap":{
             *      "standing": "default-animation"  // On receiving a "standing" event, or when this.owner.state.standing === true, the "default" animation will begin playing.
             *      "ground,moving": "walking",  // Comma separated values have a special meaning when evaluating "state-changed" messages. The above example will cause the "walking" animation to play ONLY if the entity's state includes both "moving" and "ground" equal to true.
             *      "ground,striking": "swing!", // Putting an exclamation after an animation name causes this animation to complete before going to the next animation. This is useful for animations that would look poorly if interrupted.
             *      "default": "default-animation" // Optional. "default" is a special property that matches all states. If none of the above states are valid for the entity, it will use the default animation listed here.
             *  }
             *
             * @property animationMap
             * @type Object
             * @default null
             */
            "animationMap": null,

            /**
             * Optional. Forces animations to complete before starting a new animation. Defaults to `false`.
             *
             * @property forcePlayThrough
             * @type Boolean
             * @default false
             */
            forcePlayThrough: false
        },

        constructor: function () {
            var anim      = '',
                animation = '',
                map = this.animationMap;

            this.followThroughs = {};
            this.checkStates = Array.setUp();
            this.state = this.owner.state;
            this.stateChange = true; //Check state against entity's prior state to update animation if necessary on instantiation.
            this.lastState = -1;

            for (anim in map) {
                if (map.hasOwnProperty(anim)) {
                    animation = map[anim];

                    //TODO: Should probably find a cleaner way to accomplish this. Maybe in the animationMap definition? - DDD
                    if (animation[animation.length - 1] === '!') {
                        animation = animation.substring(0, animation.length - 1);
                        this.followThroughs[animation] = true;
                    } else {
                        this.followThroughs[animation] = false;
                    }

                    this.checkStates.push(createTest(anim, animation));
                }
            }

            this.waitingAnimation = false;
            this.waitingState = 0;
            this.playWaiting = false;
            this.animationFinished = false;
        },

        events: {
            /**
             * This listens for the entity state to change and will update the currently playing animation.
             *
             * @method 'state-changed'
             */
            "state-changed": function () {
                this.stateChange = true;
            },

            /**
             * On receiving this event, the component checks for any waiting animations and begins playing them if so.
             *
             * @method 'animation-ended'
             * @param animation {String} The animation that completed.
             */
            "animation-ended": function (animation) {
                if (animation === this.currentAnimation) {
                    if (this.waitingAnimation) {
                        this.currentAnimation = this.waitingAnimation;
                        this.waitingAnimation = false;
                        this.lastState = this.waitingState;
                        
                        this.animationFinished = false;
                        this.owner.triggerEvent('play-animation', this.currentAnimation);
                    } else {
                        this.animationFinished = true;
                    }
                }
            },

            /**
             * This checks to determine whether another animation should begin playing.
             *
             * @method update-animation
             * @param playing {Boolean} Whether the new animation should play or pause on the first frame.
             */
            "update-animation": function (playing) {
                var i = 0,
                    testCase = false;

                if (this.stateChange) {
                    if (this.state.has('visible')) {
                        this.visible = this.state.get('visible');
                    }
                    if (this.checkStates) {
                        for (i = 0; i < this.checkStates.length; i++) {
                            testCase = this.checkStates[i](this.state);
                            if (testCase) {
                                if (this.currentAnimation !== testCase) {
                                    if (!this.followThroughs[this.currentAnimation] && (!this.forcePlaythrough || (this.animationFinished || (this.lastState >= +i)))) {
                                        this.currentAnimation = testCase;
                                        this.lastState = +i;
                                        this.animationFinished = false;
                                        if (playing) {
                                            this.owner.triggerEvent('play-animation', this.currentAnimation);
                                        } else {
                                            this.owner.triggerEvent('stop-animation', this.currentAnimation);
                                        }
                                    } else {
                                        this.waitingAnimation = testCase;
                                        this.waitingState = +i;
                                    }
                                } else if (this.waitingAnimation && !this.followThroughs[this.currentAnimation]) {// keep animating this animation since this animation has already overlapped the waiting animation.
                                    this.waitingAnimation = false;
                                }
                                break;
                            }
                        }
                    }
                    this.stateChange = false;
                }
            }
        },
        
        methods: {
            destroy: function () {
                this.checkStates.recycle();
                this.followThroughs = null;
                this.state = null;
            }
        },
        
        publicMethods: {
        }
    });
}());
