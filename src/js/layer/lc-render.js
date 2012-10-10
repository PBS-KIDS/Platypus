platformer.components['lc-render'] = (function(){
	var canvas = false,
	stage      = false,
	layers     = 0,
	component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		this.tickMessages = ['render'];
		this.addListeners(['entity-added','render', 'camera-update']);
		
		if(!layers){ // use the same canvas and stage across layers to allow for mouse input across layers
			canvas = document.createElement('canvas');
			this.owner.rootElement.appendChild(canvas);
			canvas.style.width = '100%';
			canvas.style.height = '100%';
			canvas.width  = 320; //TODO: figure out where to specify this
			canvas.height = 240;
			stage = new createjs.Stage(canvas);
		}
		this.canvas = canvas;
		this.stage  = stage;
		layers += 1
	};
	var proto = component.prototype; 

	proto['entity-added'] = function(entity){
		var self = this,
		messageIds = entity.getMessageIds(); 
		
		for (var x = 0; x < messageIds.length; x++)
		{
			if (messageIds[x] == 'layer:render')
			{
				this.entities.push(entity);
				entity.trigger('layer:render-load', {
					stage: this.stage,
					parentElement: this.owner.rootElement
					//TODO: send along scaling functions to convert world coordinates to window coordinates // somehow get these from camera?
				});
				break;
			}
		}
	};
	
	proto['render'] = function(){
		for (var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger('layer:render');
			
		}
		this.stage.update();
	};
	
	proto['camera-update'] = function(cameraInfo){
		this.stage.setTransform(-cameraInfo.x, -cameraInfo.y);
		
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		layers -= 1;
		if (layers === 0){
			stage = false;
			canvas = false;
		}
		this.stage = undefined;
		this.owner.rootElement.removeChild(this.canvas);
		this.canvas = undefined;
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
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();
