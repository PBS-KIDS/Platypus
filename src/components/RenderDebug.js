/**
 * This component is attached to entities that will appear in the game world. It serves two purposes. First, it displays a rectangle that indicates the location of the entity. By default it uses the specified position and dimensions of the object (in grey). If the object has a collision component it will display the AABB of the collision shape (in pink). If the entity has a LogicCarrier component and is/was carrying an object, a green rectangle will be drawn showing the collision group. The RenderDebug component also allows the developer to right-click on an entity and it will print the object in the debug console.
 *
 * @namespace platypus.components
 * @class RenderDebug
 * @uses platypus.Component
 */
/*global include, platypus */
(function () {
    'use strict';
    
    var Graphics = include('PIXI.Graphics'),
        defaultHeight = 100,
        defaultWidth = 100,
        defaultZ = 10000,
        createShape = function (shape, color, left, top, width, height, z, outline) {
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
    
    return platypus.createComponentClass({
        
        id: 'RenderDebug',

        properties: {
            /**
             * The color to use to highlight an entity's AABB. For example, use `"#ffffff"` or `0xffffff` to set as white.
             *
             * @property aabbColor
             * @type Number|String
             * @default 0xff88ff
             * @since 0.11.3
             */
            aabbColor: 0xff88ff,

            /**
             * The color to use to highlight an entity's collision shape. For example, use `"#ffffff"` or `0xffffff` to set as white.
             *
             * @property collisionColor
             * @type Number|String
             * @default 0xff00ff
             * @since 0.11.3
             */
            collisionColor: 0xff00ff,

            /**
             * The color to use to highlight the AABB for a group of entities attached to this entity. For example, use `"#ffffff"` or `0xffffff` to set as white.
             *
             * @property groupColor
             * @type Number|String
             * @default 0x00ff00
             * @since 0.11.3
             */
            groupColor: 0x00ff00,

            /**
             * The color to use to highlight an entity. This property is only used if there is no `CollisionBasic` component attached to the entity: this component uses the entity's `width` and `height` properties if defined. For example, use `"#ffffff"` or `0xffffff` to set as white.
             *
             * @property renderColor
             * @type Number|String
             * @default 0x0000ff
             * @since 0.11.3
             */
            renderColor: 0x0000ff
        },
        
        initialize: function () {
            this.parentContainer = null;
            this.shapes = Array.setUp();
            this.isOutdated = true;

            this.aabbColor = standardizeColor(this.aabbColor);
            this.collisionColor = standardizeColor(this.collisionColor);
            this.groupColor = standardizeColor(this.groupColor);
            this.renderColor = standardizeColor(this.renderColor);
        },
        
        events: {// These are messages that this component listens for
            /**
             * The visual components are set up and added to the stage. Setting up mouse input stuff. The click-to-print-to-console functionality is set up too.
             *
             * @method 'handle-render-load'
             * @param handlerData {Object} Data from the render handler
             * @param handlerData.container {PIXI.Container} The parent container.
             */
            "handle-render-load": function (handlerData) {
                if (!platypus.game.settings.debug) {
                    this.owner.removeComponent(this);
                } else if (!this.parentContainer && handlerData && handlerData.container) {
                    this.parentContainer = handlerData.container;
                }
            },
            
            /**
             * Repositions the pieces of the component in preparation for rendering
             *
             * @method 'handle-render'
             * @param renderData {Object} Data from the render handler
             * @param renderData.container {PIXI.Container} The parent container.
             */
            "handle-render": function (renderData) {
                var i = 0,
                    aabb = null,
                    offset = -0.5;

                if (!this.parentContainer) {
                    if (!platypus.game.settings.debug) {
                        this.owner.removeComponent(this);
                        return;
                    } else if (renderData.container) {
                        this.parentContainer = renderData.container;
                    } else {
                        platypus.debug.warn('No Container, removing render debug component from "' + this.owner.type + '".');
                        this.owner.removeComponent(this);
                        return;
                    }
                }

                if (this.isOutdated) {
                    this.updateSprites();
                    this.isOutdated = false;
                }
                
                for (i = 0; i < this.shapes.length; i++) {
                    this.shapes[i].x = this.owner.x;
                    this.shapes[i].y = this.owner.y;
                }
                
                if (this.owner.getCollisionGroupAABB) {
                    aabb = this.owner.getCollisionGroupAABB();
                    if (!this.groupShape) {
                        this.groupShape = createShape('rectangle', this.groupColor, offset, offset, 1, 1, (this.owner.z || 0) + defaultZ)
                        this.parentContainer.addChild(this.groupShape);
                    }
                    this.groupShape.scaleX = aabb.width;
                    this.groupShape.scaleY = aabb.height;
                    this.groupShape.x      = aabb.x;
                    this.groupShape.y      = aabb.y;
                }
            },
            
            /**
             * On receiving this message, will re-orient itself on the next update.
             *
             * @method 'orientation-updated'
             */
            "orientation-updated": function () {
                this.isOutdated = true;
            }
            
        },
        
        methods: {
            updateSprites: function () {
                var z        = (this.owner.z || 0) + defaultZ,
                    i        = 0,
                    j        = 0,
                    lineWidth = 2,
                    width    = this.owner.width  = this.owner.width  || defaultWidth,
                    height   = this.owner.height = this.owner.height || defaultHeight,
                    shapes   = null,
                    aabb     = null,
                    shape    = null;

                for (i = 0; i < this.shapes.length; i++) {
                    this.parentContainer.removeChild(this.shapes[i]);
                }
                this.shapes.length = 0;

                if (this.owner.getAABB) {
                    for (j = 0; j < this.owner.collisionTypes.length; j++) {
                        aabb   = this.owner.getAABB(this.owner.collisionTypes[j]);
                        width  = this.initialWidth  = aabb.width;
                        height = this.initialHeight = aabb.height;
                        shapes = this.owner.getShapes(this.owner.collisionTypes[j]);
                        
                        shape  = createShape('rectangle', this.aabbColor, aabb.left - this.owner.x, aabb.top - this.owner.y, width, height, z--);
                        this.shapes.push(shape);
                        this.parentContainer.addChild(shape);
                        this.addInput(shape);
                        
                        for (i = 0; i < shapes.length; i++) {
                            width = shapes[i].width - lineWidth;
                            height = shapes[i].height - lineWidth;
                            shape = createShape(shapes[i].type, this.collisionColor, shapes[i].offsetX - width / 2, shapes[i].offsetY - height / 2, (shapes[i].radius ? shapes[i].radius - lineWidth : width), height, z--, lineWidth);
                            this.shapes.push(shape);
                            this.parentContainer.addChild(shape);
                            this.addInput(shape);
                        }
                    }
                } else {
                    shape = createShape('rectangle', this.renderColor, -width / 2, -height / 2, width, height, z--);
                    this.shapes.push(shape);
                    this.parentContainer.addChild(shape);
                    this.addInput(shape);
                }
            },
            
            addInput: (function () {
                var lastEntityLog = null,
                    handler = function () {
                        if (lastEntityLog !== this.owner) {
                            lastEntityLog = this.owner;
                            platypus.debug.olive('Entity "' + lastEntityLog.type + '":', lastEntityLog);
                        }

                        return false;
                    };
                
                return function (sprite) {
                    sprite.interactive = true;
                    sprite.addListener('rightdown', handler.bind(this));
                };
            }()),
            
            destroy: function () {
                var i = 0;
                
                for (i = 0; i < this.shapes.length; i++) {
                    this.parentContainer.removeChild(this.shapes[i]);
                }
                this.shapes.recycle();
                this.parentContainer = null;
            }
        }
    });
}());
