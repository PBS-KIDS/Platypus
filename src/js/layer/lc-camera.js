platformer.components['lc-camera'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// on resize should the view be stretched or should the world's initial aspect ratio be maintained?
		this.stretch = definition.stretch || false;
		
		// Messages that this component listens for
		this.listeners = [];
		
		this.tickMessages = ['camera'];
		this.addListeners(['resize', 'orientationchange', 'camera', 'load', 'world-loaded', 'child-entity-added']);  
		
		//The dimensions of the camera in the window
		this.window = {
			viewportTop: this.owner.rootElement.innerTop,
			viewportLeft: this.owner.rootElement.innerLeft,
			viewportWidth: this.owner.rootElement.offsetWidth,
			viewportHeight: this.owner.rootElement.offsetHeight
		};
		
		//The dimensions of the camera in the game world
		this.world = {
			viewportWidth:       definition.width       || 0,
			viewportHeight:      definition.height      || 0,
			viewportLeft:        definition.left        || 0,
			viewportTop:         definition.top         || 0
		};

		this.aspectRatio              = definition.aspectRatio || 0;
		if(this.world.viewportWidth && this.world.viewportHeight){
			this.aspectRatio = this.aspectRatio || (this.world.viewportHeight      / this.world.viewportWidth); 
		} else {
			this.aspectRatio = this.aspectRatio || (this.window.viewportHeight / this.window.viewportWidth);
			if (this.world.viewportWidth || this.world.viewportHeight){
				this.world.viewportWidth       = this.world.viewportWidth       || (this.world.viewportHeight      / this.aspectRatio); 
				this.world.viewportHeight      = this.world.viewportHeight      || (this.aspectRatio / this.world.viewportWidth); 
			} else {
				this.world.viewportWidth       = this.window.viewportWidth;
				this.world.viewportHeight      = this.aspectRatio * this.world.viewportWidth;
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
		this.bBInnerWidth = this.world.viewportWidth - (2 * this.bBBorderX);
		this.bBInnerHeight = this.world.viewportHeight - (2 * this.bBBorderY);
		
		
		this.direction = true;  
	};
	var proto = component.prototype; 

	proto['load'] = function(){
		
	};

	proto['child-entity-added'] = function(entity){
		var messageIds = entity.getMessageIds(); 
		
		for (var x = 0; x < messageIds.length; x++)
		{
			if (messageIds[x] == 'camera-update')
			{
				this.entities.push(entity);
				break;
			}
		}
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
				this.move(this.world.viewportLeft + speed, this.world.viewportTop);
				if (this.worldWidth && (this.world.viewportLeft == this.worldWidth - this.world.viewportWidth)) {
					this.direction = !this.direction;
				}
			} else {
				this.move(this.world.viewportLeft - speed, this.world.viewportTop);
				if (this.worldWidth && (this.world.viewportLeft == 0)) {
					this.direction = !this.direction;
				}
			}
			break;
		case 'static':
		default:
			break;
		}
		
		this.owner.trigger('camera-update', {
			x:      this.world.viewportLeft   * this.windowPerWorldUnitWidth,
			y:      this.world.viewportTop    * this.windowPerWorldUnitHeight,
			scaleX: this.windowPerWorldUnitWidth,
			scaleY: this.windowPerWorldUnitHeight,
		});
		
		for (var x = this.entities.length - 1; x > -1; x--)
		{
			if(!this.entities[x].trigger('camera-update', this.world))
			{
				this.entities.splice(x, 1);
			}
		}
	};
	
	proto['resize'] = proto['orientationchange'] = function ()
	{
		//The dimensions of the camera in the window
		this.window.viewportTop = this.owner.rootElement.innerTop;
		this.window.viewportLeft = this.owner.rootElement.innerLeft;
		this.window.viewportWidth = this.owner.rootElement.offsetWidth;
		this.window.viewportHeight = this.owner.rootElement.offsetHeight;

		if(this.scaleWidth){
			this.world.viewportWidth = this.window.viewportWidth / Math.ceil(this.window.viewportWidth / this.scaleWidth);
		}
		
		if(!this.stretch || this.scaleWidth){
			this.world.viewportHeight = this.window.viewportHeight * this.world.viewportWidth / this.window.viewportWidth;
		}
		
		this.worldPerWindowUnitWidth  = this.world.viewportWidth / this.window.viewportWidth;
		this.worldPerWindowUnitHeight = this.world.viewportHeight / this.window.viewportHeight;
		this.windowPerWorldUnitWidth  = this.window.viewportWidth / this.world.viewportWidth;
		this.windowPerWorldUnitHeight = this.window.viewportHeight/ this.world.viewportHeight;
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
		if (this.worldWidth < this.world.viewportWidth){
			this.world.viewportLeft = (this.worldWidth - this.world.viewportWidth) / 2;
		} else if (this.worldWidth && (newLeft + this.world.viewportWidth > this.worldWidth)) {
			this.world.viewportLeft = this.worldWidth - this.world.viewportWidth;
		} else if (this.worldWidth && (newLeft < 0)) {
			this.world.viewportLeft = 0; 
		} else {
			this.world.viewportLeft = newLeft;
		}
	};
	
	proto.moveTop = function (newTop)
	{
		if (this.worldHeight < this.world.viewportHeight){
			this.world.viewportTop = (this.worldHeight - this.world.viewportHeight) / 2;
		} else if (this.worldHeight && (newTop + this.world.viewportHeight > this.worldHeight)) {
			this.world.viewportTop = this.worldHeight - this.world.viewportHeight;
		} else if (this.worldHeight && (newTop < 0)) {
			this.world.viewportTop = 0; 
		} else {
			this.world.viewportTop = newTop;
		}
	};
	
	
	proto.lockedFollow = function (entity)
	{
		this.move(entity.x - (this.world.viewportWidth / 2), entity.y - (this.world.viewportHeight / 2));
	};
	
	proto.setBoundingArea = function (top, left, width, height)
	{
		this.bBBorderY = (typeof top !== 'undefined') ? top : 500;
		this.bBBorderX = (typeof left !== 'undefined') ? left : 500;
		this.bBInnerWidth = (typeof width !== 'undefined') ? width : this.world.viewportWidth - (2 * this.bBBorderX);
		this.bBInnerHeight = (typeof height !== 'undefined') ? height : this.world.viewportHeight - (2 * this.bBBorderY);
	};
	
	proto.boundingFollow = function (entity)
	{
		var newLeft = undefined;
		var newTop = undefined;
		
		if (entity.x > this.world.viewportLeft + this.bBBorderX + this.bBInnerWidth) 
		{
			newLeft = entity.x -(this.bBBorderX + this.bBInnerWidth);
		} else if (entity.x < this.world.viewportLeft + this.bBBorderX) {
			newLeft = entity.x - this.bBBorderX;
		}
		
		if (entity.y > this.world.viewportTop + this.bBBorderY + this.bBInnerHeight) 
		{
			newTop = entity.y - (this.bBBorderY + this.bBInnerHeight);
		} else if (entity.y < this.world.viewportTop + this.bBBorderY) {
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
		wCoords[0] = Math.round((sCoords[0] - this.window.viewportLeft) * this.worldPerWindowUnitWidth);
		wCoords[1] = Math.round((sCoords[1] - this.window.viewportTop)  * this.worldPerWindowUnitHeight);
		return wCoords; 
	};
	
	proto.worldToWindow = function (wCoords)
	{
		var sCoords = [];
		sCoords[0] = Math.round((wCoords[0] * this.windowPerWorldUnitWidth) + this.window.viewportLeft);
		sCoords[1] = Math.round((wCoords[1] * this.windowPerWorldUnitHeight) + this.window.viewportTop);
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
