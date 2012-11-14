platformer.components['render-debug'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		//this.controllerEvents = undefined;
		
		if(definition.acceptInput){
			this.hover = definition.acceptInput.hover || false;
			this.click = definition.acceptInput.click || false;
			this.touch = definition.acceptInput.touch || false;
		} else {
			this.hover = false;
			this.click = false;
			this.touch = false;
		}
		
		this.regX = definition.regX || 0;
		this.regY = definition.regY || 0;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['layer:render', 'layer:render-load']);
	};
	var proto = component.prototype;

	proto['layer:render'] = function(stage){
		if(this.owner.getAABB){
			var aabb   = this.owner.getAABB();
			this.shape.scaleX = aabb.width / this.initialWidth;
			this.shape.scaleY = aabb.height / this.initialHeight;
			this.shape.x = aabb.x - aabb.halfWidth;
			this.shape.y = aabb.y - aabb.halfHeight;
			this.shape.z = this.owner.z;
			this.txt.x = aabb.x;
			this.txt.y = aabb.y;
			this.txt.z = this.owner.z;
		} else {
			this.shape.x = this.owner.x	- this.regX;
			this.shape.y = this.owner.y	- this.regY;
			this.shape.z = this.owner.z;
			this.txt.x = this.owner.x	- this.regX + (this.owner.width / 2);
			this.txt.y = this.owner.y 	- this.regY + (this.owner.height / 2);
			this.txt.z = this.owner.z;
		}
		if(this.owner.getCollisionGroupAABB){
			var aabb = this.owner.getCollisionGroupAABB();
			if(!this.groupShape){
				this.groupShape = new createjs.Shape((new createjs.Graphics()).beginFill("rgba(0,255,0,0.1)").setStrokeStyle(3).beginStroke("#0f0").rect(0, 0, aabb.width, aabb.height));
				this.groupShapeInitialWidth  = aabb.width;
				this.groupShapeInitialHeight = aabb.height;
				this.stage.addChild(this.groupShape);
			}
			this.groupShape.scaleX = aabb.width  / this.groupShapeInitialWidth;
			this.groupShape.scaleY = aabb.height / this.groupShapeInitialHeight;
			this.groupShape.x      = aabb.x      - aabb.halfWidth;
			this.groupShape.y      = aabb.y      - aabb.halfHeight;
		}
	};

	proto['layer:render-load'] = function(resp){
		var self = this,
		x        = this.owner.x      = this.owner.x || 0,
		y        = this.owner.y      = this.owner.y || 0,
		z        = this.owner.z      = this.owner.z || 0,
		width    = this.owner.width  = this.owner.width  || 300,
		height   = this.owner.height = this.owner.height || 100,
		comps    = platformer.settings.entities[this.owner.type]?(platformer.settings.entities[this.owner.type].components || []):[],
		components = [],
		over     = false;
		
		for (var i in comps) components[i] = comps[i].type;
		
		this.stage = resp.stage;
		
		this.txt   = new createjs.Text(this.owner.type + '\n(' + components.join(', ') + ')');
		this.txt.x = x + width / 2;
		this.txt.y = y + height / 2;
		this.txt.z = z;
		this.txt.textAlign = "center";
		this.txt.textBaseline = "middle";
		
/*		this.mookieImg   = new createjs.Bitmap('i/mookie.png');
		this.mookieImg.x = this.owner.x;
		this.mookieImg.y = this.owner.y;*/
		
		if(this.owner.getAABB){
			var aabb   = this.owner.getAABB();
			width      = this.initialWidth  = aabb.width;
			height     = this.initialHeight = aabb.height;
			this.shape = new createjs.Shape((new createjs.Graphics()).beginFill("rgba(255,0,255,0.1)").setStrokeStyle(3).beginStroke("#f0f").rect(0, 0, width, height));
			this.regX  = width  / 2;
			this.regY  = height / 2;
		} else {
			this.shape = new createjs.Shape((new createjs.Graphics()).beginFill("rgba(0,0,0,0.1)").beginStroke("#880").rect(0, 0, width, height));
		}
		this.shape.z = z;
		this.stage.addChild(this.shape);
		this.stage.addChild(this.txt);
		
		// The following appends necessary information to displayed objects to allow them to receive touches and clicks
		if(this.touch && createjs.Touch.isSupported()){
			createjs.Touch.enable(this.stage);
		}

		this.shape.onPress     = function(event) {
			if(this.click || this.touch){
				self.owner.trigger('mousedown', {
					event: event.nativeEvent,
					over: over,
					x: event.stageX,
					y: event.stageY,
					entity: self.owner
				});
				event.onMouseUp = function(event){
					self.owner.trigger('mouseup', {
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
			}
			if(event.nativeEvent.button == 2){
				console.log('This Entity:', self.owner);
			}
		};
		if(this.click || this.touch){
			this.shape.onMouseOut  = function(){over = false;};
			this.shape.onMouseOver = function(){over = true;};
		}
		if(this.hover){
			this.stage.enableMouseOver();
			this.shape.onMouseOut  = function(event){
				over = false;
				self.owner.trigger('mouseout', {
					event: event.nativeEvent,
					over: over,
					x: event.stageX,
					y: event.stageY,
					entity: self.owner
				});
			};
			this.shape.onMouseOver = function(event){
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
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.stage.removeChild(this.shape);
		this.stage.removeChild(this.txt);
		this.shape = undefined;
		this.txt = undefined;
		this.stage = undefined;
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
