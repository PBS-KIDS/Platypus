platformer.components['logic-hero'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		var self = this;
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['layer:logic','key-left','key-right','key-up','key-down','key-jump']);
		
		this.owner.state = 'ground';
		this.owner.heading = 'right';
		this.left = false;
		this.right = false;
		this.up = false;
		this.down = false;
		this.jump = false;
		
		this.vX = 0; 
		this.vY = 0;
		this.aX = .25;
		this.fX = .4;
		this.maxVX = 2;
		this.maxVY = 3;
		this.jumpV = 4;
		this.aGravity = .01;
		
		//Handle Tile Collisions
		this.owner.resolveTileCollision = function(heading, collisionInfo){
			return self.resolveTileCollision(heading, collisionInfo);
		};
		
		//Handle Solid Collisions
		this.owner.resolveSolidCollision = function(heading, collisionInfo){
			return self.resolveSolidCollision(heading, collisionInfo);
		};
		
		//Handle Soft Collisions
		this.owner.resolveSoftCollision = function(collisionInfo){
			return self.resolveSoftCollision(collisionInfo);
		};
	};
	var proto = component.prototype;
	
	proto['layer:logic'] = function(deltaT){
		//this.vX = 0;
		//this.vY = 0;
		
		if(this.left)
		{
			this.vX -= this.aX * deltaT;
			if (this.vX < -this.maxVX)
			{
				this.vX = -this.maxVX;
			}
			this.owner.heading = 'right';
		} else if (this.right) {
			this.vX += this.aX * deltaT;
			if (this.vX > this.maxVX)
			{
				this.vX = this.maxVX;
			}
			this.owner.heading = 'left';
		} else {
			if (this.vX > 0)
			{
				this.vX -= this.fX * deltaT;
				if (this.vX < 0) {
					this.vX = 0;
				} 
			} else if (this.vX < 0)
			{
				this.vX += this.fX * deltaT;
				if (this.vX > 0) {
					this.vX = 0;
				} 
			} 
		}

		/*
		
		if (this.up) {
			this.vY -= this.aX * deltaT;
			if (this.vY < -this.maxVX)
			{
				this.vY = -this.maxVX;
			}
		}  else if (this.down) {
			this.vY += this.aX * deltaT;
			if (this.vY > this.maxVX)
			{
				this.vY = this.maxVX;
			}
		} 
		*/
		if (this.jump && this.owner.state != 'air') {
			this.vY = -this.jumpV;
			this.owner.state = 'air';
			this.owner.trigger('jumping'); //This is for audio
		}
		
		if (this.owner.state == 'air')
		{
			this.vY += this.aGravity * deltaT;
			if (this.vY > this.maxVY)
			{
				this.vY = this.maxVY;
			}
		} else if (this.owner.state == 'ground'){
			this.vY += this.aGravity * deltaT;
		}
		
		this.owner.x += (this.vX * deltaT);
		this.owner.y += (this.vY * deltaT);
		
		this.left = false;
		this.right = false;
		this.up = false;
		this.down = false;
		this.jump = false;
		
		
		if (this.owner.state == 'ground')
		{
			if (this.vX == 0)
			{
				this.owner.trigger('logical-state', {state: 'standing' + '-' + this.owner.heading});
			} else {
				this.owner.trigger('logical-state', {state: 'walking' + '-' + this.owner.heading});
				this.owner.trigger('walking'); //This is for audio
			}
		} else if (this.owner.state == 'air')
		{
			this.owner.trigger('logical-state', {state: 'jumping' + '-' + this.owner.heading});
			
		}
		
		
		
	};
	
	proto['key-left'] = function (state)
	{
		if(state.pressed)
		{
			this.left = true;
		}
	};
	
	proto['key-right'] = function (state)
	{
		if(state.pressed)
		{
			this.right = true;
		}
	};
	
	proto['key-up'] = function (state)
	{
		if(state.pressed)
		{
			this.up = true;
		}
	};
	
	proto['key-down'] = function (state)
	{
		if(state.pressed)
		{
			this.down = true;
		}
	};
	
	proto['key-jump'] = function (state)
	{
		if(state.pressed)
		{
			this.jump = true;
		}
	};

	proto.resolveTileCollision = function(heading, collisionInfo){
		switch (heading)
		{
		case 'down':
			this.owner.state = 'ground';
			break;
		case 'up':
			this.vY = 0;
			break;
		}
		return true;
	};
	
	proto.resolveSolidCollision = function(heading, collisionInfo){
		switch (heading)
		{
		case 'down':
			if (this.owner.state == 'ground')
			{
				this.vY = 0; 
			} else if (this.owner.state == 'air') {
				this.owner.state = 'ground';
				this.vY = 0; 
			}
			break;
		}
		return true;
	};
	
	proto.resolveSoftCollision = function(collisionInfo){
		return false;
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
