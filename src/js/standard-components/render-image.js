platformer.components['render-image'] = (function(){
	var component = function(owner, definition){
		var image = definition.image,
		source    = definition.source;
		
		this.owner = owner;
		
		if(definition.acceptInput){
			this.hover = definition.acceptInput.hover || false;
			this.click = definition.acceptInput.click || false;
			this.touch = definition.acceptInput.touch || false;
		} else {
			this.hover = false;
			this.click = false;
			this.touch = false;
		}
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['handle-render-load', 'handle-render']);
		this.stage = undefined;
		this.image = new createjs.Bitmap(platformer.assets[image]);
		if(source){
			this.image.sourceRect = new createjs.Rectangle(source.x, source.y, source.width, source.height);
		}
		this.image.regX   = definition.regX || 0;
		this.image.regY   = definition.regY || 0;
		this.image.scaleX = definition.scaleX || this.owner.scaleX || 1;
		this.image.scaleY = definition.scaleY || this.owner.scaleY || 1;
	};
	var proto = component.prototype;
	
	proto['handle-render-load'] = function(obj){
		var self = this,
		over     = false;
		
		this.stage = obj.stage;
		this.stage.addChild(this.image);
		
		// The following appends necessary information to displayed objects to allow them to receive touches and clicks
		if(this.click || this.touch){
			if(this.touch && createjs.Touch.isSupported()){
				createjs.Touch.enable(this.stage);
			}

			this.anim.onPress     = function(event) {
				self.owner.trigger('mousedown', {
					//debug: true,
					event: event.nativeEvent,
					over: over,
					x: event.stageX,
					y: event.stageY,
					entity: self.owner
				});
				event.onMouseUp = function(event){
					self.owner.trigger('mouseup', {
						//debug: true,
						event: event.nativeEvent,
						over: over,
						x: event.stageX,
						y: event.stageY,
						entity: self.owner
					});
				};
				event.onMouseMove = function(event){
					self.owner.trigger('mousemove', {
						event: event.nativeEvent,
						over: over,
						x: event.stageX,
						y: event.stageY,
						entity: self.owner
					});
				};
			};
			this.anim.onMouseOut  = function(){over = false;};
			this.anim.onMouseOver = function(){over = true;};
		}
		if(this.hover){
			this.stage.enableMouseOver();
			this.anim.onMouseOut  = function(event){
				over = false;
				self.owner.trigger('mouseout', {
					event: event.nativeEvent,
					over: over,
					x: event.stageX,
					y: event.stageY,
					entity: self.owner
				});
			};
			this.anim.onMouseOver = function(event){
				over = true;
				self.owner.trigger('mouseover', {
					event: event.nativeEvent,
					over: over,
					x: event.stageX,
					y: event.stageY,
					entity: self.owner
				});
			};
		}
	};
	
	proto['handle-render'] = function(obj){
		this.image.x = this.owner.x;
		this.image.y = this.owner.y;
		this.image.z = this.owner.z;
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
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
