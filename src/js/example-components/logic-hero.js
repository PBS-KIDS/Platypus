platformer.components['logic-hero'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		var self = this;
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['handle-logic', 'set-velocity', 'teleport', 'portal-waiting', 'key-left','key-right','key-up','key-down','key-jump','key-swing']);
		
		this.state = {
			air: false,
			ground: true,
			left: false,
			moving: false,
			right: true,
			swing: false,
			swingHit: false
		};
		
		this.left = false;
		this.right = false;
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
	
	proto['handle-logic'] = function(resp){
		var deltaT = resp.deltaT;
		
		if (this.teleportDestination)
		{
			this.owner.trigger('relocate-entity', this.teleportDestination);
			this.teleportDestination = undefined;
		} else {
			if(this.left) {
				this.vX -= this.aX * deltaT;
				if (this.vX < -this.maxVX) {
					this.vX = -this.maxVX;
				}
				this.state.left  = true;
				this.state.right = false;
			} else if (this.right) {
				this.vX += this.aX * deltaT;
				if (this.vX > this.maxVX)
				{
					this.vX = this.maxVX;
				}
				this.state.left  = false;
				this.state.right = true;
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

			if (this.jump && this.state.ground) {
				this.vY = -this.aJump;
				this.state.air = true;
				this.state.ground = false;
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
			this.state.air = true;
			this.state.ground = false;
		}
		this.hitGround = false;
		
		this.state.swingHit = false;
		if(this.swing){
			this.state.swing = true;
//			this.state.debug = true;
			if(this.swingInstance){
				this.state.swingHit = true;
				this.owner.parent.addEntity(new platformer.classes.entity(platformer.settings.entities['pickaxe'], {
					properties: {
						x: this.owner.x + (this.state.right?1:-1) * 140,
						y: this.owner.y
					}
				}));
			}
		} else {
			this.state.swing = false;
//			this.state.debug = false;
			if (this.state.ground) {
				if (this.vX == 0) {
					this.state.moving = false;
				} else {
					this.state.moving = true;
//					this.owner.trigger('walking'); //This is for audio
				}
			}
		}

		this.owner.trigger('logical-state', this.state);
		
		this.swingInstance = false;		
		
	};
	
	proto['teleport'] = function (posObj)
	{
//		this.owner.trigger('collide-off');
		this.teleportDestination = {x: posObj.x, y: posObj.y};
	};
	
	proto['portal-waiting'] = function (portal)
	{
		portal.trigger('activate');
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
		this.left = state.pressed;
	};
	
	proto['key-right'] = function (state)
	{
		this.right = state.pressed;
	};
	
	proto['key-jump'] = function (state)
	{
		this.jump = state.pressed;
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
			this.state.ground = true;
			this.state.air = false;
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
			this.state.ground = true;
			this.state.air = false;
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
