/**
 * This component controls the game camera deciding where and how it should move. The camera also broadcasts messages when the window resizes or its orientation changes.
 *
 * @namespace platypus.components
 * @class Camera
 * @uses platypus.Component
*/
/*global createjs, PIXI, platypus, include, window */
(function () {
    'use strict';
    
    var AABB = include('platypus.AABB'),
        Data = include('platypus.Data'),
        Vector = include('platypus.Vector'),
        anchorBound = function (anchorAABB, entityOffsetX, entityOffsetY, entity) {
            var aabb = AABB.setUp(entity.x + entityOffsetX, entity.y + entityOffsetY, entity.width, entity.height),
                x = anchorAABB.x,
                y = anchorAABB.y;

            if (aabb.top < anchorAABB.top) {
                y -= (anchorAABB.top - aabb.top);
            } else if (aabb.bottom > anchorAABB.bottom) {
                y += (anchorAABB.bottom - aabb.bottom);
            }
            
            if (aabb.left < anchorAABB.left) {
                x -= (anchorAABB.left - aabb.left);
            } else if (aabb.right > anchorAABB.right) {
                x += (anchorAABB.right - aabb.right);
            }
            
            aabb.recycle();
            
            return this.move(x, y, 0);
        },
        doNothing = function () {
            return false;
        };
    
    return platypus.createComponentClass({
        id: 'Camera',
        properties: {
            /**
             * Number specifying width of viewport in world coordinates.
             *
             * @property width
             * @type number
             * @default 0
             **/
            "width": 0,
             
            /**
             * Number specifying height of viewport in world coordinates.
             *
             * @property height
             * @type number
             * @default 0
             **/
            "height": 0,
            
            /**
             * Specifies whether the camera should be draggable via the mouse by setting to 'pan'.
             *
             * @property mode
             * @type String
             * @default 'static'
             * @since 0.9.0
             **/
            "mode": "static",
            
            /**
             * Whether camera overflows to cover the whole canvas or remains contained within its aspect ratio's boundary.
             *
             * @property overflow
             * @type boolean
             * @default false
             */
            "overflow": false,
            
            /**
             * Boolean value that determines whether the camera should stretch the world viewport when window is resized. Defaults to false which maintains the proper aspect ratio.
             *
             * @property stretch
             * @type boolean
             * @default: false
             */
            "stretch": false,
            
            /**
             * Sets how many units the followed entity can move before the camera will re-center. This should be lowered for small-value coordinate systems such as Box2D.
             *
             * @property threshold
             * @type number
             * @default 1
             **/
            "threshold": 1,
            
            /**
             * Whether, when following an entity, the camera should rotate to match the entity's orientation.
             *
             * @property rotate
             * @type boolean
             * @default false
             **/
            "rotate": false,

            /**
             * Number specifying the horizontal center of viewport in world coordinates.
             *
             * @property x
             * @type number
             * @default 0
             **/
            "x": 0,
             
            /**
             * Number specifying the vertical center of viewport in world coordinates.
             *
             * @property y
             * @type number
             * @default 0
             **/
            "y": 0
        },
        publicProperties: {
            /**
             * The entity's canvas element is used to determine the window size of the camera.
             *
             * @property canvas
             * @type DOMElement Canvas
             * @default null
             */
            "canvas": null,
            
            /**
             * Sets how quickly the camera should pan to a new position in the horizontal direction.
             *
             * @property transitionX
             * @type number
             * @default 400
             **/
            "transitionX": 400,
            
            /**
             * Sets how quickly the camera should pan to a new position in the vertical direction.
             *
             * @property transitionY
             * @type number
             * @default 600
             **/
            "transitionY": 600,
             
            /**
             * Sets how quickly the camera should rotate to a new orientation.
             *
             * @property transitionAngle
             * @type number
             * @default: 600
             **/
            "transitionAngle": 600
        },
        initialize: function (definition) {
            var worldVP = AABB.setUp(this.x, this.y, this.width, this.height),
                worldCamera = Data.setUp(
                    "viewport", worldVP,
                    "orientation", definition.orientation || 0
                );

            //The dimensions of the camera in the window
            this.viewport = AABB.setUp(0, 0, 0, 0);
            
            //The dimensions of the camera in the game world
            this.worldCamera = worldCamera;

            //Message object defined here so it's reusable
            this.worldDimensions = AABB.setUp();
            this.message = Data.setUp(
                "viewport", AABB.setUp(),
                "scaleX", 0,
                "scaleY", 0,
                "orientation", 0,
                "stationary", false,
                "world", this.worldDimensions
            );
            this.cameraLoadedMessage = Data.setUp(
                "viewport", this.message.viewport,
                "world", this.worldDimensions
            );
    
            //Whether the map has finished loading.
            this.worldIsLoaded = false;
            
            this.following = null;
            this.state = 'static';//'roaming';
            if (this.mode === 'pan') {
                this.state = 'mouse-pan';
            }
            
            //FOLLOW MODE VARIABLES
            
            //--Bounding
            this.boundingBox = AABB.setUp(worldVP.x, worldVP.y, worldVP.width / 2, worldVP.height / 2);
            
            //Forward Follow
            this.lastX = worldVP.x;
            this.lastY = worldVP.y;
            this.lastOrientation = worldCamera.orientation;
            this.forwardX = 0;
            this.forwardY = 0;
            this.forwardAngle = 0;
            this.averageOffsetX = 0;
            this.averageOffsetY = 0;
            this.averageOffsetAngle = 0;
            this.offsetX = 0;
            this.offsetY = 0;
            this.offsetAngle = 0;
            this.forwardFollower = Data.setUp(
                "x", this.lastX,
                "y", this.lastY,
                "orientation", this.lastOrientation
            );
            
            this.lastFollow = Data.setUp(
                "entity", null,
                "mode", null,
                "offsetX", 0,
                "offsetY", 0,
                "begin", 0
            );
            
            this.xMagnitude = 0;
            this.yMagnitude = 0;
            this.xWaveLength = 0;
            this.yWaveLength = 0;
            this.xShakeTime = 0;
            this.yShakeTime = 0;
            this.shakeTime = 0;
            this.shakeIncrementor = 0;
            
            this.direction = true;
            this.stationary = false;
            
            this.viewportUpdate = false;
            
            if (this.owner.container) {
                this.parentContainer = this.owner.container;
            } else if (this.owner.stage) {
                this.canvas = this.canvas || platypus.game.app.display.canvas; //TODO: Probably need to find a better way to handle resizing - DDD 10/4/2015
                this.parentContainer = this.owner.stage;
                this.owner.width  = this.canvas.width;
                this.owner.height = this.canvas.height;
            } else {
                platypus.debug.warn('Camera: There appears to be no Container on this entity for the camera to display.');
            }
            this.container = new PIXI.Container();
            this.container.visible = false;
            this.parentContainer.addChild(this.container);
            this.movedCamera = false;
        },
        events: {
            /**
             * Sets up the camera window size on load.
             *
             * @method 'load'
             */
            "load": function () {
                this.resize();
            },
            
            /**
             * On receiving this message, the camera begins viewing the world.
             *
             * @method 'render-world'
             * @param data {Object} Information about the world.
             * @param data.world {PIXI.Container} The container containing world entities.
             */
            "render-world": function (data) {
                this.world = data.world;
                this.container.addChild(this.world);
            },
            
            /**
             * The viewport is flagged to update when children are added.
             *
             * @method 'child-entity-added'
             * @param entity {platypus.Entity} Expects an entity as the message object.
              **/
            "child-entity-added": function (entity) {
                this.viewportUpdate = true;
                
                if (this.worldIsLoaded) {
                    /**
                     * On receiving a "world-loaded" message, the camera broadcasts the world size to all children in the world.
                     *
                     * @event 'camera-loaded'
                     * @param message
                     * @param message.world {platypus.AABB} The dimensions of the world map.
                     **/
                    entity.triggerEvent('camera-loaded', this.cameraLoadedMessage);
                }
            },

            /**
             * Triggers "camera-update" on newly changed entities.
             *
             * @method 'child-entity-updated'
             * @param entity {platypus.Entity} Expects an entity as the message object to determine whether to trigger `camera-update` on it.
             * @since 0.6.8
             **/
            "child-entity-updated": function (entity) {
                this.viewportUpdate = true;
                
                if (this.worldIsLoaded) {
                    entity.triggerEvent('camera-update', this.message);
                }
            },

            /**
             * On receiving this message, the camera updates its world location and size as necessary. An example of this message is triggered by the [TiledLoader](platypus.components.TiledLoader.html) component.
             *
             * @method 'world-loaded'
             * @param message {Object}
             * @param [message.width] {number} The width of the loaded world.
             * @param [message.height] {number} The height of the loaded world.
             * @param [message.camera] {platypus.Entity} An entity that the camera should follow in the loaded world.
             **/
            "world-loaded": function (values) {
                var msg = this.message;
                
                msg.viewport.set(this.worldCamera.viewport);
                this.worldDimensions.set(values.world);
                
                this.worldIsLoaded = true;
                if (values.camera) {
                    this.follow(values.camera);
                }
                if (this.owner.triggerEventOnChildren) {
                    this.owner.triggerEventOnChildren('camera-loaded', this.cameraLoadedMessage);
                }
                this.updateMovementMethods();
            },
            
            /**
             * If mouse dragging should cause the camera to move, this listens for the beginning of the drag motion.
             *
             * @method 'mousedown'
             * @param event {Object} The mouse event.
             * @since 0.9.0
             **/
            "mousedown": function (event) {
                var worldVP = this.worldCamera.viewport;

                if (this.state === 'mouse-pan') {
                    if (!this.mouseVector) {
                        this.mouseVector = Vector.setUp();
                        this.mouseWorldOrigin = Vector.setUp();
                    }
                    this.mouse = this.mouseVector;
                    this.mouse.x = event.event.x;
                    this.mouse.y = event.event.y;
                    this.mouseWorldOrigin.x = worldVP.x;
                    this.mouseWorldOrigin.y = worldVP.y;
                    event.pixiEvent.stopPropagation();
                }
            },
            
            /**
             * If mouse dragging should cause the camera to move, this listens the drag motion.
             *
             * @method 'pressmove'
             * @param event {Object} The mouse event.
             * @since 0.9.0
             **/
            "pressmove": function (event) {
                if (this.mouse) {
                    if (this.move(this.mouseWorldOrigin.x + (this.mouse.x - event.event.x) / this.world.transform.worldTransform.a, this.mouseWorldOrigin.y + (this.mouse.y - event.event.y) / this.world.transform.worldTransform.d)) {
                        this.viewportUpdate = true;
                        this.movedCamera = true;
                        event.pixiEvent.stopPropagation();
                    }
                }
            },

            /**
             * If mouse dragging should cause the camera to move, this listens for the end of the drag motion.
             *
             * @method 'pressup'
             * @param event {Object} The mouse event.
             * @since 0.9.0
             **/
            "pressup": function (event) {
                if (this.mouse) {
                    this.mouse = null;
                    if (this.movedCamera) {
                        this.movedCamera = false;
                        event.pixiEvent.stopPropagation();
                    }
                }
            },
            
            /**
             * On a "tick" step event, the camera updates its location according to its current state.
             *
             * @method 'tick'
             * @param message {Object}
             * @param message.delta {Number} If necessary, the current camera update function may require the length of the tick to adjust movement rate.
             **/
            "tick": function (resp) {
                var msg       = this.message,
                    viewport  = msg.viewport,
                    worldCamera = this.worldCamera;
                
                if ((this.state === 'following') && this.followingFunction(this.following, resp.delta)) {
                    this.viewportUpdate = true;
                }
                
                // Need to update owner's size information for changes to canvas size
                if (this.canvas) {
                    this.owner.width  = this.canvas.width;
                    this.owner.height = this.canvas.height;
                }
                
                // Check for owner resizing
                if ((this.owner.width !== this.lastWidth) || (this.owner.height !== this.lastHeight)) {
                    this.resize();
                    this.lastWidth = this.owner.width;
                    this.lastHeight = this.owner.height;
                }
                
                if (this.viewportUpdate) {
                    this.viewportUpdate = false;
                    this.stationary = false;
                    msg.stationary = false;
                    
                    viewport.set(worldCamera.viewport);

                    if (this.shakeIncrementor < this.shakeTime) {
                        this.viewportUpdate = true;
                        this.shakeIncrementor += resp.delta;
                        this.shakeIncrementor = Math.min(this.shakeIncrementor, this.shakeTime);
                        
                        if (this.shakeIncrementor < this.xShakeTime) {
                            viewport.moveX(viewport.x + Math.sin((this.shakeIncrementor / this.xWaveLength) * (Math.PI * 2)) * this.xMagnitude);
                        }
                        
                        if (this.shakeIncrementor < this.yShakeTime) {
                            viewport.moveY(viewport.y + Math.sin((this.shakeIncrementor / this.yWaveLength) * (Math.PI * 2)) * this.yMagnitude);
                        }
                    }

                    // Set up the rest of the camera message:
                    msg.scaleX         = this.windowPerWorldUnitWidth;
                    msg.scaleY         = this.windowPerWorldUnitHeight;
                    msg.orientation    = worldCamera.orientation;
                    
                    // Transform the world to appear within camera
                    this.world.setTransform((viewport.halfWidth - viewport.x) * msg.scaleX, (viewport.halfHeight - viewport.y) * msg.scaleY, msg.scaleX, msg.scaleY, msg.orientation);
                    this.container.visible = true;

                    /**
                     * This component fires "camera-update" when the position of the camera in the world has changed. This event is triggered on both the entity (typically a layer) as well as children of the entity.
                     *
                     * @event 'camera-update'
                     * @param message {Object}
                     * @param message.world {platypus.AABB} The dimensions of the world map.
                     * @param message.orientation {Number} Number describing the orientation of the camera.
                     * @param message.scaleX {Number} Number of window pixels that comprise a single world coordinate on the x-axis.
                     * @param message.scaleY {Number} Number of window pixels that comprise a single world coordinate on the y-axis.
                     * @param message.viewport {platypus.AABB} An AABB describing the world viewport area.
                     * @param message.stationary {Boolean} Whether the camera is moving.
                     **/
                    this.owner.triggerEvent('camera-update', msg);
                    if (this.owner.triggerEventOnChildren) {
                        this.owner.triggerEventOnChildren('camera-update', msg);
                    }
                } else if (!this.stationary) {
                    this.stationary = true;
                    msg.stationary = true;

                    this.owner.triggerEvent('camera-update', msg);
                    if (this.owner.triggerEventOnChildren) {
                        this.owner.triggerEventOnChildren('camera-update', msg);
                    }
                }
                
                if (this.lastFollow.begin) {
                    if (this.lastFollow.begin < Date.now()) {
                        this.follow(this.lastFollow);
                    }
                }
            },
            
            /**
            * The camera listens for this event to change its world viewport size.
            *
            * @method 'resize-camera'
            * @param dimensions {Object} List of key/value pairs describing new viewport size
            * @param dimensions.width {number} Width of the camera viewport
            * @param dimensions.height {number} Height of the camera viewport
            **/
            "resize-camera": function (dimensions) {
                this.width = dimensions.width;
                this.height = dimensions.height;
                this.resize();
            },
            
            /**
             * The camera listens for this event to change its position in the world.
             *
             * @method 'relocate'
             * @param location {Vector|Object} List of key/value pairs describing new location
             * @param location.x {Number} New position along the x-axis.
             * @param location.y {Number} New position along the y-axis.
             * @param [location.time] {Number} The time to transition to the new location.
             * @param [location.ease] {Function} The ease function to use. Defaults to a linear transition.
             */
            "relocate": (function () {
                var move = function (v) {
                        if (this.move(v.x, v.y)) {
                            this.viewportUpdate = true;
                        }
                    },
                    stop = function () {
                        this.recycle();
                    };

                return function (location) {
                    var v = null,
                        worldVP = this.worldCamera.viewport;

                    if (location.time && window.createjs && createjs.Tween) {
                        v = Vector.setUp(worldVP.x, worldVP.y);
                        createjs.Tween.get(v).to({x: location.x, y: location.y}, location.time, location.ease).on('change', move.bind(this, v)).call(stop.bind(v));
                    } else if (this.move(location.x, location.y)) {
                        this.viewportUpdate = true;
                    }
                };
            }()),
            
            /**
            * On receiving this message, the camera begins following the requested object.
            *
            * @method 'follow'
            * @param message {Object}
            * @param message.mode {String} Can be "locked", "forward", "bounding", "anchor-bound", or "static". "static" suspends following, but the other three settings require that the entity parameter be defined. Also set the bounding area parameters if sending "bounding" as the following method and the movement parameters if sending "forward" as the following method.
            * @param [message.entity] {platypus.Entity} The entity that the camera should commence following.
            * @param [message.top] {number} The top of a bounding box following an entity.
            * @param [message.left] {number} The left of a bounding box following an entity.
            * @param [message.width] {number} The width of a bounding box following an entity.
            * @param [message.height] {number} The height of a bounding box following an entity.
            * @param [message.movementX] {number} Movement multiplier for focusing the camera ahead of a moving entity in the horizontal direction.
            * @param [message.movementY] {number} Movement multiplier for focusing the camera ahead of a moving entity in the vertical direction.
            * @param [message.offsetX] {number} How far to offset the camera from the entity horizontally.
            * @param [message.offsetY] {number} How far to offset the camera from the entity vertically.
            * @param [message.time] {number} How many milliseconds to follow the entity.
            **/
            "follow": function (def) {
                this.follow(def);
            },
            
            /**
            * On receiving this message, the camera will shake around its target location.
            *
            * @method 'shake'
            * @param shake {Object}
            * @param [shake.xMagnitude] {number} How much to move along the x axis.
            * @param [shake.yMagnitude] {number} How much to move along the y axis.
            * @param [shake.xFrequency] {number} How quickly to shake along the x axis.
            * @param [shake.yFrequency] {number} How quickly to shake along the y axis.
            * @param [shake.time] {number} How long the camera should shake.
            **/
            "shake": function (shakeDef) {
                var def = shakeDef || {},
                    xMag    = def.xMagnitude || 0,
                    yMag    = def.yMagnitude || 0,
                    xFreq   = def.xFrequency || 0, //Cycles per second
                    yFreq   = def.yFrequency || 0, //Cycles per second
                    second  = 1000,
                    time    = def.time || 0;
                
                this.viewportUpdate = true;
                
                this.shakeIncrementor = 0;
                
                this.xMagnitude = xMag;
                this.yMagnitude = yMag;
                
                if (xFreq === 0) {
                    this.xWaveLength = 1;
                    this.xShakeTime = 0;
                } else {
                    this.xWaveLength = (second / xFreq);
                    this.xShakeTime = Math.ceil(time / this.xWaveLength) * this.xWaveLength;
                }
                
                if (yFreq === 0) {
                    this.yWaveLength = 1;
                    this.yShakeTime = 0;
                } else {
                    this.yWaveLength = (second / yFreq);
                    this.yShakeTime = Math.ceil(time / this.yWaveLength) * this.yWaveLength;
                }
                
                this.shakeTime = Math.max(this.xShakeTime, this.yShakeTime);
            }
        },
        
        methods: {
            follow: function (def) {
                var portion = 0.1;
                
                if (def.time) { //save current follow
                    if (!this.lastFollow.begin) {
                        this.lastFollow.entity = this.following;
                        this.lastFollow.mode   = this.mode;
                        this.lastFollow.offsetX = this.offsetX;
                        this.lastFollow.offsetY = this.offsetY;
                    }
                    this.lastFollow.begin  = Date.now() + def.time;
                } else if (this.lastFollow.begin) {
                    this.lastFollow.begin = 0;
                }
                
                this.mode = def.mode;
                
                switch (def.mode) {
                case 'locked':
                    this.state = 'following';
                    this.following = def.entity;
                    this.followingFunction = this.lockedFollow;
                    this.offsetX = def.offsetX || 0;
                    this.offsetY = def.offsetY || 0;
                    this.offsetAngle = def.offsetAngle || 0;
                    break;
                case 'forward':
                    this.state = 'following';
                    this.followFocused   = false;
                    this.following       = def.entity;
                    this.lastX           = def.entity.x - def.offsetX || 0;
                    this.lastY           = def.entity.y - def.offsetY || 0;
                    this.lastOrientation = def.entity.orientation || 0;
                    this.forwardX  = def.movementX || (this.transitionX * portion);
                    this.forwardY  = def.movementY || (this.transitionY * portion);
                    this.averageOffsetX = 0;
                    this.averageOffsetY = 0;
                    this.averageOffsetAngle = 0;
                    this.offsetX = def.offsetX || 0;
                    this.offsetY = def.offsetY || 0;
                    this.offsetAngle = def.offsetAngle || 0;
                    this.followingFunction = this.forwardFollow;
                    break;
                case 'bounding':
                    this.state = 'following';
                    this.following = def.entity;
                    this.offsetX = def.offsetX || 0;
                    this.offsetY = def.offsetY || 0;
                    this.offsetAngle = def.offsetAngle || 0;
                    this.boundingBox.setAll(def.x, def.y, def.width, def.height);
                    this.followingFunction = this.boundingFollow;
                    break;
                case 'anchor-bound':
                    this.state = 'following';
                    this.following = def.entity;
                    this.followingFunction = anchorBound.bind(this, def.anchorAABB, def.offsetX || 0, def.offsetY || 0);
                    break;
                case 'pan':
                    this.state = 'mouse-pan';
                    this.following = null;
                    this.followingFunction = null;
                    if (def && (typeof def.x === 'number') && (typeof def.y === 'number')) {
                        this.move(def.x, def.y, def.orientation || 0);
                        this.viewportUpdate = true;
                    }
                    break;
                default:
                    this.state = 'static';
                    this.following = null;
                    this.followingFunction = null;
                    if (def && (typeof def.x === 'number') && (typeof def.y === 'number')) {
                        this.move(def.x, def.y, def.orientation || 0);
                        this.viewportUpdate = true;
                    }
                    break;
                }
                
                if (def.begin) { // get rid of last follow
                    def.begin = 0;
                }

            },
            
            move: function (x, y, newOrientation) {
                var moved = this.moveX(x);
                moved = this.moveY(y) || moved;
                if (this.rotate) {
                    moved = this.reorient(newOrientation || 0) || moved;
                }
                return moved;
            },
            
            moveX: doNothing,
            
            moveY: doNothing,
            
            reorient: function (newOrientation) {
                var errMargin = 0.0001,
                    worldCamera = this.worldCamera;
                
                if (Math.abs(worldCamera.orientation - newOrientation) > errMargin) {
                    worldCamera.orientation = newOrientation;
                    return true;
                }
                return false;
            },
            
            lockedFollow: (function () {
                var min = Math.min,
                    getTransitionalPoint = function (a, b, ratio) {
                        // Find point between two points according to ratio.
                        return ratio * b + (1 - ratio) * a;
                    },
                    getRatio = function (transition, time) {
                        // Look at the target transition time (in milliseconds) and set up ratio accordingly.
                        if (transition) {
                            return min(time / transition, 1);
                        } else {
                            return 1;
                        }
                    };
                
                return function (entity, time) {
                    var worldCamera = this.worldCamera,
                        worldVP = worldCamera.viewport,
                        x = getTransitionalPoint(worldVP.x, entity.x, getRatio(this.transitionX, time)),
                        y = getTransitionalPoint(worldVP.y, entity.y, getRatio(this.transitionY, time));

                    if (this.rotate) { // Only run the orientation calculations if we need them.
                        return this.move(x, y, getTransitionalPoint(worldCamera.orientation, -(entity.orientation || 0), getRatio(this.transitionAngle, time)));
                    } else {
                        return this.move(x, y, 0);
                    }
                };
            }()),
            
            forwardFollow: function (entity, time) {
                var avgFraction = 0.9,
                    avgFractionFlip = 1 - avgFraction,
                    ff = this.forwardFollower,
                    moved  = false,
                    ms = 15,
                    standardizeTimeDistance = ms / time, //This allows the camera to pan appropriately on slower devices or longer ticks
                    worldCamera = this.worldCamera,
                    worldVP = worldCamera.viewport,
                    x = entity.x + this.offsetX,
                    y = entity.y + this.offsetY,
                    a = (entity.orientation || 0) + this.offsetAngle;
                
                if (this.followFocused && (this.lastX === x) && (this.lastY === y)) {
                    return this.lockedFollow(ff, time);
                } else {
                    // span over last 10 ticks to prevent jerkiness
                    this.averageOffsetX *= avgFraction;
                    this.averageOffsetY *= avgFraction;
                    this.averageOffsetX += avgFractionFlip * (x - this.lastX) * standardizeTimeDistance;
                    this.averageOffsetY += avgFractionFlip * (y - this.lastY) * standardizeTimeDistance;

                    if (Math.abs(this.averageOffsetX) > (worldVP.width / (this.forwardX * 2))) {
                        this.averageOffsetX = 0;
                    }
                    if (Math.abs(this.averageOffsetY) > (worldVP.height / (this.forwardY * 2))) {
                        this.averageOffsetY = 0;
                    }
                    
                    if (this.rotate) {
                        this.averageOffsetAngle *= avgFraction;
                        this.averageOffsetAngle += avgFractionFlip * (a - this.lastOrientation) * standardizeTimeDistance;
                        if (Math.abs(this.averageOffsetAngle) > (worldCamera.orientation / (this.forwardAngle * 2))) {
                            this.averageOffsetAngle = 0;
                        }
                    }

                    ff.x = this.averageOffsetX * this.forwardX + x;
                    ff.y = this.averageOffsetY * this.forwardY + y;
                    ff.orientation = this.averageOffsetAngle * this.forwardAngle + a;
                    
                    this.lastX = x;
                    this.lastY = y;
                    this.lastOrientation = a;
                    
                    moved = this.lockedFollow(ff, time);

                    if (!this.followFocused && !moved) {
                        this.followFocused = true;
                    }
                    
                    return moved;
                }
                
                
            },
            
            boundingFollow: function (entity, time) {
                var x = 0,
                    y = 0,
                    ratioX  = (this.transitionX ? Math.min(time / this.transitionX, 1) : 1),
                    iratioX = 1 - ratioX,
                    ratioY  = (this.transitionY ? Math.min(time / this.transitionY, 1) : 1),
                    iratioY = 1 - ratioY,
                    worldVP = this.worldCamera.viewport;
                
                this.boundingBox.move(worldVP.x, worldVP.y);
                
                if (entity.x > this.boundingBox.right) {
                    x = entity.x - this.boundingBox.halfWidth;
                } else if (entity.x < this.boundingBox.left) {
                    x = entity.x + this.boundingBox.halfWidth;
                }
                
                if (entity.y > this.boundingBox.bottom) {
                    y = entity.y - this.boundingBox.halfHeight;
                } else if (entity.y < this.boundingBox.top) {
                    y = entity.y + this.boundingBox.halfHeight;
                }
                
                if (x !== 0) {
                    x = this.moveX(ratioX * x + iratioX * worldVP.x);
                }
                
                if (y !== 0) {
                    y = this.moveY(ratioY * y + iratioY * worldVP.y);
                }
                
                return x || y;
            },
            
            resize: function () {
                var worldAspectRatio = this.width / this.height,
                    windowAspectRatio = this.owner.width / this.owner.height,
                    worldVP = this.worldCamera.viewport;
                
                //The dimensions of the camera in the window
                this.viewport.setAll(this.owner.width / 2, this.owner.height / 2, this.owner.width, this.owner.height);
                
                if (!this.stretch) {
                    if (windowAspectRatio > worldAspectRatio) {
                        if (this.overflow) {
                            worldVP.resize(this.height * windowAspectRatio, this.height);
                        } else {
                            this.viewport.resize(this.viewport.height * worldAspectRatio, this.viewport.height);
                        }
                    } else if (this.overflow) {
                        worldVP.resize(this.width, this.width / windowAspectRatio);
                    } else {
                        this.viewport.resize(this.viewport.width, this.viewport.width / worldAspectRatio);
                    }
                }
                
                this.worldPerWindowUnitWidth  = worldVP.width  / this.viewport.width;
                this.worldPerWindowUnitHeight = worldVP.height / this.viewport.height;
                this.windowPerWorldUnitWidth  = this.viewport.width  / worldVP.width;
                this.windowPerWorldUnitHeight = this.viewport.height / worldVP.height;
                
                this.container.setTransform(this.viewport.x - this.viewport.halfWidth, this.viewport.y - this.viewport.halfHeight);
                
                this.viewportUpdate = true;
                
                this.updateMovementMethods();
            },
            
            updateMovementMethods: (function () {
                // This is used to change movement modes as needed rather than doing a check every tick to determine movement type. - DDD 2/29/2016
                var doNot = doNothing,
                    centerX = function () {
                        var world = this.worldDimensions;
                        
                        this.worldCamera.viewport.moveX(world.width / 2 + world.left);
                        this.moveX = doNot;
                        return true;
                    },
                    centerY = function () {
                        var world = this.worldDimensions;
                        
                        this.worldCamera.viewport.moveY(world.height / 2 + world.top);
                        this.moveY = doNot;
                        return true;
                    },
                    containX = function (x) {
                        var aabb = this.worldCamera.viewport,
                            d = this.worldDimensions,
                            w = d.width,
                            l = d.left;
                        
                        if (Math.abs(aabb.x - x) > this.threshold) {
                            if (x + aabb.halfWidth > w + l) {
                                aabb.moveX(w - aabb.halfWidth + l);
                            } else if (x < aabb.halfWidth + l) {
                                aabb.moveX(aabb.halfWidth + l);
                            } else {
                                aabb.moveX(x);
                            }
                            return true;
                        }
                        return false;
                    },
                    containY = function (y) {
                        var aabb = this.worldCamera.viewport,
                            d = this.worldDimensions,
                            h = d.height,
                            t = d.top;
                        
                        if (Math.abs(aabb.y - y) > this.threshold) {
                            if (y + aabb.halfHeight > h + t) {
                                aabb.moveY(h - aabb.halfHeight + t);
                            } else if (y < aabb.halfHeight + t) {
                                aabb.moveY(aabb.halfHeight + t);
                            } else {
                                aabb.moveY(y);
                            }
                            return true;
                        }
                        return false;
                    },
                    allX = function (x) {
                        var aabb = this.worldCamera.viewport;
                        
                        if (Math.abs(aabb.x - x) > this.threshold) {
                            aabb.moveX(x);
                            return true;
                        }
                        return false;
                    },
                    allY = function (y) {
                        var aabb = this.worldCamera.viewport;
                        
                        if (Math.abs(aabb.y - y) > this.threshold) {
                            aabb.moveY(y);
                            return true;
                        }
                        return false;
                    };
                
                return function () {
                    var threshold = this.threshold,
                        worldVP = this.worldCamera.viewport,
                        world = this.worldDimensions,
                        w = world.width,
                        h = world.height;
                    
                    if (!w) {
                        this.moveX = allX;
                    } else if (w < worldVP.width) {
                        this.moveX = centerX;
                    } else {
                        this.moveX = containX;
                    }

                    if (!h) {
                        this.moveY = allY;
                    } else if (h < worldVP.height) {
                        this.moveY = centerY;
                    } else {
                        this.moveY = containY;
                    }

                    // Make sure camera is correctly contained:
                    this.threshold = -1; // forces update
                    this.moveX(worldVP.x);
                    this.moveY(worldVP.y);
                    this.threshold = threshold;
                };
            }()),
            
            destroy: function () {
                this.parentContainer.removeChild(this.container);
                this.parentContainer = null;
                this.container = null;
                if (this.mouseVector) {
                    this.mouseVector.recycle();
                    this.mouseWorldOrigin.recycle();
                }
                
                this.boundingBox.recycle();
                this.viewport.recycle();
                this.worldCamera.viewport.recycle();
                this.worldCamera.recycle();
                this.message.viewport.recycle();
                this.message.recycle();
                this.cameraLoadedMessage.recycle();
                this.worldDimensions.recycle();
    
                this.forwardFollower.recycle();
                this.lastFollow.recycle();
            }
        },

        publicMethods: {
            /**
             * Returns whether a particular display object intersects the camera's viewport on the canvas.
             *
             * @method isOnCanvas
             * @param bounds {PIXI.Rectangle|Object} The bounds of the display object.
             * @param bounds.height {Number} The height of the display object.
             * @param bounds.width {Number} The width of the display object.
             * @param bounds.x {Number} The left edge of the display object.
             * @param bounds.y {Number} The top edge of the display object.
             * @return {Boolean} Whether the display object intersects the camera's bounds.
             * @since 0.10.0
             */
            isOnCanvas: function (bounds) {
                var canvas = this.canvas;

                return !bounds || !((bounds.x + bounds.width < 0) || (bounds.x > canvas.width) || (bounds.y + bounds.height < 0) || (bounds.y > canvas.height));
            },

            /**
             * Returns a world coordinate corresponding to a provided window coordinate.
             *
             * @method windowToWorld
             * @param windowVector {platypus.Vector} A vector describing a window position.
             * @param withOffset {Boolean} Whether to provide a world position relative to the camera's location.
             * @param vector {platypus.Vector} If provided, this is used as the return vector.
             * @return {platypus.Vector} A vector describing a world position.
             */
            windowToWorld: function (windowVector, withOffset, vector) {
                var worldVector = vector || Vector.setUp();
                
                worldVector.x = windowVector.x * this.worldPerWindowUnitWidth;
                worldVector.y = windowVector.y * this.worldPerWindowUnitHeight;
                
                if (withOffset !== false) {
                    worldVector.x += this.worldCamera.viewport.left;
                    worldVector.y += this.worldCamera.viewport.top;
                }

                return worldVector;
            },
            
            /**
             * Returns a window coordinate corresponding to a provided world coordinate.
             *
             * @method worldToWindow
             * @param worldVector {platypus.Vector} A vector describing a world position.
             * @param withOffset {Boolean} Whether to provide a window position relative to the camera's location.
             * @param vector {platypus.Vector} If provided, this is used as the return vector.
             * @return {platypus.Vector} A vector describing a window position.
             */
            worldToWindow: function (worldVector, withOffset, vector) {
                var windowVector = vector || Vector.setUp();

                windowVector.x = worldVector.x * this.windowPerWorldUnitWidth;
                windowVector.y = worldVector.y * this.windowPerWorldUnitHeight;
                
                if (withOffset !== false) {
                    windowVector.x += this.viewport.x;
                    windowVector.y += this.viewport.y;
                }

                return windowVector;
            }
        }
    });
}());
