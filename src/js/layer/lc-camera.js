platformer.components['lc-camera'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// on resize should the view be stretched or should the world's initial aspect ratio be maintained?
		this.stretch = definition.stretch || false;
		
		// Messages that this component listens for
		this.listeners = [];
		
		this.tickMessages = ['camera'];
		this.addListeners(['resize', 'orientationchange', 'camera', 'load', 'world-loaded']);  
		
		//The dimensions of the camera in the window
		this.windowViewportTop = this.owner.rootElement.innerTop;
		this.windowViewportLeft = this.owner.rootElement.innerLeft;
		this.windowViewportWidth = this.owner.rootElement.offsetWidth;
		this.windowViewportHeight = this.owner.rootElement.offsetHeight;
		
		//The dimensions of the camera in the game world
		this.worldViewportWidth       = definition.width       || 0; 
		this.worldViewportHeight      = definition.height      || 0;
		this.worldViewportLeft        = definition.left        || 0;
		this.worldViewportTop         = definition.top         || 0;

		this.aspectRatio              = definition.aspectRatio || 0;
		if(this.worldViewportWidth && this.worldViewportHeight){
			this.aspectRatio = this.aspectRatio || (this.worldViewportHeight      / this.worldViewportWidth); 
		} else {
			this.aspectRatio = this.aspectRatio || (this.windowViewportHeight / this.windowViewportWidth);
			if (this.worldViewportWidth || this.worldViewportHeight){
				this.worldViewportWidth       = this.worldViewportWidth       || (this.worldViewportHeight      / this.aspectRatio); 
				this.worldViewportHeight      = this.worldViewportHeight      || (this.aspectRatio / this.worldViewportWidth); 
			} else {
				this.worldViewportWidth       = this.windowViewportWidth;
				this.worldViewportHeight      = this.aspectRatio * this.worldViewportWidth;
			}
		}
		
		// on resize should the game snap to certain sizes or should it be fluid?
		// 0 == fluid scaling
		// set the windowWidth multiple that triggers zooming in
		this.scaleWidth = definition.scaleWidth || 0;
		this.resize();
		
		// The dimensions of the entire world
		this.worldWidth  = 0; //definition.worldWidth;
		this.worldHeight = 0; //definition.worldHeight;
		
		this.following = undefined;
		this.state = 'static';//'roaming';
		
		//FOLLOW MODE VARIABLES
		
		//--Bounding
		this.boundingBoxLeft = 100;
		this.boundingBoxTop = 100;
		this.boundingBoxWidth = this.worldViewportWidth - (2 * this.boundingBoxLeft);
		this.boundingBoxHeight = this.worldViewportHeight - (2 * this.boundingBoxTop);
		
		
		this.direction = true;  
	};
	var proto = component.prototype; 

	proto['load'] = function(){
		
	};

	proto['world-loaded'] = function(values){
		this.worldWidth   = this.owner.worldWidth  = values.width;
		this.worldHeight  = this.owner.worldHeight = values.height;
		if(values.camera){
			this.follow(values.camera);
		}
	};
	
	proto['camera'] = function(deltaT){
		
		switch (this.state)
		{
		case 'following':
			this.followingFunction(this.following);
			break;
		case 'roaming':
			var speed = .3 * deltaT;
			if (this.direction)
			{
				this.move(this.worldViewportLeft + speed, this.worldViewportTop);
				if (this.worldWidth && (this.worldViewportLeft == this.worldWidth - this.worldViewportWidth)) {
					this.direction = !this.direction;
				}
			} else {
				this.move(this.worldViewportLeft - speed, this.worldViewportTop);
				if (this.worldWidth && (this.worldViewportLeft == 0)) {
					this.direction = !this.direction;
				}
			}
			break;
		case 'static':
		default:
			break;
		}
		this.owner.trigger('camera-update', {x: this.worldViewportLeft * this.windowPerWorldUnitWidth, y: this.worldViewportTop * this.windowPerWorldUnitHeight, scaleX: this.windowPerWorldUnitWidth, scaleY: this.windowPerWorldUnitHeight});
	};
	
	proto['resize'] = proto['orientationchange'] = function ()
	{
		//The dimensions of the camera in the window
		this.windowViewportTop = this.owner.rootElement.innerTop;
		this.windowViewportLeft = this.owner.rootElement.innerLeft;
		this.windowViewportWidth = this.owner.rootElement.offsetWidth;
		this.windowViewportHeight = this.owner.rootElement.offsetHeight;

		if(this.scaleWidth){
			this.worldViewportWidth = this.windowViewportWidth / Math.ceil(this.windowViewportWidth / this.scaleWidth);
		}
		
		if(!this.stretch || this.scaleWidth){
			this.worldViewportHeight = this.windowViewportHeight * this.worldViewportWidth / this.windowViewportWidth;
		}
		
		this.worldPerWindowUnitWidth  = this.worldViewportWidth / this.windowViewportWidth;
		this.worldPerWindowUnitHeight = this.worldViewportHeight / this.windowViewportHeight;
		this.windowPerWorldUnitWidth  = this.windowViewportWidth / this.worldViewportWidth;
		this.windowPerWorldUnitHeight = this.windowViewportHeight/ this.worldViewportHeight;
	};
	
	proto['follow'] = function (def)
	{
		switch (def.mode)
		{
		case 'locked':
			this.state = 'following';
			this.following = def.entity;
			this.followingFunction = this.lockedFollow;
			break;
		case 'bounding':
			this.state = 'following';
			this.following = def.entity;
			this.setBoundingArea(def.top, def.left, def.width, def.height);
			this.followingFunction = this.boundingFollow;
			break;
		case 'custom':
			this.state = 'following';
			this.following = def.entity;
			this.followingFunction = def.followingFunction;
			break;
		case 'static':
		default:
			this.state = 'static';
			this.following = undefined;
			this.followingFunction = undefined;
			break;
		}
		
	};
	
	proto.move = function (newleft, newtop)
	{
		if (this.worldWidth < this.worldViewportWidth){
			this.worldViewportLeft = (this.worldWidth - this.worldViewportWidth) / 2;
		} else if (this.worldWidth && (newleft + this.worldViewportWidth > this.worldWidth)) {
			this.worldViewportLeft = this.worldWidth - this.worldViewportWidth;
		} else if (this.worldWidth && (newleft < 0)) {
			this.worldViewportLeft = 0; 
		} else {
			this.worldViewportLeft = newleft;
		}
		
		if (this.worldHeight < this.worldViewportHeight){
			this.worldViewportTop = (this.worldHeight - this.worldViewportHeight) / 2;
		} else if (this.worldHeight && (newtop + this.worldViewportHeight > this.worldHeight)) {
			this.worldViewportTop = this.worldHeight - this.worldViewportHeight;
		} else if (this.worldHeight && (newtop < 0)) {
			this.worldViewportTop = 0; 
		} else {
			this.worldViewportTop = newtop;
		}
		
	};
	
	proto.lockedFollow = function (entity)
	{
		this.move(entity.x - (this.worldViewportWidth / 2), entity.y - (this.worldViewportHeight / 2));
	};
	
	proto.setBoundingArea = function (top, left, width, height)
	{
		this.boundingBoxTop = top || 100;
		this.boundingBoxLeft = left || 100;
		this.boundingBoxWidth = width || this.worldViewportWidth - (2 * this.boundingBoxLeft);
		this.boundingBoxHeight = height || this.worldViewportHeight - (2 * this.boundingBoxTop);
	};
	
	proto.boundingFollow = function (entity)
	{
		var newLeft = 0;
		var newTop = 0;
		
		if (entity.x > this.x + this.boundingBoxLeft + this.BoundingBoxWidth) 
		{
			newLeft = entity.x -(this.boundingBoxLeft + this.BoundingBoxWidth);
		} else if (entity.x < this.x + this.boundingBoxLeft) {
			newLeft = entity.x - this.boundingBoxLeft;
		}
		
		if (entity.y > this.y + this.boundingBoxTop + this.BoundingBoxHeight) 
		{
			newTop = entity.y - this.boundingBoxTop + this.BoundingBoxHeight;
		} else if (entity.y < this.y + this.boundingBoxTop) {
			newTop = entity.y - this.boundingBoxTop;
		}
		
		this.move(newLeft, newTop);
	};
	
	/*
	proto.transition = function (coords, type, def)
	{
		this.state = 'transitioning';
		switch (type)
		{
		case 'linear':
			if (def.entity)
			{
				this.transitionEntity = def.entity;
			} else {
				this.transitionX = def.x;
				this.transitionY = def.y;
			}
			this.transitionFunction = this.linearTransition;
			break;
		case 'custom':
			this.transitionFunction = def.transitionFunction;
			break;
		case 'instant':
		default:
			this.move(coords.x - (this.worldViewportWidth / 2), coords.y - (this.worldViewportHeight / 2));
			break;
		
		
		}
		
	};
	
	proto.linearTransition = function ()
	{
		
		
	};
	*/
	
	proto.windowToWorld = function (sCoords)
	{
		var wCoords = [];
		wCoords[0] = Math.round((sCoords[0] - this.windowViewportLeft) * this.worldPerWindowUnitWidth);
		wCoords[1] = Math.round((sCoords[1] - this.windowViewportTop)  * this.worldPerWindowUnitHeight);
		return wCoords; 
	};
	
	proto.worldToWindow = function (wCoords)
	{
		var sCoords = [];
		sCoords[0] = Math.round((wCoords[0] * this.windowPerWorldUnitWidth) + this.windowViewportLeft);
		sCoords[1] = Math.round((wCoords[1] * this.windowPerWorldUnitHeight) + this.windowViewportTop);
		return sCoords;
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.entities.length = 0;
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
