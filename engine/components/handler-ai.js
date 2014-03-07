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
			this.entities = [];
		},
		events:{
			"child-entity-added": function(entity){
				var messageIds = entity.getMessageIds();
				
				for (var x = 0; x < messageIds.length; x++)
				{
					if (messageIds[x] == 'handle-ai')
					{
						this.entities.push(entity);
						break;
					}
				}
			},
			"tick": function(obj){
				for (var x = this.entities.length - 1; x > -1; x--)
				{
					if(!this.entities[x].trigger('handle-ai', obj))
					{
						this.entities.splice(x, 1);
					}
				}
			}
		},
		methods: {
			destroy: function(){
				this.entities.length = 0;
			}
		}
	});
})();
