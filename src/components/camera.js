/**
 * This component controls the game camera deciding where and how it should move. The camera also broadcasts messages when the window resizes or its orientation changes.
 * 
 * If either worldWidth and worldHeight is set to 0 it is assumed the world is infinite in that dimension.
 * 
 * @namespace platypus.components
 * @class Camera
 * @uses Component
*/
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";
    
    return platypus.createComponentClass({
        id: 'Camera',
        properties: {
            /**
             * Number specifying top of viewport in world coordinates.
             * 
             * @property top
             * @type number
             * @default 0
             **/
            "top": 0,
            
            /**
             * Number specifying left of viewport in world coordinates.
             * 
             * @property left
             * @type number
             * @default 0
             **/
            "left": 0,
             
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
            "rotate": false
        },
        publicProperties: {
            /**
             * The entity's canvas element is used to determine the window size of the camera.
             * 
             * @property canvas
             * @type DOMElement Canvas
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
            this.window = {
                viewportTop:    0,
                viewportLeft:   0,
                viewportWidth:  0,
                viewportHeight: 0
            };
            
            //The dimensions of the camera in the game world
            this.worldWindow = {
                viewportWidth:       this.width,
                viewportHeight:      this.height,
                viewportLeft:        definition.left        || 0,
                viewportTop:         definition.top         || 0,
                viewportOrientation: definition.orientation || 0
            };
            
            //Message object defined here so it's reusable
            this.message = {
                viewportWidth:  0,
                viewportHeight: 0,
                viewportLeft:   0,
                viewportTop:    0,
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
            this.bBBorderX = 0;
            this.bBBorderY = 0;
            this.bBInnerWidth = 0;
            this.bBInnerHeight = 0;
            this.setBoundingArea();
            
            //Forward Follow
            this.lastLeft = this.worldWindow.viewportLeft;
            this.lastTop = this.worldWindow.viewportTop;
            this.lastOrientation = this.worldWindow.viewportOrientation;
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
                x: this.lastLeft,
                y: this.lastTop,
                orientation: this.lastOrientation
            };
            
            this.lastFollow = {
                entity: null,
                mode: null,
                offsetX: 0,
                offsetY: 0,
                begin: 0
            };
            
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
            
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
            
            this.parentContainer = this.owner.container || this.owner.stage;
            this.container = new createjs.Container();
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
             * @param data.world {createjs.Container} The container containing world entities.
             */
            "render-world": function (data) {
                this.world = data.world;
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
                var cvs = this.owner.stage.canvas;
                
                if ((this.state === 'following') && this.followingFunction(this.following, resp.delta)) {
                    this.viewportUpdate = true;
                }
                
                if ((cvs.width !== this.window.viewportWidth) || (cvs.height !== this.window.viewportHeight)) {
                    this.resize();
                }
                
                if (this.viewportUpdate) {
                    this.viewportUpdate = false;
                    this.stationary = false;
                    
                    if (this.shakeIncrementor < this.shakeTime) {
                        this.viewportUpdate = true;
                        this.shakeIncrementor += resp.delta;
                        this.shakeIncrementor = Math.min(this.shakeIncrementor, this.shakeTime);
                        
                        if (this.shakeIncrementor < this.xShakeTime) {
                            this.shakeOffsetX = Math.sin((this.shakeIncrementor / this.xWaveLength) * (Math.PI * 2)) * this.xMagnitude;
                        } else {
                            this.shakeOffsetX = 0;
                        }
                        
                        if (this.shakeIncrementor < this.yShakeTime) {
                            this.shakeOffsetY = Math.sin((this.shakeIncrementor / this.yWaveLength) * (Math.PI * 2)) * this.yMagnitude;
                        } else {
                            this.shakeOffsetY = 0;
                        }
                    }
                    
                    
                    this.message.viewportLeft   = this.worldWindow.viewportLeft + this.shakeOffsetX;
                    this.message.viewportTop    = this.worldWindow.viewportTop + this.shakeOffsetY;
                    this.message.viewportWidth  = this.worldWindow.viewportWidth;
                    this.message.viewportHeight = this.worldWindow.viewportHeight;
                    this.message.scaleX         = this.windowPerWorldUnitWidth;
                    this.message.scaleY         = this.windowPerWorldUnitHeight;
                    this.message.orientation    = this.worldWindow.viewportOrientation;
                    
                    this.container.addChild(this.world);

                    var i = 0,
                        child           = null,
                        bounds          = null,
                        dpr             = (window.devicePixelRatio || 1),
                        cameraInfo      = this.message,
                        viewportCenterX = cameraInfo.viewportLeft + cameraInfo.viewportWidth / 2,
                        viewportCenterY = cameraInfo.viewportTop + cameraInfo.viewportHeight / 2,
                        resets          = [];
                    
                    // Transform the world to appear within camera
                    this.world.setTransform((cameraInfo.viewportWidth / 2) * cameraInfo.scaleX * dpr, (cameraInfo.viewportHeight / 2) * cameraInfo.scaleY * dpr, cameraInfo.scaleX * dpr, cameraInfo.scaleY * dpr, (cameraInfo.orientation || 0) * 180 / Math.PI, 0, 0, viewportCenterX, viewportCenterY);
                    
                    // Make sure entities outside of the camera are not drawn (optimization)
                    for (i = 0; i < this.world.children.length; i++) {
                        child = this.world.children[i];
                        if (child.visible && (child.name !== 'entity-managed')) {
                            bounds = child.getTransformedBounds();
                            if (bounds && ((bounds.x + bounds.width < this.message.viewportLeft) || (bounds.x > this.message.viewportLeft + this.message.viewportWidth) || (bounds.y + bounds.height < this.message.viewportTop) || (bounds.y > this.message.viewportTop + this.message.viewportHeight))) {
                                child.visible = false;
                                resets.push(child);
                            }
                        }
                    }
                    
                    // Update the camera's snapshot
                    this.container.updateCache('source-over');
                    
                    // Reset visibility of hidden children
                    for (i = 0; i < resets.length; i++) {
                        resets[i].visible = true;
                    }
                    
                    
                    /**
                     * This component fires "camera-update" when the position of the camera in the world has changed. This event is triggered on both the entity (typically a layer) as well as children of the entity.
                     * 
                     * @event 'camera-update'
                     * @param message {Object}
                     * @param message.viewportTop {number} The top of the camera viewport in world coordinates.
                     * @param message.viewportLeft {number} The left of the camera viewport in world coordinates.
                     * @param message.viewportWidth {number} The width of the camera viewport in world coordinates.
                     * @param message.viewportHeight {number} The height of the camera viewport in world coordinates.
                     * @param message.scaleX {number} Number of window pixels that comprise a single world coordinate on the x-axis.
                     * @param message.scaleY {number} Number of window pixels that comprise a single world coordinate on the y-axis.
                     **/
                    this.owner.trigger('camera-update', this.message);

                    if (this.owner.triggerEventOnChildren) {
                        this.owner.triggerEventOnChildren('camera-update', this.message);
                    }
                    
                } else if (!this.stationary) {
                    
/**
 * This component triggers "camera-stationary" on the entity when the camera stops moving.
 * 
 * @event 'camera-stationary'
 **/
                    this.owner.trigger('camera-stationary', this.message);
                    this.stationary = true;
                    
                }
                
                if (this.lastFollow.begin) {
                    if (this.lastFollow.begin < new Date().getTime()) {
                        this.follow(this.lastFollow);
                    }
                }
            },
            
/**
 * The camera listens for this event passed along from [[Game]] (who receives it from `window`). It adjusts the camera viewport according to the new size and position of the window.
 * 
 * @method 'resize'
 **/
            "resize": function () {
                this.resize();
            },
            
            "relocate": function (loc) {
                if (this.move(loc.x, loc.y)) {
                    this.viewportUpdate = true;
                }
            },

/**
 * The camera listens for this event passed along from [[Game]] (who receives it from `window`). It adjusts the camera viewport according to the new size and position of the window.
 * 
 * @method 'orientationchange'
 **/
            "orientationchange": function () {
                this.resize();
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
                
                this.shakeOffsetX = 0;
                this.shakeOffsetY = 0;
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
                    this.followFocused = false;
                    this.following = def.entity;
                    this.lastLeft  = def.entity.x || 0;
                    this.lastTop   = def.entity.y || 0;
                    this.lastorientation = def.entity.orientation || 0;
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
                    this.setBoundingArea(def.top, def.left, def.width, def.height);
                    this.followingFunction = this.boundingFollow;
                    break;
                default:
                    this.state = 'static';
                    this.following = undefined;
                    this.followingFunction = undefined;
                    if (def && (typeof def.top === 'number') && (typeof def.left === 'number')) {
                        this.move(def.left, def.top, def.orientation || 0);
                        this.viewportUpdate = true;
                    }
                    break;
                }
                
                if (def.begin) { // get rid of last follow
                    def.begin = 0;
                }

            },
            
            move: function (newLeft, newTop, newOrientation) {
                var moved = this.moveLeft(newLeft);
                moved = this.moveTop(newTop) || moved;
                if (this.rotate) {
                    moved = this.reorient(newOrientation || 0) || moved;
                }
                return moved;
            },
            
            moveLeft: function (newLeft) {
                if (Math.abs(this.worldWindow.viewportLeft - newLeft) > this.threshold) {
                    if (this.worldWidth && this.worldWidth !== 0 && this.worldWidth < this.worldWindow.viewportWidth) {
                        this.worldWindow.viewportLeft = (this.worldWidth - this.worldWindow.viewportWidth) / 2;
                    } else if (this.worldWidth && this.worldWidth !== 0 && (newLeft + this.worldWindow.viewportWidth > this.worldWidth)) {
                        this.worldWindow.viewportLeft = this.worldWidth - this.worldWindow.viewportWidth;
                    } else if (this.worldWidth && this.worldWidth !== 0 && (newLeft < 0)) {
                        this.worldWindow.viewportLeft = 0;
                    } else {
                        this.worldWindow.viewportLeft = newLeft;
                    }
                    return true;
                }
                return false;
            },
            
            moveTop: function (newTop) {
                if (Math.abs(this.worldWindow.viewportTop - newTop) > this.threshold) {
                    if (this.worldHeight && this.worldHeight !== 0 && this.worldHeight < this.worldWindow.viewportHeight) {
                        this.worldWindow.viewportTop = (this.worldHeight - this.worldWindow.viewportHeight) / 2;
                    } else if (this.worldHeight && this.worldHeight !== 0 && (newTop + this.worldWindow.viewportHeight > this.worldHeight)) {
                        this.worldWindow.viewportTop = this.worldHeight - this.worldWindow.viewportHeight;
                    } else if (this.worldHeight && this.worldHeight !== 0 && (newTop < 0)) {
                        this.worldWindow.viewportTop = 0;
                    } else {
                        this.worldWindow.viewportTop = newTop;
//                        console.log(newTop + ',' + this.worldWindow.viewportHeight + ',' + this.worldHeight);
                    }
                    return true;
                }
                return false;
            },
            
            reorient: function (newOrientation) {
                if (Math.abs(this.worldWindow.viewportOrientation - newOrientation) > 0.0001) {
                    this.worldWindow.viewportOrientation = newOrientation;
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
                    var x = getTransitionalPoint(this.worldWindow.viewportLeft, entity.x - (this.worldWindow.viewportWidth / 2),  getRatio(this.transitionX,     time)),
                        y = getTransitionalPoint(this.worldWindow.viewportTop,  entity.y - (this.worldWindow.viewportHeight / 2), getRatio(this.transitionY,     time));

                    if (this.rotate) { // Only run the orientation calculations if we need them.
                        return this.move(x, y, getTransitionalPoint(this.worldWindow.viewportOrientation, -(entity.orientation || 0), getRatio(this.transitionAngle, time)));
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
                
                if (this.followFocused && (this.lastLeft === x) && (this.lastTop === y)) {
                    return this.lockedFollow(ff, time);
                } else {
                    // span over last 10 ticks to prevent jerkiness
                    this.averageOffsetX *= 0.9;
                    this.averageOffsetY *= 0.9;
                    this.averageOffsetX += 0.1 * (x - this.lastLeft) * standardizeTimeDistance;
                    this.averageOffsetY += 0.1 * (y - this.lastTop)  * standardizeTimeDistance;

                    if (Math.abs(this.averageOffsetX) > (this.worldWindow.viewportWidth / (this.forwardX * 2))) {
                        this.averageOffsetX = 0;
                    }
                    if (Math.abs(this.averageOffsetY) > (this.worldWindow.viewportHeight / (this.forwardY * 2))) {
                        this.averageOffsetY = 0;
                    }
                    
                    if (this.rotate) {
                        this.averageOffsetAngle *= 0.9;
                        this.averageOffsetAngle += 0.1 * (a - this.lastOrientation) * standardizeTimeDistance;
                        if (Math.abs(this.averageOffsetAngle) > (this.worldWindow.viewportOrientation / (this.forwardAngle * 2))) {
                            this.averageOffsetAngle = 0;
                        }
                    }

                    ff.x = this.averageOffsetX * this.forwardX + x;
                    ff.y = this.averageOffsetY * this.forwardY + y;
                    ff.orientation = this.averageOffsetAngle * this.forwardAngle + a;
                    
                    this.lastLeft = x;
                    this.lastTop  = y;
                    this.lastOrientation = a;
                    
                    moved = this.lockedFollow(ff, time);

                    if (!this.followFocused && !moved) {
                        this.followFocused = true;
                    }
                    
                    return moved;
                }
                
                
            },
            
            setBoundingArea: function (top, left, width, height) {
                this.bBBorderY = (typeof top !== 'undefined') ? top : this.worldWindow.viewportHeight  * 0.25;
                this.bBBorderX = (typeof left !== 'undefined') ? left : this.worldWindow.viewportWidth * 0.4;
                this.bBInnerWidth = (typeof width !== 'undefined') ? width : this.worldWindow.viewportWidth - (2 * this.bBBorderX);
                this.bBInnerHeight = (typeof height !== 'undefined') ? height : this.worldWindow.viewportHeight - (2 * this.bBBorderY);
            },
            
            boundingFollow: function (entity, time) {
                var newLeft = null,
                    newTop  = null,
                    ratioX  = (this.transitionX ? Math.min(time / this.transitionX, 1) : 1),
                    iratioX = 1 - ratioX,
                    ratioY  = (this.transitionY ? Math.min(time / this.transitionY, 1) : 1),
                    iratioY = 1 - ratioY;
                
                if (entity.x > this.worldWindow.viewportLeft + this.bBBorderX + this.bBInnerWidth) {
                    newLeft = entity.x - (this.bBBorderX + this.bBInnerWidth);
                } else if (entity.x < this.worldWindow.viewportLeft + this.bBBorderX) {
                    newLeft = entity.x - this.bBBorderX;
                }
                
                if (entity.y > this.worldWindow.viewportTop + this.bBBorderY + this.bBInnerHeight) {
                    newTop = entity.y - (this.bBBorderY + this.bBInnerHeight);
                } else if (entity.y < this.worldWindow.viewportTop + this.bBBorderY) {
                    newTop = entity.y - this.bBBorderY;
                }
                
                if (newLeft !== null) {
                    newLeft = this.moveLeft(ratioX * newLeft + iratioX * this.worldWindow.viewportLeft);
                }
                
                if (newTop !== null) {
                    newTop = this.moveTop(ratioY * newTop + iratioY * this.worldWindow.viewportTop);
                }
                
                return newLeft || newTop;
            },
            
            resize: function () {
                var element = this.owner.stage.canvas;
                
                //The dimensions of the camera in the window
                this.window.viewportTop = element.offsetTop;
                this.window.viewportLeft = element.offsetLeft;
                this.window.viewportWidth = element.offsetWidth || this.worldWidth;
                this.window.viewportHeight = element.offsetHeight || this.worldHeight;
                
                if (!this.stretch) {
                    this.worldWindow.viewportHeight = this.window.viewportHeight * this.worldWindow.viewportWidth / this.window.viewportWidth;
                }
                
                this.worldPerWindowUnitWidth  = this.worldWindow.viewportWidth   / this.window.viewportWidth;
                this.worldPerWindowUnitHeight = this.worldWindow.viewportHeight  / this.window.viewportHeight;
                this.windowPerWorldUnitWidth  = this.window.viewportWidth  / this.worldWindow.viewportWidth;
                this.windowPerWorldUnitHeight = this.window.viewportHeight / this.worldWindow.viewportHeight;
                
                this.container.cache(0, 0, this.window.viewportWidth, this.window.viewportHeight, 1);
                
                this.viewportUpdate = true;
            },
            
            windowToWorld: function (sCoords) {
                var wCoords = [];
                wCoords[0] = Math.round((sCoords[0] - this.window.viewportLeft) * this.worldPerWindowUnitWidth);
                wCoords[1] = Math.round((sCoords[1] - this.window.viewportTop)  * this.worldPerWindowUnitHeight);
                return wCoords;
            },
            
            worldToWindow: function (wCoords) {
                var sCoords = [];
                sCoords[0] = Math.round((wCoords[0] * this.windowPerWorldUnitWidth) + this.window.viewportLeft);
                sCoords[1] = Math.round((wCoords[1] * this.windowPerWorldUnitHeight) + this.window.viewportTop);
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
