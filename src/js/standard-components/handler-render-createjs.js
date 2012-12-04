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
		this.canvas.width  = 320;
		this.canvas.height = 240;
		this.canvas.style.webkitTransform = 'translate3d(0,0,0)';
		this.canvas.style.transform = 'translate3d(0,0,0)';
		
		this.stage = new createjs.Stage(this.canvas);
		
		this.camera = {
			left: 0,
			top: 0,
			width: 0,
			height: 0,
			buffer: definition.buffer || 0
		};
		this.firstChild = undefined;
		this.timeElapsed = {
			name: 'Render',
			time: 0
		};
	},
	proto = component.prototype; 

	proto['child-entity-added'] = function(entity){
		var self = this,
		messageIds = entity.getMessageIds(); 
		
		for (var x = 0; x < messageIds.length; x++)
		{
			if ((messageIds[x] == 'handle-render') || (messageIds[x] == 'handle-render-load')){
				this.entities.push(entity);
				entity.trigger('handle-render-load', {
					stage: self.stage,
					parentElement: self.owner.rootElement
				});
				break;
			}
		}
	};
	
	proto['tick'] = proto['render'] = function(resp){
		var child = undefined,
		time    = new Date().getTime();
		
		for (var x = this.entities.length - 1; x > -1; x--){
			if(!this.entities[x].trigger('handle-render', resp))
			{
				this.entities.splice(x, 1);
			}
		}
		for (var x = this.stage.children.length - 1; x > -1; x--){
			child = this.stage.children[x];
			if(child.name !== 'entity-managed'){
				if((child.x >= this.camera.x - this.camera.buffer) && (child.x <= this.camera.x + this.camera.width + this.camera.buffer) && (child.y >= this.camera.y - this.camera.buffer) && (child.y <= this.camera.y + this.camera.height + this.camera.buffer)){
					if(!child.visible) child.visible = true;
				} else {
					if(child.visible) child.visible = false;
				}
			}
		}
		
		if (this.stage.getChildAt(0) !== this.firstChild)
		{
			this.stage.sortChildren(function(a, b) {
				return a.z - b.z;
			});
			this.firstChild = this.stage.getChildAt(0);
		}

		this.timeElapsed.name = 'Render-Prep';
		this.timeElapsed.time = new Date().getTime() - time;
		platformer.game.currentScene.trigger('time-elapsed', this.timeElapsed);
		time += this.timeElapsed.time;

		this.stage.update();
		this.timeElapsed.name = 'Render';
		this.timeElapsed.time = new Date().getTime() - time;
		platformer.game.currentScene.trigger('time-elapsed', this.timeElapsed);
	};
	
	proto['camera-update'] = function(cameraInfo){
		this.camera.x = cameraInfo.viewportLeft;
		this.camera.y = cameraInfo.viewportTop;
		this.camera.width = cameraInfo.viewportWidth;
		this.camera.height = cameraInfo.viewportHeight;
		if(!this.camera.buffer){
			this.camera.buffer = this.camera.width / 12; // sets a default buffer based on the size of the world units if the buffer was not explicitly set.
		}
		
		this.canvas.width  = this.canvas.offsetWidth;
		this.canvas.height = this.canvas.offsetHeight;
		this.stage.setTransform(-cameraInfo.viewportLeft * cameraInfo.scaleX, -cameraInfo.viewportTop * cameraInfo.scaleY, cameraInfo.scaleX, cameraInfo.scaleY);
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
