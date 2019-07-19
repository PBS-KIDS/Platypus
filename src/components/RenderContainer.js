/**
 * This component is attached to entities that will appear in the game world. It creates a PIXI Container to contain all other display objects on the entity and keeps the container updates with the entity's location and other dynamic properties.
 *
 * @namespace platypus.components
 * @class RenderContainer
 * @uses platypus.Component
 * @since 0.11.0
 */
/* global PIXI, platypus */
import AABB from '../AABB.js';
import Data from '../Data.js';
import Interactive from './Interactive.js';
import {arrayCache} from '../utils/array.js';
import {greenSplit} from '../utils/string.js';

export default (function () {
    var ColorMatrixFilter = PIXI.filters.ColorMatrixFilter,
        Container = PIXI.Container,
        Graphics = PIXI.Graphics,
        Matrix = PIXI.Matrix,
        pixiMatrix = new Matrix(),
        castValue = function (color) {
            if (color === null) {
                return color;
            }
            if ((typeof color === 'string') && (color[0] === '#')) {
                color = '0x' + color.substring(1);
            }
            return +color;
        },
        processGraphics = (function () {
            var process = function (gfx, value) {
                var i = 0,
                    paren  = value.indexOf('('),
                    func   = value.substring(0, paren),
                    values = value.substring(paren + 1, value.indexOf(')'));

                if (values.length) {
                    values = greenSplit(values, ',');
                    i = values.length;
                    while (i--) {
                        values[i] = +values[i];
                    }
                    gfx[func].apply(gfx, values);
                    arrayCache.recycle(values);
                } else {
                    gfx[func]();
                }
            };

            return function (gfx, value) {
                var i = 0,
                    arr = greenSplit(value, '.');

                for (i = 0; i < arr.length; i++) {
                    process(gfx, arr[i]);
                }
                
                arrayCache.recycle(arr);
            };
        }());
    
    return platypus.createComponentClass({
        
        id: 'RenderContainer',
        
        properties: {
            /**
             * Optional. A mask definition that determines where the image should clip. A string can also be used to create more complex shapes via the PIXI graphics API like: "mask": "r(10,20,40,40).dc(30,10,12)". Defaults to no mask or, if simply set to true, a rectangle using the entity's dimensions. Note that the mask is in world coordinates by default. To make the mask local to the entity's coordinates, set `localMask` to `true` in the RenderContainer properties.
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
             * Optional. Whether this sprite should be cached into an entity with a `RenderTiles` component (like "render-layer"). The `RenderTiles` component must have its "entityCache" property set to `true`. Warning! This is a one-direction setting and will remove this component from the entity once the current frame has been cached.
             *
             * @property cache
             * @type Boolean
             * @default false
             */
            cache: false,

            /**
             * Optional. Ignores the opacity of the owner.
             *
             * @property ignoreOpacity
             * @type Boolean
             * @default false
             */
            ignoreOpacity: false,

            /**
             * Whether the mask should be relative to the entity's coordinates.
             *
             * @property localMask
             * @type boolean
             * @default false
             */
            localMask: false
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
             * Determines the container this entity should use for rendering. Defaults to the top-most layer.
             *
             * @property renderGroup
             * @type String
             * @default ""
             * @since 0.11.10
             */
            renderGroup: '',

            /**
             * Optional. The rotation of the sprite in degrees. All sprites on the same entity are rotated the same amount unless they ignore the rotation value by setting 'rotate' to false.
             *
             * @property rotation
             * @type Number
             * @default 0
             */
            rotation: 0,

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
             * Optional. The tint applied to the sprite. Tint may be specified by number or text. For example, to give the sprite a red tint, set to 0xff0000 or "#ff0000". Tint will be stored as a number even when set using text. Defaults to no tint.
             *
             * @property tint
             * @type Number|String
             * @default null
             */
            tint: null,

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
        
        initialize: function () {
            var container = this.container = this.owner.container = new Container(),
                definition = null,
                initialTint = this.tint;

            this.rootContainer = null;
            this.parentContainer = null;
            this.renderGroups = null;
            this.wasVisible = this.visible;
            this.lastX = this.owner.x;
            this.lastY = this.owner.y;
            this.camera = AABB.setUp();
            this.isOnCamera = true;
            this.needsCameraCheck = true;

            this._tint = null;

            Object.defineProperty(this.owner, 'tint', {
                get: function () {
                    return this._tint;
                }.bind(this),
                set: function (value) {
                    var filters = this.container.filters,
                        matrix = null,
                        color = castValue(value);

                    if (color === this._tint) {
                        return;
                    }

                    if (color === null) {
                        if (filters) {
                            this.container.filters = null;
                        }
                    } else {
                        if (!filters) {
                            filters = this.container.filters = arrayCache.setUp(new ColorMatrixFilter());
                        }
                        matrix = filters[0].matrix;
                        matrix[0] = (color & 0xff0000) / 0xff0000; // Red
                        matrix[6] = (color & 0xff00) / 0xff00; // Green
                        matrix[12] = (color & 0xff) / 0xff; // Blue
                    }

                    this._tint = color;
                }.bind(this)
            });

            this.storedRenderGroup = this.renderGroup;
            this._renderGroup = null;
            Object.defineProperty(this.owner, 'renderGroup', {
                get: function () {
                    return this._renderGroup;
                }.bind(this),
                set: function (value) {
                    var groups = this.renderGroups,
                        i = groups.length,
                        container = null,
                        mask = null;

                    if (value === this._renderGroup) {
                        return;
                    }

                    this._renderGroup = value;

                    if (this.mask) {
                        mask = this.mask;
                        this.setMask();
                    }

                    while (i--) {
                        if (groups[i].name === value) {
                            this.parentContainer = groups[i];
                            groups[i].addChild(this.container);
                            groups[i].reorder = true;
                            if (mask) {
                                this.setMask(mask);
                            }
                            return;
                        }
                    }

                    container = new Container();
                    container.name = value;
                    container.z = this.owner.z;
                    groups.push(container);
                    this.rootContainer.addChild(container);
                    this.rootContainer.reorder = true;
                    this.parentContainer = container;
                    container.addChild(this.container);
                    if (mask) {
                        this.setMask(mask);
                    }
                }.bind(this)
            });
        
            if (initialTint !== null) {
                this.tint = initialTint; // feed initial tint through setter.
            }

            if (this.interactive) {
                definition = Data.setUp(
                    'container', container,
                    'hitArea', this.interactive.hitArea,
                    'hover', this.interactive.hover
                );
                this.owner.addComponent(new Interactive(this.owner, definition));
                definition.recycle();
            }

            if (this.cache) {
                this.updateSprite(false);
                this.owner.cacheRender = this.container;
            }
        },
        
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
                if (this.owner.parent.triggerEventOnChildren) {
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
                this.needsCameraCheck = true;
            },
            
            /**
             * A setup message used to add the sprite to the stage. On receiving this message, the component sets its parent container to the stage contained in the message if it doesn't already have one.
             *
             * @method 'handle-render-load'
             * @param handlerData {Object} Data from the render handler
             * @param handlerData.container {PIXI.Container} The parent container.
             */
            "handle-render-load": function (handlerData) {
                if (!this.rootContainer && handlerData && handlerData.container) {
                    this.addStage(handlerData.container, handlerData.renderGroups);
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
                if (!this.container) { // If this component's removal is pending
                    return;
                } else if (!this.rootContainer && renderData && renderData.container) {
                    this.addStage(renderData.container, renderData.renderGroups);
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
            }
        },
        
        methods: {
            addStage: function (stage, renderGroups) {
                if (stage) {
                    this.rootContainer = stage;
                    this.renderGroups = renderGroups;
                    this.renderGroup = this.storedRenderGroup;

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
                
                return function (uncached) {
                    var x = 0,
                        y = 0,
                        o = this.owner.orientationMatrix,
                        rotation = 0,
                        matrix = pixiMatrix,
                        mirrored = 1,
                        flipped  = 1,
                        angle    = null;
                    
                    x = this.owner.x;
                    y = this.owner.y;
                    if (this.rotate) {
                        rotation = this.rotation;
                    }
                    if (this.container.z !== this.owner.z) {
                        if (this.parentContainer) {
                            this.parentContainer.reorder = true;
                        }
                        this.container.z = this.owner.z;
                    }

                    if (!this.ignoreOpacity && (this.owner.opacity || (this.owner.opacity === 0))) {
                        this.container.alpha = this.owner.opacity;
                    }
                    
                    if (this.container.reorder) {
                        this.container.reorder = false;
                        this.container.children.sort(sort);
                        this.needsCameraCheck = true; // reorder is set when adding children, so force another camera check.
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
                    
                    if (o) { // This is a 3x3 2D matrix describing an affine transformation.
                        matrix.a = o[0][0];
                        matrix.b = o[1][0];
                        matrix.tx = x + o[0][2];
                        matrix.c = o[0][1];
                        matrix.d = o[1][1];
                        matrix.ty = y + o[1][2];
                        this.container.transform.setFromMatrix(matrix);
                    } else {
                        this.container.setTransform(x, y, this.scaleX * mirrored, this.scaleY * flipped, (rotation ? (rotation / 180) * Math.PI : 0), this.skewX, this.skewY);
                    }
                    
                    // Set isCameraOn of sprite if within camera bounds
                    if (!this.needsCameraCheck) {
                        this.needsCameraCheck = (this.lastX !== this.owner.x) || (this.lastY !== this.owner.y);
                    }
                    if (uncached && this.container && (this.needsCameraCheck || (!this.wasVisible && this.visible))) {
                        this.isOnCamera = this.owner.parent.isOnCanvas(this.container.getBounds(false));
                        this.needsCameraCheck = false;
                    }
                    
                    this.lastX = this.owner.x;
                    this.lastY = this.owner.y;
                    this.wasVisible = this.visible;
                    this.container.visible = (this.visible && this.isOnCamera) || this.dragMode;
                };
            }()),
            
            setMask: function (shape) {
                var gfx = null;
                
                if (this.mask) {
                    if (this.localMask) {
                        this.container.removeChild(this.mask);
                    } else if (this.parentContainer) {
                        this.parentContainer.removeChild(this.mask);
                    }
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
                this.mask.z = 0; //TML 12-4-16 - Masks don't need a Z, but this makes it play nice with the Z-ordering in HandlerRender.

                if (this.localMask) {
                    this.container.addChild(this.mask);
                } else if (this.parentContainer) {
                    this.parentContainer.addChild(this.mask);
                }
            },
            
            destroy: function () {
                this.camera.recycle();
                if (this.parentContainer && !this.container.mouseTarget) {
                    this.parentContainer.removeChild(this.container);
                    this.parentContainer = null;
                } else if (!this.cache) {
                    this.container.destroy();
                }
                this.container = null;
            }
        }
    });
}());
