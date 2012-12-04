platformer.components['logic-fps-counter'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['handle-logic', 'toggle-visible', 'time-elapsed']);

		this.counter = {
			text: ''
		};
		this.times = {};
		this.timeElapsed = false;
		this.ticks = definition.ticks || 30; //number of ticks for which to take an average
		this.count = this.ticks;
	};
	var proto = component.prototype;
	
	proto['handle-logic'] = function(){
		if(this.timeElapsed){ //to make sure we're not including 0's from multiple logic calls between time elapsing.
			this.timeElapsed = false;
			this.count--;
			if(!this.count){
				this.count = this.ticks;
				var text = Math.floor(createjs.Ticker.getMeasuredFPS()) + " FPS<br />";
				for(var name in this.times){
					text += '<br />' + name + ': ' + Math.round(this.times[name] / this.ticks) + 'ms';
					this.times[name] = 0;
				}
				this.counter.text = text;
				this.owner.trigger('update-content', this.counter);
			}
		}
	};
	
	proto['toggle-visible'] = function(){
		this.counter.visible = !this.counter.visible;  
	};
	
	proto['time-elapsed'] = function(value){
		if(value){
			if(value.name){
				if((value.name === 'Engine Total') && !this.timeElapsed){
					this.timeElapsed = true;
				}
				this.times[value.name] += value.time;
			}
		}
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
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
