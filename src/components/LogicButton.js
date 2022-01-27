import AABB from '../AABB.js';
import Data from '../Data.js';
import createComponentClass from '../factory.js';

export default (function () {
    return createComponentClass(/** @lends platypus.components.LogicButton.prototype */{

        id: 'LogicButton',

        properties: {
            /**
             * The event to trigger when pressed.
             *
             * @property onPress
             * @type String
             * @default ""
             */
            "onPress": "",

            /**
             * The event to trigger when released.
             *
             * @property onRelease
             * @type String
             * @default ""
             */
            "onRelease": "",

            /**
             * The event to trigger when cancelled.
             *
             * @property onCancel
             * @type String
             * @default ""
             */
            "onCancel": "",

            /**
             * The event to trigger when the user mouses over the button
             *
             * @property hoverAudio
             * @type String|String[]|Message[]
             * @default ""
             */
            "onHover": "",

            /**
             * Whether this button's actions should be limited to the initial press/release.
             *
             * @property useOnce
             * @type Boolean
             * @default false
             */
            "useOnce": false,

            /**
             * Whether this button should start disabled.
             *
             * @property disabled
             * @type Boolean
             * @default false
             */
            "disabled": false,

            /**
             * Determines whether this button should behave as a toggle.
             *
             * @property toggle
             * @type Boolean
             * @default false
             */
            "toggle": false,

            /**
             * Specifies whether the button starts off 'pressed'; typically only useful for toggle buttons.
             *
             * @property pressed
             * @type Boolean
             * @default false
             */
            "pressed": false
        },

        publicProperties: {
            /**
             * This sets the distance in world units from the bottom of the camera's world viewport. If set, it will override the entity's y coordinate. This property is accessible on the entity as `entity.bottom`.
             *
             * @property bottom
             * @type Number
             * @default null
             */
            "bottom": null,

            /**
             * This sets the distance in world units from the left of the camera's world viewport. If set, it will override the entity's x coordinate. This property is accessible on the entity as `entity.left`.
             *
             * @property left
             * @type Number
             * @default null
             */
            "left": null,

            /**
             * This sets the distance in world units from the right of the camera's world viewport. If set, it will override the entity's x coordinate. This property is accessible on the entity as `entity.right`.
             *
             * @property right
             * @type Number
             * @default null
             */
            "right": null,

            /**
             * This sets the distance in world units from the top of the camera's world viewport. If set, it will override the entity's y coordinate. This property is accessible on the entity as `entity.top`.
             *
             * @property top
             * @type Number
             * @default null
             */
            "top": null
        },

        /**
         * Provides button functionality for a RenderSprite component.
         *
         * @memberof platypus.components
         * @uses platypus.Component
         * @constructs
         * @listens platypus.Entity#camera-update
         * @listens platypus.Entity#disable
         * @listens platypus.Entity#enable
         * @listens platypus.Entity#handle-logic
         * @listens platypus.Entity#highlight
         * @listens platypus.Entity#pointerdown
         * @listens platypus.Entity#pointerout
         * @listens platypus.Entity#pointerover
         * @listens platypus.Entity#pressup
         * @listens platypus.Entity#toggle-disabled
         * @listens platypus.Entity#toggle-highlight
         * @listens platypus.Entity#unhighlight
         * @fires platypus.Entity#pressed
         * @fires platypus.Entity#cancelled
         * @fires platypus.Entity#released
         */
        initialize: function () {
            var state = this.owner.state;
            
            this.aabb = AABB.setUp();
            this.lastBottom = null;
            this.lastLeft = null;
            this.lastRight = null;
            this.lastTop = null;

            this.state = state;
            state.set('disabled', this.disabled);
            state.set('released', !this.pressed);
            state.set('pressed', this.pressed);
            state.set('highlighted', false);
            this.owner.buttonMode = !this.disabled;
            this.cancelled = false;

            this.readyToToggle = false;
        },

        events: {
            "handle-logic": function () {
                var bottom = this.bottom,
                    left = this.left,
                    right = this.right,
                    top = this.top;

                if ((this.lastBottom !== bottom) || (this.lastLeft !== left) || (this.lastRight !== right) || (this.lastTop !== top)) {
                    this.updatePosition(this.aabb);
                    this.lastBottom = bottom;
                    this.lastLeft = left;
                    this.lastRight = right;
                    this.lastTop = top;
                }
            },

            "camera-update": function (camera) {
                this.aabb.set(camera.viewport);
                this.updatePosition(this.aabb);
            },

            "pointerdown": function (eventData) {
                if (!this.state.get('disabled')) {
                    if (this.toggle) {
                        this.readyToToggle = true;
                    } else {
                        if (this.onPress) {
                            this.owner.trigger(this.onPress);
                        }

                        /**
                         * This event is triggered when the button is pressed to mimic keypress events. If the button is a toggle button, this only occurs on up-to-down.
                         *
                         * @event platypus.Entity#pressed
                         * @param buttonState {platypus.Data} The state of the button
                         * @param buttonState.pressed {Boolean} This is `true` for the 'pressed' event.
                         * @param buttonState.released {Boolean} This is `false` for the 'pressed' event.
                         * @param buttonState.triggered {Boolean} This is `true` for the 'pressed' event.
                         * @param buttonState.entity {platypus.Entity} The entity for which the original event occurred.
                         */
                        this.updateStateAndTrigger('pressed');
                        if (eventData && eventData.pixiEvent && eventData.pixiEvent.stopPropagation) { // ensure a properly formed event has been sent
                            eventData.pixiEvent.stopPropagation();
                        }

                        // Doing this prevents the call from reccurring.
                        if (this.useOnce && this.removeEventListener) {
                            this.removeEventListener('pointerdown');
                        }
                    }
                }
            },

            "pressup": function (eventData) {
                var state = this.state;

                if (!state.get('disabled')) {
                    if (this.cancelled) {
                        if (this.onCancel) {
                            this.owner.trigger(this.onCancel);
                        }

                        /**
                         * This event is triggered when the button is pressed and the mouse/touch is dragged off-target before release.
                         *
                         * @event platypus.Entity#cancelled
                         * @param buttonState {platypus.Data} The state of the button
                         * @param buttonState.pressed {Boolean} This is `false` for the 'cancelled' event.
                         * @param buttonState.released {Boolean} This is `true` for the 'cancelled' event.
                         * @param buttonState.triggered {Boolean} This is `false` for the 'cancelled' event.
                         * @param buttonState.entity {platypus.Entity} The entity for which the original event occurred.
                         */
                        this.updateStateAndTrigger('cancelled');
                    } else if (this.toggle) {
                        if (this.readyToToggle) {
                            if (state.get('pressed')) {
                                this.updateStateAndTrigger('released');
                            } else {
                                this.updateStateAndTrigger('pressed');
                            }
                        }
                    } else {
                        if (this.onRelease) {
                            this.owner.trigger(this.onRelease);
                        }

                        /**
                         * This event is triggered when the button is released, or on the down-to-up change for toggle buttons.
                         *
                         * @event platypus.Entity#released
                         * @param buttonState {platypus.Data} The state of the button
                         * @param buttonState.pressed {Boolean} This is `false` for the 'released' event.
                         * @param buttonState.released {Boolean} This is `true` for the 'released' event.
                         * @param buttonState.triggered {Boolean} This is `false` for the 'released' event.
                         * @param buttonState.entity {platypus.Entity} The entity for which the original event occurred.
                         */
                        this.updateStateAndTrigger('released');
                    }
                    if (eventData && eventData.pixiEvent && eventData.pixiEvent.stopPropagation) { // ensure a properly formed event has been sent
                        eventData.pixiEvent.stopPropagation();
                    }

                    // Doing this prevents the call from reccurring.
                    if (this.useOnce && this.removeEventListener) { //Second check is to ensure method exists which won't be the case if a result of the press is the button being destroyed.
                        this.removeEventListener('pressup');
                        this.state.set('disabled', true);
                        this.owner.buttonMode = false;
                    }
                }

                this.cancelled = false;
                this.readyToToggle = false;
            },

            "pointerover": function () {
                if (this.onHover) {
                    this.owner.trigger(this.onHover);
                }
                if (this.state.get('pressed')) {
                    this.cancelled = false;
                }
            },

            "pointerout": function () {
                if (this.state.get('pressed')) {
                    this.cancelled = true;
                }
            },
            
            /**
             * Disables the entity.
             *
             * @event platypus.Entity#disable
             */
            "disable": function () {
                this.state.set('disabled', true);
                this.owner.buttonMode = false;
            },
            
            /**
             * Enables the entity.
             *
             * @event platypus.Entity#enable
             */
            "enable": function () {
                this.state.set('disabled', false);
                this.owner.buttonMode = true;
            },

            /**
             * Toggles whether the entity is disabled.
             *
             * @event platypus.Entity#toggle-disabled
             */
            "toggle-disabled": function () {
                var value = this.state.get('disabled');
                
                this.owner.buttonMode = value;
                this.state.set('disabled', !value);
            },
            
            /**
             * Sets the entity's highlighted state to `true`.
             *
             * @event platypus.Entity#highlight
             */
            "highlight": function () {
                this.state.set('highlighted', true);
            },
            
            /**
             * Sets the entity's highlighted state to `false`.
             *
             * @event platypus.Entity#unhighlight
             */
            "unhighlight": function () {
                this.state.set('highlighted', false);
            },
            
            /**
             * Toggles the entity's highlighted state.
             *
             * @event platypus.Entity#toggle-highlight
             */
            "toggle-highlight": function () {
                var state = this.state;

                state.set('highlighted', !state.get('highlighted'));
            }
        },
        
        methods: {
            updatePosition: function (vp) {
                var bottom = this.bottom,
                    left = this.left,
                    owner = this.owner,
                    right = this.right,
                    top = this.top;

                if (typeof left === 'number') {
                    owner.x = vp.left + left;
                } else if (typeof right === 'number') {
                    owner.x = vp.right - right;
                }

                if (typeof top === 'number') {
                    owner.y = vp.top + top;
                } else if (typeof bottom === 'number') {
                    owner.y = vp.bottom - bottom;
                }
            },

            updateStateAndTrigger: function (event) {
                var message = null,
                    owner = this.owner,
                    state = this.state,
                    pressed = state.get('pressed'),
                    released = state.get('released'),
                    toggled = false;
                
                if (released && (event === 'pressed')) {
                    state.set('pressed', true);
                    state.set('released', false);
                    toggled = true;
                } else if (pressed && ((event === 'released') || (event === 'cancelled'))) {
                    state.set('pressed', false);
                    state.set('released', true);
                    toggled = true;
                }

                if (toggled) {
                    message = Data.setUp(
                        'released', pressed,
                        'pressed', released,
                        'triggered', released,
                        'entity', owner
                    );
                    owner.triggerEvent(event, message);
                    message.recycle();
                }
            },

            destroy: function () {
                this.aabb.recycle();
                this.aabb = null;
                this.owner.buttonMode = false;
                this.state = null;
            }
        }
    });
}());
