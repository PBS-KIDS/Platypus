/* global console, include, PIXI, platypus */
(function () {
    "use strict";

    var AABB = include('platypus.AABB'),
        Animator = include('PIXI.animate.Animator', false),
        Data = include('platypus.Data'),
        EventRender = include('platypus.components.EventRender'),
        Graphics = include('PIXI.Graphics'),
        Interactive = include('platypus.components.Interactive'),
        MovieClip = include('PIXI.animate.MovieClip', false),
        StateRender = include('platypus.components.StateRender'),
        animationEnded = function (animation) {
            /**
             * This event fires each time an animation completes.
             *
             * @event 'animation-ended'
             * @param animation {String} The id of the animation that ended.
             */
            this.owner.triggerEvent('animation-ended', animation);
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
    
    if (MovieClip) { // Temporary fix for setMask
        MovieClip.prototype.setMask = MovieClip.prototype.ma = function (mask) {
            // According to PIXI, only Graphics and Sprites can
            // be used as mask, let's ignore everything else, like other
            // movieclips and displayobjects/containers
            if (mask) {
                if (!(mask instanceof PIXI.Graphics) && !(mask instanceof PIXI.Sprite)) {
                    if (typeof console !== "undefined" && console.warn) {
                        console.warn("Warning: Masks can only be PIXI.Graphics or PIXI.Sprite objects.");
                    }
                    return this;
                }
            }
            this.mask = mask;
            return this;
        };
    }

    return platypus.createComponentClass({
        id: "RenderAnimation",
        properties: {
            animation: '',

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

            regX: 0,
            regY: 0,
            offsetZ: 0
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
            var createAnimationMap = function (animationMap, labels, totalFrames, endings) {
                    var lastAnim = totalFrames,
                        map  = null,
                        i = labels.length;

                    while (i--) {
                        endings[labels[i].label] = lastAnim;
                        lastAnim = labels[i].label;
                    }

                    if (animationMap) {
                        return animationMap;
                    } else if (Array.isArray(labels) && (labels.length === 1)) {
                        // This is a single animation, so no mapping is necessary
                        return null;
                    } else {
                        // Create 1-to-1 animation map since none was defined
                        map = {};
                        i = labels.length;
                        while (i--) {
                            map[labels[i].label] = labels[i].label;
                        }
                        return map;
                    }
                },
                onceLoaded = function (callback, instance) {
                    var definition = null,
                        map = createAnimationMap(this.animationMap, instance.labels, instance.totalFrames, this.endings);

                    this.instance = instance;

                    this.stateBased = map && this.stateBased;
                    this.eventBased = map && this.eventBased;
                    if (map) {
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

                    if (this.parentContainer) {
                        this.parentContainer.addChild(this.instance);
                        this.ready = true;
                        //Handle mask
                        if (this.mask) {
                            this.setMask(this.mask);
                        }
                        this.update();
                    }

                    if (this.interactive) {
                        definition = Data.setUp(
                            'container', instance,
                            'hitArea', this.interactive.hitArea,
                            'hover', this.interactive.hover
                        );
                        this.owner.addComponent(new Interactive(this.owner, definition, function () {
                            /**
                             * This event is triggered once the RenderSprite is ready to handle interactivity.
                             *
                             * @event 'input-on'
                             */
                            this.owner.triggerEvent('input-on');

                            callback();
                        }.bind(this)));
                        definition.recycle();
                    } else {
                        callback();
                    }
                };
            
            return function (definition, callback) {
                this.endings = Data.setUp();
                this.instance = null;
                this.ready = false;
                if (this.animation) {
                    PIXI.animate.load(include(this.animation), onceLoaded.bind(this, callback));
                }

                this.parentContainer = null;
                this.wasVisible = this.visible;
                this.lastX = this.owner.x;
                this.lastY = this.owner.y;
                this.camera = AABB.setUp();
                this.isOnCamera = true;

                return true; // notifies owner that this component is asynchronous.
            };
        }()),
        events: {
            /**
             * Listens for this event to determine whether this sprite is visible.
             *
             * @method 'camera-update'
             * @param camera.viewport {platypus.AABB} Camera position and size.
             */
            "camera-update": function (camera) {
                this.camera.set(camera.viewport);
                
                // Set visiblity of sprite if within camera bounds
                if (this.instance) { //TODO: At some point, may want to do this according to window viewport instead of world viewport so that native PIXI bounds checks across the whole stage can be used. - DDD 9-21-15
                    this.checkCameraBounds();
                }
            },
            
            "handle-render-load": function (resp) {
                if (!this.parentContainer && resp && resp.container) {
                    this.addStage(resp.container);
                }
            },

            "handle-render": function (resp) {
                if (!this.ready && !this.parentContainer) {
                    this.addStage(resp.container);
                }
                if (this.ready) {
                    this.update();
                }
            },
            
            /**
             * This event makes the animation invisible.
             *
             * @method 'hide-animation'
             */
            "hide-animation": function () {
                this.visible = false;
            },

            /**
             * This event makes the animation visible.
             *
             * @method 'show-animation'
             */
            "show-animation": function () {
                this.visible = true;
            },
            
            /**
             * Defines the mask on the animation. If no mask is specified, the mask is set to null.
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
             */
            "stop-animation": function (animation) {
                var instance = this.instance;

                if (animation && instance.has(animation)) {
                    instance.gotoAndStop(animation);
                } else {
                    instance.stop();
                }
            },
            
            /**
             * Starts the sprite's animation.
             *
             * @method 'play-animation'
             * @param [animation] {String} The animation to play. If not specified, this method simply unpauses the current animation.
             */
            "play-animation": function (animation, restart) {
                this.playAnimation(animation, restart);
            }
        },
        methods: {
            checkCameraBounds: function () {
                this.isOnCamera = this.owner.parent.isOnCanvas(this.instance.getBounds(false));
            },
            
            addStage: function (stage) {
                if (stage) {
                    this.parentContainer = stage;
                    if (this.instance) {
                        this.parentContainer.addChild(this.instance);
                        this.ready = true;
                        //Handle mask
                        if (this.mask) {
                            this.setMask(this.mask);
                        }
                    }
                    return stage;
                } else {
                    return null;
                }
            },
            
            playAnimation: function (animation) {
                var instance = this.instance;

                Animator.fromTo(instance, animation, this.endings[animation], true, animationEnded.bind(this, animation));
            },

            setMask: function (shape) {
                var gfx = null;
                
                if (this.mask && this.parentContainer) {
                    this.parentContainer.removeChild(this.mask);
                }
                
                if (!shape) {
                    this.mask = this.instance.mask = null;
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

                this.mask = this.instance.mask = gfx;
                this.mask.z = 0; //Masks don't need a Z, but this makes it play nice with the Z-ordering in HandlerRender.

                if (this.parentContainer) {
                    this.parentContainer.addChild(this.mask);
                }
            },

            update: function () {
                var instance = this.instance,
                    scale = instance.scale;

                scale.x = this.scaleX;
                scale.y = this.scaleY;
                instance.x = this.x - this.regX * this.scaleX;
                instance.y = this.y - this.regY * this.scaleY;
                instance.z = this.z + this.offsetZ;

                // Set isCameraOn of instance if within camera bounds
                if (this.instance && ((!this.wasVisible && this.visible) || this.lastX !== this.owner.x || this.lastY !== this.owner.y)) {
                    //TODO: This check is running twice when an object is moving and the camera is moving.
                    //Find a way to remove the duplication!
                    this.checkCameraBounds();
                }
                this.lastX = this.owner.x;
                this.lastY = this.owner.y;
                this.wasVisible = this.visible;
                this.instance.visible = (this.visible && this.isOnCamera) || this.dragMode;
            }
        }
    });
}());
