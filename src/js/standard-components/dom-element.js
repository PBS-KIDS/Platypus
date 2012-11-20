platformer.components['dom-element'] = (function(){
	var component = function(owner, definition){
		var self    = this, 
		elementType = definition.element || 'div',
		innerHTML   = definition.innerHTML || false;
		
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['handle-render', 'handle-render-load']);
		
		this.element = this.owner.element = document.createElement(elementType);
		for(i in definition){
			if((i !== 'innerHTML') && (i !== 'type') && (i !== 'element')){
				if(i.indexOf('on') === 0){
					this.element[i] = function(e){
						self.owner.trigger(definition[i], e);
					};
				} else {
//					this.element.setAttribute(i, definition[i]);
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
	
	proto['handle-render'] = function(resp){
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
