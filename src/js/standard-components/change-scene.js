/**
# COMPONENT **change-scene**
This component allows the entity to initiate a change from the current scene to another scene.

## Messages

### Listens for:
- **new-scene** - On receiving this message, a new scene is loaded according to provided parameters or previously determined component settings.
  > @param message.scene (string) - This is a label corresponding with a predefined scene.
  > @param message.transition (string) - This can be "instant" or "fade-to-black". Defaults to an instant transition.

## JSON Definition:
    {
      "type": "change-scene",
      
      "scene": "scene-menu",
      // Optional (but must be provided by a "change-scene" parameter if not defined here). This causes the "new-scene" trigger to load this scene.
      
      "transition": "fade-to-black",
      // Optional. This can be "instant" or "fade-to-black". Defaults to an "instant" transition.
    }
*/
platformer.components['change-scene'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.scene = definition.scene;
		this.transition = definition.transition || 'instant';
		
		this.addListeners(['new-scene']);
	};
	var proto = component.prototype;
	
	proto['new-scene'] = function(response){
		var resp   = response || this,
		scene      = resp.scene || this.scene,
		transition = resp.transition || this.transition;

		platformer.game.loadScene(scene, transition);
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
