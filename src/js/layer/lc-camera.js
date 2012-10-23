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
		this.bBBorderX = 0;
		this.bBBorderY = 0;
		this.bBInnerWidth = this.worldViewportWidth - (2 * this.bBBorderX);
		this.bBInnerHeight = this.worldViewportHeight - (2 * this.bBBorderY);
		
		
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
		case 'static':
		default:
			this.state = 'static';
			this.following = undefined;
			this.followingFunction = undefined;
			break;
		}
		
	};
	
	proto.move = function (newLeft, newTop)
	{
		this.moveLeft(newLeft);
		this.moveTop(newTop);
	};
	
	proto.moveLeft = function (newLeft)
	{
		if (this.worldWidth < this.worldViewportWidth){
			this.worldViewportLeft = (this.worldWidth - this.worldViewportWidth) / 2;
		} else if (this.worldWidth && (newLeft + this.worldViewportWidth > this.worldWidth)) {
			this.worldViewportLeft = this.worldWidth - this.worldViewportWidth;
		} else if (this.worldWidth && (newLeft < 0)) {
			this.worldViewportLeft = 0; 
		} else {
			this.worldViewportLeft = newLeft;
		}
	};
	
	proto.moveTop = function (newTop)
	{
		if (this.worldHeight < this.worldViewportHeight){
			this.worldViewportTop = (this.worldHeight - this.worldViewportHeight) / 2;
		} else if (this.worldHeight && (newTop + this.worldViewportHeight > this.worldHeight)) {
			this.worldViewportTop = this.worldHeight - this.worldViewportHeight;
		} else if (this.worldHeight && (newTop < 0)) {
			this.worldViewportTop = 0; 
		} else {
			this.worldViewportTop = newTop;
		}
	};
	
	
	proto.lockedFollow = function (entity)
	{
		this.move(entity.x - (this.worldViewportWidth / 2), entity.y - (this.worldViewportHeight / 2));
	};
	
	proto.setBoundingArea = function (top, left, width, height)
	{
		this.bBBorderY = (typeof top !== 'undefined') ? top : 500;
		this.bBBorderX = (typeof left !== 'undefined') ? left : 500;
		this.bBInnerWidth = (typeof width !== 'undefined') ? width : this.worldViewportWidth - (2 * this.bBBorderX);
		this.bBInnerHeight = (typeof height !== 'undefined') ? height : this.worldViewportHeight - (2 * this.bBBorderY);
	};
	
	proto.boundingFollow = function (entity)
	{
		var newLeft = undefined;
		var newTop = undefined;
		
		if (entity.x > this.worldViewportLeft + this.bBBorderX + this.bBInnerWidth) 
		{
			newLeft = entity.x -(this.bBBorderX + this.bBInnerWidth);
		} else if (entity.x < this.worldViewportLeft + this.bBBorderX) {
			newLeft = entity.x - this.bBBorderX;
		}
		
		if (entity.y > this.worldViewportTop + this.bBBorderY + this.bBInnerHeight) 
		{
			newTop = entity.y - (this.bBBorderY + this.bBInnerHeight);
		} else if (entity.y < this.worldViewportTop + this.bBBorderY) {
			newTop = entity.y - this.bBBorderY;
		}
		
		if (typeof newLeft !== 'undefined')
		{
			this.moveLeft(newLeft);
		}
		
		if (typeof newTop !== 'undefined')
		{
			this.moveTop(newTop);
		}
	};
	
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
