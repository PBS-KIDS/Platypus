/**
# COMPONENT **logic-game-button**
This component serves as a switch in the game world, typically tied to collision events such that this entity changes state when another entity collides or passed over.

## Dependencies:
- [[handler-logic]] (on entity's parent) - This component listens for a logic tick message to maintain and update its state.

## Messages

### Listens for:
- **handle-logic** - On a `tick` logic message, the component determines its state and triggers messages accordingly.
- **button-pressed** - Causes the button to be in a pressed state.

### Local Broadcasts:
- **button-on** - This message is triggered when the button has just been pressed.
- **button-off** - This message is triggered when the button has just been released.
- **initial-press** - This message is triggered the first time the button is pressed. This occurs before the "button-on" message is triggered.

## JSON Definition:
    {
      "type": "logic-game-button",
      
      "sticky": true
      // Optional. Whether a pressed button should stay pressed once collision messages cease. Defaults to `false`.
    }
*/
(function(){

	return platformer.createComponentClass({
		
		id: 'logic-game-button',
		
		constructor: function(definition){
			this.state = this.owner.state;
			this.pressed = false;
			this.wasPressed = this.pressed;
			this.sticky = definition.sticky || false;
			this.state.pressed = false;
			this.initialPress = true;
		},

		events: {// These are messages that this component listens for
			'handle-logic': function () {
				if (this.sticky) {
					if (this.pressed && !this.wasPressed) {
						this.state.pressed = true;
						this.wasPressed = true;
						this.owner.trigger('button-on');
					}
				} else {
					if (this.pressed != this.wasPressed) {
						if (this.pressed) {	
							this.state.pressed = true;
							this.owner.trigger('button-on');
						} else {
							this.state.pressed = false;
							this.owner.trigger('button-off');
						}
					}
					this.wasPressed = this.pressed;
					this.pressed = false;
				}
			},
			'button-pressed': function() {
				this.pressed = true; 
				if(this.initialPress){
					this.owner.trigger('initial-press');
					this.initialPress = false;
				}
			}
		}		
	});
})();
