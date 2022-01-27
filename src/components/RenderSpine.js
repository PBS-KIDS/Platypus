/* global platypus */
import * as PIXI from 'pixi.js';
import {arrayCache, union} from '../utils/array.js';
import Data from '../Data.js';
import RenderAnimator from './RenderAnimator.js';
import RenderContainer from './RenderContainer.js';
import StateMap from '../StateMap.js';
import createComponentClass from '../factory.js';

export default (function () {
    const
        BaseTexture = PIXI.BaseTexture,
        createTest = function (testStates, skin) {
            if (testStates === 'default') {
                return defaultTest.bind(null, skin);
            } else {
                //TODO: Better clean-up: Create a lot of these without removing them later... DDD 2/5/2016
                return stateTest.bind(null, skin, StateMap.setUp(testStates));
            }
        },
        defaultTest = function (skin) {
            return skin;
        },
        stateTest = function (skin, states, ownerState) {
            if (ownerState.includes(states)) {
                return skin;
            }
            return null;
        },
        getBaseTexture = function (path, pma) {
            var asset = platypus.assetCache.get(path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.')));
            
            if (!asset) {
                platypus.debug.warn('RenderSpine: "' + path + '" is not a loaded asset.');
            }
            return new BaseTexture(asset, {
                alphaMode: pma ? PIXI.ALPHA_MODES.PMA : PIXI.ALPHA_MODES.UNPACK
            });
        };
    
    return createComponentClass(/** @lends platypus.components.RenderSpine.prototype */{

        id: 'RenderSpine',

        properties: {
            /**
             * An object containg key-value pairs that define a mapping from entity states to the animation that should play. The list is processed from top to bottom, so the most important actions should be listed first (for example, a jumping animation might take precedence over an idle animation). If not specified, an 1-to-1 animation map is created from the list of animations in the sprite sheet definition using the animation names as the keys.
             *
             *  "animationStates":{
             *      "standing": "default-animation"  // On receiving a "standing" event, or when this.owner.state.standing === true, the "default" animation will begin playing.
             *      "ground,moving": "walking",  // Comma separated values have a special meaning when evaluating "state-changed" messages. The above example will cause the "walking" animation to play ONLY if the entity's state includes both "moving" and "ground" equal to true.
             *      "ground,striking": "swing!", // Putting an exclamation after an animation name causes this animation to complete before going to the next animation. This is useful for animations that would look poorly if interrupted.
             *      "default": "default-animation" // Optional. "default" is a special property that matches all states. If none of the above states are valid for the entity, it will use the default animation listed here.
             *  }
             *
             * If `stateBased` is `true` and this property is not set, this component will use the `animationMap` property value to define state mappings.
             *
             * @property animationStates
             * @type Object
             * @default animationMap
             */
            animationStates: null,

            /**
             * An object containg key-value pairs that define a mapping from triggered events to the animation that should play.
             *
             *     "animationEvents":{
             *         "move": "walk-animation",
             *         "jump": "jumping-animation"
             *     }
             *
             * The above will create two event listeners on the entity, "move" and "jump", that will play their corresponding animations when the events are triggered.
             *
             * If `eventBased` is `true` and this property is not set, this component will use the `animationMap` property value to define event mappings.
             *
             * @property animationEvents
             * @type Object
             * @default animationMap
             */
            animationEvents: null,

            /**
             * Optional. An object containing key-value pairs that define a mapping from triggered events or entity states to the animation that should play. The list is processed from top to bottom, so the most important actions should be listed first (for example, a jumping animation might take precedence over an idle animation). If not specified, an 1-to-1 animation map is created from the list of animations in the skeleton definition using the animation names as the keys.
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
            animationMap: null,

            /**
             * Optional. No, this isn't a Stephen R. Lawhead novel. Use this to specify a skin according to the entity's state.
             *
             *  "skinMap":{
             *      "cloaked": "cloak"  // On receiving a "cloaked" event, or when `this.owner.state.get('cloaked') === true`, this skin will be activated.
             *      "default": "normal_attire" // Optional. "default" is a special property that matches all states. If none of the above states are valid for the entity, it will use the default skin listed here.
             *  }
             *
             * @property skinMap
             * @type Object
             * @default null
             */
            skinMap: null,

            /**
             * The scaling factor for this sprite relative to the scale of the container.
             *
             * @property localScaleX
             * @type Number|Array|Object
             * @default 1
             */
            localScaleX: 1,

           /**
            * The scaling factor for this sprite relative to the scale of the container.
            *
            * @property localScaleY
            * @type Number|Array|Object
            * @default 1
            */
            localScaleY: 1,

            /**
             * Optional. A mask definition that determines where the image should clip. A string can also be used to create more complex shapes via the PIXI graphics API like: "mask": "r(10,20,40,40).drawCircle(30,10,12)". Defaults to no mask or, if simply set to true, a rectangle using the entity's dimensions.
             *
             *  "mask": {
             *      "x": 10,
             *      "y": 10,
             *      "width": 40,
             *      "height": 40
             *  },
             *
             *  -OR-
             *
             *  "mask": "r(10,20,40,40).drawCircle(30,10,12)"
             *
             * @property mask
             * @type Object
             * @default null
             */
            mask: null,

            /**
             * Defines whether the entity will respond to touch and click events. Setting this value will create an Interactive component on this entity with these properties. For example:
             *
             *  "interactive": {
             *      "hover": false,
             *      "hitArea": {
             *          "x": 10,
             *          "y": 10,
             *          "width": 40,
             *          "height": 40
             *      }
             *  }
             *
             * @property interactive
             * @type Boolean|Object
             * @default false
             */
            interactive: false,

            /**
             * Sets the transition time between animations. If a number is defined, the transition time applies to all animation changes. If an object is specified, the key value pairs should match this syntax where the first part of the key lists the animation currently playing and the second part of the key lists the animation being transitioned to:
             *
             *     {
             *         "jump:walk": 0.4,
             *         "walk:jump": 0.2
             *     }
             *
             * @property mixTimes
             * @type Number|Object
             * @default 0
             */
            mixTimes: 0,

            /**
             * The offset of the x-axis position of the sprite from the entity's x-axis position.
             *
             * @property offsetX
             * @type Number
             * @default 0
             */
            offsetX: 0,

            /**
             * The offset of the y-axis position of the sprite from the entity's y-axis position.
             *
             * @property offsetY
             * @type Number
             * @default 0
             */
            offsetY: 0,

            /**
             * The z-index relative to other render components on the entity.
             *
             * @property offsetZ
             * @type Number
             * @default 0
             */
            offsetZ: 0,

            /**
             * Text describing an atlas of graphic assets for the Spine animation or an asset id for the same.
             *
             * @property atlas
             * @type String
             * @default ""
             */
            atlas: "",

            /**
             * A JSON structure defining a Spine skeleton and behaviors for the animation, or an asset id for the same.
             *
             * @property skeleton
             * @type String|Object
             * @default null
             */
            skeleton: null,

            /**
             * Whether this object can be mirrored over X. To mirror it over X set the this.owner.rotation value to be > 90  and < 270.
             *
             * @property mirror
             * @type Boolean
             * @default false
             */
            mirror: false,

            /**
             * Optional. Whether this object can be flipped over Y. To flip it over Y set the this.owner.rotation to be > 180.
             *
             * @property flip
             * @type Boolean
             * @default false
             */
            flip: false,

            /**
             * Optional. Whether this object is visible or not. To change the visible value dynamically set this.owner.state.visible to true or false.
             *
             * @property visible
             * @type Boolean
             * @default false
             */
            visible: true,

            /**
             * Optional. Specifies whether this component should create a RenderAnimator component to listen to events matching the animationMap to animate. Set this to true if the component should animate for on events. Default is `false`.
             *
             * @property eventBased
             * @type Boolean
             * @default false
             */
            eventBased: false,

            /**
             * Optional. Specifies whether the spine image alpha has been premultiplied. Set this to `false` if you see bright borders around image parts. Make sure it's `true` if you see thin black lines around image pieces.
             *
             * @property preMultipliedAlpha
             * @type Boolean
             * @default true
             */
            preMultipliedAlpha: true,

            /**
             * Optional. Specifies whether this component should create a RenderAnimator component to handle changes in the entity's state that match the animationMap to animate. Set this to true if the component should animate based on `this.owner.state`. Default is `true`.
             *
             * @property stateBased
             * @type Boolean
             * @default true
             */
            stateBased: true
        },

        publicProperties: {
            /**
             * Prevents the spine from becoming invisible out of frame and losing mouse input connection.
             *
             * @property dragMode
             * @type Boolean
             * @default false
             */
            dragMode: false,

            /**
             * Optional. The X scaling factor for the image. Defaults to 1.
             *
             * @property scaleX
             * @type Number
             * @default 1
             */
            scaleX: 1,

            /**
             * Optional. The Y scaling factor for the image. Defaults to 1.
             *
             * @property scaleY
             * @type Number
             * @default 1
             */
            scaleY: 1,

            /**
             * Optional. The X swek factor of the sprite. Defaults to 0.
             *
             * @property skewX
             * @type Number
             * @default 0
             */
            skewX: 0,

            /**
             * Optional. The Y skew factor for the image. Defaults to 0.
             *
             * @property skewY
             * @type Number
             * @default 0
             */
            skewY: 0,

            /**
             * Optional. The x position of the entity. Defaults to 0.
             *
             * @property x
             * @type Number
             * @default 0
             */
            x: 0,
            
            /**
             * Optional. The y position of the entity. Defaults to 0.
             *
             * @property y
             * @type Number
             * @default 0
             */
            y: 0,
            
            /**
             * Optional. The z position of the entity. Defaults to 0.
             *
             * @property z
             * @type Number
             * @default 0
             */
            z: 0
        },

        /**
         * This component is attached to entities that will appear in the game world. It renders a spine-based puppet. It listens for messages triggered on the entity or changes in the logical state of the entity to play a corresponding animation.
         *
         * @memberof platypus.components
         * @uses platypus.Component
         * @constructs
         * @listens platypus.Entity#handle-render
         * @listens platypus.Entity#hide
         * @listens platypus.Entity#play-animation
         * @listens platypus.Entity#set-mix-times
         * @listens platypus.Entity#show
         * @listens platypus.Entity#state-changed
         * @listens platypus.Entity#stop-animation
         * @fires platypus.Entity#animation-ended
         * @fires platypus.Entity#update-animation
         */
        initialize: (function () {
            var
                createAnimationMap = function (animationMap, animations) {
                    var map  = null,
                        anim = '';

                    if (animationMap) {
                        return animationMap;
                    } else {
                        // Create 1-to-1 animation map since none was defined
                        map = {};
                        for (anim in animations) {
                            if (animations.hasOwnProperty(anim)) {
                                map[anim] = anim;
                            }
                        }
                        return map;
                    }
                },
                imageCallback = function (pma, loadFinished, line, callback) {
                    // Not sure if this handles memory well - keeping it in for now.
                    var baseTexture = getBaseTexture(line, pma);

                    callback(baseTexture);

                    if (baseTexture.isLoading) {
                        baseTexture.on('loaded', loadFinished);
                    } else {
                        loadFinished();
                    }
                },
                animationEnded = function (animationData) {
                    const
                        animationName = animationData.animation.name;
                        
                    if (this.playSequence) {
                        this.playIndex += 1;
                        if (this.playIndex < this.playSequence.length || this.loopSequence) {
                            this.playIndex = this.playIndex % this.playSequence.length;
                            this.innerPlayAnimation(this.playSequence[this.playIndex], false);
                        }
                    }

                    this.owner.triggerEvent('animation-ended', animationName);
                },
                handleSpineEvent = function (entry, event) {
                    var eventName = event.data.name;

                    if (this.playAnimation(eventName)) {
                        this.spine.update(0.000001);
                    }

                    this.owner.trigger(eventName, event.data);
                };
            
            return function (def, callback) {
                const PIXIspine = PIXI.spine,
                    core = PIXIspine && PIXIspine.core,
                    Spine = PIXIspine && PIXIspine.Spine;
                
                // If PIXI.spine is unavailable, this component doesn't work.
                if (!Spine || !core) {
                    platypus.debug.error('RenderSpine requires `PIXI.spine` to function.');
                    return false;
                } else {
                    const
                        TextureAtlas = core.TextureAtlas,
                        AtlasAttachmentLoader = core.AtlasAttachmentLoader,
                        SkeletonJson = core.SkeletonJson,
                        settings = platypus.game.settings,
                        atlas = settings.atlases[this.atlas],
                        skeleton = settings.skeletons[this.skeleton],
                        spineAtlas = new TextureAtlas(atlas, imageCallback.bind(null, this.preMultipliedAlpha, callback)),
                        spineJsonParser = new SkeletonJson(new AtlasAttachmentLoader(spineAtlas)),
                        skeletonData = spineJsonParser.readSkeletonData(skeleton),
                        spine = this.spine = new Spine(skeletonData),
                        map = createAnimationMap(this.animationMap, skeleton.animations);

                    let animation = '';

                    spine.state.addListener({
                        event: handleSpineEvent.bind(this),
                        complete: animationEnded.bind(this)
                    });
                    spine.autoUpdate = false;
    
                    this.stateBased = map && this.stateBased;
                    this.eventBased = map && this.eventBased;
                    if (map) {
                        const
                            definition = Data.setUp(
                                'animationEvents', this.eventBased ? this.animationEvents || map : null,
                                'animationStates', this.stateBased ? this.animationStates || map : null,
                                'forcePlayThrough', this.forcePlayThrough,
                                'component', this
                            );

                        this.owner.addComponent(new RenderAnimator(this.owner, definition));
                        definition.recycle();

                        animation = map.default || '';
                    }
    
                    // set up the mixes!
                    if (this.mixTimes) {
                        this.setMixTimes(this.mixTimes);
                    }
    
                    // play animation
                    this.currentAnimations = arrayCache.setUp();
                    if (animation) {
                        this.playAnimation(animation);
                    }

                    this.playSequence = null;
                    this.playIndex = 0;
    
                    spine.x = this.offsetX;
                    spine.y = this.offsetY;
                    spine.z = this.offsetZ;
                    spine.scale.x = this.localScaleX;
                    spine.scale.y = this.localScaleY;
    
                    if (this.skinMap) { // Set up skin map handling.
                        const switchSkin = function (skin) {
                                if (this.currentSkin !== skin) {
                                    this.currentSkin = skin;
                                    this.spine.skeleton.setSkin(null);
                                    //this.spine.skeleton.skin = null;
                                    this.spine.skeleton.setSlotsToSetupPose();
                                    this.spine.state.apply(this.spine.skeleton);
                                    if (skin) {
                                        this.spine.skeleton.setSkinByName(skin);
                                        this.spine.skeleton.setSlotsToSetupPose();
                                        //this.playAnimation(this.currentAnimations.join(';'));
                                        this.spine.state.apply(this.spine.skeleton);
                                    }
                                }
                            },
                            map = this.skinMap;
        
                        this.currentSkin = null;

                        //Handle Events:
                        if (this.eventBased) {
                            for (const state in map) {
                                if (map.hasOwnProperty(state)) {
                                    this.addEventListener(state, switchSkin.bind(this, map[state]));
                                }
                            }
                        }
        
                        //Handle States:
                        if (this.stateBased) {
                            this.state = this.owner.state;
                            this.stateChange = true; //Check state against entity's prior state to update skin if necessary on instantiation.
                            this.checkStates = arrayCache.setUp();
                            this.skins = arrayCache.setUp();

                            for (const state in map) {
                                if (map.hasOwnProperty(state)) {
                                    this.checkStates.push(createTest(state, map[state]));
                                    this.skins.push(state);
                                }
                            }

                            this.addEventListener('state-changed', () => {
                                this.stateChange = true;
                            });
                            this.addEventListener('handle-render', () => {
                                if (this.stateChange) {
                                    for (let i = 0; i < this.checkStates.length; i++) {
                                        const testCase = this.checkStates[i](this.state);

                                        if (testCase !== null) {
                                            switchSkin.call(this, testCase);
                                            break;
                                        }
                                    }
                                    this.stateChange = false;
                                }
                            });
                        }
                    }
    
                    if (!this.owner.container) {
                        const
                            definition = Data.setUp(
                                'interactive', this.interactive,
                                'mask', this.mask,
                                'mirror', this.mirror,
                                'flip', this.flip,
                                'visible', this.visible,
                                'cache', this.cache,
                                'ignoreOpacity', this.ignoreOpacity,
                                'scaleX', this.scaleX,
                                'scaleY', this.scaleY,
                                'skewX', this.skewX,
                                'skewY', this.skewY
                            );
                        this.owner.addComponent(new RenderContainer(this.owner, definition, this.addToContainer.bind(this)));
                        definition.recycle();
                    } else {
                        this.addToContainer();
                    }
                }

                return true; //using callback
            };
        }()),

        events: {
            "handle-render": function (renderData) {
                if (this.spine) {
                    this.owner.triggerEvent('update-animation', true);

                    this.spine.update(renderData.delta / 1000);
                }
            },

            /**
             * This sets the mix times.
             *
             * @event platypus.Entity#set-mix-times
             * @param mixTimes {Object} This matches the syntax required for this component's `mixTimes` property
             */
            "set-mix-times": function (mixTimes) {
                this.setMixTimes(mixTimes);
            },
            
            /**
             * This event makes the spine invisible.
             *
             * @event platypus.Entity#hide
             */
            "hide": function () {
                this.visible = false;
            },

            /**
             * This event makes the spine visible.
             *
             * @event platypus.Entity#show
             */
            "show": function () {
                this.visible = true;
            },

            "stop-animation": function (animation) {
                this.stopAnimation(animation);
            },
            
            "play-animation": function (animation, loop) {
                this.playAnimation(animation, loop);
            }
        },

        methods: {
            addToContainer: function () {
                var container = this.owner.container;

                container.addChild(this.spine);
            },
            
            playAnimation: function (animation, loop = true) {
                if (Array.isArray(animation)) {
                    if (animation !== this.playSequence) {
                        this.playSequence = animation;
                        this.playIndex = 0;
                        this.loopSequence = loop;
                        return this.innerPlayAnimation(animation[0], false);
                    } else {
                        return 0; //not sure if this is used
                    }
                } else {
                    this.playSequence = null;
                    this.playIndex = 0;
                    return this.innerPlayAnimation(animation, loop);
                }
            },

            innerPlayAnimation: function (animation, loop) {
                const spine = this.spine;
                let animated = 0,
                    remaining = animation;

                while (remaining) {
                    const
                        semicolon = remaining.indexOf(';'),
                        next = (semicolon >= 0) ? remaining.substring(0, semicolon) : remaining;
                    
                    remaining = (semicolon >= 0) ? remaining.substring(semicolon + 1) : '';

                    if (spine.state.hasAnimation(next)) {
                        this.currentAnimations[animated] = next;
                        spine.state.setAnimation(animated, next, loop);
                    }
                    animated += 1;
                }

                return animated;
            },

            stopAnimation: function (animation) {
                const spine = this.spine;
                let animated = 0,
                    remaining = animation;

                while (remaining) {
                    const
                        semicolon = remaining.indexOf(';'),
                        next = (semicolon >= 0) ? remaining.substring(0, semicolon) : remaining;
                    
                    remaining = (semicolon >= 0) ? remaining.substring(semicolon + 1) : '';

                    if (spine.state.hasAnimation(next)) {
                        this.currentAnimations[animated] = next;
                        spine.state.setAnimation(animated, next, false);
                    }
                    animated += 1;
                }

                this.paused = true;
                return animated;
            },

            setMixTimes: function (mixTimes) {
                var spine = this.spine,
                    animations = spine.spineData.animations,
                    colon = 0,
                    i = 0,
                    j = 0,
                    key = '',
                    stateData = spine.stateData;

                if (typeof mixTimes === 'number') {
                    i = animations.length;
                    while (i--) {
                        j = animations.length;
                        while (j--) {
                            if (i !== j) {
                                stateData.setMix(animations[i].name, animations[j].name, mixTimes);
                            }
                        }
                    }
                } else {
                    for (key in mixTimes) {
                        if (mixTimes.hasOwnProperty(key)) {
                            colon = key.indexOf(':');
                            if (colon >= 0) {
                                stateData.setMix(key.substring(0, colon), key.substring(colon + 1), mixTimes[key]);
                            }
                        }
                    }
                }

                this.mixTimes = stateData.animationToMixTime;
            },

            destroy: function () {
                this.owner.container.removeChild(this.spine);
                this.spine.destroy();
                this.spine = null;
                this.mixTimes = null;
            }
        },
        
        getAssetList: (function () {
            var
                getImages = function (atlas, atlases) {
                    const images = arrayCache.setUp();

                    if (atlas) {
                        const findReturns = /\r/g;
                        let lines = atlas.replace(findReturns, '').split('\n'),
                            j = lines.length;

                        if (lines.length === 1) { // id, not an actual atlas
                            atlas = atlases[atlas];
                            if (atlas) {
                                lines = atlas.replace(findReturns, '').split('\n');
                            } else {
                                return images;
                            }
                            j = lines.length;
                        }

                        while (j--) { // Fix up relative image location paths.
                            if (lines[j].substr(lines[j].length - 4) === '.png') {
                                images.push(lines[j]);
                            }
                        }
                    }

                    return images;
                };
            
            return function (component, props, defaultProps) {
                var arr = null,
                    i = 0,
                    images = null,
                    atlases = platypus.game.settings.atlases,
                    atlas = component.atlas || props.atlas || defaultProps.atlas;
                
                if (Array.isArray(atlas)) {
                    i = atlas.length;
                    images = arrayCache.setUp();
                    while (i--) {
                        arr = getImages(atlas[i], atlases);
                        union(images, arr);
                        arrayCache.recycle(arr);
                    }
                    return images;
                } else {
                    return getImages(atlas, atlases);
                }
            };
        }())
    });
})();
