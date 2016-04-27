/**
 * This component is attached to entities that will appear in the game world. It renders a static or animated image. It listens for messages triggered on the entity or changes in the logical state of the entity to play a corresponding animation.
 *
 * @namespace platypus.components
 * @class RenderSprite
 * @uses platypus.Component
 */
/* global console, include, PIXI, platypus */
(function () {
    'use strict';
    
    var Data = include('platypus.Data'),
        StateMap = include('platypus.StateMap'),
        tempMatrix = new PIXI.Matrix(),
        changeState = function (state) {
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
        },
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
        },
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
             * Optional. Defines what types of input the entity will take. Defaults to no input. A hitArea can be defined that determines where on the image should be clickable. A string can also be used to create more complex shapes via the PIXI graphics API like: "hitArea": "r(10,20,40,40).dc(30,10,12)". Defaults to this component's image if not specified or, if simply set to `true`, a rectangle using the entity's dimensions.
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
             *      "frames": {"0": {"x": 12, "y": -32}, "3": {"x": 12}}  //The keys specify the the frame to match the pin to. If a frame doesn't have coordinates or a parameter is undefined, the x/y/z values above are used. If they're not specified, the pinned sprite is invisible.
             *
             *      "frames": [{"x": 12, "y": -32}, null, {"x": 12}]  //In this format, we assume the indexes of the array match those of the frames. If a given index is null or a parameter is undefined, the x/y/z values above are used. If they're not specified, the pinned sprite is invisible.
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
             * @property offsetZ
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
             * Optional. Whether this object is visible or not. To change the visible value dynamically set this.owner.state.visible to true or false.
             *
             * @property visible
             * @type Boolean
             * @default false
             */
            visible: true,

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
             * Determines whether hovering over the sprite should alter the cursor.
             *
             * @property buttonMode
             * @type Boolean
             * @default false
             */
            buttonMode: false,

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
            var createAnimationMap = function (animationMap, ss) {
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
                    component.checkStates = Array.setUp();

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
                                component.addEventListener(anim, changeState.bind(component, animation));
                            }
                            if (component.stateBased) {
                                component.checkStates.push(createTest(anim, animation));
                            }
                        }
                    }
                };
            
            return function () {
                var ss   = null,
                    map  = null;
                
                if (this.spriteSheet) {
                    if (typeof this.spriteSheet === 'string') {
                        ss = platypus.game.settings.spriteSheets[this.spriteSheet];
                    } else {
                        ss = this.spriteSheet;
                    }
                } else {
                    ss = {};
                    platypus.debug.warn(this.owner.type + ' - RenderSprite: Sprite Sheet not defined.');
                }
                
                map      = createAnimationMap(this.animationMap, ss);
                
                this.parentContainer      = null;
                this.stateBased = map && this.stateBased;
                this.eventBased = map && this.eventBased;
                this.hover      = false;
                this.click      = false;
                
                this.wasVisible = this.visible;
                this.lastX = this.owner.x;
                this.lastY = this.owner.y;
                
                this.camera = new platypus.AABB();

                if (this.eventBased || this.stateBased) {
                    setupEventsAndStates(this, map);
                    this.currentAnimation = map.default || '';
                }
                
                /*
                 * PIXIAnimation created here:
                 */
                this.sprite = new platypus.PIXIAnimation(ss, this.currentAnimation || 0);
                this.sprite.onComplete = function (animation) {
                    /**
                     * This event fires each time an animation completes.
                     *
                     * @event 'animation-ended'
                     * @param animation {String} The id of the animation that ended.
                     */
                    this.owner.triggerEvent('animation-ended', animation);
                    if (this.waitingAnimation) {
                        this.currentAnimation = this.waitingAnimation;
                        this.waitingAnimation = false;
                        this.lastState = this.waitingState;
                        
                        this.animationFinished = false;
                        this.sprite.gotoAndPlay(this.currentAnimation);
                    } else {
                        this.animationFinished = true;
                    }
                }.bind(this);

                this.affine = new PIXI.Matrix();
                
                // add pins to sprite and setup this.container if needed.
                if (this.pinLocations) {
                    this.container = new PIXI.Container();
                    this.container.transformMatrix = new PIXI.Matrix();
                    this.container.addChild(this.sprite);
                    this.sprite.z = 0;

                    this.addPins(this.pinLocations, ss.frames);
                    this.sprite.transformMatrix = new PIXI.Matrix();
                } else {
                    this.container = this.sprite;
                    this.sprite.transformMatrix = new PIXI.Matrix();
                }
    
                // pin to another RenderSprite
                if (this.pinTo) {
                    this.owner.triggerEvent('pin-me', this.pinTo);
                }
                
                /* These next few need this.container set up */
                
                //handle hitArea
                if (this.acceptInput) {
                    this.hover = this.acceptInput.hover || false;
                    this.click = this.acceptInput.click || false;
                    
                    if (this.acceptInput.hitArea) {
                        this.container.hitArea = this.setHitArea(this.acceptInput.hitArea);
                    }
                }
                
                this.isOnCamera = true;
                this.state = this.owner.state;
                this.stateChange = true; //Check state against entity's prior state to update animation if necessary on instantiation.
                this.lastState = -1;
    
                this.waitingAnimation = false;
                this.waitingState = 0;
                this.playWaiting = false;
                this.animationFinished = false;
                
                if (this.cache) {
                    this.updateSprite(false);
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
                this.updateSprite(false);
                this.owner.cacheRender = this.container;
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
             * @param handlerData {Object} Data from the render handler
             * @param handlerData.container {PIXI.Container} The parent container.
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
             * The render update message. This updates the sprite. If a sprite doesn't have a container, it's removed.
             *
             * @method 'handle-render'
             * @param renderData {Object} Data from the render handler
             * @param renderData.container {PIXI.Container} The parent container.
             */
            "handle-render": function (renderData) {
                if (!this.container) { // If this component's removal is pending
                    return;
                }

                if (!this.parentContainer) {
                    if (!this.pinTo) { //In case this component was added after handler-render is initiated
                        if (!this.addStage(renderData.container)) {
                            platypus.debug.warn('No PIXI Stage, removing render component from "' + this.owner.type + '".');
                            this.owner.removeComponent(this);
                            return;
                        }
                    } else {
                        return;
                    }
                }
                
                this.updateSprite(true);
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
             * This event makes the sprite invisible. When multiple sprites are pinned together, the entire group is invisible.
             *
             * @method 'hide-sprite'
             */
            "hide-sprite": function () {
                this.visible = false;
            },

            /**
             * This event makes the sprite visible. When multiple sprites are pinned together, the entire group is made visible.
             *
             * @method 'show-sprite'
             */
            "show-sprite": function () {
                this.visible = true;
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
                    this.owner.triggerEvent("attach-pin", this.pins[pinId]);
                }
            },
            
            /**
             * On receiving this message, the component checks whether it wants to be pinned, and if so, adds itself to the provided container.
             *
             * @method 'attach-pin'
             * @param pinInfo {Object} Information about the pin.
             * @param pinInfo.pinId {String} The pin id.
             * @param pinInfo.container {PIXI.Container} The container to add this sprite to.
             */
            "attach-pin": function (pinInfo) {
                if (pinInfo.pinId === this.pinTo) {
                    this.parentContainer = pinInfo.container;
                    this.parentContainer.addChild(this.container);
                    this.addInputs();
                    this.pinnedTo = pinInfo;
                    this.updateSprite(true); // Initial set up in case position, etc is needed prior to the first "render" event.
                }
            },
            
            /**
             * On receiving this message, the component checks whether it is pinned to the specified pin. If so, it removes itself from the container.
             *
             * @method 'remove-pin'
             * @param pinInfo {Object} Information about the pin.
             * @param pinInfo.pinId {String} The pin id.
             * @param pinInfo.container {PIXI.Container} The container to add this sprite to.
             */
            "remove-pin": function (pinInfo) {
                if (pinInfo.pinId === this.pinTo) {
                    this.parentContainer.removeChild(this.container);
                    this.parentContainer = null;
                    this.pinnedTo = null;
                }
            },
            
            /**
             * This event dispatches a PIXI.Event on this component's PIXI.Sprite. Useful for rerouting mouse/keyboard events.
             *
             * @method 'dispatch-event'
             * @param event {Object | PIXI.Event} The event to dispatch.
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
                this.setMask(mask);
            },
            
            /**
             * Stops the sprite's animation.
             *
             * @method 'stop-sprite'
             * @since 0.7.1
             */
            "stop-sprite": function () {
                this.sprite.stop();
            },
            
            /**
             * Starts the sprite's animation.
             *
             * @method 'play-sprite'
             * @since 0.7.1
             */
            "play-sprite": function () {
                this.sprite.play();
            }
        },
        
        methods: {
            checkCameraBounds: function () {
                var bounds = null,
                    sprite   = this.sprite,
                    matrix   = null,
                    pinning  = null;
                
                matrix = sprite.transformMatrix.copy(tempMatrix);
                pinning = this.pinnedTo;
                while (pinning) {
                    matrix.prepend(pinning.container.transformMatrix);
                    pinning = pinning.pinnedTo;
                }

                sprite._currentBounds = null;
                bounds = sprite.getBounds(matrix);
                
                if (bounds && ((bounds.x + bounds.width < this.camera.left) || (bounds.x > this.camera.right) || (bounds.y + bounds.height < this.camera.top) || (bounds.y > this.camera.bottom))) {
                    this.isOnCamera = false;
                } else {
                    this.isOnCamera = true;
                }
            },
            
            addStage: function (stage) {
                if (stage && !this.pinTo) {
                    this.parentContainer = stage;
                    this.parentContainer.addChild(this.container);

                    //Handle mask
                    if (this.mask) {
                        this.setMask(this.mask);
                    }

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
                
                return function (playing) {
                    var i = 0,
                        x = 0,
                        y = 0,
                        o = null,
                        rotation = 0,
                        testCase = false,
                        mirrored = 1,
                        flipped  = 1,
                        angle    = null,
                        m        = this.affine.copy(this.container.transformMatrix),
                        temp     = PIXI.Matrix.TEMP_MATRIX;
                    
                    if (this.buttonMode !== this.container.buttonMode) {
                        this.container.buttonMode = this.buttonMode;
                    }
                    
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
                            this.visible = true;
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
                            this.visible = true;
                        } else {
                            this.visible = false;
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
                                                this.sprite.gotoAndPlay(testCase);
                                            } else {
                                                this.sprite.gotoAndStop(testCase);
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
                    
                    // Handle rotation
                    if (rotation) {
                        m.rotate((rotation / 180) * Math.PI);
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
                    
                    // Set isCameraOn of sprite if within camera bounds
                    if (this.sprite && ((!this.wasVisible && this.visible) || this.lastX !== this.owner.x || this.lastY !== this.owner.y)) {
                        //TODO: This check is running twice when an object is moving and the camera is moving.
                        //Find a way to remove the duplication!
                        this.checkCameraBounds();
                    }
                    this.lastX = this.owner.x;
                    this.lastY = this.owner.y;
                    this.wasVisible = this.visible;
                    this.container.visible = (this.visible && this.isOnCamera) || this.dragMode;
                };
            }()),
            
            triggerInput: function (event, eventName) {
                var msg = null;
                
                //TML - This is in case we do a scene change using an event and the container is destroyed.
                if (!this.container) {
                    return;
                }
                
                msg = Data.setUp(
                    "event", event.data.originalEvent,
                    "pixiEvent", event,
                    "x", event.data.global.x / this.parentContainer.transformMatrix.a + this.camera.left,
                    "y", event.data.global.y / this.parentContainer.transformMatrix.d + this.camera.top,
                    "entity", this.owner
                );

                this.owner.trigger(eventName, msg);
                msg.recycle();
            },
            
            addInputs: function () {
                var pressed   = false,
                    sprite    = this.container,
                    mousedown = null,
                    mouseover = null,
                    mouseout  = null,
                    pressmove = null,
                    pressup   = null,
                    click     = null;
                
                // The following appends necessary information to displayed objects to allow them to receive touches and clicks
                if (this.click) {
                    sprite.interactive = true;
                    
                    mousedown = function (event) {
                        if (!pressed) {
                            this.triggerInput(event, 'mousedown');
                            event.target.mouseTarget = true;
                            pressed = true;
                        }
                    }.bind(this);
                    
                    pressmove = function (event) {
                        if (pressed) {
                            this.triggerInput(event, 'pressmove');
                            event.target.mouseTarget = true;
                        } else {
                            this.triggerInput(event, 'mousemove');
                        }
                    }.bind(this);
                    
                    pressup   = function (event) {
                        if (pressed) {
                            this.triggerInput(event, 'pressup');
                            event.target.mouseTarget = false;
                            pressed = false;
                            
                            if (event.target.removeDisplayObject) {
                                event.target.removeDisplayObject();
                            }
                        }
                    }.bind(this);
                    
                    click     = function (event) {
                        this.triggerInput(event, 'click');
                    }.bind(this);
                    
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

                    mouseover = function (event) {
                        this.triggerInput(event, 'mouseover');
                    }.bind(this);
                    mouseout  = function (event) {
                        this.triggerInput(event, 'mouseout');
                    }.bind(this);

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
                    sprite.interactive = false;
                    this.removeInputListeners = null;
                };
            },
            
            addPins: function (pins, frames) {
                var i = 0,
                    j = 0,
                    pin   = null,
                    regX  = frames.regX || 0,
                    regY  = frames.regY || 0,
                    isArray = Array.isArray(frames),
                    zFix = 0.00000001;
                
                this.pinsToRemove = this.pinsToRemove || Array.setUp();
                
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
                            z: pins[i].z || zFix, //force z to prevent flickering z-order issues.
                            angle: (pins[i].angle || 0)
                        };
                    }
                    
                    if (pins[i].frames) {
                        pin.frames = Array.setUp();
                        for (j = 0; j < pins[i].frames.length; j++) {
                            if (pins[i].frames[j]) {
                                if (isArray) {
                                    regX = frames[j][5] || 0;
                                    regY = frames[j][6] || 0;
                                }
                                if ((typeof pins[i].frames[j].x === 'number') && (typeof pins[i].frames[j].y === 'number')) {
                                    pin.frames.push({
                                        x: (pins[i].frames[j].x - regX),
                                        y: (pins[i].frames[j].y - regY),
                                        z: pins[i].frames[j].z || (pin.defaultPin ? pin.defaultPin.z : zFix),
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
                    this.owner.triggerEvent('attach-pin', pin);
                }
            },

            removePins: function () {
                var i = 0;
                
                if (this.pins && this.pinsToRemove) {
                    for (i = 0; i < this.pinsToRemove.length; i++) {
                        this.owner.triggerEvent('remove-pin', this.pins[this.pinsToRemove[i]].pinId);
                        if (this.pins[this.pinsToRemove[i]].frames) {
                            this.pins[this.pinsToRemove[i]].frames.recycle();
                        }
                        delete this.pins[this.pinsToRemove[i]];
                    }
                    this.pinsToRemove.recycle();
                }
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
                
                if (shape instanceof PIXI.Graphics) {
                    gfx = shape;
                } else {
                    gfx = new PIXI.Graphics();
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
            
            setHitArea: (function () {
                var savedHitAreas = {}; //So generated hitAreas are reused across identical entities.
                
                return function (shape) {
                    var ha  = null,
                        sav = '';
                    
                    sav = JSON.stringify(shape);
                    
                    ha = savedHitAreas[sav];

                    if (!ha) {
                        if (shape.radius) {
                            ha = new PIXI.Circle(shape.x || 0, shape.y || 0, shape.radius);
                        } else {
                            ha = new PIXI.Rectangle(shape.x || 0, shape.y || 0, shape.width || this.owner.width || 0, shape.height || this.owner.height || 0);
                        }
                        
                        savedHitAreas[sav] = ha;
                    }
                    
                    return ha;
                };
            }()),
            
            destroy: function () {
                if (this.removeInputListeners) {
                    this.removeInputListeners();
                }
                if (this.parentContainer) {
                    if (this.container.mouseTarget) {
                        this.container.visible = false;
                        this.container.removeDisplayObject = function () {
                            this.parentContainer.removeChild(this.container);
                            this.parentContainer = null;
                            this.container = null;
                        }.bind(this);
                    } else {
                        this.parentContainer.removeChild(this.container);
                        this.parentContainer = null;
                        this.container = null;
                    }
                }
                this.removePins();
                this.followThroughs = null;
                if (this.checkStates) {
                    this.checkStates.recycle();
                }
                if (!this.cache) {
                    this.sprite.destroy();
                }
                this.sprite = null;
                this.state = null;
            }
        },
        
        getAssetList: function (component, props, defaultProps) {
            var ss = component.spriteSheet || props.spriteSheet || defaultProps.spriteSheet;
            
            if (typeof ss === 'string') {
                return platypus.game.settings.spriteSheets[ss].images.greenSlice();
            } else {
                return ss.images.greenSlice();
            }
        }
    });
}());
