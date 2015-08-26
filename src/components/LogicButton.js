/**
# COMPONENT **LogicButton**
This component handles the pressed/released state of a button according to input. It can be set as a toggle button or a simple press-and-release button.

## Dependencies:
- [[HandlerLogic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its state.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component updates its current state and broadcasts its logical state to the entity.
- **pressed** - on receiving this message, the state of the button is set to "pressed".
- **released** - on receiving this message, the state of the button is set to "released".
- **mousedown** - on receiving this message, the state of the button is set to "pressed". Note that this component will not listen for "mousedown" if the component is in toggle mode.
- **mouseup** - on receiving this message, the state of the button is set to "released" unless in toggle mode, in which case it toggles between "pressed" and "released".

### Local Broadcasts:
- **state-changed** - this component will trigger this message with both "pressed" and "released" properties denoting its state. Both of these work in tandem and never equal each other.
  - @param message.pressed (boolean) - whether the button is in a pressed state.
  - @param message.released (boolean) - whether the button is in a released state.

## JSON Definition:
    {
      "type": "LogicButton",
      
      "toggle": true,
      // Optional. Determines whether this button should behave as a toggle. Defaults to "false".
      
      "state": "pressed"
      // Optional. Specifies starting state of button; typically only useful for toggle buttons. Defaults to "released".
    }
*/
/*global platypus */
(function () {
    "use strict";

    return platypus.createComponentClass({
        id: 'LogicButton',
        constructor: function (definition) {
            this.state = this.owner.state;
            this.state.released = true;
            this.state.pressed  = false;
            this.toggle = !!definition.toggle;

            if (definition.state === 'pressed') {
                this.state.released = false;
                this.state.pressed  = true;
            }
        },
        events: {
            "mousedown": function () {
                if (!this.toggle) {
                    this.updateState('pressed');
                }
            },
            "pressup": function () {
                if (this.toggle) {
                    if (this.state.pressed) {
                        this.updateState('released');
                    } else {
                        this.updateState('pressed');
                    }
                } else {
                    this.updateState('released');
                }
            },
            "handle-logic": function () {
                //TODO: This is only here so that the "state-changed" message is triggered by the Entity for other components needing it.
            }
        },
        
        methods: {
            updateState: function (state) {
                if (this.state.released && (state === 'pressed')) {
                    this.state.pressed = true;
                    this.state.released = false;
                    this.owner.triggerEvent(state, this.state);
                } else if (this.state.pressed && (state === 'released')) {
                    this.state.pressed = false;
                    this.state.released = true;
                    this.owner.triggerEvent(state, this.state);
                }
            }
        }
    });
}());
