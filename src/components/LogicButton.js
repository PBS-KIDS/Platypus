/**
 * Provides button functionality for a RenderSprite component.
 *
 * Formerly known as "LogicCanvasButton" which has been deprecated since 0.9.1
 *
 * @namespace platypus.components
 * @class LogicButton
 * @uses platypus.Component
 */
/*global include, platypus */
(function () {
    'use strict';
    
    var Data = include('platypus.Data'),
        component = platypus.components.LogicCanvasButton = platypus.createComponentClass({

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
                 * @type String or an Array of Strings and Message Objects
                 * @default ""
                 * @since 0.9.0
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
                 * @since 0.9.1
                 */
                "toggle": false,

                /**
                 * Specifies whether the button starts off 'pressed'; typically only useful for toggle buttons.
                 *
                 * @property pressed
                 * @type Boolean
                 * @default false
                 * @since 0.9.1
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
                 * @since 0.9.0
                 */
                "bottom": null,

                /**
                 * This sets the distance in world units from the left of the camera's world viewport. If set, it will override the entity's x coordinate. This property is accessible on the entity as `entity.left`.
                 *
                 * @property left
                 * @type Number
                 * @default null
                 * @since 0.9.0
                 */
                "left": null,

                /**
                 * This sets the distance in world units from the right of the camera's world viewport. If set, it will override the entity's x coordinate. This property is accessible on the entity as `entity.right`.
                 *
                 * @property right
                 * @type Number
                 * @default null
                 * @since 0.9.0
                 */
                "right": null,

                /**
                 * This sets the distance in world units from the top of the camera's world viewport. If set, it will override the entity's y coordinate. This property is accessible on the entity as `entity.top`.
                 *
                 * @property top
                 * @type Number
                 * @default null
                 * @since 0.9.0
                 */
                "top": null
            },

            constructor: function () {
                var state = this.owner.state;
                
                this.state = state;
                state.set('disabled', this.disabled);
                state.set('down', this.pressed); // deprecate post 0.9 in favor of "pressed".
                state.set('released', !this.pressed);
                state.set('pressed', this.pressed);
                state.set('highlighted', false);
                this.owner.buttonMode = !this.disabled;
                this.cancelled = false;
            },

            events: {
                /**
                 * This component listens for camera updates to reposition the entity if its bottom, left, right, or top properties have been set.
                 *
                 * @method 'camera-update'
                 * @param camera {platypus.Data} Camera update information
                 * @param camera.viewport {platypus.AABB} The bounding box describing the camera viewport location in the world.
                 * @since 0.9.0
                 */
                "camera-update": function (camera) {
                    var bottom = this.bottom,
                        left = this.left,
                        owner = this.owner,
                        right = this.right,
                        top = this.top,
                        vp = camera.viewport;

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

                /**
                 * Triggers events per the component's definition when a press is made.
                 *
                 * @method 'mousedown'
                 */
                "mousedown": function (eventData) {
                    if (!this.toggle && !this.state.get('disabled')) {
                        if (this.onPress) {
                            this.owner.trigger(this.onPress);
                        }

                        /**
                         * This event is triggered when the button is pressed to mimic keypress events. If the button is a toggle button, this only occurs on up-to-down.
                         *
                         * @event 'pressed'
                         * @param buttonState {platypus.Data} The state of the button
                         * @param buttonState.pressed {Boolean} This is `true` for the 'pressed' event.
                         * @param buttonState.released {Boolean} This is `false` for the 'pressed' event.
                         * @param buttonState.triggered {Boolean} This is `true` for the 'pressed' event.
                         * @since 0.9.1
                         */
                        this.updateStateAndTrigger('pressed');
                        eventData.pixiEvent.stopPropagation();

                        // Doing this prevents the call from reccurring.
                        if (this.useOnce && this.removeEventListener) {
                            this.removeEventListener('mousedown');
                        }
                    }
                },

                /**
                 * Triggers events per the component's definition when a press is released.
                 *
                 * @method 'pressup'
                 */
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
                             * @event 'cancelled'
                             * @param buttonState {platypus.Data} The state of the button
                             * @param buttonState.pressed {Boolean} This is `false` for the 'cancelled' event.
                             * @param buttonState.released {Boolean} This is `true` for the 'cancelled' event.
                             * @param buttonState.triggered {Boolean} This is `false` for the 'cancelled' event.
                             * @since 0.9.1
                             */
                            this.updateStateAndTrigger('cancelled');
                        } else if (this.toggle) {
                            if (state.get('pressed')) {
                                this.updateStateAndTrigger('released');
                            } else {
                                this.updateStateAndTrigger('pressed');
                            }
                        } else {
                            if (this.onRelease) {
                                this.owner.trigger(this.onRelease);
                            }

                            /**
                             * This event is triggered when the button is released, or on the down-to-up change for toggle buttons.
                             *
                             * @event 'released'
                             * @param buttonState {platypus.Data} The state of the button
                             * @param buttonState.pressed {Boolean} This is `false` for the 'released' event.
                             * @param buttonState.released {Boolean} This is `true` for the 'released' event.
                             * @param buttonState.triggered {Boolean} This is `false` for the 'released' event.
                             * @since 0.9.1
                             */
                            this.updateStateAndTrigger('released');
                        }
                        eventData.pixiEvent.stopPropagation();

                        // Doing this prevents the call from reccurring.
                        if (this.useOnce && this.removeEventListener) { //Second check is to ensure method exists which won't be the case if a result of the press is the button being destroyed.
                            this.removeEventListener('pressup');
                            this.state.set('disabled', true);
                            this.owner.buttonMode = false;
                        }
                    }

                    this.cancelled = false;
                },

                /**
                 * If a press moves over the button, it's not cancelled.
                 *
                 * @method 'mouseover'
                 */
                "mouseover": function () {
                    if (this.onHover) {
                        this.owner.trigger(this.onHover);
                    }
                    if (this.state.get('pressed')) {
                        this.cancelled = false;
                    }
                },

                /**
                 * If a press moves off of the button, it's cancelled.
                 *
                 * @method 'mouseout'
                 */
                "mouseout": function () {
                    if (this.state.get('pressed')) {
                        this.cancelled = true;
                    }
                },
                
                /**
                 * Disables the entity.
                 *
                 * @method 'disable'
                 */
                "disable": function () {
                    this.state.set('disabled', true);
                    this.owner.buttonMode = false;
                },
                
                /**
                 * Enables the entity.
                 *
                 * @method 'enable'
                 */
                "enable": function () {
                    this.state.set('disabled', false);
                    this.owner.buttonMode = true;
                },

                /**
                 * Toggles whether the entity is disabled.
                 *
                 * @method 'toggle-disabled'
                 */
                "toggle-disabled": function () {
                    var value = this.state.get('disabled');
                    
                    this.owner.buttonMode = value;
                    this.state.set('disabled', !value);
                },
                
                /**
                 * Sets the entity's highlighted state to `true`.
                 *
                 * @method 'highlight'
                 * @since 0.8.6
                 */
                "highlight": function () {
                    this.state.set('highlighted', true);
                },
                
                /**
                 * Sets the entity's highlighted state to `false`.
                 *
                 * @method 'unhighlight'
                 * @since 0.8.6
                 */
                "unhighlight": function () {
                    this.state.set('highlighted', false);
                },
                
                /**
                 * Toggles the entity's highlighted state.
                 *
                 * @method 'toggle-highlight'
                 * @since 0.8.6
                 */
                "toggle-highlight": function () {
                    var state = this.state;

                    state.set('highlighted', !state.get('highlighted'));
                }
            },
            
            methods: {
                updateStateAndTrigger: function (event) {
                    var message = null,
                        state = this.state,
                        pressed = state.get('pressed'),
                        released = state.get('released'),
                        toggled = false;
                    
                    if (released && (event === 'pressed')) {
                        state.set('pressed', true);
                        state.set('down', false);
                        state.set('released', false);
                        toggled = true;
                    } else if (pressed && ((event === 'released') || (event === 'cancelled'))) {
                        state.set('pressed', false);
                        state.set('down', false);
                        state.set('released', true);
                        toggled = true;
                    }

                    if (toggled) {
                        message = Data.setUp(
                            'released', pressed,
                            'pressed', released,
                            'triggered', released
                        );
                        this.owner.triggerEvent(event, message);
                        message.recycle();
                    }
                },

                destroy: function () {
                    this.owner.buttonMode = false;
                    this.state = null;
                }
            }
        });

    return component;
}());
