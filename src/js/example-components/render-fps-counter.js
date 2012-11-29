platformer.components['render-fps-counter'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['handle-render', 'handle-render-load', 'toggle-visible', 'time-elapsed']);
		this.stage = undefined;
		
		var font = definition.font || "12px Arial";
		this.counter = new createjs.Text('SOON TO BE FPS', font);
		this.counter.x = definition.x || this.owner.x || 20;
		this.counter.y = definition.y || this.owner.y || 20;
		this.counter.z = definition.z || this.owner.z || 1000;
		this.counter.scaleX = definition.scaleX || this.owner.scaleX || 1;
		this.counter.scaleY = definition.scaleY || this.owner.scaleY || 1;
		this.counter.color = definition.color || '#000';
		this.counter.textAlign = "left";
		this.counter.textBaseline = "middle";
		
		this.times = {};
	};
	var proto = component.prototype;
	
	proto['handle-render-load'] = function(resp){
		this.stage = resp.stage;
		this.stage.addChild(this.counter);
	};
	
	proto['handle-render'] = function(){
		var text = Math.floor(createjs.Ticker.getMeasuredFPS()) + " FPS\n";
		for(var name in this.times){
			text += '\n' + name + ': ' + this.times[name] + 'ms';
			this.times[name] = 0;
		}
		this.counter.text = text;
	};
	
	proto['toggle-visible'] = function(){
		this.counter.visible = !this.counter.visible;  
	};
	
	proto['time-elapsed'] = function(value){
		if(value){
			if(value.name){
				this.times[value.name] += value.time;
			}
		}
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.stage.removeChild(this.counter);
		this.stage = undefined;
		this.counter = undefined;
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
