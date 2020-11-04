/**
 * This component accepts touches and clicks on the entity. It is typically automatically added by a render component that requires interactive functionality.
 *
 * @class Interactive
 * @uses platypus.Component
 */
import {Circle, Polygon, Rectangle} from 'pixi.js';
import AABB from '../AABB.js';
import Data from '../Data.js';
import createComponentClass from '../factory.js';

const
    getId = function (event) {
        const
            data = event.data,
            originalEvent = data.originalEvent;

        return originalEvent.type.substr(0, 5) + (data.identifier || (originalEvent.changedTouches && originalEvent.changedTouches[0] && originalEvent.changedTouches[0].identifier) || 0);
    },
    pointerInstances = {},
    orphanPointers = [];

export default createComponentClass({
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
         * Or a circle:
         *
         *     "hitArea": {
         *         "x": 10,
         *         "y": 10,
         *         "radius": 40
         *     }
         *
         * Or use an array of numbers to define a polygon: [x1, y1, x2, y2, ...]
         *
         *     "hitArea": [-10, -10, 30, -10, 30, 30, -5, 30]
         *
         * Defaults to the container if not specified.
         *
         * @property hitArea
         * @type Object
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
        },

        /**
         * This component listens for its own "pointerdown" event to track pressed state to trigger "pressmove" and "pressup" events.
         *
         * @method 'pointerdown'
         */
        "pointerdown": function () {
            this.pressed = true;
        },

        /**
         * This component listens for its own "pointermove" event to trigger "pressmove" events.
         *
         * @method 'pointermove'
         * @param {Object} event
         */
        "pointermove": function (event) {
            if (this.pressed && ((pointerInstances[getId(event.pixiEvent)] === this))) {
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
                this.owner.triggerEvent('pressmove', event);
            }
        },

        /**
         * This component listens for its own "pointerup" event to track pressed state and trigger "pressup" events.
         *
         * @method 'pointerup'
         * @param {Object} event
         */
        "pointerup": function (event) {
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
                this.owner.triggerEvent('pressup', event);
                this.pressed = false;
            }
        },

        /**
         * This component listens for its own "pointerupoutside" event to track pressed state and trigger "pressup" events.
         *
         * @method 'pointerupoutside'
         * @param {Object} event
         */
        "pointerupoutside": function (event) {
            if (this.pressed) {
                this.owner.triggerEvent('pressup', event);
                this.pressed = false;
            }
        },

        /**
         * This component listens for its own "pointercancel" event to track pressed state and trigger "pressup" events.
         *
         * @method 'pointercancel'
         * @param {Object} event
         */
        "pointercancel": function (event) {
            if (this.pressed) {
                this.owner.triggerEvent('pressup', event);
                this.pressed = false;
            }
        },

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
         * Or a circle:
         *
         *     "hitArea": {
         *         "x": 10,
         *         "y": 10,
         *         "radius": 40
         *     }
         *
         * Or use an array of numbers to define a polygon: [x1, y1, x2, y2, ...]
         *
         *     "hitArea": [-10, -10, 30, -10, 30, 30, -5, 30]
         *
         * Defaults to the container if set to `null`.
         *
         * @method 'set-hit-area'
         * @param {Object} shape
         */
        "set-hit-area": function (shape) {
            this.container.hitArea = this.setHitArea(shape);
        }
    },
    
    methods: {
        addInputs: (function () {
            var
                trigger = function (eventName, event) {
                    var camera = this.camera,
                        container = this.container,
                        msg = null,
                        matrix = null,
                        target = this.owner;
                    
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
                        "entity", target
                    );

                    target.trigger(eventName, msg);
                    msg.recycle();
                },
                triggerPointerDown = function (event) {
                    const id = getId(event);

                    if (pointerInstances[id]) { // Hmm, this is a shared identifer - not supposed to happen. We'll save for later to make sure it gets its "pointerup" event.
                        orphanPointers.push(pointerInstances[id]);
                    }
                    pointerInstances[id] = this;

                    /**
                     * This event is triggered on pointer down.
                     *
                     * @event 'pointerdown'
                     * @param event {DOMEvent} The original DOM pointer event.
                     * @param pixiEvent {PIXI.interaction.InteractionEvent} The Pixi pointer event.
                     * @param x {Number} The x coordinate in world units.
                     * @param y {Number} The y coordinate in world units.
                     * @param entity {platypus.Entity} The entity receiving this event.
                     */
                    trigger.call(this, 'pointerdown', event);
                    event.currentTarget.mouseTarget = true;
                },
                triggerPointerMove = function (event) {
                    /**
                     * This event is triggered on pointer move.
                     *
                     * @event 'pointermove'
                     * @param event {DOMEvent} The original DOM pointer event.
                     * @param pixiEvent {PIXI.interaction.InteractionEvent} The Pixi pointer event.
                     * @param x {Number} The x coordinate in world units.
                     * @param y {Number} The y coordinate in world units.
                     * @param entity {platypus.Entity} The entity receiving this event.
                     */
                    trigger.call(this, 'pointermove', event);
                    event.currentTarget.mouseTarget = true;
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
                     */
                    trigger.call(this, 'pointertap', event);
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
                     */
                    trigger.call(this, 'pointerout', event);
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
                     */
                    trigger.call(this, 'pointerover', event);
                },
                triggerPointerUp = function (event) {
                    const
                        id = getId(event);
                    let target = null;

                    if (pointerInstances[id] === this) {
                        // eslint-disable-next-line consistent-this
                        target = this;
                        pointerInstances[id] = null;
                    } else if (orphanPointers.length) {
                        target = orphanPointers[orphanPointers.length - 1];
                        orphanPointers.length -= 1;
                    } else if (pointerInstances[id]) {
                        target = pointerInstances[id];
                    } else {
                        return;
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
                     */
                    trigger.call(target, 'pointerup', event);
                    event.currentTarget.mouseTarget = false;
                    
                    if (event.currentTarget.removeDisplayObject) {
                        event.currentTarget.removeDisplayObject();
                    }
                },
                triggerPointerUpOutside = function (event) {
                    const
                        id = getId(event);
                    let target = null;

                    if (pointerInstances[id] === this) {
                        // eslint-disable-next-line consistent-this
                        target = this;
                        pointerInstances[id] = null;
                    } else if (orphanPointers.length) {
                        target = orphanPointers[orphanPointers.length - 1];
                        orphanPointers.length -= 1;
                    } else if (pointerInstances[id]) {
                        target = pointerInstances[id];
                    } else {
                        return;
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
                     */
                    trigger.call(target, 'pointerupoutside', event);
                    event.currentTarget.mouseTarget = false;
                    
                    if (event.currentTarget.removeDisplayObject) {
                        event.currentTarget.removeDisplayObject();
                    }
                },
                triggerPointerCancel = function (event) {
                    const
                        id = getId(event);
                    let target = null;

                    if (pointerInstances[id] === this) {
                        // eslint-disable-next-line consistent-this
                        target = this;
                        pointerInstances[id] = null;
                    } else if (orphanPointers.length) {
                        target = orphanPointers[orphanPointers.length - 1];
                        orphanPointers.length -= 1;
                    } else if (pointerInstances[id]) {
                        target = pointerInstances[id];
                    } else {
                        return;
                    }

                    /**
                     * This event is triggered on pointer cancel.
                     *
                     * @event 'pointercancel'
                     * @param event {DOMEvent} The original DOM pointer event.
                     * @param pixiEvent {PIXI.interaction.InteractionEvent} The Pixi pointer event.
                     * @param x {Number} The x coordinate in world units.
                     * @param y {Number} The y coordinate in world units.
                     * @param entity {platypus.Entity} The entity receiving this event.
                     */
                    trigger.call(target, 'pointercancel', event);
                    event.currentTarget.mouseTarget = false;
                    
                    if (event.currentTarget.removeDisplayObject) {
                        event.currentTarget.removeDisplayObject();
                    }
                },
                removeInputListeners = function (sprite, pointerdown, pointerup, pointerupoutside, pointercancel, pointermove, pointertap, pointerover, pointerout) {
                    var key = '';

                    for (key in pointerInstances) {
                        if (pointerInstances.hasOwnProperty(key) && (pointerInstances[key] === this)) {
                            pointerInstances[key] = null;
                        }
                    }

                    sprite.removeListener('pointerdown', pointerdown);
                    sprite.removeListener('pointerup', pointerup);
                    sprite.removeListener('pointerupoutside', pointerupoutside);
                    sprite.removeListener('pointercancel', pointercancel);
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
                    pointercancel = null,
                    pointertap = null;
                
                // The following appends necessary information to displayed objects to allow them to receive touches and clicks
                sprite.interactive = true;
                
                pointerdown = triggerPointerDown.bind(this);
                pointermove = triggerPointerMove.bind(this);
                pointerup = triggerPointerUp.bind(this);
                pointerupoutside = triggerPointerUpOutside.bind(this);
                pointercancel = triggerPointerCancel.bind(this);
                pointertap = triggerPointerTap.bind(this);
                
                sprite.addListener('pointerdown', pointerdown);
                sprite.addListener('pointerup', pointerup);
                sprite.addListener('pointerupoutside', pointerupoutside);
                sprite.addListener('pointercancel', pointercancel);
                sprite.addListener('pointermove', pointermove);
                sprite.addListener('pointertap', pointertap);

                if (this.hover) {
                    pointerover = triggerPointerOver.bind(this);
                    pointerout  = triggerPointerOut.bind(this);

                    sprite.addListener('pointerover', pointerover);
                    sprite.addListener('pointerout', pointerout);
                }

                this.removeInputListeners = removeInputListeners.bind(this, sprite, pointerdown, pointerup, pointerupoutside, pointercancel, pointermove, pointertap, pointerover, pointerout);
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
                    if (Array.isArray(shape)) {
                        ha = new Polygon(shape);
                    } else if (shape.radius) {
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
    }
});
