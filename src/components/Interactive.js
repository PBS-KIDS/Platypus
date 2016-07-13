/**
 * This component accepts touches and clicks on the entity. It is typically automatically added by a render component that requires interactive functionality.
 *
 * @class Interactive
 * @uses platypus.Component
 */
/*global include, platypus */
(function () {
    'use strict';

    var AABB = include('platypus.AABB'),
        Circle = include('PIXI.Circle'),
        Data = include('platypus.Data'),
        Rectangle = include('PIXI.Rectangle');
    
    return platypus.createComponentClass({
        id: 'Interactive',

        properties: {
            /**
             * Sets the container that represents the interactive area.
             *
             * @property container
             * @type PIXI.Container
             * @default null
             */
            "container": null,

            /**
             * Sets the hit area for interactive responses by describing the dimensions of a clickable rectangle:
             *
             *     "hitArea": {
             *         "x": 10,
             *         "y": 10,
             *         "width": 40,
             *         "height": 40
             *     }
             *
             * A string can also be used to create more complex shapes via the PIXI graphics API like:
             *
             *     "hitArea": "r(10,20,40,40).dc(30,10,12)"
             *
             * Defaults to the container if not specified or, if simply set to `true`, a rectangle using the entity's dimensions.
             *
             * @property hitArea
             * @type Object|String|Boolean
             * @default null
             */
            "hitArea": null,

            /**
             * Sets whether the entity should respond to mouse hovering.
             *
             * @property hover
             * @type Boolean
             * @default false
             */
            "hover": false
        },
        
        publicProperties: {
        },
        
        constructor: function () {
            this.camera = AABB.setUp();
            if (this.hitArea) {
                this.container.hitArea = this.setHitArea(this.hitArea);
            }
        },

        events: {
            /**
             * Listens for this event to determine whether this sprite is visible.
             *
             * @method 'camera-update'
             * @param camera.viewport {platypus.AABB} Camera position and size.
             */
            "camera-update": function (camera) {
                this.camera.set(camera.viewport);
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
            }
        },
        
        methods: {
            triggerInput: function (event, eventName) {
                var camera = this.camera,
                    container = this.container,
                    msg = null,
                    matrix = null;
                
                //TML - This is in case we do a scene change using an event and the container is destroyed.
                if (!container) {
                    return;
                }

                matrix = container.parent.transformMatrix;
                msg = Data.setUp(
                    "event", event.data.originalEvent,
                    "pixiEvent", event,
                    "x", event.data.global.x / matrix.a + camera.left,
                    "y", event.data.global.y / matrix.d + camera.top,
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

                    if (this.hover) {
                        sprite.removeListener('mouseover', mouseover);
                        sprite.removeListener('mouseout',  mouseout);
                    }
                    sprite.interactive = false;
                    this.removeInputListeners = null;
                };
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
                            ha = new Circle(shape.x || 0, shape.y || 0, shape.radius);
                        } else {
                            ha = new Rectangle(shape.x || 0, shape.y || 0, shape.width || this.owner.width || 0, shape.height || this.owner.height || 0);
                        }
                        
                        savedHitAreas[sav] = ha;
                    }
                    
                    return ha;
                };
            }()),

            destroy: (function () {
                var
                    removeAfterMouseUp = function () {
                        this.container.parent.removeChild(this.container);
                        this.container = null;
                    };

                return function () {
                    if (this.removeInputListeners) {
                        this.removeInputListeners();
                    }

                    this.camera.recycle();
                    
                    // This handles removal after the mouseup event to prevent weird input behaviors. If it's not currently a mouse target, we let the render component handle its removal from the parent container.
                    if (this.container.mouseTarget && this.container.parent) {
                        this.container.visible = false;
                        this.container.removeDisplayObject = removeAfterMouseUp.bind(this);
                    }
                };
            }())
        },
        
        publicMethods: {
            
        }
    });
}());
