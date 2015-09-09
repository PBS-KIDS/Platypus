/**
 * This component controls the game camera deciding where and how it should move. The camera also broadcasts messages when the window resizes or its orientation changes.
 * 
 * If either worldWidth and worldHeight is set to 0 it is assumed the world is infinite in that dimension.
 * 
 * @namespace platypus.components
 * @class Camera
 * @uses Component
*/
/*global createjs, PIXI, platypus */
/*jslint plusplus:true */
(function () {
    "use strict";
    
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
            "transitionAngle": 600,
            
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
             * Number specifying width of the world in units. This property is available on the Entity.
             * 
             * @property worldWidth
             * @type number
             * @default 0
             **/
            "worldWidth": 0,
            
            /**
             * Number specifying height of the world in units. This property is available on the Entity.
             * 
             * @property worldHeight
             * @type number
             * @default 0
             **/
            "worldHeight": 0
        },
        constructor: function (definition) {
            //The dimensions of the camera in the window
            this.viewport = new platypus.AABB(0, 0, 0, 0);
            
            //The dimensions of the camera in the game world
            this.worldCamera = {
                viewport: new platypus.AABB(this.x, this.y, this.width, this.height),
                orientation: definition.orientation || 0
            };
            
            //Message object defined here so it's reusable
            this.message = {
                viewport: new platypus.AABB(),
                scaleX: 0,
                scaleY: 0,
                orientation: 0
            };
    
            //Whether the map has finished loading.
            this.worldIsLoaded = false;
            
            this.following = undefined;
            this.state = 'static';//'roaming';
            
            //FOLLOW MODE VARIABLES
            
            //--Bounding
            this.boundingBox = new platypus.AABB(this.worldCamera.viewport.x, this.worldCamera.viewport.y, this.worldCamera.viewport.width / 2, this.worldCamera.viewport.height / 2);
            
            //Forward Follow
            this.lastX = this.worldCamera.viewport.x;
            this.lastY = this.worldCamera.viewport.y;
            this.lastOrientation = this.worldCamera.orientation;
            this.forwardX = 0;
            this.forwardY = 0;
            this.forwardAngle = 0;
            this.averageOffsetX = 0;
            this.averageOffsetY = 0;
            this.averageOffsetAngle = 0;
            this.offsetX = 0;
            this.offsetY = 0;
            this.offsetAngle = 0;
            this.forwardFollower = {
                x: this.lastX,
                y: this.lastY,
                orientation: this.lastOrientation
            };
            
            this.lastFollow = {
                entity: null,
                mode: null,
                offsetX: 0,
                offsetY: 0,
                begin: 0
            };
            
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
                this.canvas = this.canvas || springroll.Application.instance.display.canvas; //TODO: Probably need to find a better way to handle resizing - DDD 10/4/2015
                this.parentContainer = this.owner.stage;
                this.owner.width  = this.canvas.width;
                this.owner.height = this.canvas.height;
            } else {
                console.warn('Camera: There appears to be no Container on this entity for the camera to display.');
            }
            this.container = new PIXI.Container();
            this.matrix = this.container.transformMatrix = new PIXI.Matrix();
            this.parentContainer.addChild(this.container);
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
                this.world.transformMatrix = this.world.transformMatrix || new PIXI.Matrix();
            },
            
            /**
             * If children entities are listening for a `camera-update` message, they are added to an internal list.
             * 
             * @method 'child-entity-added'
             * @param entity {Entity} Expects an entity as the message object to determine whether to trigger `camera-update` on it.
              **/
            "child-entity-added": function (entity) {
                this.viewportUpdate = true;
                
                if (this.worldIsLoaded) {
                    /**
                     * On receiving a "world-loaded" message, the camera broadcasts the world size to all children in the world.
                     * 
                     * @event 'camera-loaded'
                     * @param message
                     * @param message.width {number} The width of the loaded world.
                     * @param message.height {number} The height of the loaded world.
                     **/
                    entity.triggerEvent('camera-loaded', {
                        width: this.worldWidth,
                        height: this.worldHeight
                    });
                }
            },

            /**
             * On receiving this message, the camera updates its world location and size as necessary. An example of this message is triggered by the [[Tiled-Loader]] component.
             * 
             * @method 'world-loaded'
             * @param message {Object}
             * @param [message.width] {number} The width of the loaded world.
             * @param [message.height] {number} The height of the loaded world.
             * @param [message.camera] {Entity} An entity that the camera should follow in the loaded world.
             **/
            "world-loaded": function (values) {
                this.worldIsLoaded = true;
                this.worldWidth    = values.width;
                this.worldHeight   = values.height;
                if (values.camera) {
                    this.follow(values.camera);
                }
                if (this.owner.triggerEventOnChildren) {
                    this.owner.triggerEventOnChildren('camera-loaded', values);
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
                var i = 0,
                    child     = null,
                    bounds    = null,
                    resets    = [],
                    msg       = this.message,
                    viewport  = msg.viewport,
                    transform = null;
                
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
                    
                    viewport.set(this.worldCamera.viewport);

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
                    msg.orientation    = this.worldCamera.orientation;
                    
                    // Transform the world to appear within camera
                    //this.world.setTransform(viewport.halfWidth * msg.scaleX, viewport.halfHeight * msg.scaleY, msg.scaleX, msg.scaleY, (msg.orientation || 0) * 180 / Math.PI, 0, 0, viewport.x, viewport.y);
                    transform = this.world.transformMatrix;
                    if (msg.orientation) {
                        transform.rotate(msg.orientation);
                    }
                    transform.a = msg.scaleX;
                    transform.b = 0;
                    transform.c = 0;
                    transform.d = msg.scaleY;
                    transform.tx = (viewport.halfWidth - viewport.x) / msg.scaleX;
                    transform.ty = (viewport.halfHeight - viewport.y) / msg.scaleY;
                    
                    /**
                     * This component fires "camera-update" when the position of the camera in the world has changed. This event is triggered on both the entity (typically a layer) as well as children of the entity.
                     * 
                     * @event 'camera-update'
                     * @param message {Object}
                     * @param message.orientation {number} Number describing the orientation of the camera.
                     * @param message.scaleX {number} Number of window pixels that comprise a single world coordinate on the x-axis.
                     * @param message.scaleY {number} Number of window pixels that comprise a single world coordinate on the y-axis.
                     * @param message.viewport {platypus.AABB} An AABB describing the world viewport area.
                     **/
                    this.owner.trigger('camera-update', msg);

                    if (this.owner.triggerEventOnChildren) {
                        this.owner.triggerEventOnChildren('camera-update', msg);
                    }
                    
                } else if (!this.stationary) {
                    
                    /**
                    * This component triggers "camera-stationary" on the entity when the camera stops moving.
                    *
                    * @event 'camera-stationary'
                    **/
                    this.owner.trigger('camera-stationary', msg);
                    this.stationary = true;
                    
                }
                
                this.container.addChild(this.world);

                // Make sure entities outside of the camera are not drawn (optimization)
                for (i = 0; i < this.world.children.length; i++) {
                    child = this.world.children[i];
                    if (child.visible && (child.name !== 'entity-managed')) {
                        bounds = child.getBounds();
                        if (bounds && ((bounds.x + bounds.width < viewport.left) || (bounds.x > viewport.right) || (bounds.y + bounds.height < viewport.top) || (bounds.y > viewport.bottom))) {
                            child.visible = false;
                            resets.push(child);
                        }
                    }
                }
                
                // Update the camera's snapshot
                //this.container.updateCache(); //TODO: This is not really supported in pixi - need to figure out a better way to handle multiple cameras. - DDD 10/4/2015
                
                // Reset visibility of hidden children
                for (i = 0; i < resets.length; i++) {
                    resets[i].visible = true;
                }

                if (this.lastFollow.begin) {
                    if (this.lastFollow.begin < new Date().getTime()) {
                        this.follow(this.lastFollow);
                    }
                }
            },
            
            /**
            * The camera listens for this event to change its world viewport size.
            *
            * @method 'resize'
            * @param dimensions {Object} List of key/value pairs describing new viewport size
            * @param dimensions.width {number} Width of the camera viewport
            * @param dimensions.height {number} Height of the camera viewport
            **/
            "resize": function (dimensions) {
                this.worldCamera.viewport.resize(dimensions.width, dimensions.height);
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
            "relocate": function (location) {
                var self = this,
                    move = function () {
                        if (self.move(v.x, v.y)) {
                            self.viewportUpdate = true;
                        }
                    },
                    v = null;

                if (location.time && window.createjs && createjs.Tween) {
                    v = new platypus.Vector(this.worldCamera.viewport.x, this.worldCamera.viewport.y);
                    createjs.Tween.get(v).to({x: location.x, y: location.y}, location.time, location.ease).on('change', move);
                } else {
                    if (this.move(location.x, location.y)) {
                        this.viewportUpdate = true;
                    }
                }
            },
            
            /**
            * On receiving this message, the camera begins following the requested object.
            *
            * @method 'follow'
            * @param message {Object}
            * @param message.mode {String} Can be "locked", "forward", "bounding", or "static". "static" suspends following, but the other three settings require that the entity parameter be defined. Also set the bounding area parameters if sending "bounding" as the following method and the movement parameters if sending "forward" as the following method.
            * @param [message.entity] {Entity} The entity that the camera should commence following.
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
                    time    = def.time || 0;
                
                this.viewportUpdate = true;
                
                this.shakeIncrementor = 0;
                
                this.xMagnitude = xMag;
                this.yMagnitude = yMag;
                
                if (xFreq === 0) {
                    this.xWaveLength = 1;
                    this.xShakeTime = 0;
                } else {
                    this.xWaveLength = (1000 / xFreq);
                    this.xShakeTime = Math.ceil(time / this.xWaveLength) * this.xWaveLength;
                }
                
                if (yFreq === 0) {
                    this.yWaveLength = 1;
                    this.yShakeTime = 0;
                } else {
                    this.yWaveLength = (1000 / yFreq);
                    this.yShakeTime = Math.ceil(time / this.yWaveLength) * this.yWaveLength;
                }
                
                this.shakeTime = Math.max(this.xShakeTime, this.yShakeTime);
            }
        },
        
        methods: {
            follow: function (def) {
                if (def.time) { //save current follow
                    if (!this.lastFollow.begin) {
                        this.lastFollow.entity = this.following;
                        this.lastFollow.mode   = this.mode;
                        this.lastFollow.offsetX = this.offsetX;
                        this.lastFollow.offsetY = this.offsetY;
                    }
                    this.lastFollow.begin  = new Date().getTime() + def.time;
                } else {
                    if (this.lastFollow.begin) {
                        this.lastFollow.begin = 0;
                    }
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
                    this.lastX           = def.entity.x || 0;
                    this.lastY           = def.entity.y || 0;
                    this.lastOrientation = def.entity.orientation || 0;
                    this.forwardX  = def.movementX || (this.transitionX / 10);
                    this.forwardY  = def.movementY || (this.transitionY / 10);
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
                default:
                    this.state = 'static';
                    this.following = undefined;
                    this.followingFunction = undefined;
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
            
            moveX: function (x) {
                var aabb = this.worldCamera.viewport;
                
                if (Math.abs(aabb.x - x) > this.threshold) {
                    if (this.worldWidth && this.worldWidth !== 0 && this.worldWidth < aabb.width) {
                        aabb.moveX(this.worldWidth / 2);
                    } else if (this.worldWidth && this.worldWidth !== 0 && (x + aabb.halfWidth > this.worldWidth)) {
                        aabb.moveX(this.worldWidth - aabb.halfWidth);
                    } else if (this.worldWidth && this.worldWidth !== 0 && (x < aabb.halfWidth)) {
                        aabb.moveX(aabb.halfWidth);
                    } else {
                        aabb.moveX(x);
                    }
                    return true;
                }
                return false;
            },
            
            moveY: function (y) {
                var aabb = this.worldCamera.viewport;
                
                if (Math.abs(aabb.y - y) > this.threshold) {
                    if (this.worldHeight && this.worldHeight !== 0 && this.worldHeight < aabb.height) {
                        aabb.moveY(this.worldHeight / 2);
                    } else if (this.worldHeight && this.worldHeight !== 0 && (y + aabb.halfHeight > this.worldHeight)) {
                        aabb.moveY(this.worldHeight - aabb.halfHeight);
                    } else if (this.worldHeight && this.worldHeight !== 0 && (y < aabb.halfHeight)) {
                        aabb.moveY(aabb.halfHeight);
                    } else {
                        aabb.moveY(y);
                    }
                    return true;
                }
                return false;
            },
            
            reorient: function (newOrientation) {
                if (Math.abs(this.worldCamera.orientation - newOrientation) > 0.0001) {
                    this.worldCamera.orientation = newOrientation;
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
                
                return function (entity, time, slowdown) {
                    var x = getTransitionalPoint(this.worldCamera.viewport.x, entity.x, getRatio(this.transitionX, time)),
                        y = getTransitionalPoint(this.worldCamera.viewport.y, entity.y, getRatio(this.transitionY, time));

                    if (this.rotate) { // Only run the orientation calculations if we need them.
                        return this.move(x, y, getTransitionalPoint(this.worldCamera.orientation, -(entity.orientation || 0), getRatio(this.transitionAngle, time)));
                    } else {
                        return this.move(x, y, 0);
                    }
                };
            }()),
            
            forwardFollow: function (entity, time) {
                var ff = this.forwardFollower,
                    standardizeTimeDistance = 15 / time, //This allows the camera to pan appropriately on slower devices or longer ticks
                    moved  = false,
                    x = entity.x + this.offsetX,
                    y = entity.y + this.offsetY,
                    a = (entity.orientation || 0) + this.offsetAngle;
                
                if (this.followFocused && (this.lastX === x) && (this.lastY === y)) {
                    return this.lockedFollow(ff, time);
                } else {
                    // span over last 10 ticks to prevent jerkiness
                    this.averageOffsetX *= 0.9;
                    this.averageOffsetY *= 0.9;
                    this.averageOffsetX += 0.1 * (x - this.lastX) * standardizeTimeDistance;
                    this.averageOffsetY += 0.1 * (y - this.lastY) * standardizeTimeDistance;

                    if (Math.abs(this.averageOffsetX) > (this.worldCamera.viewport.width / (this.forwardX * 2))) {
                        this.averageOffsetX = 0;
                    }
                    if (Math.abs(this.averageOffsetY) > (this.worldCamera.viewport.height / (this.forwardY * 2))) {
                        this.averageOffsetY = 0;
                    }
                    
                    if (this.rotate) {
                        this.averageOffsetAngle *= 0.9;
                        this.averageOffsetAngle += 0.1 * (a - this.lastOrientation) * standardizeTimeDistance;
                        if (Math.abs(this.averageOffsetAngle) > (this.worldCamera.orientation / (this.forwardAngle * 2))) {
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
                    iratioY = 1 - ratioY;
                
                this.boundingBox.move(this.worldCamera.viewport.x, this.worldCamera.viewport.y);
                
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
                    x = this.moveX(ratioX * x + iratioX * this.worldCamera.viewport.x);
                }
                
                if (y !== 0) {
                    y = this.moveY(ratioY * y + iratioY * this.worldCamera.viewport.y);
                }
                
                return x || y;
            },
            
            resize: function () {
                var worldAspectRatio = this.width / this.height,
                    windowAspectRatio = this.owner.width / this.owner.height;
                
                //The dimensions of the camera in the window
                this.viewport.setAll(this.owner.width / 2, this.owner.height / 2, this.owner.width, this.owner.height);
                
                if (!this.stretch) {
                    if (windowAspectRatio > worldAspectRatio) {
                        if (this.overflow) {
                            this.worldCamera.viewport.resize(this.height * windowAspectRatio, this.height);
                        } else {
                            this.viewport.resize(this.viewport.height * worldAspectRatio, this.viewport.height);
                        }
                    } else {
                        if (this.overflow) {
                            this.worldCamera.viewport.resize(this.width, this.width / windowAspectRatio);
                        } else {
                            this.viewport.resize(this.viewport.width, this.viewport.width / worldAspectRatio);
                        }
                    }
                }
                
                this.worldPerWindowUnitWidth  = this.worldCamera.viewport.width  / this.viewport.width;
                this.worldPerWindowUnitHeight = this.worldCamera.viewport.height / this.viewport.height;
                this.windowPerWorldUnitWidth  = this.viewport.width  / this.worldCamera.viewport.width;
                this.windowPerWorldUnitHeight = this.viewport.height / this.worldCamera.viewport.height;
                
                //this.container.cache(0, 0, this.viewport.width, this.viewport.height, 1);
                this.matrix.tx = this.viewport.x - this.viewport.halfWidth;
                this.matrix.ty = this.viewport.y - this.viewport.halfHeight;
                
                this.viewportUpdate = true;
            },
            
            windowToWorld: function (sCoords) {
                var wCoords = [];
                wCoords[0] = Math.round((sCoords[0] - this.viewport.x) * this.worldPerWindowUnitWidth);
                wCoords[1] = Math.round((sCoords[1] - this.viewport.y) * this.worldPerWindowUnitHeight);
                return wCoords;
            },
            
            worldToWindow: function (wCoords) {
                var sCoords = [];
                sCoords[0] = Math.round((wCoords[0] * this.windowPerWorldUnitWidth) + this.viewport.x);
                sCoords[1] = Math.round((wCoords[1] * this.windowPerWorldUnitHeight) + this.viewport.y);
                return sCoords;
            },
            
            destroy: function () {
                this.parentContainer.removeChild(this.container);
                this.parentContainer = null;
                this.container = null;
            }
        }
    });
}());
