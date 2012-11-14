platformer.components['logic-directional-movement'] = (function(){
	var processDirection = function(direction){
		return function (state){
			if(state){
				if(state.pressed)
				{
					this[direction] = true;
				} else {
					this[direction] = false;
				}
			} else {
				this[direction] = true;
			}
		};
	},
	component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['layer:logic',
   		    'go-down',       'go-south',
   		    'go-down-left',  'go-southwest',
		    'go-left',       'go-west',
		    'go-up-left',    'go-northwest',
		    'go-up',         'go-north',
		    'go-up-right',   'go-northeast',
		    'go-right',      'go-east',
		    'go-down-right', 'go-southeast',
		    'stop'
		]);
		
		this.owner.state = 'standing';
		this.owner.heading = 'right';
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
	
	proto['layer:logic'] = function(resp){
		var vX    = 0,
		vY        = 0,
		upLeft    = this.upLeft    || (this.up   && this.left),
		downLeft  = this.downLeft  || (this.down && this.left),
		downRight = this.downRight || (this.down && this.right),
		upRight   = this.upRight   || (this.up   && this.right);
		
		if (this.up && this.down){
			this.owner.state = 'standing';
		} else if (this.left && this.right) {
			this.owner.state = 'standing';
		} else if (upLeft) {
			vX = -this.speed / 1.414;
			vY = -this.speed / 1.414;
			this.owner.heading = 'up-left';
			this.owner.state = 'walking';
		} else if (upRight) {
			vY = -this.speed / 1.414;
			vX =  this.speed / 1.414;
			this.owner.heading = 'up-right';
			this.owner.state = 'walking';
		} else if (downLeft) {
			vY =  this.speed / 1.414;
			vX = -this.speed / 1.414;
			this.owner.heading = 'down-left';
			this.owner.state = 'walking';
		} else if (downRight) {
			vY =  this.speed / 1.414;
			vX =  this.speed / 1.414;
			this.owner.heading = 'down-right';
			this.owner.state = 'walking';
		} else if(this.left)	{
			vX = -this.speed;
			this.owner.heading = 'left';
			this.owner.state = 'walking';
		} else if (this.right) {
			vX =  this.speed;
			this.owner.heading = 'right';
			this.owner.state = 'walking';
		} else if (this.up) {
			vY = -this.speed;
			this.owner.heading = 'up';
			this.owner.state = 'walking';
		} else if (this.down) {
			vY =  this.speed;
			this.owner.heading = 'down';
			this.owner.state = 'walking';
		} else {
			this.owner.state = 'standing';
		}
		
		this.owner.x += (vX * resp.deltaT);
		this.owner.y += (vY * resp.deltaT);
		
		this.owner.trigger('logical-state', {state: this.owner.state + '-' + this.owner.heading});
		this.owner.trigger(this.owner.state);
	};
	
	proto['go-down']       = proto['go-south']     = processDirection('down');
	proto['go-down-left']  = proto['go-southwest'] = processDirection('downLeft');
	proto['go-left']       = proto['go-west']      = processDirection('left');
	proto['go-up-left']    = proto['go-northwest'] = processDirection('upLeft');
	proto['go-up']         = proto['go-north']     = processDirection('up');
	proto['go-up-right']   = proto['go-northeast'] = processDirection('upRight');
	proto['go-right']      = proto['go-east']      = processDirection('right');
	proto['go-down-right'] = proto['go-southeast'] = processDirection('downRight');

	proto['stop'] = function(state){
		if(!state || state.pressed)
		{
			this.down = false;
			this.downLeft = false;
			this.left = false;
			this.upLeft = false;
			this.up = false;
			this.upRight = false;
			this.right = false;
			this.downRight = false;
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
