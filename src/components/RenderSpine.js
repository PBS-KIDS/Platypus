/**
 * This component is attached to entities that will appear in the game world. It renders a spine-based puppet. It listens for messages triggered on the entity or changes in the logical state of the entity to play a corresponding animation.
 *
 * @namespace platypus.components
 * @class RenderSpine
 * @uses platypus.Component
 */
/* global PIXI, platypus */
import Data from '../Data.js';
import EventRender from './EventRender.js';
import RenderContainer from './RenderContainer.js';
import StateRender from './StateRender.js';

export default (function () {
    var spine = PIXI.spine,
        core = spine && spine.core,
        TextureAtlas = core && core.TextureAtlas,
        AtlasAttachmentLoader = core && core.AtlasAttachmentLoader,
        BaseTexture = PIXI.BaseTexture,
        SkeletonJson = core && core.SkeletonJson,
        Spine = spine && spine.Spine,
        getBaseTexture = function (path) {
            var asset = platypus.assetCache.get(path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.')));
            
            if (!asset) {
                platypus.debug.warn('RenderSpine: "' + path + '" is not a loaded asset.');
            }
            return new BaseTexture(asset);
        };
    
    // If PIXI.spine is unavailable, this component doesn't work.
    if (!Spine) {
        return function () {
            platypus.debug.error('RenderSpine requires `PIXI.spine` to function.');
        };
    }

    return platypus.createComponentClass({

        id: 'RenderSpine',

        properties: {
            /**
             * Optional. An object containg key-value pairs that define a mapping from triggered events or entity states to the animation that should play. The list is processed from top to bottom, so the most important actions should be listed first (for example, a jumping animation might take precedence over an idle animation). If not specified, an 1-to-1 animation map is created from the list of animations in the skeleton definition using the animation names as the keys.
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
             * Optional. A mask definition that determines where the image should clip. A string can also be used to create more complex shapes via the PIXI graphics API like: "mask": "r(10,20,40,40).dc(30,10,12)". Defaults to no mask or, if simply set to true, a rectangle using the entity's dimensions.
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
             *  "mask": "r(10,20,40,40).dc(30,10,12)"
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
             * @since 0.11.4
             */
            offsetX: 0,

            /**
             * The offset of the y-axis position of the sprite from the entity's y-axis position.
             *
             * @property offsetY
             * @type Number
             * @default 0
             * @since 0.11.4
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
             * Optional. Whether this object can be rotated. It's rotational angle is set by setting the this.owner.rotation value on the entity.
             *
             * @property rotate
             * @type Boolean
             * @default false
             */
            rotate: false,

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
             * Optional. Specifies whether this component should create an EventRender component to listen to events matching the animationMap to animate. Set this to true if the component should animate for on events. Default is `false`.
             *
             * @property eventBased
             * @type Boolean
             * @default false
             */
            eventBased: false,

            /**
             * Optional. Specifies whether this component should create a StateRender component to handle changes in the entity's state that match the animationMap to animate. Set this to true if the component should animate based on `this.owner.state`. Default is `true`.
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
             * Optional. The rotation of the spine in degrees. All spines on the same entity are rotated the same amount unless they ignore the rotation value by setting 'rotate' to false.
             *
             * @property rotation
             * @type Number
             * @default 1
             */
            rotation: 0,

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
                imageCallback = function (loadFinished, line, callback) {
                    // Not sure if this handles memory well - keeping it in for now.
                    var baseTexture = getBaseTexture(line);

                    callback(baseTexture);

                    if (baseTexture.isLoading) {
                        baseTexture.on('loaded', loadFinished);
                    } else {
                        loadFinished();
                    }
                },
                animationEnded = function () {
                    /**
                     * This event fires each time an animation completes.
                     *
                     * @event 'animation-ended'
                     * @param animation {String} The id of the animation that ended.
                     */
                    this.owner.triggerEvent('animation-ended', this.currentAnimation);
                },
                handleSpineEvent = function (entry, event) {
                    var eventName = event.data.name;

                    if (this.playAnimation(eventName)) {
                        this.spine.update(0.000001);
                    }

                    this.owner.trigger(eventName, event.data);
                };
            
            return function (def, callback) {
                var animation = '',
                    definition = null,
                    settings = platypus.game.settings,
                    atlas = settings.atlases[this.atlas],
                    map = null,
                    skeleton = settings.skeletons[this.skeleton],
                    spineAtlas = new TextureAtlas(atlas, imageCallback.bind(null, callback)),
                    spineJsonParser = new SkeletonJson(new AtlasAttachmentLoader(spineAtlas)),
                    skeletonData = spineJsonParser.readSkeletonData(skeleton),
                    spine = this.spine = new Spine(skeletonData);

                spine.state.addListener({
                    event: handleSpineEvent.bind(this),
                    complete: animationEnded.bind(this)
                });
                spine.autoUpdate = false;

                map = createAnimationMap(this.animationMap, skeleton.animations);
                this.stateBased = map && this.stateBased;
                this.eventBased = map && this.eventBased;
                if (map) {
                    animation = map.default || '';

                    if (this.eventBased) {
                        definition = Data.setUp(
                            'animationMap', map,
                            'component', this
                        );
                        this.owner.addComponent(new EventRender(this.owner, definition));
                        definition.recycle();
                    }

                    if (this.stateBased) {
                        definition = Data.setUp(
                            'animationMap', map,
                            'forcePlayThrough', this.forcePlayThrough,
                            'component', this
                        );
                        this.owner.addComponent(new StateRender(this.owner, definition));
                        definition.recycle();
                    }
                }

                // set up the mixes!
                if (this.mixTimes) {
                    this.setMixTimes(this.mixTimes);
                }

                // play animation
                if (animation) {
                    this.currentAnimation = animation;
                    spine.state.setAnimation(0, animation, true);
                }

                spine.x = this.offsetX;
                spine.y = this.offsetY;
                spine.z = this.offsetZ;

                if (!this.owner.container) {
                    definition = Data.setUp(
                        'interactive', this.interactive,
                        'mask', this.mask,
                        'rotate', this.rotate,
                        'mirror', this.mirror,
                        'flip', this.flip,
                        'visible', this.visible,
                        'cache', this.cache,
                        'ignoreOpacity', this.ignoreOpacity,
                        'scaleX', this.scaleX,
                        'scaleY', this.scaleY,
                        'skewX', this.skewX,
                        'skewY', this.skewY,
                        'rotation', this.rotation
                    );
                    this.owner.addComponent(new RenderContainer(this.owner, definition, this.addToContainer.bind(this)));
                    definition.recycle();
                } else {
                    this.addToContainer();
                }

                return true; //using callback
            };
        }()),

        events: {
            /**
             * The render update message updates the spine.
             *
             * @method 'handle-render'
             * @param renderData {Object} Data from the render handler
             * @param renderData.container {PIXI.Container} The parent container.
             */
            "handle-render": function (renderData) {
                if (this.spine) {
                    /**
                     * This event is triggered each tick to check for animation updates.
                     *
                     * @event 'update-animation'
                     * @param playing {Boolean} Whether the animation is in a playing or paused state.
                     */
                    this.owner.triggerEvent('update-animation', true);

                    this.spine.update(renderData.delta / 1000);
                }
            },

            /**
             * This sets the mix times.
             *
             * @method 'set-mix-times'
             * @param mixTimes {Object} This matches the syntax required for this component's `mixTimes` property
             */
            "set-mix-times": function (mixTimes) {
                this.setMixTimes(mixTimes);
            },
            
            /**
             * This event makes the spine invisible.
             *
             * @method 'hide'
             */
            "hide": function () {
                this.visible = false;
            },

            /**
             * This event makes the spine visible.
             *
             * @method 'show'
             */
            "show": function () {
                this.visible = true;
            },

            /**
             * Stops the sprite's animation.
             *
             * @method 'stop-animation'
             * @param [animation] {String} The animation to show and pause. If not specified, this method simply pauses the current animation.
             * @since 0.9.0
             */
            "stop-animation": function (animation) {
                this.stopAnimation(animation);
            },
            
            /**
             * Starts the sprite's animation.
             *
             * @method 'play-animation'
             * @param [animation] {String} The animation to play. If not specified, this method simply unpauses the current animation.
             * @since 0.9.0
             */
            "play-animation": function (animation) {
                this.playAnimation(animation);
            }
        },

        methods: {
            addToContainer: function () {
                var container = this.owner.container;

                container.addChild(this.spine);
                container.reorder = true;
            },
            
            playAnimation: function (animation) {
                var spine = this.spine;

                if (animation && spine.state.hasAnimation(animation)) {
                    this.currentAnimation = animation;
                    spine.state.setAnimation(0, animation, true);
                    this.paused = false;

                    return true;
                }

                return false;
            },

            stopAnimation: function (animation) {
                var spine = this.spine;

                if (animation && spine.state.hasAnimation(animation)) {
                    this.currentAnimation = animation;
                    spine.state.setAnimation(0, animation, false);
                }

                this.paused = true;
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
                    var images = Array.setUp(),
                        lines = null,
                        j = 0;

                    if (atlas) {
                        lines = atlas.split('\n');
                        if (lines.length === 1) { // id, not an actual atlas
                            atlas = atlases[atlas];
                            if (atlas) {
                                lines = atlas.split('\n');
                            } else {
                                return images;
                            }
                        }
                        j = lines.length;
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
                    images = Array.setUp();
                    while (i--) {
                        arr = getImages(atlas[i], atlases);
                        images.union(arr);
                        arr.recycle();
                    }
                    return images;
                } else {
                    return getImages(atlas, atlases);
                }
            };
        }())
    });
})();
