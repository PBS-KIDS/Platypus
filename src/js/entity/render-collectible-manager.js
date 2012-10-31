platformer.components['render-collectible-manager'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['layer:render', 'layer:render-load', 'logic-gem-added', 'logic-gem-collected']);
		
		
		this.displayGemCollected = 0;
		this.actualGemCollected = 0;
		this.countChanged = true;
		this.gemCollectedText = undefined;
		this.gemCountText = undefined;
		
		this.gemTotal = 0;
		this.gemTotalText = undefined;
		this.totalChanged = true;
		
		this.counterBG = undefined;
		this.stage = undefined;
		
		var spriteSheetSpec = {
				images: definition.spriteSheet.images.slice(),
				frames: definition.spriteSheet.frames,
				animations: definition.spriteSheet.animations
			};
		for (var x = 0; x < spriteSheetSpec.images.length; x++)
		{
			spriteSheetSpec.images[x] = platformer.assets[spriteSheetSpec.images[x]];
		}
		var spriteSheet = new createjs.SpriteSheet(spriteSheetSpec);
		this.counterBG = new createjs.BitmapAnimation(spriteSheet);
		this.currentAnimation = 'default';
		this.counterBG.scaleX = this.owner.scaleX || 1;
		this.counterBG.scaleY = this.owner.scaleY || 1;
		if(this.currentAnimation){
			this.counterBG.gotoAndPlay(this.currentAnimation);
		}
	};
	var proto = component.prototype;
	
	proto['logic-gem-added'] = function(data){
		this.gemTotal = data.total;
		this.totalChanged = true;
	};
	
	proto['logic-gem-collected'] = function(data){
		this.actualGemCollected = data.count;
		this.countChanged = true;
	};
	
	proto['layer:render-load'] = function(resp){
		this.stage = resp.stage;
		
		this.gemCountText = new createjs.Text('0');
		this.gemCountText.x = 20;
		this.gemCountText.y = 20;
		this.gemCountText.textAlign = "center";
		this.gemCountText.textBaseline = "middle";
		
		this.gemTotalText = new createjs.Text(this.gemTotal.toString);
		this.gemTotalText.x = 30;
		this.gemTotalText.y = 20;
		this.gemTotalText.textAlign = "center";
		this.gemTotalText.textBaseline = "middle";
		
		this.stage.addChild(this.counterBG);
		this.stage.addChild(this.gemCountText);
		this.stage.addChild(this.gemTotalText);
	};
	
	proto['layer:render'] = function(resp){
		if (this.countChanged)
		{
			//This is where we'd tween;
			this.countChanged = false;
			this.displayGemCollected = this.actualGemCollected;
			this.gemCountText.text = this.displayGemCollected.toString();
		}
		
		if (this.totalChanged)
		{
			this.totalChanged = false;
			this.gemTotalText.text = this.gemTotal.toString();
		}
		
		this.counterBG.x = 1000;
		this.counterBG.y = 1000;
		
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
