/**
# COMPONENT **relay-game**
This component listens for specified local entity messages and re-broadcasts them at the top game level.

## Messages

### Listens for:
- **[Messages specified in definition]** - Listens for specified messages and on receiving them, re-triggers them as new messages.
  - @param message (object) - accepts a message object that it will include in the new message to be triggered.

### Game Broadcasts:
- **[Messages specified in definition]** - Listens for specified messages and on receiving them, re-triggers them as new messages at the top game level.
  - @param message (object) - sends the message object received by the original message.

## JSON Definition:
    {
      "type": "relay-game",
      
      "events": {
      // Optional: Maps local messages to trigger global game messages. At least one of the following mappings should be included.
        
        "local-message-1": "global-game-message",
        // On receiving "local-message-1", triggers "global-game-message" at the game level.
        
        "local-message-2": ["multiple", "messages", "to-trigger"]
        // On receiving "local-message-2", triggers each message in the array in sequence at the game level.
      }
    }
*/
(function(){
	var broadcast = function(event){
		return function(value, debug){
			platformer.game.currentScene.trigger(event, value, debug);
		};
	};
	
	return platformer.createComponentClass({
		id: 'relay-game',
		
		constructor: function(definition){
			// Messages that this component listens for and then broadcasts to all layers.
			if(definition.events){
				for(var event in definition.events){
					this.addEventListener(event, broadcast(definition.events[event]));
				}
			}
		}
	});
})();
