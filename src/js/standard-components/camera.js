/**
# COMPONENT **camera**
This component maintains the current viewport location and size with regards to both the game world coordinates and the screen coordinates.

## Dependencies:
- **rootElement** property (on entity) - This component requires a DOM element which it uses as the "window" determining the camera's aspect ratio and size.

## Messages

### Listens for:
- **tick, camera** - On a `tick` or `camera` step message, the camera updates its location according to its current state.
  > @param message.deltaT - If necessary, the current camera update function may require the length of the tick to adjust movement rate.
- **follow** - On receiving this message, the camera begins following the requested object.
  > @param message.mode (string) - Required. Can be "locked", "bounding", or "static". "static" suspends following, but the other two settings require that the entity parameter be defined. Also set the bounding area parameters if sending "bounding" as the following method.
  > @param message.entity ([[Entity]]) - The entity that the camera should commence following.
  > @param message.top (number) - The top of a bounding box following an entity.
  > @param message.left (number) - The left of a bounding box following an entity.
  > @param message.width (number) - The width of a bounding box following an entity.
  > @param message.height (number) - The height of a bounding box following an entity.
- **resize, orientationchange** - The camera listens for these events passed along from [[Game]] (who receives them from `window`). It adjusts the camera viewport according to the new size and position of the window.
- **world-loaded** - On receiving this message, the camera updates its world location and size as necessary. An example of this message is triggered by the [[Tiled-Loader]] component.
  > @param message.width (number) - Optional. The width of the loaded world.
  > @param message.height (number) - Optional. The height of the loaded world.
  > @param message.camera ([[Entity]]) - Optional. An entity that the camera should follow in the loaded world.
- **child-entity-added** - If children entities are listening for a `camera-update` message, they are added to an internal list.
  > @param message ([[Entity]]} - Expects an entity as the message object to determine whether to trigger `camera-update` on it.
- **child-entity-removed** - If children are removed from the entity, they are also removed from this component.
  > @param message ([[Entity]]} - Expects an entity as the message object to determine the entity to remove from its list.

### Child Broadcasts:
- **camera-update** - This component fires this message when the position of the camera in the world has changed.
  > @param message.viewportTop (number) - The top of the camera viewport in world coordinates.
  > @param message.viewportLeft (number) - The left of the camera viewport in world coordinates.
  > @param message.viewportWidth (number) - The width of the camera viewport in world coordinates.
  > @param message.viewportHeight (number) - The height of the camera viewport in world coordinates.
  > @param message.scaleX (number) - Number of window pixels that comprise a single world coordinate on the x-axis.
  > @param message.scaleY (number) - Number of window pixels that comprise a single world coordinate on the y-axis.

### Local Broadcasts:
- **camera-update** - This component fires this message when the position of the camera in the world has changed or if the window has been resized.
  > @param message.viewportTop (number) - The top of the camera viewport in world coordinates.
  > @param message.viewportLeft (number) - The left of the camera viewport in world coordinates.
  > @param message.viewportWidth (number) - The width of the camera viewport in world coordinates.
  > @param message.viewportHeight (number) - The height of the camera viewport in world coordinates.
  > @param message.scaleX (number) - Number of window pixels that comprise a single world coordinate on the x-axis.
  > @param message.scaleY (number) - Number of window pixels that comprise a single world coordinate on the y-axis.

## JSON Definition:
    {
      "type": "camera",
      
      "top": 100,
      // Optional number specifying top of viewport in world coordinates
      
      "left": 100,
      // Optional number specifying left of viewport in world coordinates
      
      "width": 100,
      // Optional number specifying width of viewport in world coordinates
      
      "height": 100,
      // Optional number specifying height of viewport in world coordinates
      
      "stretch": true,
      // Optional boolean value that determines whether the camera should stretch the world viewport when window is resized. Defaults to false which maintains the proper aspect ratio.
      
      "scaleWidth": 480
      // Optional. Sets the size in window coordinates at which the world zoom should snap to a larger multiple of pixel size (1,2, 3, etc). This is useful for maintaining a specific game pixel viewport width on pixel art games so pixels use multiples rather than smooth scaling. Default is 0 which causes smooth scaling of the game world in a resizing viewport.
    }
*/
platformer.components['camera'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// on resize should the view be stretched or should the world's initial aspect ratio be maintained?
		this.stretch = definition.stretch || false;
		
		// Messages that this component listens for
		this.listeners = [];
		
		this.addListeners(['tick', 'camera', 'follow', 'resize', 'orientationchange', 'world-loaded', 'child-entity-added', 'child-entity-removed']);
		
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
		
		this.message = { //defined here so it can be reused
			viewportWidth:  0,
			viewportHeight: 0,
			viewportLeft:   0,
			viewportTop:    0,
			scaleX: 0,
			scaleY: 0
		};

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
	
	proto['child-entity-removed'] = function(entity){
		var x = 0;

		for (x in this.entities) {
			if(this.entities[x] === entity){
				this.entities.splice(x, 1);
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
	
	proto['tick'] = proto['camera'] = function(resp){
		var deltaT = resp.deltaT,
		broadcastUpdate = false;
		
		switch (this.state)
		{
		case 'following':
			broadcastUpdate = this.followingFunction(this.following);
			break;
		case 'roaming': //TODO: remove or change this test code, since it currently just goes left to right - DDD
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
			broadcastUpdate = true;
			break;
		case 'static':
		default:
			break;
		}
		
		if(broadcastUpdate || this.windowResized){
			this.message.viewportLeft   = this.world.viewportLeft;
			this.message.viewportTop    = this.world.viewportTop;
			this.message.viewportWidth  = this.world.viewportWidth;
			this.message.viewportHeight = this.world.viewportHeight;
			this.message.scaleX         = this.windowPerWorldUnitWidth;
			this.message.scaleY         = this.windowPerWorldUnitHeight;

			this.windowResized = false;
			this.owner.trigger('camera-update', this.message);

			if(broadcastUpdate){
				for (var x = this.entities.length - 1; x > -1; x--)
				{
					if(!this.entities[x].trigger('camera-update', this.message)){
						this.entities.splice(x, 1);
					}
				}
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
		
		this.windowResized = true;
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
	
	proto.move = function (newLeft, newTop){
		var moved = this.moveLeft(newLeft);
		moved = this.moveTop(newTop) || moved;
		return moved;
	};
	
	proto.moveLeft = function (newLeft)	{
		if(this.world.viewportLeft !== newLeft){
			if (this.worldWidth < this.world.viewportWidth){
				this.world.viewportLeft = (this.worldWidth - this.world.viewportWidth) / 2;
			} else if (this.worldWidth && (newLeft + this.world.viewportWidth > this.worldWidth)) {
				this.world.viewportLeft = this.worldWidth - this.world.viewportWidth;
			} else if (this.worldWidth && (newLeft < 0)) {
				this.world.viewportLeft = 0; 
			} else {
				this.world.viewportLeft = newLeft;
			}
			return true;
		}
		return false;
	};
	
	proto.moveTop = function (newTop) {
		if(this.world.viewportTop !== newTop){
			if (this.worldHeight < this.world.viewportHeight){
				this.world.viewportTop = (this.worldHeight - this.world.viewportHeight) / 2;
			} else if (this.worldHeight && (newTop + this.world.viewportHeight > this.worldHeight)) {
				this.world.viewportTop = this.worldHeight - this.world.viewportHeight;
			} else if (this.worldHeight && (newTop < 0)) {
				this.world.viewportTop = 0; 
			} else {
				this.world.viewportTop = newTop;
			}
			return true;
		}
		return false;
	};
	
	
	proto.lockedFollow = function (entity)
	{
		return this.move(entity.x - (this.world.viewportWidth / 2), entity.y - (this.world.viewportHeight / 2));
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
			newLeft = this.moveLeft(newLeft);
		}
		
		if (typeof newTop !== 'undefined')
		{
			newTop = this.moveTop(newTop);
		}
		
		return newLeft || newTop;
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
