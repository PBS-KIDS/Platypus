platformer.components['render-button'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['layer:render-load', 'layer:render', 'controller:input']);
		this.stage = undefined;
		this.upBitmap = new createjs.Bitmap(platformer.assets[definition.upImg]);
		this.downBitmap = new createjs.Bitmap(platformer.assets[definition.downImg]);
		//this.shape = new createjs.Shape();;
	};
	var proto = component.prototype;
	
	proto['controller:input-handler'] = function (settings){
		
	};
	
	proto['layer:render-load'] = function (obj) {
		this.stage = obj.stage;
		this.stage.addChild(this.upBitmap);
		this.stage.addChild(this.downBitmap);
		
		this.upBitmap.x = this.owner.x;
		this.downBitmap.x = this.owner.x;
		this.upBitmap.y = this.owner.y;
		this.downBitmap.y = this.owner.y;
		
		
		/*
		var g = this.shape.graphics;
		if(this.owner.state)
		{
			g.beginFill('#333');
		} else {
			g.beginFill('#888');
		}
		g.rect(this.owner.x, this.owner.y, this.owner.width, this.owner.height);
		g.endFill();
		
		this.stage.addChild(this.shape);
		*/
	};
	
	proto['layer:render'] = function () {
		/*
		this.shape.x = this.owner.x;
		*/
		this.upBitmap.x = this.owner.x;
		this.downBitmap.x = this.owner.x;
		if(this.owner.state)
		{
			this.downBitmap.alpha = 0;
		} else {
			this.downBitmap.alpha = 1;
		}
		
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.stage.removeChild(this.shape);
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
