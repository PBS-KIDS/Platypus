/**
 * This component listens for input messages triggered on the entity and updates the state of any controller inputs it is listening for. It then broadcasts messages on the entity corresponding to the input it received.
 * 
 * @namespace platypus.components
 * @class EntityController
 * @uses platypus.Component
 */
/*
## Dependencies:
- [[Handler-Controller]] (on entity's parent) - This component listens for a controller "tick" message in order to trigger messages regarding the state of its inputs.

## Messages

### Listens for:
- **handle-controller** - On each `handle-controller` message, this component checks its list of actions and if any of their states are currently true or were true on the last call, that action message is triggered.
- **mousedown** - This message triggers a new message on the entity that includes what button on the mouse was pressed: "mouse:left-button:down", "mouse:middle-button:down", or "mouse:right-button:down".
  - @param message.event (DOM Event object) - This event object is passed along with the new message.
- **mouseup** - This message triggers a new message on the entity that includes what button on the mouse was released: "mouse:left-button:up", "mouse:middle-button:up", or "mouse:right-button:up".
  - @param message.event (DOM Event object) - This event object is passed along with the new message.
- **mousemove** - Updates mouse action states with whether the mouse is currently over the entity.
  - @param message.over (boolean) - Whether the mouse is over the input entity.
- **pause-controls** - This message will stop the controller from triggering messages until "unpause-controls" is triggered on the entity.
- **unpause-controls** - This message will allow the controller to trigger messages until "pause-controls" is triggered on the entity.
- **[Messages specified in definition]** - Listens for additional messages and on receiving them, sets the appropriate state and broadcasts the associated message on the next `handle-controller` message. These messages come in pairs and typically have the form of "keyname:up" and "keyname:down" specifying the current state of the input.
  
### Local Broadcasts:
- **mouse:mouse-left:down, mouse:mouse-left:up, mouse:mouse-middle:down, mouse:mouse-middle:up, mouse:mouse-right:down, mouse:mouse-right:up** - This component triggers the state of mouse inputs on the entity if a render component of the entity accepts mouse input (for example [[Render-Animation]]).
  - @param message (DOM Event object) - The original mouse event object is passed along with the control message.
- **north, north-northeast, northeast, east-northeast, east, east-southeast, southeast, south-southeast, south, south-southwest, southwest, west-southwest, west, west-northwest, northwest, north-northwest** - If the soft joystick is enabled on this component, it will broadcast these directional messages if the joystick is in use.
  - @param message (DOM Event object) - Mirrors the mouse event object that moved the joystick.
- **joystick-orientation** - If the soft joystick is enabled on this component, this message will trigger to provide the current orientation of the joystick.
  - @param orientation (number) - A number in radians representing the orientation of the joystick.
- **[Messages specified in definition]** - Broadcasts active states using the JSON-defined message on each `handle-controller` message. Active states include `pressed` being true or `released` being true. If both of these states are false, the message is not broadcasted.
  - @param message.pressed (boolean) - Whether the current input is active.
  - @param message.released (boolean) - Whether the current input was active last tick but is no longer active.
  - @param message.triggered (boolean) - Whether the current input is active but was not active last tick.
  - @param message.over (boolean) - Whether the mouse was over the entity when pressed, released, or triggered. This value is always false for non-mouse input messages.

## JSON Definition:
    {
      "type": "EntityController",
      
      "joystick":{
      // Optional. Determines whether this entity should listen for mouse events to trigger directional events. Can be set simply to "true" to accept all joystick defaults
          
          "directions": 8,
          // Optional: 4, 8, or 16. Determines how many directions to broadcast. Default is 4 ("north", "east", "south", and "west").
          
          "innerRadius": 30,
          // Optional. Number determining how far the mouse must be from the entity's position before joystick events should be triggered. Default is 0.
          
          "outerRadius": 60
          // Optional. Number determining how far the mouse can move away from the entity's position before the joystick stops triggering events. Default is Infinity.
      }
    }
*/
/*global include, platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    var ActionState = include('platypus.ActionState'),
        Data = include('platypus.Data'),
        Map = include('platypus.Map'),
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
        
        constructor: function (definition) {
            var key = '',
                filter = null;
            
            this.actions = Map.setUp();
            
            if (this.stateMaps) {
                for (key in this.stateMaps) {
                    if (this.stateMaps.hasOwnProperty(key)) {
                        filter = StateMap.setUp(key);
                        this.addMap(this.stateMaps[key], filter);
                        filter.recycle();
                    }
                }
            }
            
            this.addMap(this.controlMap);

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
            
            "mousedown": function (value) {
                this.owner.triggerEvent('mouse:' + mouseMap[value.event.button || 0] + ':down', value.event);
                if (this.joystick) {
                    this.owner.triggerEvent('joystick:down', value.event);
                    this.handleJoy(value);
                }
            },
            
            "pressup": function (value) {
                this.owner.triggerEvent('mouse:' + mouseMap[value.event.button || 0] + ':up', value.event);
                if (this.joystick) {
                    this.owner.triggerEvent('joystick:up', value.event);
                    this.handleJoy(value);
                }
            },
            
            "pressmove": function (value) {
                if (this.joystick) {
                    this.handleJoy(value);
                }
            },
            
            "pause-controls": function () {
                this.paused = true;
            },
            
            "unpause-controls": function () {
                this.paused = false;
            }
        },
        
        methods: {
            handleJoy: function (event) {
                // The following translate mouse and touch events into messages that this controller can handle in a systematic way
                var segment     = Math.PI / (this.joystick.directions / 2),
                    dist        = distance(this.owner, event),
                    orientation = 0,
                    direction   = '',
                    accuracy    = '';
                
                if ((dist > this.joystick.outerRadius) || (dist < this.joystick.innerRadius)) {
                    return;
                } else if (!this.paused) {
                    orientation = angle(this.owner, event, dist);
                    direction   = directions[this.joystick.directions][Math.floor(((orientation + segment / 2) % (Math.PI * 2)) / segment)];
                    
                    if (this.joystick.handleEdge) {
                        segment  = Math.PI / this.joystick.directions;
                        accuracy = directions[this.joystick.directions * 2][Math.floor(((orientation + segment / 2) % (Math.PI * 2)) / segment)];
                        if (accuracy !== direction) {
                            this.owner.triggerEvent(accuracy.replace(direction, '').replace('-', ''), event);  //There's probably a better way to perform this, but the current method is functional. - DDD
                        }
                    }
                    this.owner.triggerEvent(direction, event);
                    this.owner.triggerEvent("joystick-orientation", orientation);
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
                        actionState = actions[id]; // If there's already a state storage object for this action, reuse it: there are multiple keys mapped to the same action.
                        
                    // Otherwise create a new state storage object
                    if (!actionState) {
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

            addMap: function (map, states) {
                var controller = null,
                    i = 0,
                    j = '',
                    key = '',
                    hash = JSON.stringify(states) || 'default';
                
                for (key in map) {
                    if (map.hasOwnProperty(key)) {
                        controller = map[key];
                        if (typeof controller === 'string') {
                            this.addController(key, hash, controller, states);
                        } else {
                            if (Array.isArray(controller)) {
                                for (i = 0; i < controller.length; i++) {
                                    this.addController(key, hash, controller[i], states);
                                }
                            } else {
                                for (j in controller) {
                                    if (controller.hasOwnProperty(j)) {
                                        if (typeof controller[j] === 'string') {
                                            this.addController(key, hash, controller[j], states, j);
                                        } else {
                                            for (i = 0; i < controller[j].length; i++) {
                                                this.addController(key, hash, controller[j][i], states, j);
                                            }
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
