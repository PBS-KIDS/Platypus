platformer.components['logic-hero'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		var self = this;
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['layer:logic', 'set-velocity', 'teleport','key-left','key-right','key-up','key-down','key-jump','key-swing']);
		
		this.owner.state   = this.owner.state || 'ground';
		this.owner.heading = this.owner.heading || 'right';
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
		this.aJump = 4;
		this.aGravity = .01;
		
		this.teleportDestination = undefined;
		this.justTeleported = false;
		
		this.hitGround = false;
		
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
	
	proto['layer:logic'] = function(resp){
		var deltaT = resp.deltaT;
		
		if (this.teleportDestination)
		{
			this.owner.trigger('relocate-entity', this.teleportDestination);
			this.teleportDestination = undefined;
		} else {
			if(this.left) {
				this.vX -= this.aX * deltaT;
				if (this.vX < -this.maxVX)
				{
					this.vX = -this.maxVX;
				}
				this.owner.heading = 'left';
			} else if (this.right) {
				this.vX += this.aX * deltaT;
				if (this.vX > this.maxVX)
				{
					this.vX = this.maxVX;
				}
				this.owner.heading = 'right';
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

			if (this.jump && this.owner.state != 'air') {
				this.vY = -this.aJump;
				this.owner.state = 'air';
				this.owner.trigger('jumping'); //This is for audio
			}
			
			this.vY += this.aGravity * deltaT;

			if (this.vY > this.maxVY) {
				this.vY = this.maxVY;
			//	} else if (this.vY < - this.maxVY) {
			//		this.vY = -this.maxVY;
			}
			
			this.owner.x += (this.vX * deltaT);
			this.owner.y += (this.vY * deltaT);
		}
		
		if (!this.hitGround)
		{
			this.owner.state = 'air';
		}
		this.hitGround = false;
		
		if(this.swing){
			this.owner.trigger('logical-state', {state: 'swing' + '-' + this.owner.heading});
			if(this.swingInstance){
				this.owner.parent.addEntity(new platformer.classes.entity(platformer.settings.entities['pickaxe'], {
					properties: {
						x: this.owner.x + ((this.owner.heading === 'right')?1:-1) * 140,
						y: this.owner.y
					}
				}));
				this.owner.trigger('pickaxe');
			}
		} else if (this.owner.state == 'ground') {
			if (this.vX == 0) {
				this.owner.trigger('logical-state', {state: 'standing' + '-' + this.owner.heading});
			} else {
				this.owner.trigger('logical-state', {state: 'walking' + '-' + this.owner.heading});
				this.owner.trigger('walking'); //This is for audio
			}
		} else if (this.owner.state == 'air') {
			this.owner.trigger('logical-state', {state: 'jumping' + '-' + this.owner.heading});
		}
		
		this.left  = false;
		this.right = false;
		this.up    = false;
		this.down  = false;
		this.jump  = false;
		this.swingInstance = false;		
		
	};
	
	proto['teleport'] = function (posObj)
	{
//		this.owner.trigger('collide-off');
		this.teleportDestination = {x: posObj.x, y: posObj.y};
	};
	
	proto['set-velocity'] = function (velocityObj)
	{
		if (typeof velocityObj.vX !== "undefined")
		{
			this.vX = velocityObj.vX;
		}
		if (typeof velocityObj.vY !== "undefined")
		{
			this.vY = velocityObj.vY;
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

	proto['key-swing'] = function (state)
	{
		if(state.pressed)
		{
			if(!this.swing){
				this.swing = true;
				this.swingInstance = true;
			}
		} else {
			this.swing = false;
		}
	};

	proto.resolveTileCollision = function(heading, collisionInfo){
		switch (heading)
		{
		case 'down':
			this.owner.state = 'ground';
			this.hitGround = true;
			this.vY = 0; 
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
			this.owner.state = 'ground';
			this.hitGround = true;
			this.vY = 0; 
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
