/**
# COMPONENT **handler-ai**
A component that handles updating ai components. Each tick it calls all the entities that accept 'handle-ai' messages.

## Dependencies
- **Needs a 'tick' call** - This component doesn't need a specific component, but it does require a 'tick' call to function. It's usually used as a component of an action-layer.

## Messages

### Listens for:
- **child-entity-added** - Called when a new entity has been added and should be considered for addition to the handler. If the entity has a 'handle-ai' message id it's added to the list of entities. 
  - @param entity (Object) - The entity that is being considered for addition to the handler.
- **tick** - Sends a 'handle-ai' message to all the entities the component is handling. If an entity does not handle the message, it's removed it from the entity list.
  - @param obj (object) - An object containing delta which is the time passed since the last tick. 

### Child Broadcasts:
- **handle-ai** - Sent to entities to run their ai for the tick.
  - @param object - An object containing a delta variable that is the time that's passed since the last tick.

## JSON Definition
    {
      "type": "handler-ai",
    }
*/


	
(function(){
	return platformer.createComponentClass({
		id: 'handler-ai',
		constructor: function(definition){
		},
		events:{
			"tick": function(message){
				if(this.owner.triggerEventOnChildren){
					this.owner.triggerEventOnChildren('handle-ai', message);
				}
			}
		},
		methods: {
			destroy: function(){
			}
		}
	});
})();
