/**
# COMPONENT **LogicSwitch**
This component serves as a switch in the game world, typically tied to collision events such that this entity changes state when another entity collides or passed over.

## Dependencies:
- [[HandlerLogic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its state.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component determines its state and triggers messages accordingly.
- **switch-pressed** - Causes the switch to be in a pressed state.

### Local Broadcasts:
- **switch-on** - This message is triggered when the switch has just been pressed.
- **switch-off** - This message is triggered when the switch has just been released.
- **initial-press** - This message is triggered the first time the switch is pressed. This occurs before the "switch-on" message is triggered.

## JSON Definition:
    {
      "type": "LogicSwitch",
      
      "sticky": true
      // Optional. Whether a pressed switch should stay pressed once collision messages cease. Defaults to `false`.
    }
*/
/*global platypus */
(function () {
    'use strict';

    return platypus.createComponentClass({
        
        id: 'LogicSwitch',
        
        initialize: function (definition) {
            this.state = this.owner.state;
            this.pressed = false;
            this.wasPressed = this.pressed;
            this.sticky = definition.sticky || false;
            this.state.set('pressed', false);
            this.initialPress = true;
        },

        events: {// These are messages that this component listens for
            "handle-logic": function () {
                if (this.sticky) {
                    if (this.pressed && !this.wasPressed) {
                        this.state.set('pressed', true);
                        this.wasPressed = true;
                        this.owner.triggerEvent('switch-on');
                    }
                } else {
                    if (this.pressed !== this.wasPressed) {
                        if (this.pressed) {
                            this.state.set('pressed', true);
                            this.owner.triggerEvent('switch-on');
                        } else {
                            this.state.set('pressed', false);
                            this.owner.triggerEvent('switch-off');
                        }
                    }
                    this.wasPressed = this.pressed;
                    this.pressed = false;
                }
            },
            'switch-pressed': function () {
                this.pressed = true;
                if (this.initialPress) {
                    this.owner.triggerEvent('initial-press');
                    this.initialPress = false;
                }
            }
        },
        
        methods: {
            destroy: function () {
                this.state = null;
            }
        }
    });
}());
