/**
# COMPONENT **handler-render-createjs**
A component that handles updating rendering for components that are rendering via createjs. Each tick it calls all the entities that accept 'handle-render' messages.

## Dependencies
- **Needs a 'tick' or 'render' call** - This component doesn't need a specific component, but it does require a 'tick' or 'render' call to function. It's usually used as a component of an action-layer.
- [createjs.EaselJS][link1] - This component requires the EaselJS library to be included for canvas functionality.

## Messages

### Listens for:
- **child-entity-added** - Called when a new entity has been added to the parent and should be considered for addition to the handler. If the entity has a 'handle-render' or 'handle-render-load' message id it's added to the list of entities. Entities are sent a reference to the stage that we're rendering to, so they can add their display objects to it. 
  > @param entity (Object) - The entity that is being considered for addition to the handler.
- **tick, render** - Sends a 'handle-render' message to all the entities the component is handling. If an entity does not handle the message, it's removed it from the entity list. This function also sorts the display objects in the stage according to their z value. We detect when new objects are added by keeping track of the first element. If it changes the list gets resorted. Finally the whole stage is updated by CreateJS.
  > @param resp (object) - An object containing deltaT which is the time passed since the last tick. 
- **camera-update** - Called when the camera moves in the world, or if the window is resized. This function sets the canvas size and the stage transform.
  > @param cameraInfo (object) - An object containing the camera information. 


### Child Broadcasts:
- **handle-render** - Sent to entities to run their render for the tick.
  > @param object (object) - An object containing a deltaT variable that is the time that's passed since the last tick.
- **handle-render-load** - Sent to entities when they are added to the handler. Sends along the stage object so the entity can add its display objects. It also sends the parent DOM element of the canvas.
  > @param object.stage ([createjs.Stage][link2]) - The createjs stage object.
  > @param object.parentElement (object) - The DOM parent element of the canvas. 

## JSON Definition
    {
      "type": "handler-render-createjs"
    }
    
[link1]: http://www.createjs.com/Docs/EaselJS/module_EaselJS.html
[link2]: http://createjs.com/Docs/EaselJS/Stage.html
*/

platformer.components['handler-render-createjs'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['tick', 'child-entity-added', 'render', 'camera-update']);
		
		this.canvas = this.owner.canvas = document.createElement('canvas');
		this.owner.rootElement.appendChild(this.canvas);
		this.owner.element = this.canvas; 
		
		this.stage = new createjs.Stage(this.canvas);
		this.stage.snapToPixelEnabled = true;
		
		this.camera = {
			left: 0,
			top: 0,
			width: 0,
			height: 0,
			buffer: definition.buffer || 0
		};
		this.firstChild = undefined;
		this.timeElapsed = {
			name: 'Render',
			time: 0
		};
	},
	proto = component.prototype; 

	proto['child-entity-added'] = function(entity){
		var self = this,
		messageIds = entity.getMessageIds(); 
		
		for (var x = 0; x < messageIds.length; x++)
		{
			if ((messageIds[x] == 'handle-render') || (messageIds[x] == 'handle-render-load')){
				this.entities.push(entity);
				entity.trigger('handle-render-load', {
					stage: self.stage,
					parentElement: self.owner.rootElement
				});
				break;
			}
		}
	};
	
	proto['tick'] = proto['render'] = function(resp){
		var child = undefined,
		time    = new Date().getTime();
		
		for (var x = this.entities.length - 1; x > -1; x--){
			if(!this.entities[x].trigger('handle-render', resp))
			{
				this.entities.splice(x, 1);
			}
		}
		for (var x = this.stage.children.length - 1; x > -1; x--){
			child = this.stage.children[x];
			if(child.name !== 'entity-managed'){
				if((child.x >= this.camera.x - this.camera.buffer) && (child.x <= this.camera.x + this.camera.width + this.camera.buffer) && (child.y >= this.camera.y - this.camera.buffer) && (child.y <= this.camera.y + this.camera.height + this.camera.buffer)){
					if(!child.visible) child.visible = true;
				} else {
					if(child.visible) child.visible = false;
				}
			}
		}
		
		if (this.stage.getChildAt(0) !== this.firstChild)
		{
			this.stage.sortChildren(function(a, b) {
				return a.z - b.z;
			});
			this.firstChild = this.stage.getChildAt(0);
		}

		this.timeElapsed.name = 'Render-Prep';
		this.timeElapsed.time = new Date().getTime() - time;
		platformer.game.currentScene.trigger('time-elapsed', this.timeElapsed);
		time += this.timeElapsed.time;

		this.stage.update();
		this.timeElapsed.name = 'Render';
		this.timeElapsed.time = new Date().getTime() - time;
		platformer.game.currentScene.trigger('time-elapsed', this.timeElapsed);
	};
	
	proto['camera-update'] = function(cameraInfo){
		this.camera.x = cameraInfo.viewportLeft;
		this.camera.y = cameraInfo.viewportTop;
		this.camera.width = cameraInfo.viewportWidth;
		this.camera.height = cameraInfo.viewportHeight;
		if(!this.camera.buffer){
			this.camera.buffer = this.camera.width / 12; // sets a default buffer based on the size of the world units if the buffer was not explicitly set.
		}
		
		this.canvas.width  = this.canvas.offsetWidth;
		this.canvas.height = this.canvas.offsetHeight;
		this.stage.setTransform(-cameraInfo.viewportLeft * cameraInfo.scaleX, -cameraInfo.viewportTop * cameraInfo.scaleY, cameraInfo.scaleX, cameraInfo.scaleY);
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.stage = undefined;
		this.owner.rootElement.removeChild(this.canvas);
		this.owner.element = null;
		this.canvas = undefined;
		this.entities.length = 0;
		this.owner = undefined;
	};
	
	/*********************************************************************************************************
	 * The stuff below here can be left alone. 
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
