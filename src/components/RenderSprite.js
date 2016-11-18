/**
 * This component is attached to entities that will appear in the game world. It renders a static or animated image. It listens for messages triggered on the entity or changes in the logical state of the entity to play a corresponding animation.
 *
 * @namespace platypus.components
 * @class RenderSprite
 * @uses platypus.Component
 */
/* global include, platypus */
(function () {
    'use strict';
    
    var AABB = include('platypus.AABB'),
        Data = include('platypus.Data'),
        EventRender = include('platypus.components.EventRender'),
        Graphics = include('PIXI.Graphics'),
        Interactive = include('platypus.components.Interactive'),
        PIXIAnimation = include('platypus.PIXIAnimation'),
        StateRender = include('platypus.components.StateRender'),
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
    
    return platypus.createComponentClass({
        
        id: 'RenderSprite',
        
        properties: {
           /**
             * spriteSheet can either be a String or an object. If a string, the spritesheet data will be loaded from the file with a matching name in the spritesheet folder. Otherwise the definition is in full here. That spritesheet data defines an EaselJS sprite sheet to use for rendering. See http://www.createjs.com/Docs/EaselJS/SpriteSheet.html for the full specification.
             *
             *  "spriteSheet": 'hero-image'
             *
             *  -OR-
             *
             *  "spriteSheet": {
             *
             *      "images": ["example0", "example1"], //Can also define 'image' and give the
             *      "frames": {
             *          "width":  100,
             *          "height": 100,
             *          "regY":   100,
             *          "regX":   50
             *      },
             *      "animations":{
             *          "default-animation":[2],
             *          "walking": {"frames": [0, 1, 2], "speed": 4},
             *          "swing": {"frames": [3, 4, 5], "speed": 4}
             *      }
             *  }
             *
             *  -OR- an Array of the above (since 0.8.4)
             *
             * @property spriteSheet
             * @type String|Array|Object
             * @default null
             */
            spriteSheet: null,

            /**
             * Optional. An object containg key-value pairs that define a mapping from triggered events or entity states to the animation that should play. The list is processed from top to bottom, so the most important actions should be listed first (for example, a jumping animation might take precedence over an idle animation). If not specified, an 1-to-1 animation map is created from the list of animations in the sprite sheet definition using the animation names as the keys.
             *
             *     "animationMap":{
             *         "standing": "default-animation"  // On receiving a "standing" event, or when this.owner.state.standing === true, the "default" animation will begin playing.
             *         "ground,moving": "walking",  // Comma separated values have a special meaning when evaluating "state-changed" messages. The above example will cause the "walking" animation to play ONLY if the entity's state includes both "moving" and "ground" equal to true.
             *         "ground,striking": "swing!", // Putting an exclamation after an animation name causes this animation to complete before going to the next animation. This is useful for animations that would look poorly if interrupted.
             *         "default": "default-animation" // Optional. "default" is a special property that matches all states. If none of the above states are valid for the entity, it will use the default animation listed here.
             *     }
             *
             * This data is used to create EventRender or StateRender components on the entity if the `eventBased` or `stateBased` properties are set to `true`.
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
             * @since 0.9.0
             */
            interactive: false,

            /**
             * This property's functionality is now provided by the `interactive` property.
             *
             * @property acceptInput
             * @type Object
             * @default null
             * @deprecated since 0.9.0
             */
            acceptInput: null,

            /**
             * Optional. The offset of the z-index of the sprite from the entity's z-index. Will default to 0.
             *
             * @property offsetZ
             * @type Number
             * @default 0
             */
            offsetZ: 0,

            /**
             * Whether to restart a playing animation on event.
             *
             * @property restart
             * @type Boolean
             * @default true
             * @since 0.9.2
             */
            restart: true,

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
            stateBased: true,

            /**
             * Optional. Whether this sprite should be cached into an entity with a `RenderTiles` component (like "render-layer"). The `RenderTiles` component must have its "entityCache" property set to `true`. Warning! This is a one-direction setting and will remove this component from the entity once the current frame has been cached.
             *
             * @property cache
             * @type Boolean
             * @default false
             */
            cache: false,

            /**
             * Optional. When using state-based animations, forces animations to complete before starting a new animation. Defaults to false.
             *
             * @property forcePlayThrough
             * @type Boolean
             * @default false
             */
            forcePlayThrough: false,

            /**
             * Optional. Ignores the opacity of the owner. Used when multiple RenderSprite components are on the same entity.
             *
             * @property ignoreOpacity
             * @type Boolean
             * @default false
             */
            ignoreOpacity: false
        },

        publicProperties: {
            /**
             * Prevents sprite from becoming invisible out of frame and losing mouse input connection.
             *
             * @property dragMode
             * @type Boolean
             * @default false
             * @since 0.8.3
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
             * Optional. The X skew factor of the sprite. Defaults to 0.
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
             * Optional. The rotation of the sprite in degrees. All sprites on the same entity are rotated the same amount unless they ignore the rotation value by setting 'rotate' to false.
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
        
        constructor: (function () {
            var
                createAnimationMap = function (animationMap, ss) {
                    var map  = null,
                        anim = '';

                    if (animationMap) {
                        return animationMap;
                    } else if (Array.isArray(ss.frames) && (ss.frames.length === 1)) {
                        // This is a single frame animation, so no mapping is necessary
                        return null;
                    } else {
                        // Create 1-to-1 animation map since none was defined
                        map = {};
                        for (anim in ss.animations) {
                            if (ss.animations.hasOwnProperty(anim)) {
                                map[anim] = anim;
                            }
                        }
                        return map;
                    }
                },
                animationEnded = function (animation) {
                    /**
                     * This event fires each time an animation completes.
                     *
                     * @event 'animation-ended'
                     * @param animation {String} The id of the animation that ended.
                     */
                    this.owner.triggerEvent('animation-ended', animation);
                };
            
            return function () {
                var animation = '',
                    definition = null,
                    ss = PIXIAnimation.formatSpriteSheet(this.spriteSheet),
                    map  = null;

                if (this.acceptInput) {
                    platypus.debug.warn('Entity "' + this.owner.type + '": RenderSprite "acceptInput" property has been deprecated since 0.9.0 in favor of the "interactive" property which adds an "Interactive" component to the entity to handle input.');
                    this.interactive = this.interactive || this.acceptInput;
                }
                
                if (ss === PIXIAnimation.EmptySpriteSheet) {
                    platypus.debug.warn('Entity "' + this.owner.type + '": RenderSprite sprite sheet not defined.');
                }
                
                map = createAnimationMap(this.animationMap, ss);
                this.stateBased = map && this.stateBased;
                this.eventBased = map && this.eventBased;
                if (map) {
                    animation = map.default || '';

                    if (this.eventBased) {
                        definition = Data.setUp(
                            'animationMap', map,
                            'restart', this.restart,
                            'component', this
                        );
                        this.owner.addComponent(new EventRender(this.owner, definition));
                        definition.recycle();
                    }

                    if (this.stateBased) {
                        definition = Data.setUp(
                            'animationMap', map,
                            'forcePlayThrough', this.forcePlayThrough
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
                this.isOnCamera = true;

                /*
                 * PIXIAnimation created here:
                 */
                this.sprite = new PIXIAnimation(ss, animation);
                this.sprite.on('complete', animationEnded.bind(this));
    
                /* These next few need this.sprite set up */
                
                //handle hitArea
                if (this.interactive) {
                    definition = Data.setUp(
                        'container', this.sprite,
                        'hitArea', this.interactive.hitArea,
                        'hover', this.interactive.hover
                    );
                    this.owner.addComponent(new Interactive(this.owner, definition));
                    definition.recycle();
                }
    
                if (this.cache) {
                    this.updateSprite(false);
                    this.owner.cacheRender = this.sprite;
                }
                
                ss.recycleSpriteSheet();
            };
        }()),
        
        events: {
            /**
             * On receiving a "cache" event, this component triggers "cache-sprite" to cache its rendering into the background. This is an optimization for static images to reduce render calls.
             *
             * @method 'cache'
             */
            "cache": function () {
                this.updateSprite(false);
                this.owner.cacheRender = this.sprite;
                this.cache = true;
                if (this.owner.parent && this.owner.parent.triggerEventOnChildren) {
                    /**
                     * On receiving a "cache" event, this component triggers "cache-sprite" to cache its rendering into the background. This is an optimization for static images to reduce render calls.
                     *
                     * @event 'cache-sprite'
                     * @param entity {platypus.Entity} This component's owner.
                     */
                    this.owner.parent.triggerEventOnChildren('cache-sprite', this.owner);
                } else {
                    platypus.debug.warn('Unable to cache sprite for ' + this.owner.type);
                }
            },

            /**
             * Listens for this event to determine whether this sprite is visible.
             *
             * @method 'camera-update'
             * @param camera.viewport {platypus.AABB} Camera position and size.
             */
            "camera-update": function (camera) {
                this.camera.set(camera.viewport);
                
                // Set visiblity of sprite if within camera bounds
                if (this.sprite) { //TODO: At some point, may want to do this according to window viewport instead of world viewport so that native PIXI bounds checks across the whole stage can be used. - DDD 9-21-15
                    this.checkCameraBounds();
                }
            },
            
            /**
             * A setup message used to add the sprite to the stage. On receiving this message, the component sets its parent container to the stage contained in the message if it doesn't already have one.
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
             * The render update message updates the sprite. If a sprite doesn't have a container, it's removed.
             *
             * @method 'handle-render'
             * @param renderData {Object} Data from the render handler
             * @param renderData.container {PIXI.Container} The parent container.
             */
            "handle-render": function (renderData) {
                if (!this.sprite) { // If this component's removal is pending
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
             * This event makes the sprite invisible.
             *
             * @method 'hide-sprite'
             */
            "hide-sprite": function () {
                this.visible = false;
            },

            /**
             * This event makes the sprite visible.
             *
             * @method 'show-sprite'
             */
            "show-sprite": function () {
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
                var sprite = this.sprite;

                if (animation && sprite.has(animation)) {
                    sprite.gotoAndStop(animation);
                } else {
                    sprite.stop();
                }
            },
            
            /**
             * Starts the sprite's animation.
             *
             * @method 'play-animation'
             * @param [animation] {String} The animation to play. If not specified, this method simply unpauses the current animation.
             * @since 0.9.0
             */
            "play-animation": function (animation, restart) {
                this.playAnimation(animation, restart);
            },
            
            /**
             * Stops the sprite's animation.
             *
             * @method 'stop-sprite'
             * @deprecated since 0.9.0
             */
            "stop-sprite": function () {
                this.sprite.stop();
            },
            
            /**
             * Starts the sprite's animation.
             *
             * @method 'play-sprite'
             * @deprecated since 0.9.0
             */
            "play-sprite": function () {
                this.sprite.play();
            }
        },
        
        methods: {
            checkCameraBounds: function () {
                this.isOnCamera = this.owner.parent.isOnCanvas(this.sprite.getBounds(false));
            },
            
            addStage: function (stage) {
                if (stage) {
                    this.parentContainer = stage;
                    this.parentContainer.addChild(this.sprite);

                    //Handle mask
                    if (this.mask) {
                        this.setMask(this.mask);
                    }

                    /**
                     * This event is triggered once the RenderSprite is ready to handle interactivity.
                     *
                     * @event 'input-on'
                     */
                    this.owner.triggerEvent('input-on');
                    return stage;
                } else {
                    return null;
                }
            },
            
            updateSprite: (function () {
                var sort = function (a, b) {
                    return a.z - b.z;
                };
                
                return function (playing) {
                    var x = 0,
                        y = 0,
                        o = this.owner.orientationMatrix,
                        rotation = 0,
                        mirrored = 1,
                        flipped  = 1,
                        angle    = null;
                    
                    x = this.owner.x;
                    y = this.owner.y;
                    if (this.rotate) {
                        rotation = this.rotation;
                    }
                    if (this.sprite.z !== (this.owner.z + this.offsetZ)) {
                        if (this.parentContainer) {
                            this.parentContainer.reorder = true;
                        }
                        this.sprite.z = (this.owner.z + this.offsetZ);
                    }

                    if (!this.ignoreOpacity && (this.owner.opacity || (this.owner.opacity === 0))) {
                        this.sprite.alpha = this.owner.opacity;
                    }
                    
                    if (this.sprite.reorder) {
                        this.sprite.reorder = false;
                        this.sprite.children.sort(sort);
                    }
                    
                    if (this.mirror || this.flip) {
                        angle = this.rotation % 360;
                        
                        if (this.mirror && (angle > 90) && (angle < 270)) {
                            mirrored = -1;
                        }
                        
                        if (this.flip && (angle < 180)) {
                            flipped = -1;
                        }
                    }
                    
                    /**
                     * This event is triggered each tick to check for animation updates.
                     *
                     * @event 'update-animation'
                     * @param playing {Boolean} Whether the animation is in a playing or paused state.
                     */
                    this.owner.triggerEvent('update-animation', playing);

                    if (o) { // This is a 3x3 2D matrix describing an affine transformation.
                        this.sprite.setTransform(o[0][2], o[1][2], o[0][0], o[1][1], (rotation ? (rotation / 180) * Math.PI : 0), o[1][0], o[0][1]);
                    } else {
                        this.sprite.setTransform(x, y, this.scaleX * mirrored, this.scaleY * flipped, (rotation ? (rotation / 180) * Math.PI : 0), this.skewX, this.skewY);
                    }
                    
                    // Set isCameraOn of sprite if within camera bounds
                    if (this.sprite && ((!this.wasVisible && this.visible) || this.lastX !== this.owner.x || this.lastY !== this.owner.y)) {
                        //TODO: This check is running twice when an object is moving and the camera is moving.
                        //Find a way to remove the duplication!
                        this.checkCameraBounds();
                    }
                    this.lastX = this.owner.x;
                    this.lastY = this.owner.y;
                    this.wasVisible = this.visible;
                    this.sprite.visible = (this.visible && this.isOnCamera) || this.dragMode;
                };
            }()),
            
            playAnimation: function (animation, restart) {
                var sprite = this.sprite;

                if (animation && sprite.has(animation)) {
                    sprite.gotoAndPlay(animation, restart);
                } else {
                    sprite.play();
                }
            },

            setMask: function (shape) {
                var gfx = null;
                
                if (this.mask && this.parentContainer) {
                    this.parentContainer.removeChild(this.mask);
                }
                
                if (!shape) {
                    this.mask = this.sprite.mask = null;
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

                this.mask = this.sprite.mask = gfx;
                this.mask.z = 0; //TML 12-4-16 - Masks don't need a Z, but this makes it play nice with the Z-ordering in HandlerRender.

                if (this.parentContainer) {
                    this.parentContainer.addChild(this.mask);
                }
            },
            
            destroy: function () {
                this.camera.recycle();
                if (this.parentContainer && !this.sprite.mouseTarget) {
                    this.parentContainer.removeChild(this.sprite);
                    this.parentContainer = null;
                } else if (!this.cache) {
                    this.sprite.destroy();
                }
                this.sprite = null;
            }
        },
        
        getAssetList: (function () {
            var
                getImages = function (ss, spriteSheets) {
                    if (ss) {
                        if (typeof ss === 'string') {
                            return getImages(spriteSheets[ss], spriteSheets);
                        } else if (ss.images) {
                            return ss.images.greenSlice();
                        }
                    }

                    return Array.setUp();
                };
            
            return function (component, props, defaultProps) {
                var arr = null,
                    i = 0,
                    images = null,
                    spriteSheets = platypus.game.settings.spriteSheets,
                    ss = component.spriteSheet || props.spriteSheet || defaultProps.spriteSheet;
                
                if (Array.isArray(ss)) {
                    i = ss.length;
                    images = Array.setUp();
                    while (i--) {
                        arr = getImages(ss[i], spriteSheets);
                        images.union(arr);
                        arr.recycle();
                    }
                    return images;
                } else {
                    return getImages(ss, spriteSheets);
                }
            };
        }())
    });
}());
