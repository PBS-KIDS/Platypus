import {Container, Graphics} from 'pixi.js';
import {arrayCache} from '../utils/array.js';
import config from 'config';
import createComponentClass from '../factory.js';

const
    collisionColors = {},
    createCollisionColor = function (collisionType) {
        let
            r = collisionType.charCodeAt(0) || 0,
            g = collisionType.charCodeAt(1) || 0,
            b = collisionType.charCodeAt(2) || 0,
            min = 0,
            max = 0;
        
        min = Math.min(r, g, b);

        r -= min;
        g -= min;
        b -= min;

        max = Math.max(r, g, b, 1);
            
        r = (0xCC * r / max) >> 0;
        g = (0xCC * g / max) >> 0;
        b = (0xCC * b / max) >> 0;

        return (r << 8) + (g << 4) + b;
    };

export default (function () {
    var createShape = function (shape, color, left, top, width, height, z, outline) {
            var newShape = new Graphics().beginFill(color, 0.1);

            if (outline) {
                newShape.lineStyle(outline, color);
            }

            switch (shape) {
            case 'rectangle':
                newShape.drawRect(left, top, width, height);
                break;
            case 'circle':
                newShape.drawCircle(0, 0, width);
                break;
            }
            newShape.z = z;

            return newShape;
        },
        standardizeColor = function (color) {
            if (typeof color === 'string') {
                return parseInt(color.replace('#', ''), 16);
            } else {
                return color;
            }
        };
    
    return createComponentClass(/** @lends platypus.components.RenderDebug.prototype */{
        
        id: 'RenderDebug',

        properties: {
            /**
             * The color to use to highlight an entity's AABB. For example, use `"#ffffff"` or `0xffffff` to set as white.
             *
             * @property aabbColor
             * @type Number|String
             * @default 0xff88ff
             */
            aabbColor: 0xff88ff,

            /**
             * The color to use to highlight an entity's collision shape. For example, use `"#ffffff"` or `0xffffff` to set as white. Will generate a color based on the collision type if not specified.
             *
             * @property collisionColor
             * @type Number|String
             * @default 0
             */
            collisionColor: 0,

            /**
             * The color to use to highlight the AABB for a group of entities attached to this entity. For example, use `"#ffffff"` or `0xffffff` to set as white.
             *
             * @property groupColor
             * @type Number|String
             * @default 0x00ff00
             */
            groupColor: 0x00ff00,

            /**
             * The color to use to highlight an entity. This property is only used if there is no `CollisionBasic` component attached to the entity: this component uses the entity's `width` and `height` properties if defined. For example, use `"#ffffff"` or `0xffffff` to set as white.
             *
             * @property renderColor
             * @type Number|String
             * @default 0x0000ff
             */
            renderColor: 0x0000ff,

            /**
             * The height of the entity.
             *
             * @property height
             * @type Number
             * @default 100
             */
            width: 100,

            /**
             * The width of the entity.
             *
             * @property width
             * @type Number
             * @default 100
             */
            height: 100,

            /**
             * The local offset in z-index for the rendered debug area.
             *
             * @property offsetZ
             * @type Number
             * @default 10000
             */
            offsetZ: 10000
        },
        
        /**
         * This component is attached to entities that will appear in the game world. It serves two purposes. First, it displays a rectangle that indicates the location of the entity. By default it uses the specified position and dimensions of the object (in grey). If the object has a collision component it will display the AABB of the collision shape (in pink). If the entity has a LogicCarrier component and is/was carrying an object, a green rectangle will be drawn showing the collision group. The RenderDebug component also allows the developer to right-click on an entity and it will print the object in the debug console.
         *
         * @memberof platypus.components
         * @uses platypus.Component
         * @constructs
         * @listens platypus.Entity#camera-update
         * @listens platypus.Entity#collide-off
         * @listens platypus.Entity#collide-on
         * @listens platypus.Entity#handle-render
         * @listens platypus.Entity#load
         * @listens platypus.Entity#orientation-updated
         */
        initialize: function () {
            this.container = new Container();
            this.parentContainer = this.owner.parent.worldContainer;
            this.parentContainer.addChild(this.container);
            this.needsCameraCheck = true;

            this.shapes = arrayCache.setUp();
            this.isOutdated = true;

            this.aabbColor = standardizeColor(this.aabbColor);
            this.collisionColor = this.collisionColor ? standardizeColor(this.collisionColor) : 0;
            this.groupColor = standardizeColor(this.groupColor);
            this.renderColor = standardizeColor(this.renderColor);
        },
        
        events: {
            "load": function () {
                if (!config.dev) {
                    this.owner.removeComponent(this);
                    return;
                }
            },

            "camera-update": function () {
                // Set visiblity of sprite if within camera bounds
                this.needsCameraCheck = true;
            },

            "handle-render": function () {
                var aabb = null,
                    offset = -0.5;

                if (this.isOutdated) {
                    this.updateSprites();
                    this.isOutdated = false;
                }
                
                if (this.owner.getCollisionGroupAABB) {
                    aabb = this.owner.getCollisionGroupAABB();
                    if (!this.groupShape) {
                        this.groupShape = createShape('rectangle', this.groupColor, offset, offset, 1, 1, this.offsetZ);
                        this.container.addChild(this.groupShape);
                    }
                    this.groupShape.scaleX = aabb.width;
                    this.groupShape.scaleY = aabb.height;
                    this.groupShape.x      = aabb.x - this.owner.x;
                    this.groupShape.y      = aabb.y - this.owner.y;
                }

                this.update();
            },
            
            "orientation-updated": function () {
                this.isOutdated = true;
            },
            
            "collide-on": function () {
                this.isOutdated = true;
            },
            
            "collide-off": function () {
                this.isOutdated = true;
            }
        },
        
        methods: {
            update: function () {
                var x = 0,
                    y = 0;
                
                x = this.owner.x;
                y = this.owner.y;

                if (this.container.zIndex !== this.owner.z + 0.000001) {
                    this.container.zIndex = this.owner.z + 0.000001;
                }

                this.container.setTransform(x, y, 1, 1, 0, 0, 0);
                
                // Set isCameraOn of sprite if within camera bounds
                if (!this.needsCameraCheck) {
                    this.needsCameraCheck = (this.lastX !== this.owner.x) || (this.lastY !== this.owner.y);
                }
                if (this.needsCameraCheck) {
                    this.isOnCamera = this.owner.parent.isOnCanvas(this.container.getBounds(false));
                    this.needsCameraCheck = false;
                }
                
                this.lastX = this.owner.x;
                this.lastY = this.owner.y;
                this.container.visible = this.isOnCamera;
            },

            updateSprites: function () {
                var owner = this.owner,
                    z        = this.offsetZ,
                    i        = 0,
                    j        = 0,
                    lineWidth = 2,
                    width    = this.width,
                    height   = this.height,
                    shapes   = null,
                    aabb     = null,
                    shape    = null;

                for (i = 0; i < this.shapes.length; i++) {
                    this.container.removeChild(this.shapes[i]);
                }
                this.shapes.length = 0;

                if (owner.getAABB) {
                    for (j = 0; j < owner.collisionTypes.length; j++) {
                        const
                            collisionType = owner.collisionTypes[j];

                        let collisionColor = this.collisionColor || collisionColors[collisionType];

                        if (!collisionColor) {
                            collisionColor = collisionColors[collisionType] = createCollisionColor(collisionType);
                        }

                        aabb   = owner.getAABB(collisionType);
                        width  = this.initialWidth  = aabb.width;
                        height = this.initialHeight = aabb.height;
                        shapes = owner.getShapes(collisionType);
                        
                        shape  = createShape('rectangle', this.aabbColor, aabb.left - owner.x, aabb.top - owner.y, width, height, z--);
                        this.shapes.push(shape);
                        this.container.addChild(shape);
                        
                        for (i = 0; i < shapes.length; i++) {
                            width = shapes[i].width - lineWidth;
                            height = shapes[i].height - lineWidth;
                            shape = createShape(shapes[i].type, collisionColor, shapes[i].offsetX - width / 2, shapes[i].offsetY - height / 2, (shapes[i].radius ? shapes[i].radius - lineWidth : width), height, z--, lineWidth);
                            this.shapes.push(shape);
                            this.container.addChild(shape);
                        }
                    }
                } else {
                    shape = createShape('rectangle', this.renderColor, -width / 2, -height / 2, width, height, z--);
                    this.shapes.push(shape);
                    this.container.addChild(shape);
                }
            },
            
            destroy: function () {
                var i = 0;
                
                for (i = 0; i < this.shapes.length; i++) {
                    this.container.removeChild(this.shapes[i]);
                }
                arrayCache.recycle(this.shapes);

                this.parentContainer.removeChild(this.container);
                this.container = null;
            }
        }
    });
}());
