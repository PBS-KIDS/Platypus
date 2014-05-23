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

			this.handleChildren = true;
			this.extraContent = false;
		},
		events: {
			"load": function(){
				var i = 0,
				last  = null;
				
				// Check for parallel render handlers. A bit gross, but viable until we find a better way - DDD
				for(; i < this.owner.components.length; i++){
					if((this.owner.components[i] === this) || (this.owner.components[i].type.substring(0,14) === 'handler-render')){
						last = this.owner.components[i];
					}
				}
				
				if(last !== this){
					this.handleChildren = false;
				} else {
					this.addEventListener("handle-render-addition", function(addition){
						var i = '';
						
						if(!this.extraContent){
							this.extraContent = {};
						}

						for(i in addition){
							this.extraContent[i] = addition[i];
						}
					});
				}
			},
			
			"child-entity-added": function(entity){
				var self = this; 
				
				entity.trigger('handle-render-load', {
					element: self.element
				});
			},
			"tick": function(resp){
				var i   = '',
				message = {};
				
				if(this.handleChildren){
					for(i in resp){
						message[i] = resp[i];
					}
					if(this.extraContent){
						for(i in this.extraContent){
							message[i] = this.extraContent[i];
						}
					}
					if(this.owner.triggerEventOnChildren){
						this.owner.triggerEventOnChildren('handle-render', message);
					}
					if(this.extraContent){
						for(i in this.extraContent){
							delete this.extraContent[i];
							delete message[i];
						}
					}
				} else {
					this.owner.triggerEvent('handle-render-addition', message);
				}
			}
		},
		
		methods: {
			destroy: function(){
				this.owner.rootElement.removeChild(this.element);
				this.owner.element = null;
				this.element = undefined;
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
