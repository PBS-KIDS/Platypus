/**
# COMPONENT **dom-element**
This component creates a DOM element associated with the entity. In addition to allowing for CSS styling, the element can also perform as a controller accepting click and touch inputs and triggering associated messages on the entity.

## Dependencies:
- [[Handler-Render-Dom]] (on entity's parent) - This component listens for a render "handle-render-load" message with a DOM element to setup and display the element.

## Messages

### Listens for:
- **handle-render-load** - This event provides the parent DOM element that this component will require for displaying its DOM element.
  > @param message.element (DOM element) - Required. Provides the render component with the necessary DOM element parent.

### Local Broadcasts:
- **[Messages specified in definition]** - Element event handlers will trigger messages as defined in the JSON definition.
  > @param message (DOM Event object) - When messages are triggered on the entity, the associated message object is the DOM Event object that was provided to the originating DOM Event handler.

## JSON Definition
    {
      "type": "dom-element",

      "element": "div",
      //Required. Sets what type of DOM element should be created.
      
      "innerHTML": "Hi!",
      //Optional. Sets the DOM element's inner text or HTML.
      
      "className": "top-band",
      //Optional. Any standard properties of the element can be set by listing property names and their values. "className" is one example, but other element properties can be specified in the same way.
      
      "onmousedown": "turn-green"
      //Optional. If specified properties begin with "on", it is assumed that the property is an event handler and the listed value is broadcast as a message on the entity where the message object is the event handler's event object.
    }
*/
platformer.components['dom-element'] = (function(){
	var createFunction = function(message, entity){
		return function(e){
			entity.trigger(message, e);
		};
	},
	component = function(owner, definition){
		var elementType = definition.element   || 'div',
		innerHTML       = definition.innerHTML || false;
		
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListener('handle-render-load');
		
		this.element = this.owner.element = document.createElement(elementType);
		for(var i in definition){
			if((i !== 'innerHTML') && (i !== 'type') && (i !== 'element')){
				if(i.indexOf('on') === 0){
					this.element[i] = createFunction(definition[i], this.owner);
				} else {
					this.element[i] = definition[i];
				}
			}
		}
		if(innerHTML){
			this.element.innerHTML = innerHTML;
		}
	};
	var proto = component.prototype;
	
	proto['handle-render-load'] = function(resp){
		if(resp.element){
			this.parentElement = resp.element;
			this.parentElement.appendChild(this.element);
		}
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		if(this.parentElement){
			this.parentElement.removeChild(this.element);
			this.parentElement = undefined;
		}
		if(this.owner.element === this.element){
			this.owner.element = undefined;
		}
		this.element = undefined;
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/

	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value, debug){
			self[messageId](value, debug);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();
