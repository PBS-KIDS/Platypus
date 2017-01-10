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
        pointerInstances = {};
    
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
                    getId = function (event) {
                        var data = event.data,
                            originalEvent = data.originalEvent;

                        if (typeof originalEvent.pointerId !== 'undefined') {
                            return 'point' + originalEvent.pointerId; // Handles pointer events
                        } else {
                            return originalEvent.type.substr(0, 5) + (data.identifier || 0); // Handles mouse / touch events
                        }
                    },
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
                    triggerPointerDown = function (event) {
                        pointerInstances[getId(event)] = this;

                        /**
                         * This event is triggered on pointer down.
                         *
                         * @event 'pointerdown'
                         * @param event {DOMEvent} The original DOM pointer event.
                         * @param pixiEvent {PIXI.interaction.InteractionEvent} The Pixi pointer event.
                         * @param x {Number} The x coordinate in world units.
                         * @param y {Number} The y coordinate in world units.
                         * @param entity {platypus.Entity} The entity receiving this event.
                         * @since v0.10.6
                         */
                        trigger.call(this, 'pointerdown', event);

                        if (!this.pressed) {
                            /**
                             * This event is triggered on mouse down.
                             *
                             * @event 'mousedown'
                             * @param event {DOMEvent} The original DOM pointer event.
                             * @param pixiEvent {PIXI.interaction.InteractionEvent} The Pixi pointer event.
                             * @param x {Number} The x coordinate in world units.
                             * @param y {Number} The y coordinate in world units.
                             * @param entity {platypus.Entity} The entity receiving this event.
                             * @deprecated since v0.10.6 - superceded by the "pointerdown" event.
                             */
                            trigger.call(this, 'mousedown', event);
                        }

                        event.currentTarget.mouseTarget = true;
                        this.pressed = true;
                    },
                    triggerPointerMove = function (event) {
                        var id = getId(event);

                        if (pointerInstances[id] === this) {
                            /**
                             * This event is triggered on pointer move.
                             *
                             * @event 'pointermove'
                             * @param event {DOMEvent} The original DOM pointer event.
                             * @param pixiEvent {PIXI.interaction.InteractionEvent} The Pixi pointer event.
                             * @param x {Number} The x coordinate in world units.
                             * @param y {Number} The y coordinate in world units.
                             * @param entity {platypus.Entity} The entity receiving this event.
                             * @since v0.10.6
                             */
                            trigger.call(this, 'pointermove', event);
                            if (this.pressed) {
                                /**
                                 * This event is triggered on press move (drag).
                                 *
                                 * @event 'pressmove'
                                 * @param event {DOMEvent} The original DOM pointer event.
                                 * @param pixiEvent {PIXI.interaction.InteractionEvent} The Pixi pointer event.
                                 * @param x {Number} The x coordinate in world units.
                                 * @param y {Number} The y coordinate in world units.
                                 * @param entity {platypus.Entity} The entity receiving this event.
                                 */
                                trigger.call(this, 'pressmove', event);
                                event.currentTarget.mouseTarget = true;
                            } else {
                                /**
                                 * This event is triggered on mouse move.
                                 *
                                 * @event 'mousemove'
                                 * @param event {DOMEvent} The original DOM pointer event.
                                 * @param pixiEvent {PIXI.interaction.InteractionEvent} The Pixi pointer event.
                                 * @param x {Number} The x coordinate in world units.
                                 * @param y {Number} The y coordinate in world units.
                                 * @param entity {platypus.Entity} The entity receiving this event.
                                 * @deprecated since v0.10.6 - superceded by the "pointermove" event.
                                 */
                                trigger.call(this, 'mousemove', event); // deprecated in v0.10.6
                            }
                        }
                    },
                    triggerPointerTap = function (event) {
                        /**
                         * This event is triggered on pointer tap.
                         *
                         * @event 'pointertap'
                         * @param event {DOMEvent} The original DOM pointer event.
                         * @param pixiEvent {PIXI.interaction.InteractionEvent} The Pixi pointer event.
                         * @param x {Number} The x coordinate in world units.
                         * @param y {Number} The y coordinate in world units.
                         * @param entity {platypus.Entity} The entity receiving this event.
                         * @since v0.10.6
                         */
                        trigger.call(this, 'pointertap', event);

                        /**
                         * This event is triggered on click.
                         *
                         * @event 'click'
                         * @param event {DOMEvent} The original DOM pointer event.
                         * @param pixiEvent {PIXI.interaction.InteractionEvent} The Pixi pointer event.
                         * @param x {Number} The x coordinate in world units.
                         * @param y {Number} The y coordinate in world units.
                         * @param entity {platypus.Entity} The entity receiving this event.
                         * @deprecated since v0.10.6 - superceded by the "pointertap" event.
                         */
                        trigger.call(this, 'click', event); // deprecated in v0.10.6
                    },
                    triggerPointerOut = function (event) {

                        /**
                         * This event is triggered on pointer out.
                         *
                         * @event 'pointerout'
                         * @param event {DOMEvent} The original DOM pointer event.
                         * @param pixiEvent {PIXI.interaction.InteractionEvent} The Pixi pointer event.
                         * @param x {Number} The x coordinate in world units.
                         * @param y {Number} The y coordinate in world units.
                         * @param entity {platypus.Entity} The entity receiving this event.
                         * @since v0.10.6
                         */
                        trigger.call(this, 'pointerout', event);

                        /**
                         * This event is triggered on mouse out.
                         *
                         * @event 'mouseout'
                         * @param event {DOMEvent} The original DOM pointer event.
                         * @param pixiEvent {PIXI.interaction.InteractionEvent} The Pixi pointer event.
                         * @param x {Number} The x coordinate in world units.
                         * @param y {Number} The y coordinate in world units.
                         * @param entity {platypus.Entity} The entity receiving this event.
                         * @deprecated since v0.10.6 - superceded by the "pointerout" event.
                         */
                        trigger.call(this, 'mouseout', event); // deprecated in v0.10.6
                    },
                    triggerPointerOver = function (event) {
                        /**
                         * This event is triggered on pointer over.
                         *
                         * @event 'pointerover'
                         * @param event {DOMEvent} The original DOM pointer event.
                         * @param pixiEvent {PIXI.interaction.InteractionEvent} The Pixi pointer event.
                         * @param x {Number} The x coordinate in world units.
                         * @param y {Number} The y coordinate in world units.
                         * @param entity {platypus.Entity} The entity receiving this event.
                         * @since v0.10.6
                         */
                        trigger.call(this, 'pointerover', event);

                        /**
                         * This event is triggered on mouse over.
                         *
                         * @event 'mouseover'
                         * @param event {DOMEvent} The original DOM pointer event.
                         * @param pixiEvent {PIXI.interaction.InteractionEvent} The Pixi pointer event.
                         * @param x {Number} The x coordinate in world units.
                         * @param y {Number} The y coordinate in world units.
                         * @param entity {platypus.Entity} The entity receiving this event.
                         * @deprecated since v0.10.6 - superceded by the "pointerover" event.
                         */
                        trigger.call(this, 'mouseover', event); // deprecated in v0.10.6
                    },
                    triggerPointerUp = function (event) {
                        var id = getId(event);

                        if (pointerInstances[id] === this) {
                            pointerInstances[id] = null;
                            if (this.pressed) {
                                /**
                                 * This event is triggered on press up.
                                 *
                                 * @event 'pressup'
                                 * @param event {DOMEvent} The original DOM pointer event.
                                 * @param pixiEvent {PIXI.interaction.InteractionEvent} The Pixi pointer event.
                                 * @param x {Number} The x coordinate in world units.
                                 * @param y {Number} The y coordinate in world units.
                                 * @param entity {platypus.Entity} The entity receiving this event.
                                 */
                                trigger.call(this, 'pressup', event);
                                this.pressed = false;
                            }
                            /**
                             * This event is triggered on pointer up.
                             *
                             * @event 'pointerup'
                             * @param event {DOMEvent} The original DOM pointer event.
                             * @param pixiEvent {PIXI.interaction.InteractionEvent} The Pixi pointer event.
                             * @param x {Number} The x coordinate in world units.
                             * @param y {Number} The y coordinate in world units.
                             * @param entity {platypus.Entity} The entity receiving this event.
                             * @since v0.10.6
                             */
                            trigger.call(this, 'pointerup', event);
                            event.currentTarget.mouseTarget = false;
                            
                            if (event.currentTarget.removeDisplayObject) {
                                event.currentTarget.removeDisplayObject();
                            }
                        }
                    },
                    triggerPointerUpOutside = function (event) {
                        var id = getId(event);

                        if (pointerInstances[id] === this) {
                            pointerInstances[id] = null;
                            if (this.pressed) {
                                trigger.call(this, 'pressup', event);
                                this.pressed = false;
                            }
                            /**
                             * This event is triggered on pointer up outside.
                             *
                             * @event 'pointerupoutside'
                             * @param event {DOMEvent} The original DOM pointer event.
                             * @param pixiEvent {PIXI.interaction.InteractionEvent} The Pixi pointer event.
                             * @param x {Number} The x coordinate in world units.
                             * @param y {Number} The y coordinate in world units.
                             * @param entity {platypus.Entity} The entity receiving this event.
                             * @since v0.10.6
                             */
                            trigger.call(this, 'pointerupoutside', event);
                            event.currentTarget.mouseTarget = false;
                            
                            if (event.currentTarget.removeDisplayObject) {
                                event.currentTarget.removeDisplayObject();
                            }
                        }
                    },
                    removeInputListeners = function (sprite, pointerdown, pointerup, pointerupoutside, pointermove, pointertap, pointerover, pointerout) {
                        var key = '';

                        for (key in pointerInstances) {
                            if (pointerInstances.hasOwnProperty(key) && (pointerInstances[key] === this)) {
                                pointerInstances[key] = null;
                            }
                        }

                        sprite.removeListener('pointerdown', pointerdown);
                        sprite.removeListener('pointerup', pointerup);
                        sprite.removeListener('pointerupoutside', pointerupoutside);
                        sprite.removeListener('pointermove', pointermove);
                        sprite.removeListener('pointertap', pointertap);

                        if (this.hover) {
                            sprite.removeListener('pointerover', pointerover);
                            sprite.removeListener('pointerout',  pointerout);
                        }
                        sprite.interactive = false;
                        this.removeInputListeners = null;
                    };

                return function () {
                    var sprite    = this.container,
                        pointerdown = null,
                        pointerover = null,
                        pointerout  = null,
                        pointermove = null,
                        pointerup = null,
                        pointerupoutside = null,
                        pointertap = null;
                    
                    // The following appends necessary information to displayed objects to allow them to receive touches and clicks
                    sprite.interactive = true;
                    
                    pointerdown = triggerPointerDown.bind(this);
                    pointermove = triggerPointerMove.bind(this);
                    pointerup = triggerPointerUp.bind(this);
                    pointerupoutside = triggerPointerUpOutside.bind(this);
                    pointertap = triggerPointerTap.bind(this);
                    
                    sprite.addListener('pointerdown', pointerdown);
                    sprite.addListener('pointerup', pointerup);
                    sprite.addListener('pointerupoutside', pointerupoutside);
                    sprite.addListener('pointermove', pointermove);
                    sprite.addListener('pointertap', pointertap);

                    if (this.hover) {
                        pointerover = triggerPointerOver.bind(this);
                        pointerout  = triggerPointerOut.bind(this);

                        sprite.addListener('pointerover', pointerover);
                        sprite.addListener('pointerout', pointerout);
                    }

                    this.removeInputListeners = removeInputListeners.bind(this, sprite, pointerdown, pointerup, pointerupoutside, pointermove, pointertap, pointerover, pointerout);
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

            toJSON: function () { // This component is added by another component, so it shouldn't be returned for reconstruction.
                return null;
            },

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
