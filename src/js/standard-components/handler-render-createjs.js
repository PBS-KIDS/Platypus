platformer.components['handler-render-createjs'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['tick', 'child-entity-added', 'render', 'camera-update']);
		
		this.canvas = this.owner.canvas = document.createElement('canvas');
		this.owner.rootElement.appendChild(this.canvas);
		this.canvas.style.width = '100%';
		this.canvas.style.height = '100%';
		this.canvas.width  = 320; //TODO: figure out where to specify this
		this.canvas.height = 240;
		this.stage = new createjs.Stage(this.canvas);
		this.firstChild = undefined;
		this.showFPS = definition.showFPS || false;
		if (this.showFPS)
		{
			this.fpsCounter = new createjs.Text('SOON TO BE FPS', "bold 50px Arial","#FFF");
			this.stage.addChild(this.fpsCounter);
			this.fpsCounter.x = 20;
			this.fpsCounter.y = 20;
			this.fpsCounter.z = 1000;
		}
	},
	proto = component.prototype; 

	proto['child-entity-added'] = function(entity){
		var self = this,
		messageIds = entity.getMessageIds(); 
		
		for (var x = 0; x < messageIds.length; x++)
		{
			if (messageIds[x] == 'handle-render')
			{
				this.entities.push(entity);
				entity.trigger('handle-render-load', {
					stage: self.stage,
					parentElement: self.owner.rootElement
					//TODO: send along scaling functions to convert world coordinates to window coordinates // somehow get these from camera?
				});
				break;
			}
		}
	};
	
	proto['tick'] = proto['render'] = function(resp){
		for (var x = this.entities.length - 1; x > -1; x--)
		{
			if(!this.entities[x].trigger('handle-render', resp))
			{
				this.entities.splice(x, 1);
			}
		}
		if (this.stage.getChildAt(0) !== this.firstChild)
		{
			this.stage.sortChildren(function(a, b) {
				return a.z - b.z;
			});
			this.firstChild = this.stage.getChildAt(0);
		}
		if(this.fpsCounter)
		{
			this.fpsCounter.text = Math.floor(createjs.Ticker.getMeasuredFPS()) + " FPS";
		}
		this.stage.update();
	};
	
	proto['camera-update'] = function(cameraInfo){
		this.canvas.width  = this.canvas.offsetWidth;
		this.canvas.height = this.canvas.offsetHeight;
		this.stage.setTransform(-cameraInfo.x * cameraInfo.scaleX, -cameraInfo.y * cameraInfo.scaleY, cameraInfo.scaleX, cameraInfo.scaleY);
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
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
