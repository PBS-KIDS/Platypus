/**
 * This component accepts touches and clicks on the entity. It is typically automatically added by a render component that requires interactive functionality.
 *
 * @class Interactive
 * @uses platypus.Component
 * @since 0.9.0
 */
/*global include, platypus */
(function () {
    'use strict';

    var AABB = include('platypus.AABB'),
        Circle = include('PIXI.Circle'),
        Data = include('platypus.Data'),
        Rectangle = include('PIXI.Rectangle'),
        touchInstances = [];
    
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
            "hover": false,

            /**
             * Used when returning world coordinates. Typically coordinates are relative to the parent, but when this component is added to the layer level, coordinates must be relative to self.
             *
             * @property relativeToSelf
             * @type String
             * @default false
             * @since 0.9.3
             */
            "relativeToSelf": false
        },
        
        publicProperties: {
            /**
             * Determines whether hovering over the sprite should alter the cursor.
             *
             * @property buttonMode
             * @type Boolean
             * @default false
             */
            buttonMode: false
        },
        
        initialize: function () {
            this.pressed = false;
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
             * Listens to this event to update whether the interactive element should be in button mode.
             *
             * @method 'handle-render'
             */
            "handle-render": function () {
                if (this.buttonMode !== this.container.buttonMode) {
                    this.container.buttonMode = this.buttonMode;
                }
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
            addInputs: (function () {
                var
                    trigger = function (eventName, event) {
                        var camera = this.camera,
                            container = this.container,
                            msg = null,
                            matrix = null;
                        
                        if (
                            !container || //TML - This is in case we do a scene change using an event and the container is destroyed.
                            !event.data.originalEvent // This is a workaround for a bug in Pixi 3 where phantom hover events are triggered. - DDD 7/20/16
                            ) {
                            return;
                        }

                        matrix = this.relativeToSelf ? container.transform.worldTransform : container.parent.transform.worldTransform;
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
                    triggerMousedown = function (eventName, event) {
                        if (!this.pressed) {
                            if ( typeof event.data.identifier !== "undefined") {
                                touchInstances[event.data.identifier] = this;
                            }

                            trigger.call(this, eventName, event);
                            event.currentTarget.mouseTarget = true;
                            this.pressed = true;
                        }
                    },
                    triggerPressmove = function (eventName, altEventName, event) {
                        var index = touchInstances.indexOf(this);

                        if (this.pressed && (typeof event.data.identifier === "undefined" || index === event.data.identifier)) { //pressmove
                            trigger.call(this, eventName, event);
                            event.currentTarget.mouseTarget = true;
                        } else { //mousemove
                            trigger.call(this, altEventName, event);
                        }
                    },
                    triggerPressup = function (eventName, event) {
                        var index = touchInstances.indexOf(this);

                        if (this.pressed && (typeof event.data.identifier === "undefined" || index === event.data.identifier)) {
                            if (index === event.data.identifier) {
                                touchInstances.greenSlice(index);
                            }
                            trigger.call(this, eventName, event);
                            event.currentTarget.mouseTarget = false;
                            this.pressed = false;
                            
                            if (event.currentTarget.removeDisplayObject) {
                                event.currentTarget.removeDisplayObject();
                            }
                        }
                    },
                    removeInputListeners = function (sprite, mousedown, pressup, pressmove, click, mouseover, mouseout) {
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

                return function () {
                    var sprite    = this.container,
                        mousedown = null,
                        mouseover = null,
                        mouseout  = null,
                        pressmove = null,
                        pressup   = null,
                        click     = null;
                    
                    // The following appends necessary information to displayed objects to allow them to receive touches and clicks
                    sprite.interactive = true;
                    
                    mousedown = triggerMousedown.bind(this, 'mousedown');
                    pressmove = triggerPressmove.bind(this, 'pressmove', 'mousemove');
                    pressup   = triggerPressup.bind(this, 'pressup');
                    click     = trigger.bind(this, 'click');
                    
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
                        mouseover = trigger.bind(this, 'mouseover');
                        mouseout  = trigger.bind(this, 'mouseout');

                        sprite.addListener('mouseover', mouseover);
                        sprite.addListener('mouseout',  mouseout);
                    }

                    this.removeInputListeners = removeInputListeners.bind(this, sprite, mousedown, pressup, pressmove, click, mouseover, mouseout);
                };
            }()),

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
