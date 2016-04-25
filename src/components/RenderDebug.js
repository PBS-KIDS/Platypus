/**
 * This component is attached to entities that will appear in the game world. It serves two purposes. First, it displays a rectangle that indicates the location of the entity. By default it uses the specified position and dimensions of the object (in grey). If the object has a collision component it will display the AABB of the collision shape (in pink). If the entity has a LogicCarrier component and is/was carrying an object, a green rectangle will be drawn showing the collision group. The RenderDebug component also allows the developer to right-click on an entity and it will print the object in the debug console.
 *
 * @namespace platypus.components
 * @class RenderDebug
 * @uses platypus.Component
 */
/*global console, include, platypus */
(function () {
    "use strict";
    
    var Graphics = include('PIXI.Graphics'),
        defaultHeight = 100,
        defaultWidth = 100,
        defaultZ = 10000,
        types = {
            "aabb": 0xff88ff,
            "render": 0x0000ff,
            "collision": 0xff00ff,
            "group": 0x00ff00
        },
        createShape = function (shape, type, left, top, width, height, z) {
            var newShape = null,
                opacity = 0.1;

            switch (shape) {
            case 'rectangle':
                newShape = new Graphics().beginFill(types[type], opacity).drawRect(left, top, width, height);
                break;
            case 'circle':
                newShape = new Graphics().beginFill(types[type], opacity).drawCircle(0, 0, width);
                break;
            }
            newShape.z = z;

            return newShape;
        };
    
    return platypus.createComponentClass({
        
        id: 'RenderDebug',
        
        constructor: function () {
            this.parentContainer = null;
            this.shapes = Array.setUp();
            this.isOutdated = true;
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
                        console.warn('No Container, removing render debug component from "' + this.owner.type + '".');
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
                        this.groupShape = new Graphics().beginFill("rgba(255,255,0,0.2)").drawRect(offset, offset, 1, 1);
                        this.groupShape.z = (this.owner.z || 0) + defaultZ;
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
                        
                        shape  = createShape('rectangle', 'aabb', aabb.left - this.owner.x, aabb.top - this.owner.y, width, height, z--);
                        this.shapes.push(shape);
                        this.parentContainer.addChild(shape);
                        this.addInput(shape);
                        
                        for (i = 0; i < shapes.length; i++) {
                            shape = createShape(shapes[i].type, 'collision', shapes[i].offsetX - shapes[i].width / 2, shapes[i].offsetY - shapes[i].height / 2, shapes[i].radius || shapes[i].width, shapes[i].height, z--);
                            this.shapes.push(shape);
                            this.parentContainer.addChild(shape);
                            this.addInput(shape);
                        }
                    }
                } else {
                    shape = createShape('rectangle', 'render', -width / 2, -height / 2, width, height, z--);
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
