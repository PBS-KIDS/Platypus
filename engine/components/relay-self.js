/**
# COMPONENT **relay-self**
This component listens for specified local entity messages and re-broadcasts them on itself as other messages.

**Note:** Make sure that this component is never set up to receive and broadcast identical messages or an infinite loop will result, since it will receive the same message it sent.

## Messages

### Listens for:
- **[Messages specified in definition]** - Listens for specified messages and on receiving them, re-triggers them as new messages.
  - @param message (object) - accepts a message object that it will include in the new message to be triggered.

### Local Broadcasts:
- **[Messages specified in definition]** - Listens for specified messages and on receiving them, re-triggers them as new messages on the entity.
  - @param message (object) - sends the message object received by the original message.

## JSON Definition:
    {
      "type": "relay-self",
      
      "events": {
      // Required: Maps local messages to trigger alternative messages on the entity itself. This can be useful as a basic fill-in for a logic component to translate an outgoing message from one component into an incoming message for another. At least one of the following mappings should be included.
        
        "local-message-5": "another-local-message",
        // On receiving "local-message-5", triggers "another-local-message" on the entity itself.
        
        "local-message-6": ["multiple", "messages", "to-trigger"]
        // On receiving "local-message-6", triggers each message in the array in sequence on the entity itself.
      }
    }
*/
(function(){
	var broadcast = function(event){
		return function(value, debug){
			this.owner.trigger(event, value, debug);
		};
	};
	
	return platformer.createComponentClass({
		id: 'relay-self',
		
		constructor: function(definition){
			// Messages that this component listens for and then triggers on itself as a renamed message - useful as a logic place-holder for simple entities.
			if(definition.events){
				for(var event in definition.events){
					this.addEventListener(event, broadcast(definition.events[event]));
				}
			}
		}
	});
})();
