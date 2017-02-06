/**
 * This component is attached to entities that will appear in the game world. It renders a spine-based puppet. It listens for messages triggered on the entity or changes in the logical state of the entity to play a corresponding animation.
 *
 * @namespace platypus.components
 * @class RenderSpine
 * @uses platypus.Component
 */
/* global include, platypus */
(function () {
    'use strict';

    var AABB = include('platypus.AABB'),
        Atlas = include('PIXI.spine.SpineRuntime.Atlas', false),
        AtlasAttachmentParser = include('PIXI.spine.SpineRuntime.AtlasAttachmentParser', false),
        BaseTexture = include('PIXI.BaseTexture'),
        Data = include('platypus.Data'),
        EventRender = include('platypus.components.EventRender'),
        Graphics = include('PIXI.Graphics'),
        Matrix = include('PIXI.Matrix'),
        SkeletonJsonParser = include('PIXI.spine.SpineRuntime.SkeletonJsonParser', false),
        Spine = include('PIXI.spine.Spine', false),
        StateRender = include('platypus.components.StateRender'),
        tempMatrix = new Matrix(),
        processGraphics = (function () {
            var process = function (gfx, value) {
                var i = 0,
                    paren  = value.indexOf('('),
                    func   = value.substring(0, paren),
                    values = value.substring(paren + 1, value.indexOf(')'));

                if (values.length) {
                    values = values.greenSplit(',');
                    i = values.length;
                    while (i--) {
                        values[i] = +values[i];
                    }
                    gfx[func].apply(gfx, values);
                    values.recycle();
                } else {
                    gfx[func]();
                }
            };

            return function (gfx, value) {
                var i = 0,
                    arr = value.greenSplit('.');

                for (i = 0; i < arr.length; i++) {
                    process(gfx, arr[i]);
                }
                
                arr.recycle();
            };
        }());
    
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
             * Optional. The offset of the z-index of the spine from the entity's z-index. Will default to 0.
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
                imageCallback = function (line, callback) {
                    // Not sure if this handles memory well - keeping it in for now.
                    callback(BaseTexture.fromImage(line));
                },
                animationEnded = function () {
                    /**
                     * This event fires each time an animation completes.
                     *
                     * @event 'animation-ended'
                     * @param animation {String} The id of the animation that ended.
                     */
                    this.owner.triggerEvent('animation-ended', this.currentAnimation);
                };
            
            return function () {
                var animation = '',
                    definition = null,
                    settings = platypus.game.settings,
                    atlas = settings.atlases[this.atlas],
                    map = null,
                    skeleton = settings.skeletons[this.skeleton],
                    spineAtlas = new Atlas(atlas, imageCallback),
                    spineJsonParser = new SkeletonJsonParser(new AtlasAttachmentParser(spineAtlas)),
                    skeletonData = spineJsonParser.readSkeletonData(skeleton),
                    spine = this.spine = new Spine(skeletonData);

                spine.transformMatrix = new Matrix();
                spine.state.onComplete = animationEnded.bind(this);

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

                this.parentContainer = null;
                this.wasVisible = this.visible;
                this.lastX = this.owner.x;
                this.lastY = this.owner.y;
                this.camera = AABB.setUp();
                this.affine = new Matrix();
                this.isOnCamera = true;

                if (this.interactive) {
                    definition = Data.setUp(
                        'container', this.spine,
                        'hitArea', this.interactive.hitArea,
                        'hover', this.interactive.hover
                    );
                    this.owner.addComponent(new platypus.components.Interactive(this.owner, definition));
                    definition.recycle();
                }

                // set up the mixes!
                if (this.mixTimes) {
                    this.setMixTimes(this.mixTimes);
                }

                // play animation
                if (animation) {
                    this.currentAnimation = animation;
                    spine.state.setAnimationByName(0, animation, true);
                }
            };
        }()),

        events: {
            /**
             * Listens for this event to determine whether this spine is visible.
             *
             * @method 'camera-update'
             * @param camera.viewport {platypus.AABB} Camera position and size.
             */
            "camera-update": function (camera) {
                this.camera.set(camera.viewport);
                
                // Set visiblity of sprite if within camera bounds
                if (this.spine) { //TODO: At some point, may want to do this according to window viewport instead of world viewport so that native PIXI bounds checks across the whole stage can be used. - DDD 9-21-15
                    this.checkCameraBounds();
                }
            },

            /**
             * A setup message used to add the spine to the stage. On receiving this message, the component sets its parent container to the stage contained in the message if it doesn't already have one.
             *
             * @method 'handle-render-load'
             * @param handlerData {Object} Data from the render handler
             * @param handlerData.container {PIXI.Container} The parent container.
             */
            "handle-render-load": function (handlerData) {
                if (!this.parentContainer && handlerData && handlerData.container) {
                    this.addStage(handlerData.container);
                    this.updateSprite(true); // Initial set up in case position, etc is needed prior to the first "render" event.
                }
            },

            /**
             * The render update message updates the spine.
             *
             * @method 'handle-render'
             * @param renderData {Object} Data from the render handler
             * @param renderData.container {PIXI.Container} The parent container.
             */
            "handle-render": function (renderData) {
                if (!this.spine) {
                    return;
                }

                if (!this.parentContainer && !this.addStage(renderData.container)) {
                    platypus.debug.warn('No PIXI Stage, removing render component from "' + this.owner.type + '".');
                    this.owner.removeComponent(this);
                    return;
                }

                this.updateSprite(true);
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
             * Defines the mask on the container/sprite. If no mask is specified, the mask is set to null.
             *
             * @method 'set-mask'
             * @param mask {Object} The mask. This can specified the same way as the 'mask' parameter on the component.
             */
            "set-mask": function (mask) {
                this.setMask(mask);
            },
            
            /**
             * Stops the sprite's animation.
             *
             * @method 'stop-animation'
             * @param [animation] {String} The animation to show and pause. If not specified, this method simply pauses the current animation.
             * @since 0.9.0
             */
            "stop-animation": function (animation) {
                var spine = this.spine;

                if (animation && spine.state.hasAnimationByName(animation)) {
                    this.currentAnimation = animation;
                    spine.state.setAnimationByName(0, animation, false);
                }

                this.paused = true;
            },
            
            /**
             * Starts the sprite's animation.
             *
             * @method 'play-animation'
             * @param [animation] {String} The animation to play. If not specified, this method simply unpauses the current animation.
             * @since 0.9.0
             */
            "play-animation": function (animation) {
                var spine = this.spine;

                if (animation && spine.state.hasAnimationByName(animation)) {
                    this.currentAnimation = animation;
                    spine.state.setAnimationByName(0, animation, true);
                }

                this.paused = false;
            }
        },

        methods: {
            addStage: function (stage) {
                if (stage) {
                    this.parentContainer = stage;
                    this.parentContainer.addChild(this.spine);

                    //Handle mask
                    if (this.mask) {
                        this.setMask(this.mask);
                    }

                    /**
                     * This event is triggered once the RenderSpine is ready to handle interactivity.
                     *
                     * @event 'input-on'
                     */
                    this.owner.triggerEvent('input-on');
                    return stage;
                } else {
                    return null;
                }
            },
            
            checkCameraBounds: function () {
                this.isOnCamera = this.owner.parent.isOnCanvas(this.instance.getBounds(false));
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
                                stateData.setMixByName(animations[i].name, animations[j].name, mixTimes);
                            }
                        }
                    }
                } else {
                    for (key in mixTimes) {
                        if (mixTimes.hasOwnProperty(key)) {
                            colon = key.indexOf(':');
                            if (colon >= 0) {
                                stateData.setMixByName(key.substring(0, colon), key.substring(colon + 1), mixTimes[key]);
                            }
                        }
                    }
                }

                this.mixTimes = stateData.animationToMixTime;
            },

            setMask: function (shape) {
                var gfx = null;
                
                if (this.mask && this.parentContainer) {
                    this.parentContainer.removeChild(this.mask);
                }
                
                if (!shape) {
                    this.mask = this.container.mask = null;
                    return;
                }
                
                if (shape instanceof Graphics) {
                    gfx = shape;
                } else {
                    gfx = new Graphics();
                    gfx.beginFill(0x000000, 1);
                    if (typeof shape === 'string') {
                        processGraphics(gfx, shape);
                    } else if (shape.radius) {
                        gfx.dc(shape.x || 0, shape.y || 0, shape.radius);
                    } else if (shape.width && shape.height) {
                        gfx.r(shape.x || 0, shape.y || 0, shape.width, shape.height);
                    }
                    gfx.endFill();
                }
                
                gfx.isMask = true;

                this.mask = this.container.mask = gfx;

                if (this.parentContainer) {
                    this.parentContainer.addChild(this.mask);
                }
            },

            updateSprite: function (playing) {
                var spine = this.spine,
                    m = this.affine.copy(spine.transformMatrix),
                    o = null,
                    temp = Matrix.TEMP_MATRIX;

                /**
                 * This event is triggered each tick to check for animation updates.
                 *
                 * @event 'update-animation'
                 * @param playing {Boolean} Whether the animation is in a playing or paused state.
                 */
                this.owner.triggerEvent('update-animation', playing);

                if (spine.z !== (this.owner.z + this.offsetZ)) {
                    if (this.parentContainer) {
                        this.parentContainer.reorder = true;
                    }
                    spine.z = (this.owner.z + this.offsetZ);
                }

                if (typeof this.owner.opacity === 'number') {
                    spine.alpha = this.owner.opacity;
                }

                if (this.owner.orientationMatrix) { // This is a 3x3 2D matrix describing an affine transformation.
                    o = this.owner.orientationMatrix;
                    temp.tx = o[0][2];
                    temp.ty = o[1][2];
                    temp.a = o[0][0];
                    temp.b = o[1][0];
                    temp.c = o[0][1];
                    temp.d = o[1][1];
                    m.prepend(temp);
                }
                
                temp.tx = this.owner.x;
                temp.ty = this.owner.y;
                temp.a = this.scaleX || 1;// * mirrored;
                temp.b = this.owner.skewX || 0;
                temp.c = this.owner.skewY || 0;
                temp.d = this.scaleY || 1;// * flipped;
                m.prepend(temp);

                // Set isCameraOn of sprite if within camera bounds
                if (((!this.wasVisible && this.visible) || this.lastX !== this.owner.x || this.lastY !== this.owner.y)) {
                    //TODO: This check is running twice when an object is moving and the camera is moving.
                    //Find a way to remove the duplication!
                    this.checkCameraBounds();
                }
                this.lastX = this.owner.x;
                this.lastY = this.owner.y;
                this.wasVisible = this.visible;
                this.spine.visible = (this.visible && this.isOnCamera) || this.dragMode;
            },

            destroy: function () {
                this.camera.recycle();
                if (this.parentContainer && !this.spine.mouseTarget) {
                    this.parentContainer.removeChild(this.spine);
                    this.parentContainer = null;
                    this.spine.destroy();
                }
                this.spine = null;
                this.mixTimes = null;
            }
        },
        
        getAssetList: (function () {
            var
                getImages = function (atlas, atlases) {
                    var end = 0;

                    if (atlas) {
                        end = atlas.indexOf('\n');
                        if (end < 0) {
                            return getImages(atlases[atlas], atlases);
                        } else {
                            return Array.setUp(atlas.substring(0, end).replace('\r', ''));
                        }
                    }

                    return Array.setUp();
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
