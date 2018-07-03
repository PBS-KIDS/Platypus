/**
 * This component listens for input messages triggered on the entity and updates the state of any controller inputs it is listening for. It then broadcasts messages on the entity corresponding to the input it received.
 *
 * @namespace platypus.components
 * @class EntityController
 * @uses platypus.Component
 */
/* global include, platypus */
(function () {
    'use strict';

    var ActionState = include('platypus.ActionState'),
        Data = include('platypus.Data'),
        DataMap = include('platypus.DataMap'),
        StateMap = include('platypus.StateMap'),
        distance = function (origin, destination) {
            var x = destination.x - origin.x,
                y = destination.y - origin.y;

            return Math.sqrt((x * x) + (y * y));
        },
        angle = function (origin, destination, distance) {
            var x      = destination.x - origin.x,
                y      = destination.y - origin.y,
                a      = 0,
                circle = Math.PI * 2;

            if (!distance) {
                return a;
            }

            a = Math.acos(x / distance);
            if (y < 0) {
                a = circle - a;
            }
            return a;
        },
        directions = [null, null, null, null, //joystick directions
            ['east', 'south', 'west', 'north'], null, null, null,
            ['east', 'southeast', 'south', 'southwest', 'west', 'northwest', 'north', 'northeast'], null, null, null, null, null, null, null,
            ['east', 'east-southeast', 'southeast', 'south-southeast', 'south', 'south-southwest', 'southwest', 'west-southwest', 'west', 'west-northwest', 'northwest', 'north-northwest', 'north', 'north-northeast', 'northeast', 'east-northeast']
        ],
        mouseMap = ['left-button', 'middle-button', 'right-button'],
        trigger = function (event, message) {
            if (!this.paused) {
                this.owner.trigger(event, message);
            }
        },
        filteredTrigger = function (state, event, message) {
            if (!this.paused && message[state]) {
                this.owner.trigger(event, message);
            }
        };

    return platypus.createComponentClass({
        id: 'EntityController',
        
        properties: {
            /**
             * Use the controlMap property object to map inputs to messages that should be triggered. At least one control mapping should be included. The following are a few examples:
             *
             *       {
             *           "key:x": "run-left",
             *           // This causes an "x" keypress to fire "run-left" on the entity. For a full listing of key names, check out the `HandlerController` component.
             *
             *           "button-pressed": "throw-block",
             *           // custom input messages can be fired on this entity from other entities, allowing for on-screen input buttons to run through the same controller channel as other inputs.
             *
             *           "mouse:left-button"
             *           // The controller can also handle mouse events on the entity if the entity's render component triggers mouse events on the entity (for example, the `RenderSprite` component).
             *       }
             *
             * @property controlMap
             * @type Object
             * @default {}
             */
            controlMap: {},

            /**
             * Determines whether this entity should listen for mouse events to trigger directional events. Can be set simply to "true" to accept all joystick defaults.
             *
             *       "joystick": {
             *           "directions": 8, // Optional: 4, 8, or 16. Determines how many directions to broadcast. Default is 4 ("north", "east", "south", and "west").
             *           "innerRadius": 30, // Optional. Number determining how far the mouse must be from the entity's position before joystick events should be triggered. Default is 0.
             *           "outerRadius": 60 // Optional. Number determining how far the mouse can move away from the entity's position before the joystick stops triggering events. Default is Infinity.
             *       }
             *
             * @property joystick
             * @type Object
             * @default null
             */
            joystick: null,
            
            /**
             * The stateMaps property can hold multiple control maps. Use this if certain controls should only be available for certain states. The controller finds the first valid state and falls back to the base `controlMap` as default if no matches are found.
             *
             * @property stateMaps
             * @type Object
             * @default {}
             * @since 0.6.7
             */
            stateMaps: {}
        },
        
        publicProperties: {
            /**
             * Whether input controls should be deactivated.
             *
             * @property paused
             * @type Boolean
             * @default false
             */
            paused: false
        },
        
        initialize: function (definition) {
            var key = '',
                filter = null;
            
            this.actions = DataMap.setUp();
            
            if (this.stateMaps) {
                for (key in this.stateMaps) {
                    if (this.stateMaps.hasOwnProperty(key)) {
                        filter = StateMap.setUp(key);
                        this.addMap(this.stateMaps[key], key, filter);
                        filter.recycle();
                    }
                }
            }
            
            this.addMap(this.controlMap, 'default');

            if (definition.joystick) {
                this.joystick = Data.setUp(
                    "directions",  definition.joystick.directions  || 4, // 4 = n,e,s,w; 8 = n,ne,e,se,s,sw,w,nw; 16 = n,nne,ene,e...
                    "handleEdge",  definition.joystick.handleEdge  || false,
                    "innerRadius", definition.joystick.innerRadius || 0,
                    "outerRadius", definition.joystick.outerRadius || Infinity
                );
            }
        },
        
        events: {
            /**
             * On each `handle-controller` message, this component checks its list of actions and if any of their states are currently true or were true on the last call, that action message is triggered.
             *
             * @method 'handle-controller'
             */
            "handle-controller": function () {
                var actions = this.actions,
                    keys = actions.keys,
                    i = keys.length,
                    action = '',
                    resolution = Array.setUp(),
                    state = this.owner.state;
                
                while (i--) {
                    action = actions.get(keys[i]);
                    if (action.update(state)) {
                        resolution.push(action);
                    }
                }
                
                i = resolution.length;
                while (i--) {
                    resolution[i].resolve();
                }
                
                resolution.recycle();
            },
            
            /**
             * This message triggers a new message on the entity that includes what button on the mouse was pressed: "mouse:left-button:down", "mouse:middle-button:down", or "mouse:right-button:down".
             *
             * @method 'pointerdown'
             * @param value.event {DOM Event object} This event object is passed along with the new message.
             */
            "pointerdown": function (value) {
                if (value.pixiEvent.data.pointerType === 'mouse') {
                    /**
                     * This component triggers the state of mouse inputs on the entity if a render component of the entity accepts mouse input.
                     *
                     * @event 'mouse:mouse-left:down'
                     * @param message {DOM Event object} The original mouse event object is passed along with the control message.
                     */
                    /**
                     * This component triggers the state of mouse inputs on the entity if a render component of the entity accepts mouse input (for example [[Render-Animation]]).
                     *
                     * @event 'mouse:mouse-middle:down'
                     * @param message {DOM Event object} The original mouse event object is passed along with the control message.
                     */
                    /**
                     * This component triggers the state of mouse inputs on the entity if a render component of the entity accepts mouse input (for example [[Render-Animation]]).
                     *
                     * @event 'mouse:mouse-right:down'
                     * @param message {DOM Event object} The original mouse event object is passed along with the control message.
                     */
                    this.owner.triggerEvent('mouse:' + mouseMap[value.event.button || 0] + ':down', value.event);
                }

                if (this.joystick) {
                    /**
                     * This event is triggered when there is an active touch in the joystick area.
                     *
                     * @event 'joystick:down'
                     * @param message {DOM Event object} The original pointer event object is passed along with the control message.
                     */
                    this.owner.triggerEvent('joystick:down', value.event);
                    this.handleJoy(value);
                }
            },
            
            /**
             * This message triggers a new message on the entity that includes what button on the mouse was released: "mouse:left-button:up", "mouse:middle-button:up", or "mouse:right-button:up".
             *
             * @method 'pressup'
             * @param value.event {DOM Event object} This event object is passed along with the new message.
             */
            "pressup": function (value) {
                var owner = this.owner;

                if (value.pixiEvent.data.pointerType === 'mouse') {
                    /**
                     * This component triggers the state of mouse inputs on the entity if a render component of the entity accepts mouse input (for example [[Render-Animation]]).
                     *
                     * @event 'mouse:mouse-left:up'
                     * @param message {DOM Event object} The original mouse event object is passed along with the control message.
                     */
                    /**
                     * This component triggers the state of mouse inputs on the entity if a render component of the entity accepts mouse input (for example [[Render-Animation]]).
                     *
                     * @event 'mouse:mouse-middle:up'
                     * @param message {DOM Event object} The original mouse event object is passed along with the control message.
                     */
                    /**
                     * This component triggers the state of mouse inputs on the entity if a render component of the entity accepts mouse input (for example [[Render-Animation]]).
                     *
                     * @event 'mouse:mouse-right:up'
                     * @param message {DOM Event object} The original mouse event object is passed along with the control message.
                     */
                    owner.triggerEvent('mouse:' + mouseMap[value.event.button || 0] + ':up', value.event);
                }

                if (this.joystick) {
                    /**
                     * This event is triggered when there is an active touch is released from the joystick area.
                     *
                     * @event 'joystick:up'
                     * @param message {DOM Event object} The original pointer event object is passed along with the control message.
                     */
                    owner.triggerEvent('joystick:up', value.event);
                    /**
                     * This event is triggered to stop movement once the joystick is released.
                     *
                     * @event 'stop'
                     */
                    owner.triggerEvent('stop');
                }
            },
            
            /**
             * Updates joystick input if joystick is enabled.
             *
             * @method 'pressmove'
             * @param value {platypus.Data} This event object is passed along with the joystick messages.
             */
            "pressmove": function (value) {
                if (this.joystick) {
                    this.handleJoy(value);
                }
            },
            
            /**
             * This message will stop the controller from triggering messages until "unpause-controls" is triggered on the entity.
             *
             * @method 'pause-controls'
             */
            "pause-controls": function () {
                this.paused = true;
            },
            
            /**
             * This message will allow the controller to trigger messages until "pause-controls" is triggered on the entity.
             *
             * @method 'unpause-controls'
             */
            "unpause-controls": function () {
                this.paused = false;
            }
        },

        methods: {
            handleJoy: function (event) {
                // The following translate mouse and touch events into messages that this controller can handle in a systematic way
                var joystick = this.joystick,
                    owner = this.owner,
                    segment     = Math.PI / (joystick.directions / 2),
                    dist        = distance(owner, event),
                    orientation = 0,
                    direction   = '',
                    accuracy    = '';
                
                if ((dist > joystick.outerRadius) || (dist < joystick.innerRadius)) {
                    return;
                } else if (!this.paused) {
                    orientation = angle(owner, event, dist);
                    direction   = directions[joystick.directions][Math.floor(((orientation + segment / 2) % (Math.PI * 2)) / segment)];
                    
                    if (joystick.handleEdge) {
                        segment  = Math.PI / joystick.directions;
                        accuracy = directions[joystick.directions * 2][Math.floor(((orientation + segment / 2) % (Math.PI * 2)) / segment)];
                        if (accuracy !== direction) {
                            owner.triggerEvent(accuracy.replace(direction, '').replace('-', ''), event);  //There's probably a better way to perform this, but the current method is functional. - DDD
                        }
                    }

                    owner.triggerEvent('stop');

                    /**
                     * If the soft joystick is enabled on this component, it will broadcast this directional message if the joystick is dragged due north.
                     *
                     * @event 'north'
                     * @param message {DOM Event object} The original pointer event object is passed along with the control message.
                     */
                    /**
                     * If the soft joystick is enabled on this component, it will broadcast this directional message if the joystick is dragged due north-northeast.
                     *
                     * @event 'north-northeast'
                     * @param message {DOM Event object} The original pointer event object is passed along with the control message.
                     */
                    /**
                     * If the soft joystick is enabled on this component, it will broadcast this directional message if the joystick is dragged due northeast.
                     *
                     * @event 'northeast'
                     * @param message {DOM Event object} The original pointer event object is passed along with the control message.
                     */
                    /**
                     * If the soft joystick is enabled on this component, it will broadcast this directional message if the joystick is dragged due east-northeast.
                     *
                     * @event 'east-northeast'
                     * @param message {DOM Event object} The original pointer event object is passed along with the control message.
                     */
                    /**
                     * If the soft joystick is enabled on this component, it will broadcast this directional message if the joystick is dragged due east.
                     *
                     * @event 'east'
                     * @param message {DOM Event object} The original pointer event object is passed along with the control message.
                     */
                    /**
                     * If the soft joystick is enabled on this component, it will broadcast this directional message if the joystick is dragged due east-southeast.
                     *
                     * @event 'east-southeast'
                     * @param message {DOM Event object} The original pointer event object is passed along with the control message.
                     */
                    /**
                     * If the soft joystick is enabled on this component, it will broadcast this directional message if the joystick is dragged due southeast.
                     *
                     * @event 'southeast'
                     * @param message {DOM Event object} The original pointer event object is passed along with the control message.
                     */
                    /**
                     * If the soft joystick is enabled on this component, it will broadcast this directional message if the joystick is dragged due south-southeast.
                     *
                     * @event 'south-southeast'
                     * @param message {DOM Event object} The original pointer event object is passed along with the control message.
                     */
                    /**
                     * If the soft joystick is enabled on this component, it will broadcast this directional message if the joystick is dragged due south.
                     *
                     * @event 'south'
                     * @param message {DOM Event object} The original pointer event object is passed along with the control message.
                     */
                    /**
                     * If the soft joystick is enabled on this component, it will broadcast this directional message if the joystick is dragged due south-southwest.
                     *
                     * @event 'south-southwest'
                     * @param message {DOM Event object} The original pointer event object is passed along with the control message.
                     */
                    /**
                     * If the soft joystick is enabled on this component, it will broadcast this directional message if the joystick is dragged due southwest.
                     *
                     * @event 'southwest'
                     * @param message {DOM Event object} The original pointer event object is passed along with the control message.
                     */
                    /**
                     * If the soft joystick is enabled on this component, it will broadcast this directional message if the joystick is dragged due west-southwest.
                     *
                     * @event 'west-southwest'
                     * @param message {DOM Event object} The original pointer event object is passed along with the control message.
                     */
                    /**
                     * If the soft joystick is enabled on this component, it will broadcast this directional message if the joystick is dragged due west.
                     *
                     * @event 'west'
                     * @param message {DOM Event object} The original pointer event object is passed along with the control message.
                     */
                    /**
                     * If the soft joystick is enabled on this component, it will broadcast this directional message if the joystick is dragged due west-northwest.
                     *
                     * @event 'west-northwest'
                     * @param message {DOM Event object} The original pointer event object is passed along with the control message.
                     */
                    /**
                     * If the soft joystick is enabled on this component, it will broadcast this directional message if the joystick is dragged due northwest.
                     *
                     * @event 'northwest'
                     * @param message {DOM Event object} The original pointer event object is passed along with the control message.
                     */
                    /**
                     * If the soft joystick is enabled on this component, it will broadcast this directional message if the joystick is dragged due north-northwest.
                     *
                     * @event 'north-northwest'
                     * @param message {DOM Event object} The original pointer event object is passed along with the control message.
                     */
                    owner.triggerEvent(direction, event);

                    /**
                     * If the soft joystick is enabled on this component, this message will trigger to provide the current orientation of the joystick.
                     *
                     * @event 'joystick-orientation'
                     * @param orientation (number) - A number in radians representing the orientation of the joystick.
                     */
                    owner.triggerEvent("joystick-orientation", orientation);
                }
            },
            
            addController: (function () {
                var up = function (index) {
                        this.inputs[index] = false;
                    },
                    down = function (index) {
                        this.inputs[index] = true;
                    };
                
                return function (key, stateId, controller, states, controllerState) {
                    var actions = this.actions,
                        id = stateId + '-' + controller + '-' + (controllerState || 'all'),
                        actionState = actions.get(id); // If there's already a state storage object for this action, reuse it: there are multiple keys mapped to the same action.
                        
                    // Otherwise create a new state storage object
                    if (!actionState) {

                        /**
                         * Broadcasts active states using the JSON-defined message on each `handle-controller` message. Active states include `pressed` being true or `released` being true. If both of these states are false, the message is not broadcasted.
                         *
                         * @event '*'
                         * @param message.pressed {Boolean} Whether the current input is active.
                         * @param message.released {Boolean} Whether the current input was active last tick but is no longer active.
                         * @param message.triggered {Boolean} Whether the current input is active but was not active last tick.
                         * @param message.over {Boolean} Whether the mouse was over the entity when pressed, released, or triggered. This value is always false for non-mouse input messages.
                         */
                        if (controllerState) {
                            actionState = actions.set(id, ActionState.setUp(controller, states, filteredTrigger.bind(this, controllerState)));
                        } else {
                            actionState = actions.set(id, ActionState.setUp(controller, states, trigger.bind(this)));
                        }
                    }
                    
                    // Set up listeners and input flag.
                    this.addEventListener(key + ':up',   up.bind(actionState, actionState.inputs.length));
                    this.addEventListener(key + ':down', down.bind(actionState, actionState.inputs.length));
                    actionState.inputs.push(false);
                };
            }()),

            addMap: function (map, id, states) {
                var controller = null,
                    i = 0,
                    j = '',
                    key = '';
                
                for (key in map) {
                    if (map.hasOwnProperty(key)) {
                        controller = map[key];
                        if (typeof controller === 'string') {
                            this.addController(key, id, controller, states);
                        } else if (Array.isArray(controller)) {
                            for (i = 0; i < controller.length; i++) {
                                this.addController(key, id, controller[i], states);
                            }
                        } else {
                            for (j in controller) {
                                if (controller.hasOwnProperty(j)) {
                                    if (typeof controller[j] === 'string') {
                                        this.addController(key, id, controller[j], states, j);
                                    } else {
                                        for (i = 0; i < controller[j].length; i++) {
                                            this.addController(key, id, controller[j][i], states, j);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            
            destroy: function () {
                var actions = this.actions,
                    keys = actions.keys,
                    i = keys.length;
                
                while (i--) {
                    actions.get(keys[i]).recycle();
                }
                actions.recycle();
                if (this.joystick) {
                    this.joystick.recycle();
                }
            }
        }
    });
}());
