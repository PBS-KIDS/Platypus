/**
 * This component is attached to entities that will appear in the game world. It renders a static or animated image. It listens for messages triggered on the entity or changes in the logical state of the entity to play a corresponding animation.
 *
 * @namespace platypus.components
 * @class RenderSprite
 * @uses Component
 */
/*global console, PIXI, platypus */
/*jslint plusplus:true */
(function () {
    "use strict";
    
    var ssCache = {},
        changeState = function (state) {
            return function (value) {
                //9-23-13 TML - Commenting this line out to allow animation events to take precedence over the currently playing animation even if it's the same animation. This is useful for animations that should restart on key events.
                //                We may eventually want to add more complexity that would allow some animations to be overridden by messages and some not.
                //if (this.currentAnimation !== state) {
                if (this.animationFinished || (this.lastState >= -1)) {
                    this.currentAnimation = state;
                    this.lastState = -1;
                    this.animationFinished = false;
                    this.sprite.gotoAndPlay(state);
                } else {
                    this.waitingAnimation = state;
                    this.waitingState = -1;
                }
                //}
            };
        },
        createTest = function (testStates, animation) {
            var i = 0,
                states = testStates.replace(/ /g, '').split(',');
            
            if (testStates === 'default') {
                return function (state) {
                    return animation;
                };
            } else {
                return function (state) {
                    for (i = 0; i < states.length; i++) {
                        if (!state[states[i]]) {
                            return false;
                        }
                    }
                    return animation;
                };
            }
        },
        processGraphics = (function () {
            var process = function (gfx, value) {
                var paren  = value.indexOf('('),
                    func   = value.substring(0, paren),
                    values = value.substring(paren + 1, value.indexOf(')'));

                if (values.length) {
                    gfx[func].apply(gfx, values.split(','));
                } else {
                    gfx[func]();
                }
            };

            return function (gfx, value) {
                var i = 0,
                    arr = value.split('.');

                for (i = 0; i < arr.length; i++) {
                    process(gfx, arr[i]);
                }
            };
        }());
    
    return platypus.createComponentClass({
        
        id: 'RenderSprite',
        
        properties: {

            /**
             * The id of the image. Unless otherwise defined the image id is the the name of the image. image is only used when there is no spritesheet. It is useful for files containing a single image.
             *
             * @property image
             * @type String
             * @default null
             */
            image: null,

            /**
             * The x registration point of the image. Used when you don't a spritesheet and are using the image property.
             *
             * @property regX
             * @type Number
             * @default 0
             */
            regX: 0,

            /**
             * The y registration point of the image. Used when you don't a spritesheet and are using the image property.
             *
             * @property regY
             * @type Number
             * @default 0
             */
            regY: 0,

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
             * @property spriteSheet
             * @type String or Object
             * @default null
             */
            spriteSheet: null,

            /**
             * Optional. An object containg key-value pairs that define a mapping from triggered events or entity states to the animation that should play. The list is processed from top to bottom, so the most important actions should be listed first (for example, a jumping animation might take precedence over an idle animation). If not specified, an 1-to-1 animation map is created from the list of animations in the sprite sheet definition using the animation names as the keys.
             *
             *  "animationMap":{
             *      "standing": "default-animation"  // On receiving a "standing" event, or when this.owner.state.standing === true, the "default" animation will begin playing.
             *      "ground,moving": "walking",  // Comma separated values have a special meaning when evaluating "state-changed" messages. The above example will cause the "walking" animation to play ONLY if the entity's state includes both "moving" and "ground" equal to true.
             *      "ground,striking": "swing!", // Putting an exclamation after an animation name causes this animation to complete before going to the next animation. This is useful for animations that would look poorly if interrupted.
             *      "default": "default-animation" // Optional. "default" is a special property that matches all states. If none of the above states are valid for the entity, it will use the default animation listed here.
             *  }
             *
             *
             * @property animationMap
             * @type Object
             * @default null
             */
            animationMap: null,

            /**
             * Optional. A mask definition that determines where the image should clip. A string can also be used to create more complex shapes via the CreateJS graphics API like: "mask": "r(10,20,40,40).dc(30,10,12)". Defaults to no mask or, if simply set to true, a rectangle using the entity's dimensions.
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
             * Optional. Defines what types of input the entity will take. Defaults to no input. A hitArea can be defined that determines where on the image should be clickable. A string can also be used to create more complex shapes via the CreateJS graphics API like: "hitArea": "r(10,20,40,40).dc(30,10,12)". Defaults to this component's image if not specified or, if simply set to `true`, a rectangle using the entity's dimensions.
             *
             *
             *  "acceptInput": {
             *      "hover": false,
             *      "click": false,
             *      "hitArea": {
             *          "x": 10,
             *          "y": 10,
             *          "width": 40,
             *          "height": 40
             *      }
             *
             *      -OR-
             *
             *      "hitArea": "r(10,20,40,40).dc(30,10,12)"
             *  }
             *
             * @property acceptInput
             * @type Object
             * @default null
             */
            acceptInput: null,

            /**
             * Optional. Defines locations where other sprites on this entity can pin themselves to this sprite. This is useful for puppet-like dynamics. Each pin location has an id, which is used in the 'pinTo' property of another sprite to define where it connects. A pin location is defined as a set of (x,y,z) coordinates or, for moving pins, as a collection of (x,y,z) coordinates cooresponding to frames in the spritesheet. These coordinates are relative to the top-left corner of the sprite.
             *
             *  "pinLocations": [{
             *      "pinId": "head",
             *      "x": 15,
             *      "y": -30,
             *      "z": 1,
             *
             *      -AND/OR one of the following two-
             *
             *      "frames": {"0": {"x": 12, "y": -32}, "3": {"x": 12}}  //The keys specify the the frame to match the pin to. If a frame doesn't have coordinates or a parameter is undefined, the x/y/z values above are used. If they're not specified, the pinned sprite is hidden.
             *
             *      "frames": [{"x": 12, "y": -32}, null, {"x": 12}]  //In this format, we assume the indexes of the array match those of the frames. If a given index is null or a parameter is undefined, the x/y/z values above are used. If they're not specified, the pinned sprite is hidden.
             *
             *  }],
             *
             * @property pinLocations
             * @type Object
             * @default null
             */
            pinLocations: null,

            /**
             * Optional. Pin id of another sprite on this entity to pin this sprite to.
             *
             * @property pinTo
             * @type String
             * @default null
             */
            pinTo: null,

            /**
             * Optional. The offset of the z-index of the sprite from the entity's z-index. Will default to 0.
             *
             * @property scaleY
             * @type Number
             * @default 0
             */
            offsetZ: 0,

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
             * Optional. Whether this object is visible or not. To change the hidden value dynamically set this.owner.state.hidden to true or false.
             *
             * @property hidden
             * @type Boolean
             * @default false
             */
            hidden: false,

            /**
             * Optional. Specifies whether this component should listen to events matching the animationMap to animate. Set this to true if the component should animate for on events. Default is false.
             *
             * @property eventBased
             * @type Boolean
             * @default false
             */
            eventBased: false,

            /**
             * Optional. Specifies whether this component should listen to changes in the entity's state that match the animationMap to animate. Set this to true if the component should animate based on this.owner.state. Default is true.
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
             * Optional. When using stateBased animations, forces animations to complete before starting a new animation. Defaults to false.
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
             * Optional. The rotation of the sprite in degrees. All sprites on the same entity are rotated the same amount except when pinned or if they ignore the rotation value by setting 'rotate' to false.
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
            var defaultAnimations = {"default": 0},
                createSpriteSheet = function (ssDef, srcImage, entity, component) {
                    var image  = null,
                        ss     = {
                            framerate:     0,
                            images:     null,
                            frames:     null,
                            animations: null
                        },
                        cache  = {
                            definition: ss,
                            spriteSheet: null
                        };

                    //If we've already created an object with this spriteSheet, used the cached version.
                    if (typeof ssDef === 'string' && ssCache[ssDef]) {
                        return ssCache[ssDef];
                    }

                    //If spriteSheet is a string, we look it up the spritesheet data, otherwise we use the object provided.
                    if (ssDef && typeof ssDef === 'string' && platypus.game.settings.spriteSheets[ssDef]) {
                        ssDef = platypus.game.settings.spriteSheets[ssDef];
                    } else if (ssDef && typeof ssDef === 'object') {
                        //We're fine.
                    } else if (srcImage) {
                        ssDef = {"images": [srcImage]};
                    } else {
                        console.warn(entity.type + ' - RenderSprite : Neither spriteSheet nor image defined.');
                    }

                    if (ssDef.framerate) {
                        ss.framerate = ssDef.framerate;
                    }

                    if (ssDef.images && Array.isArray(ssDef.images)) {
                        ss.images = ssDef.images.slice();
                    } else {
                        console.warn(entity.type + ' - RenderSprite : No source image(s) defined.');
                    }

                    if (ssDef && ssDef.frames) {
                        ss.frames = ssDef.frames;
                    } else {
                        // Assume this is a single frame image and define accordingly.
                        image = ss.images[0];
                        if (image) {
                            ss.frames = [[
                                0,
                                0,
                                ss.images[0].width  || entity.width || 1,
                                ss.images[0].height || entity.height || 1,
                                0,
                                component.regX || entity.regX || 0,
                                component.regY || entity.regY || 0
                            ]];
                        }
                    }

                    if (ssDef && ssDef.animations) {
                        ss.animations = ssDef.animations;
                    } else {
                        // Assume this is a single frame image and define accordingly.
                        ss.animations = defaultAnimations;
                    }

                    cache.spriteSheet = cache.definition; //TODO: definition and actual can be stored together now

                    return cache;
                },
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
                setupEventsAndStates = function (component, map) {
                    var anim      = '',
                        animation = '';

                    component.followThroughs = {};
                    component.checkStates = [];

                    for (anim in map) {
                        if (map.hasOwnProperty(anim)) {
                            animation = map[anim];

                            //TODO: Should probably find a cleaner way to accomplish this. Maybe in the animationMap definition? - DDD
                            if (animation[animation.length - 1] === '!') {
                                animation = animation.substring(0, animation.length - 1);
                                component.followThroughs[animation] = true;
                            } else {
                                component.followThroughs[animation] = false;
                            }

                            if (component.eventBased) {
                                component.addEventListener(anim, changeState(animation));
                            }
                            if (component.stateBased) {
                                component.checkStates.push(createTest(anim, animation));
                            }
                        }
                    }
                };
            
            return function (definition) {
                var self = this,
                    ss       = createSpriteSheet(this.spriteSheet, this.image, this.owner, this),
                    map      = createAnimationMap(this.animationMap, ss.definition);
                
                this.sprite     = null;
                
                this.parentContainer      = null;
                this.stateBased = map && this.stateBased;
                this.eventBased = map && this.eventBased;
                this.hover      = false;
                this.click      = false;
                
                if (this.acceptInput) {
                    this.hover = this.acceptInput.hover || false;
                    this.click = this.acceptInput.click || false;
                    
                    this.camera = {
                        x: 0,
                        y: 0
                    };
                    this.addEventListener('camera-update', function (camera) {
                        self.camera.x = camera.viewport.left;
                        self.camera.y = camera.viewport.top;
                    });
                }
                
                if (this.eventBased || this.stateBased) {
                    setupEventsAndStates(this, map);
                    this.currentAnimation = map['default'] || '';
                }
                
                /*
                 * CreateJS Sprite created here:
                 */
                this.sprite = new platypus.PIXIAnimation(ss.spriteSheet, this.currentAnimation || 0);
                this.sprite.onComplete = function (animationInstance) {
                    self.owner.trigger('animation-ended', animationInstance);
                    if (self.waitingAnimation) {
                        self.currentAnimation = self.waitingAnimation;
                        self.waitingAnimation = false;
                        self.lastState = self.waitingState;
                        
                        self.animationFinished = false;
                        self.sprite.gotoAndPlay(self.currentAnimation);
                    } else {
                        self.animationFinished = true;
                    }
                };
                
                this.affine = new PIXI.Matrix();
                
                // add pins to sprite and setup this.container if needed.
                if (this.pinLocations) {
                    this.container = new PIXI.Container();
                    this.container.addChild(this.sprite);
                    this.sprite.z = 0;

                    this.addPins(this.pinLocations, ss.definition.frames);
                } else {
                    this.container = this.sprite;
                }
    
                
                /* These next few need this.container set up */
                
                //handle hitArea
                if (this.acceptInput && this.acceptInput.hitArea) {
                    if (typeof this.acceptInput.hitArea === 'string') {
                        this.container.hitArea = this.setHitArea(this.acceptInput.hitArea);
                    } else {
                        this.container.hitArea = this.setHitArea('r(' + (this.owner.x || 0) + ',' + (this.owner.y || 0) + ',' + (this.owner.width || 0) + ',' + (this.owner.height || 0) + ')');
                    }
                }
                
                //Handle mask
                if (this.mask) {
                    this.container.mask = this.setMask(this.mask);
                }
    
                // pin to another RenderSprite
                if (this.pinTo) {
                    this.owner.triggerEvent('pin-me', this.pinTo);
                }

                this.container.hidden = this.hidden;
                this.state = this.owner.state;
                this.stateChange = false;
                this.lastState = -1;
    
                this.waitingAnimation = false;
                this.waitingState = 0;
                this.playWaiting = false;
                this.animationFinished = false;
    
                //Check state against entity's prior state to update animation if necessary on instantiation.
                this.stateChange = true;
                
                if (this.cache) {
                    this.updateSprite();
                    this.owner.cacheRender = this.container;
                }
            };
        }()),
        
        events: {
            /**
             * On receiving a "cache" event, this component triggers "cache-sprite" to cache its rendering into the background. This is an optimization for static images to reduce render calls.
             *
             * @method 'cache'
             */
            "cache": function () {
                this.updateSprite();
                this.owner.cacheRender = this.container;
                if (this.owner.parent && this.owner.parent.triggerEventOnChildren) {
                    /**
                     * On receiving a "cache" event, this component triggers "cache-sprite" to cache its rendering into the background. This is an optimization for static images to reduce render calls.
                     *
                     * @event 'cache-sprite'
                     * @param entity {platypus.Entity} This component's owner.
                     */
                    this.owner.parent.triggerEventOnChildren('cache-sprite', this.owner);
                } else {
                    console.warn('Unable to cache sprite for ' + this.owner.type);
                }
            },

            /**
             * A setup message used to add the sprite to the stage. On receiving this message, the component sets its parent container to the stage contained in the message if it doesn't already have one.
             *
             * @method 'handle-render-load'
             * @param handlerData {Object} Data from the render handler
             * @param handlerData.container {createjs.Container} The parent container.
             */
            "handle-render-load": function (handlerData) {
                if (!this.parentContainer && handlerData && handlerData.container) {
                    this.addStage(handlerData.container);
                }
            },
            
            /**
             * The render update message. This updates the sprite. If a sprite doesn't have a container, it's removed.
             *
             * @method 'handle-render'
             * @param renderData {Object} Data from the render handler
             * @param renderData.container {createjs.Container} The parent container.
             */
            "handle-render": function (renderData) {
                if (!this.container) { // If this component's removal is pending
                    return;
                }

                if (!this.parentContainer) {
                    if (!this.pinTo) { //In case this component was added after handler-render is initiated
                        if (!this.addStage(renderData.container)) {
                            console.warn('No CreateJS Stage, removing render component from "' + this.owner.type + '".');
                            this.owner.removeComponent(this);
                            return;
                        }
                    } else {
                        return;
                    }
                }
                
                this.updateSprite();
            },
            
            /**
             * This event is fired when the entity state changes. This is used to update the currently playing animation when it is state based.
             *
             * @method 'state-changed'
             */
            "state-changed": function () {
                this.stateChange = true;
            },
            
            /**
             * This event hides the sprite. When multiple sprites are pinned together, the entire group is hidden.
             *
             * @method 'hide-sprite'
             */
            "hide-sprite": function () {
                this.container.hidden = true;
            },

            /**
             * This event shows a hidden sprite. When multiple sprites are pinned together, the entire group is shown.
             *
             * @method 'show-sprite'
             */
            "show-sprite": function () {
                this.container.hidden = false;
            },
            
            /**
             * If this component has a matching pin location, it will trigger "attach-pin" on the entity with the matching pin location.
             *
             * @method 'pin-me'
             * @param pinId {String} The id of the pin location we're trying to attach to.
             */
            "pin-me": function (pinId) {
                if (this.pins && this.pins[pinId]) {
                    /**
                     * Called by "pin-me", this event is responding to the inquiring component with the information about the pin it should attach to.
                     *
                     * @event 'attach-pin'
                     * @param pinInfo {Object} Information about the pin.
                     */
                    this.owner.trigger("attach-pin", this.pins[pinId]);
                }
            },
            
            /**
             * On receiving this message, the component checks whether it wants to be pinned, and if so, adds itself to the provided container.
             *
             * @method 'attach-pin'
             * @param pinInfo {Object} Information about the pin.
             * @param pinInfo.pinId {String} The pin id.
             * @param pinInfo.container {createjs.Container} The container to add this sprite to.
             */
            "attach-pin": function (pinInfo) {
                if (pinInfo.pinId === this.pinTo) {
                    this.parentContainer = pinInfo.container;
                    this.parentContainer.addChild(this.container);
                    this.addInputs();
                    this.pinnedTo = pinInfo;
                }
            },
            
            /**
             * On receiving this message, the component checks whether it is pinned to the specified pin. If so, it removes itself from the container.
             *
             * @method 'remove-pin'
             * @param pinInfo {Object} Information about the pin.
             * @param pinInfo.pinId {String} The pin id.
             * @param pinInfo.container {createjs.Container} The container to add this sprite to.
             */
            "remove-pin": function (pinInfo) {
                if (pinInfo.pinId === this.pinTo) {
                    this.parentContainer.removeChild(this.container);
                    this.parentContainer = null;
                    this.pinnedTo = null;
                }
            },
            
            /**
             * This event dispatches a createjs.Event on this component's createjs.Sprite. Useful for rerouting mouse/keyboard events.
             *
             * @method 'dispatch-event'
             * @param event {Object | createjs.Event} The event to dispatch.
             */
            "dispatch-event": function (event) {
                this.sprite.dispatchEvent(this.sprite, event.event, event.data);
            },
            
            /**
             * Adds input event listeners to the sprite, enabling input.
             *
             * @method 'input-on'
             */
            "input-on": function () {
                if (!this.removeInputListeners) {
                    this.addInputs();
                }
            },
            
            /**
             * Removes the input event listeners on the sprite, disabling input.
             *
             * @method 'input-off'
             */
            "input-off": function () {
                if (this.removeInputListeners) {
                    this.removeInputListeners();
                }
            },
            
            /**
             * Defines the mask on the container/sprite. If no mask is specified, the mask is set to null.
             *
             * @method 'set-mask'
             * @param mask {Object} The mask. This can specified the same way as the 'mask' parameter on the component.
             */
            "set-mask": function (mask) {
                if (mask) {
                    this.container.mask = this.setMask(mask);
                } else {
                    this.container.mask = null;
                }
            }
        },
        
        methods: {
            addStage: function (stage) {
                if (stage && !this.pinTo) {
                    this.parentContainer = stage;
                    this.parentContainer.addChild(this.container);
//                    if (this.container.mask) this.parentContainer.addChild(this.container.mask);
                    this.addInputs();
                    return stage;
                } else {
                    return null;
                }
            },
            
            updateSprite: (function () {
                var sort = function (a, b) {
                    return a.z - b.z;
                };
                
                return function (resp) {
                    var i = 0,
                        x = 0,
                        y = 0,
                        o = null,
                        rotation = 0,
                        testCase = false,
                        mirrored = 1,
                        flipped  = 1,
                        angle    = null,
                        matrix   = this.container.transformMatrix,
                        m        = matrix.copy(this.affine),
                        temp     = PIXI.Matrix.TEMP_MATRIX;
                    
                    if (this.pinnedTo) {
                        if (this.pinnedTo.frames && this.pinnedTo.frames[this.pinnedTo.sprite.currentFrame]) {
                            x = this.pinnedTo.frames[this.pinnedTo.sprite.currentFrame].x;
                            y = this.pinnedTo.frames[this.pinnedTo.sprite.currentFrame].y;
                            if (this.container.z !== this.pinnedTo.frames[this.pinnedTo.sprite.currentFrame].z) {
                                if (this.parentContainer) {
                                    this.parentContainer.reorder = true;
                                }
                                this.container.z = this.pinnedTo.frames[this.pinnedTo.sprite.currentFrame].z;
                            }
                            rotation = this.pinnedTo.frames[this.pinnedTo.sprite.currentFrame].angle || 0;
                            this.container.visible = true;
                        } else if (this.pinnedTo.defaultPin) {
                            x = this.pinnedTo.defaultPin.x;
                            y = this.pinnedTo.defaultPin.y;
                            if (this.container.z !== this.pinnedTo.defaultPin.z) {
                                if (this.parentContainer) {
                                    this.parentContainer.reorder = true;
                                }
                                this.container.z = this.pinnedTo.defaultPin.z;
                            }
                            rotation = this.pinnedTo.defaultPin.angle || 0;
                            this.container.visible = true;
                        } else {
                            this.container.visible = false;
                        }
                    } else {
                        x = this.owner.x;
                        y = this.owner.y;
                        if (this.rotate) {
                            rotation = this.rotation;
                        }
                        if (this.container.z !== (this.owner.z + this.offsetZ)) {
                            if (this.parentContainer) {
                                this.parentContainer.reorder = true;
                            }
                            this.container.z = (this.owner.z + this.offsetZ);
                        }
    
                        if (!this.ignoreOpacity && (this.owner.opacity || (this.owner.opacity === 0))) {
                            this.container.alpha = this.owner.opacity;
                        }
                    }
                    
                    if (this.container.reorder) {
                        this.container.reorder = false;
                        this.container.children.sort(sort);
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
                    
                    if (this.stateBased && this.stateChange) {
                        if (this.state.hidden !== undefined) {
                            this.container.hidden = this.state.hidden;
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
                                            this.sprite.gotoAndPlay(testCase);
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
                    
                    if (this.pinnedTo) {
                        temp.tx = x;
                        temp.ty = y;
                        temp.a = mirrored;
                        temp.b = 0;
                        temp.c = 0;
                        temp.d = flipped;
                        m.prepend(temp);
                    } else {
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
                        
                        temp.tx = x;
                        temp.ty = y;
                        temp.a = this.scaleX * mirrored;
                        temp.b = this.owner.skewX;
                        temp.c = this.owner.skewY;
                        temp.d = this.scaleY * flipped;
                        m.prepend(temp);
                    }

                    // Handle rotation
                    if (rotation) {
                        m.rotate((rotation / 180) * Math.PI);
                    }
                };
            }()),
            
            addInputs: (function () {
                var createHandler = function (self, eventName) {
                    return function (event) {
                        //TML - This is in case we do a scene change using an event and the container is destroyed.
                        if (!self.container) {
                            return;
                        }

                        self.owner.trigger(eventName, {
                            event: event.nativeEvent,
                            cjsEvent: event,
                            x: event.stageX / self.parentContainer.scale.x + self.camera.x,
                            y: event.stageY / self.parentContainer.scale.y + self.camera.y,
                            entity: self.owner
                        });

                        if (eventName === 'pressup') {
                            event.target.mouseTarget = false;
                            if (event.target.removeDisplayObject) {
                                event.target.removeDisplayObject();
                            }
                        } else {
                            event.target.mouseTarget = true;
                        }
                    };
                };
                
                return function () {
                    var sprite    = this.container,
                        mousedown = null,
                        mouseover = null,
                        mouseout  = null,
                        pressmove = null,
                        pressup   = null,
                        click     = null;
                    
                    // The following appends necessary information to displayed objects to allow them to receive touches and clicks
                    if (this.click) {
                        sprite.interactive = true;
                        
                        mousedown = createHandler(this, 'mousedown');
                        pressmove = createHandler(this, 'pressmove');
                        pressup   = createHandler(this, 'pressup');
                        click     = createHandler(this, 'click');
                        
                        sprite.addListener('mousedown',       mousedown);
                        sprite.addListener('touchstart',      mousedown);
                        sprite.addListener('mouseup',         pressup);
                        sprite.addListener('touchend',        pressup);
                        sprite.addListener('mouseupoutside',  pressup);
                        sprite.addListener('touchendoutside', pressup);
                        sprite.addListener('mousemove',       pressmove);
                        sprite.addListener('touchmove',       pressmove);
                        sprite.addListener('click',           click);
                        sprite.addListener('tap',             click);
                    }
                    if (this.hover) {
                        sprite.interactive = true;
                        
                        mouseover = createHandler(this, 'mouseover');
                        mouseout  = createHandler(this, 'mouseout');

                        sprite.addListener('mouseover', mouseover);
                        sprite.addListener('mouseout',  mouseout);
                    }

                    this.removeInputListeners = function () {
                        if (this.click) {
                            sprite.removeListener('mousedown',       mousedown);
                            sprite.removeListener('touchstart',      mousedown);
                            sprite.removeListener('mouseup',         pressup);
                            sprite.removeListener('touchend',        pressup);
                            sprite.removeListener('mouseupoutside',  pressup);
                            sprite.removeListener('touchendoutside', pressup);
                            sprite.removeListener('mousemove',       pressmove);
                            sprite.removeListener('touchmove',       pressmove);
                            sprite.removeListener('click',           click);
                            sprite.removeListener('tap',             click);
                        }
                        if (this.hover) {
                            sprite.removeListener('mouseover', mouseover);
                            sprite.removeListener('mouseout',  mouseout);
                        }
                        this.removeInputListeners = null;
                    };
                };
            }()),
            
            addPins: function (pins, frames) {
                var i = 0,
                    j = 0,
                    pin   = null,
                    regX  = frames.regX || 0,
                    regY  = frames.regY || 0,
                    isArray = Array.isArray(frames);
                
                this.pinsToRemove = this.pinsToRemove || [];
                
                this.pins = {};
                
                for (i = 0; i < pins.length; i++) {
                    this.pinsToRemove.push(pins[i].pinId);

                    if (isArray) {
                        regX = frames[0][5] || 0;
                        regY = frames[0][6] || 0;
                    }
                    
                    this.pins[pins[i].pinId] = pin = {
                        pinId: pins[i].pinId,
                        sprite: this.sprite,
                        container: this.container
                    };

                    if ((typeof pins[i].x === 'number') && (typeof pins[i].y === 'number')) {
                        pin.defaultPin = {
                            x: (pins[i].x - regX),
                            y: (pins[i].y - regY),
                            z: pins[i].z || 0.00000001, //force z to prevent flickering z-order issues.
                            angle: (pins[i].angle || 0)
                        };
                    }
                    
                    if (pins[i].frames) {
                        pin.frames = [];
                        for (j in pins[i].frames) {
                            if (pins[i].frames[j]) {
                                if (isArray) {
                                    regX = frames[j][5] || 0;
                                    regY = frames[j][6] || 0;
                                }
                                if ((typeof pins[i].frames[j].x === 'number') && (typeof pins[i].frames[j].y === 'number')) {
                                    pin.frames.push({
                                        x: (pins[i].frames[j].x - regX),
                                        y: (pins[i].frames[j].y - regY),
                                        z: pins[i].frames[j].z || (pin.defaultPin ? pin.defaultPin.z : 0.00000001),
                                        angle: pins[i].frames[j].angle || (pin.defaultPin ? pin.defaultPin.angle : 0)
                                    });
                                } else if (pin.defaultPin) {
                                    if (typeof pins[i].frames[j].x === 'number') {
                                        pin.frames.push({
                                            x: (pins[i].frames[j].x - regX),
                                            y: pin.defaultPin.y,
                                            z: pins[i].frames[j].z || pin.defaultPin.z,
                                            angle: pins[i].frames[j].angle || pin.defaultPin.angle
                                        });
                                    } else if (typeof pins[i].frames[j].y === 'number') {
                                        pin.frames.push({
                                            x: pin.defaultPin.x,
                                            y: (pins[i].frames[j].y - regY),
                                            z: pins[i].frames[j].z || pin.defaultPin.z,
                                            angle: pins[i].frames[j].angle || pin.defaultPin.angle
                                        });
                                    } else {
                                        pin.frames.push(null);
                                    }
                                } else {
                                    pin.frames.push(null);
                                }
                            } else {
                                pin.frames.push(null);
                            }
                        }
                    }
                    /**
                     * This event is triggered for each pin created. It is intended for other RenderSprite components looking to pin to this pin.
                     *
                     * @event 'attach-pin'
                     * @param pin {Object} The created pin.
                     */
                    this.owner.trigger('attach-pin', pin);
                }
            },

            removePins: function () {
                var i = 0;
                
                if (this.pins && this.pinsToRemove) {
                    for (i = 0; i < this.pinsToRemove.length; i++) {
                        this.owner.trigger('remove-pin', this.pins[this.pinsToRemove[i]].pinId);
                        delete this.pins[this.pinsToRemove[i]];
                    }
                    this.pinsToRemove.length = 0;
                }
            },
            
            setMask: function (shape) {
                var mask = new createjs.Shape(),
                    gfx  = mask.graphics;
                
                mask.x   = 0;
                mask.y   = 0;
                
                if (typeof shape === 'string') {
                    processGraphics(gfx, shape);
                } else {
                    if (shape.radius) {
                        gfx.dc(shape.x || 0, shape.y || 0, shape.radius);
                    } else {
                        gfx.r(shape.x || 0, shape.y || 0, shape.width || this.owner.width || 0, shape.height || this.owner.height || 0);
                    }
                }

                return mask;
            },
            
            setHitArea: (function () {
                var savedHitAreas = {}; //So generated hitAreas are reused across identical entities.
                
                return function (shape) {
                    var ha  = null,
                        gfx = null,
                        sav = '';
                    
                    if (typeof shape === 'string') {
                        sav = shape;
                    } else {
                        sav = JSON.stringify(shape);
                    }
                    
                    ha = savedHitAreas[sav];

                    if (!ha) {
                        ha   = new createjs.Shape();
                        gfx  = ha.graphics;
                        ha.x = 0;
                        ha.y = 0;

                        gfx.beginFill("#000"); // Force the fill.

                        if (typeof shape === 'string') {
                            processGraphics(gfx, shape);
                        } else if (shape.radius) {
                            gfx.dc(shape.x || 0, shape.y || 0, shape.radius);
                        } else {
                            gfx.r(shape.x || 0, shape.y || 0, shape.width || this.owner.width || 0, shape.height || this.owner.height || 0);
                        }
                        
                        savedHitAreas[sav] = ha;
                    }
                    
                    return ha;
                };
            }()),
            
            destroy: function () {
                var self = this;

                if (this.removeInputListeners) {
                    this.removeInputListeners();
                }
                if (this.parentContainer) {
                    if (this.container.mouseTarget) {
                        this.container.visible = false;
                        this.container.removeDisplayObject = function () {
                            self.parentContainer.removeChild(self.container);
                            self.parentContainer = null;
                            self.container = null;
                        };
                    } else {
                        this.parentContainer.removeChild(this.container);
                        this.parentContainer = null;
                        this.container = null;
                    }
                }
                this.removePins();
                this.followThroughs = null;
                this.sprite = null;
            }
        }
    });
}());
