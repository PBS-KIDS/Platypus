/**
# COMPONENT **relay-parent**
This component listens for specified local entity messages and re-broadcasts them on its parent entity.

## Dependencies:
- [[Entity-Container]] (on entity's parent) - This component can broadcast messages to its parent; `this.parent` is commonly specified by being a member of an entity container.

## Messages

### Listens for:
- **[Messages specified in definition]** - Listens for specified messages and on receiving them, re-triggers them as new messages.
  - @param message (object) - accepts a message object that it will include in the new message to be triggered.

### Parent Broadcasts:
- **[Messages specified in definition]** - Listens for specified messages and on receiving them, re-triggers them as new messages on the entity's parent if one exists.
  - @param message (object) - sends the message object received by the original message.

## JSON Definition:
    {
      "type": "relay-parent",
      
      "events": {
      // Required: Maps local messages to trigger messages on the entity's parent. At least one of the following mappings should be included.
        
        "local-message-3": "parent-message",
        // On receiving "local-message-3", triggers "parent-message" on the entity's parent.
        
        "local-message-4": ["multiple", "messages", "to-trigger"]
        // On receiving "local-message-4", triggers each message in the array in sequence on the entity's parent.
      }
    }
*/
(function(){
	var broadcast = function(event){
		return function(value, debug){
			if(this.owner.parent) {
				this.owner.parent.trigger(event, value, debug);
			}
		};
	};
	
	return platformer.createComponentClass({
		id: 'relay-parent',
		
		constructor: function(definition){
			// Messages that this component listens for and then broadcasts to parent.
			if(definition.events){
				for(var event in definition.events){
					this.addEventListener(event, broadcast(definition.events[event]));
				}
			}
		}
	});
})();
