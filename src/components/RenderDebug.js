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
        RenderContainer = include('platypus.components.RenderContainer'),
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
            renderColor: 0x0000ff,

            /**
             * The height of the entity.
             *
             * @property height
             * @type Number
             * @default 100
             * @since 0.11.3
             */
            width: 100,

            /**
             * The width of the entity.
             *
             * @property width
             * @type Number
             * @default 100
             * @since 0.11.3
             */
            height: 100,

            /**
             * The local offset in z-index for the rendered debug area.
             *
             * @property offsetZ
             * @type Number
             * @default 10000
             * @since 0.11.3
             */
            offsetZ: 10000
        },
        
        initialize: function () {
            this.shapes = Array.setUp();
            this.isOutdated = true;

            this.aabbColor = standardizeColor(this.aabbColor);
            this.collisionColor = standardizeColor(this.collisionColor);
            this.groupColor = standardizeColor(this.groupColor);
            this.renderColor = standardizeColor(this.renderColor);
        },
        
        events: {// These are messages that this component listens for
            /**
             * Removes this component if not in a debug build.
             *
             * @method 'load'
             * @since 0.11.3
             */
            "load": function () {
                if (!platypus.game.settings.debug) {
                    this.owner.removeComponent(this);
                    return;
                } else if (!this.owner.container) {
                    this.owner.addComponent(new RenderContainer(this.owner, null));
                }
            },

            /**
             * Repositions the pieces of the component in preparation for rendering
             *
             * @method 'handle-render'
             */
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
                        this.owner.container.addChild(this.groupShape);
                    }
                    this.groupShape.scaleX = aabb.width;
                    this.groupShape.scaleY = aabb.height;
                    this.groupShape.x      = aabb.x - this.owner.x;
                    this.groupShape.y      = aabb.y - this.owner.y;
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
                    owner.container.removeChild(this.shapes[i]);
                }
                this.shapes.length = 0;

                if (owner.getAABB) {
                    for (j = 0; j < owner.collisionTypes.length; j++) {
                        aabb   = owner.getAABB(owner.collisionTypes[j]);
                        width  = this.initialWidth  = aabb.width;
                        height = this.initialHeight = aabb.height;
                        shapes = owner.getShapes(owner.collisionTypes[j]);
                        
                        shape  = createShape('rectangle', this.aabbColor, aabb.left - owner.x, aabb.top - owner.y, width, height, z--);
                        this.shapes.push(shape);
                        owner.container.addChild(shape);
                        this.addInput(shape);
                        
                        for (i = 0; i < shapes.length; i++) {
                            width = shapes[i].width - lineWidth;
                            height = shapes[i].height - lineWidth;
                            shape = createShape(shapes[i].type, this.collisionColor, shapes[i].offsetX - width / 2, shapes[i].offsetY - height / 2, (shapes[i].radius ? shapes[i].radius - lineWidth : width), height, z--, lineWidth);
                            this.shapes.push(shape);
                            owner.container.addChild(shape);
                            this.addInput(shape);
                        }
                    }
                } else {
                    shape = createShape('rectangle', this.renderColor, -width / 2, -height / 2, width, height, z--);
                    this.shapes.push(shape);
                    owner.container.addChild(shape);
                    this.addInput(shape);
                }

                owner.container.reorder = true;
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
                    this.owner.container.removeChild(this.shapes[i]);
                }
                this.shapes.recycle();
            }
        }
    });
}());
