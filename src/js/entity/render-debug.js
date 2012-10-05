platformer.components['render-debug'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		this.controllerEvents = undefined;
		
		this.regX = definition.regX || 0;
		this.regY = definition.regY || 0;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['layer:render', 'layer:render-load', 'controller:input-handler']);
	};
	var proto = component.prototype;

	proto['layer:render'] = function(stage){
		this.shape.x = this.owner.x	- this.regX;
		this.shape.y = this.owner.y	- this.regY;
		this.txt.x = this.owner.x	- this.regX + (this.owner.width / 2);
		this.txt.y = this.owner.y 	- this.regY + (this.owner.height / 2);
		
	};

	proto['layer:render-load'] = function(resp){
		var x  = this.owner.x      = this.owner.x || 0,
		y      = this.owner.y      = this.owner.y || 0,
		width  = this.owner.width  = this.owner.width  || 300,
		height = this.owner.height = this.owner.height || 100,
		comps = platformer.settings.entities[this.owner.type]?(platformer.settings.entities[this.owner.type].components || []):[],
		components = [];
		
		for (var i in comps) components[i] = comps[i].type;
		
		this.stage = resp.stage;
		
		this.txt   = new createjs.Text(this.owner.type + '\n(' + components.join(', ') + ')');
		this.txt.x = x + width / 2;
		this.txt.y = y + height / 2;
		this.txt.textAlign = "center";
		this.txt.textBaseline = "middle";
		
/*		this.mookieImg   = new createjs.Bitmap('i/mookie.png');
		this.mookieImg.x = this.owner.x;
		this.mookieImg.y = this.owner.y;*/
		
		this.shape = new createjs.Shape((new createjs.Graphics()).beginStroke("#880").rect(0, 0, width, height));

		this.stage.addChild(this.shape);
		this.stage.addChild(this.txt);
		
		if(this.controllerEvents){
			this['controller:input-handler'](this.controllerEvents);
		}
	};
	
	/*
	 *  This handler appends necessary information to displayed objects to allow them to receive touches and clicks
	 */
	proto['controller:input-handler'] = function(events){
		var over  = false,
		mousedown = events.mousedown,
		mouseup   = events.mouseup,
		mousemove = events.mousemove;
		//TODO: receive touch input; maybe try moving most of this to input controller if possible with a reference to the stage?
		if(this.stage){
			if (mousedown || mouseup || mousemove){
				
				this.stage.enableMouseOver();
				this.shape.onPress     = function(event) {
					if(mousedown){
						mousedown(event.nativeEvent, over, event.stageX, event.stageY);
					}
					if(mouseup){
						event.onMouseUp = function(event){
							mouseup(event.nativeEvent, over, event.stageX, event.stageY);
						};
					}
					if(mousemove){
						event.onMouseMove = function(event){
							mousemove(event.nativeEvent, over, event.stageX, event.stageY);
						};
					}
				};
				this.shape.onMouseOut  = function(){over = false;};
				this.shape.onMouseOver = function(){over = true;};
			}
		} else {
			this.controllerEvents = events; //save until we have an object to attach these events to.
		}
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
