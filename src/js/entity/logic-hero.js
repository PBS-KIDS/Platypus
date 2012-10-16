platformer.components['logic-hero'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['layer:logic','key-left','key-right','key-up','key-down', 'key-up-left', 'key-up-right', 'key-down-left', 'key-down-right']);
		
		this.owner.state = 'standing';
		this.owner.heading = 'south';
		this.speed = definition.speed || .3;
		this.left = false;
		this.right = false;
		this.up = false;
		this.down = false;
		this.upLeft = false;
		this.upRight = false;
		this.downLeft = false;
		this.downRight = false;
	};
	var proto = component.prototype;
	
	proto['layer:logic'] = function(deltaT){
		var vX = 0;
		var vY = 0;
		
		if(this.left)
		{
			vX = -this.speed;
			this.owner.heading = 'west';
			this.owner.state = 'walking';
		} else if (this.right) {
			vX = this.speed;
			this.owner.heading = 'east';
			this.owner.state = 'walking';
		} else if (this.up) {
			vY = -this.speed;
			this.owner.heading = 'north';
			this.owner.state = 'walking';
		} else if (this.down) {
			vY = this.speed;
			this.owner.heading = 'south';
			this.owner.state = 'walking';
		} else if (this.upLeft) {
			vX = -this.speed;
			vY = -this.speed;
			this.owner.heading = 'west';
			this.owner.state = 'walking';
		} else if (this.upRight) {
			vY = -this.speed;
			vX = this.speed;
			this.owner.heading = 'east';
			this.owner.state = 'walking';
		} else if (this.downLeft) {
			vY = this.speed;
			vX = -this.speed;
			this.owner.heading = 'west';
			this.owner.state = 'walking';
		} else if (this.downRight) {
			vY = this.speed;
			vX = this.speed;
			this.owner.heading = 'east';
			this.owner.state = 'walking';
		}else {
			this.owner.state = 'standing';
// test for gravity			vY = 0.3; //gravity!
		}
		
		this.owner.x += (vX * deltaT);
		this.owner.y += (vY * deltaT);
		
		this.left = false;
		this.right = false;
		this.up = false;
		this.down = false;
		this.upLeft = false;
		this.upRight = false;
		this.downLeft = false;
		this.downRight = false;
		
		this.owner.trigger('logical-state', {state: this.owner.state + '-' + this.owner.heading});
		this.owner.trigger(this.owner.state);
	};
	
	proto['key-left'] = function (state)
	{
		if(state.pressed)
		{
			this.left = true;
		}
	};
	
	proto['key-up'] = function (state)
	{
		if(state.pressed)
		{
			this.up = true;
		}
	};
	
	proto['key-right'] = function (state)
	{
		if(state.pressed)
		{
			this.right = true;
		}
	};
	
	proto['key-down'] = function (state)
	{
		if(state.pressed)
		{
			this.down = true;
		}
	};
	
	proto['key-up-left'] = function (state)
	{
		if(state.pressed)
		{
			this.upLeft = true;
		}
	};
	
	proto['key-up-right'] = function (state)
	{
		if(state.pressed)
		{
			this.upRight = true;
		}
	};
	
	proto['key-down-left'] = function (state)
	{
		if(state.pressed)
		{
			this.downLeft = true;
		}
	};
	
	proto['key-down-right'] = function (state)
	{
		if(state.pressed)
		{
			this.downRight = true;
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
