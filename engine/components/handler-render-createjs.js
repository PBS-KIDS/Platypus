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
(function(){

	return platformer.createComponentClass({

		id: "handler-render-createjs",
		
		constructor: function(definition){
			this.entities = [];
			
			this.canvas = this.owner.canvas = document.createElement('canvas');
			if(this.owner.element){
				this.owner.element.appendChild(this.canvas);
			} else {
				this.owner.rootElement.appendChild(this.canvas);
				this.owner.element = this.canvas; 
			}
			
			this.stage = new createjs.Stage(this.canvas);
			
			if(definition.autoClear !== true){
				this.stage.autoClear = false; //since most tile maps are re-painted every time, the canvas does not require clearing.
			}
			
			this.camera = {
				left: 0,
				top: 0,
				width: 0,
				height: 0,
				buffer: definition.buffer || 0
			};
			this.lastChild = undefined;
			
			this.timeElapsed = {
				name: 'Render',
				time: 0
			};
			
			this.renderMessage = {
				deltaT: 0,
				stage:  this.stage
			};
		},
		
		events:{
			"child-entity-added": function(entity){
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
			},
			"pause-render": function(resp){
				if(resp && resp.time){
					this.paused = resp.time;
				} else {
					this.paused = -1;
				}
			},
			"unpause-render": function(){
				this.paused = 0;
			},
			"tick": function(resp){
				var lastIndex = 0,
				child   = undefined,
				time    = new Date().getTime(),
				message = this.renderMessage;
				
				message.deltaT = resp.deltaT;

				if(this.paused > 0){
					this.paused -= resp.deltaT;
					if(this.paused < 0){
						this.paused = 0;
					}
				}

				for (var x = this.entities.length - 1; x > -1; x--){
					if(!this.entities[x].trigger('handle-render', message)) {
						this.entities.splice(x, 1);
					}
				}
				for (var x = this.stage.children.length - 1; x > -1; x--){
					child = this.stage.children[x];
					if (child.hidden) {
						if(child.visible) child.visible = false;
					} else if(child.name !== 'entity-managed'){
						if((child.x >= this.camera.x - this.camera.buffer) && (child.x <= this.camera.x + this.camera.width + this.camera.buffer) && (child.y >= this.camera.y - this.camera.buffer) && (child.y <= this.camera.y + this.camera.height + this.camera.buffer)){
							if(!child.visible) child.visible = true;
						} else {
							if(child.visible) child.visible = false;
						}
					}
					
					if(child.visible){
						if (child.paused && !this.paused){
							child.paused = false;
						} else if (this.paused) {
							child.paused = true;
						}
					}
					
					if(!child.scaleX || !child.scaleY || (this.children && !this.children.length)){
						console.log ('uh oh', child);
//						this.cacheCanvas || this.children.length;
	//					return !!(this.visible && this.alpha > 0 && this.scaleX != 0 && this.scaleY != 0 && hasContent);
					}
				}

				lastIndex = this.stage.getNumChildren() - 1; //checked here, since handle-render could add a child
				if (this.stage.getChildAt(lastIndex) !== this.lastChild) {
					this.stage.sortChildren(function(a, b) {
						return a.z - b.z;
					});
					this.lastChild = this.stage.getChildAt(lastIndex);
				}
				
				this.timeElapsed.name = 'Render-Prep';
				this.timeElapsed.time = new Date().getTime() - time;
				platformer.game.currentScene.trigger('time-elapsed', this.timeElapsed);
				time += this.timeElapsed.time;

				this.stage.update();
				this.timeElapsed.name = 'Render';
				this.timeElapsed.time = new Date().getTime() - time;
				platformer.game.currentScene.trigger('time-elapsed', this.timeElapsed);
			},
			"camera-update": function(cameraInfo){
				var dpr = (window.devicePixelRatio || 1);
				
				this.camera.x = cameraInfo.viewportLeft;
				this.camera.y = cameraInfo.viewportTop;
				this.camera.width = cameraInfo.viewportWidth;
				this.camera.height = cameraInfo.viewportHeight;
				if(!this.camera.buffer){
					this.camera.buffer = this.camera.width / 12; // sets a default buffer based on the size of the world units if the buffer was not explicitly set.
				}
				
				this.canvas.width  = this.canvas.offsetWidth * dpr;
				this.canvas.height = this.canvas.offsetHeight * dpr;
				this.stage.setTransform(-cameraInfo.viewportLeft * cameraInfo.scaleX * dpr, -cameraInfo.viewportTop * cameraInfo.scaleY * dpr, cameraInfo.scaleX * dpr, cameraInfo.scaleY * dpr);
			}
		},
		methods:{
			destroy: function(){
				this.stage = undefined;
				this.owner.rootElement.removeChild(this.canvas);
				this.owner.element = null;
				this.canvas = undefined;
				this.entities.length = 0;
			}
		}
	});
})();