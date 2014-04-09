/**
# COMPONENT **handler-render-dom**
A component that handles the rendering of DOM elements. It creates a div element that it then shares with entities to add themselves too. It then alerts these entities when they should load and update their rendering.

## Dependencies
- **Needs a 'tick' or 'render' call** - This component doesn't need a specific component, but it does require a 'tick' or 'render' call to function. It's usually used as a component of an action-layer.

## Messages

### Listens for:
- **child-entity-added** - Called when a new entity has been added and should be considered for addition to the handler. If the entity has a 'handle-render' or 'handle-render-load' message id it's added to the list of entities. Also the 'handle-render-load' message is called immediately.
  - @param entity (Object) - The entity that is being considered for addition to the handler.
- **tick** - Sends a 'handle-render' message to all the entities the component is handling. If an entity does not handle the message, it's removed it from the entity list.
  - @param resp (object) - An object containing delta which is the time passed since the last tick. 

### Child Broadcasts:
- **handle-render-load** - Sent to an entity that has been added to the handler. Passes the entity a div element that it can add itself to.
  - @param obj.element (Object) - An object containing a DOM element that the entity should add child elements to.
- **handle-render** - Sent to entities to have them prepare to be rendered.
  - @param object - An object containing a delta variable that is the time that's passed since the last tick.

## Methods
- **getElementById** - Used to grab a DOM element that's a child of this layer. This is useful if another scene has not yet been unloaded and elements with matching ids are still in the DOM.
  - @param id (string) - An id that references the element to be returned.

## JSON Definition
    {
      "type": "handler-render-dom",

      "className": "top-band",
      //Optional. Any standard properties of the element can be set by listing property names and their values. "className" is one example, but other element properties can be specified in the same way.
      
      "onmousedown": "turn-green",
      //Optional. If specified properties begin with "on", it is assumed that the property is an event handler and the listed value is broadcast as a message on the entity where the message object is the event handler's event object.
    }
*/

(function(){
	return platformer.createComponentClass({
		id: 'handler-render-dom',
		constructor: function(definition){
			this.entities = [];
			
			this.element = this.owner.element = document.createElement('div');
			this.owner.rootElement.appendChild(this.element);
			this.owner.element = this.element;
	
			for(var i in definition){
				if(i === 'style'){
					for(var j in definition[i]){
						this.element.style[j] = definition[i][j]; 
					}
				} else if(i !== 'type'){
					if(i.indexOf('on') === 0){
						this.element[i] = createFunction(definition[i], this.owner);
					} else {
						this.element[i] = definition[i];
					}
				}
			}
		},
		events: {
			"child-entity-added": function(entity){
				var self = this,
				messageIds = entity.getMessageIds(); 
				
				for (var x = 0; x < messageIds.length; x++){
					if ((messageIds[x] == 'handle-render') || (messageIds[x] == 'handle-render-load')){
						this.entities.push(entity);
						entity.trigger('handle-render-load', {
							element: self.element
						});
						break;
					}
				}
			},
			"tick": function(resp){
				for (var x = this.entities.length - 1; x > -1; x--){
					if(!this.entities[x].trigger('handle-render', resp)){
						this.entities.splice(x, 1);
					}
				}
			}
		},
		
		methods: {
			destroy: function(){
				this.owner.rootElement.removeChild(this.element);
				this.owner.element = null;
				this.element = undefined;
				this.entities.length = 0;
			}
		},
		
		publicMethods: {
			getElementById: function(id){
				var i = 0,
				all   = this.element.getElementsByTagName('*');

				for (; i < all.length; i++) {
				    if(all[i].getAttribute('id') === id){
				    	return all[i];
				    }
				}
				
				return document.getElementById(id);
			}
		}
	});
})();
