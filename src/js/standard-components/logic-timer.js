platformer.components['logic-timer'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['handle-logic']);
		this.owner.time = this.owner.time || definition.time ||  0;
		this.prevTime = this.owner.time;
		this.owner.alarmTime = this.owner.alarmTime || definition.alarmTime || false;
		this.owner.isInterval = this.owner.isInterval || definition.isInterval || false;
		this.owner.alarmMessage =  this.owner.alarmMessage || definition.alarmMessage || '';
		this.owner.updateMessage = this.owner.updateMessage || definition.updateMessage || '';
		this.owner.isOn = this.owner.on || definition.on || true;
		this.owner.isIncrementing = this.owner.isIncrementing || definition.isIncrementing || true;
		this.maxTime = 3600000; //Max time is 1hr.
	};
	var proto = component.prototype;
	
	
	proto['handle-logic'] = function(data){
		if (this.owner.isOn)
		{
			this.prevTime = this.owner.time;
			this.owner.isIncrementing ? this.owner.time += data.deltaT : this.owner.time -= data.deltaT;
			if (Math.abs(this.owner.time) > this.maxTime)
			{
				//If the timer hits the max time we turn it off so we don't overflow anything.
				if (this.owner.time > 0)
				{
					this.owner.time = this.maxTime;
				} else if (this.owner.time < 0) {
					this.owner.time = -this.maxTime;
				}
				this.owner.isOn = false;
			}
			
			if (this.owner.isInterval)
			{
				if (this.owner.isIncrementing)
				{
					if ( Math.floor(this.owner.time / this.owner.alarmTime) > Math.floor(this.prevTime / this.owner.alarmTime))
					{
						this.owner.trigger(this.owner.alarmMessage);
					}
				} else {
					if ( Math.floor(this.owner.time / this.owner.alarmTime) < Math.floor(this.prevTime / this.owner.alarmTime))
					{
						this.owner.trigger(this.owner.alarmMessage);
					}
				}
			} else {
				if (this.owner.time > this.owner.alarmTime && this.prevTime < this.owner.alarmTime)
				{
					this.owner.trigger(this.owner.alarmMessage);
				}
			}
		}
		this.owner.trigger(this.owner.updateMessage, {time: this.owner.time});
	};
	
	proto['set-time'] = function(data){
		this.owner.time = data.time;
	};
	
	proto['start-timer'] = function(){
		this.owner.isOn = true;
	};
	
	proto['stop-timer'] = function(){
		this.owner.isOn = false;
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
