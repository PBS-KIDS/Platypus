platformer.components['handler-render-dom'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['tick', 'child-entity-added','render', 'camera-update']);
		
		this.element = this.owner.element = document.createElement('div');
		this.owner.rootElement.appendChild(this.element);
		this.element.style.position = 'absolute';
		this.element.style.width = '100%';
		this.element.style.height = '100%';
	},
	proto = component.prototype; 

	proto['child-entity-added'] = function(entity){
		var self = this,
		messageIds = entity.getMessageIds(); 
		
		for (var x = 0; x < messageIds.length; x++)
		{
			if (messageIds[x] == 'layer:render')
			{
				this.entities.push(entity);
				entity.trigger('layer:render-load', {
					element: self.element
				});
				break;
			}
		}
	};
	
	proto['tick'] = proto['render'] = function(resp){
		for (var x = this.entities.length - 1; x > -1; x--)
		{
			if(!this.entities[x].trigger('layer:render', resp))
			{
				this.entities.splice(x, 1);
			}
			
		}
	};
	
	proto['camera-update'] = function(cameraInfo){
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.owner.rootElement.removeChild(this.element);
		this.element = undefined;
		this.entities.length = 0;
	};
	
	/*********************************************************************************************************
	 * The stuff below here can be left alone. 
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
