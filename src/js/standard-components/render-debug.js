/**
# COMPONENT **render-debug**
This component is attached to entities that will appear in the game world. It serves two purposes. First, it displays a rectangle that indicates location of the object. By default it uses the specified position and dimensions of the object (in grey), if the object has a collision component it will display the AABB of the collision shape (in pink). If the entity has a [[Logic-Carrier]] component and is/was carrying an object, a green rectangle will be drawn showing the collision group. The render-debug component also allows the user to click on an object and it will print the object in the debug console. 

## Dependencies
- [[Handler-Render]] (on entity's parent) - This component listens for a render "handle-render" and "handle-render-load" message to setup and display the content.

## Messages

### Listens for:
- **handle-render** - Repositions the pieces of the component in preparation for rendering
- **handle-render-load** - The visual components are set up and added to the stage. Setting up mouse input stuff. The click-to-print-to-console functionality is set up too. 
  > @param resp.stage ([createjs.Stage][link1]) - This is the stage on which the component will be displayed.

### Local Broadcasts:
- **mousedown** - Render-debug captures this message and uses it and then passes it on to the rest of the object in case it needs to do something else with it.
  > @param event (event object) - The event from Javascript.
  > @param over (boolean) - Whether the mouse is over the object or not.
  > @param x (number) - The x-location of the mouse in stage coordinates.
  > @param y (number) - The y-location of the mouse in stage coordinates.
  > @param entity ([[Entity]]) - The entity clicked on.  
- **mouseup** - Render-debug captures this message and uses it and then passes it on to the rest of the object in case it needs to do something else with it.
  > @param event (event object) - The event from Javascript.
  > @param over (boolean) - Whether the mouse is over the object or not.
  > @param x (number) - The x-location of the mouse in stage coordinates.
  > @param y (number) - The y-location of the mouse in stage coordinates.
  > @param entity ([[Entity]]) - The entity clicked on.  
- **mousemove** - Render-debug captures this message and uses it and then passes it on to the rest of the object in case it needs to do something else with it.
  > @param event (event object) - The event from Javascript.
  > @param over (boolean) - Whether the mouse is over the object or not.
  > @param x (number) - The x-location of the mouse in stage coordinates.
  > @param y (number) - The y-location of the mouse in stage coordinates.
  > @param entity ([[Entity]]) - The entity clicked on.  

## JSON Definition
    {
      "type": "render-debug",
      "acceptInput": {
      	//Optional - What types of input the object should take.
      	"hover": false;
      	"click": false; 
      }, 
      "regX": 0,
      //Optional - The X offset from X position for the displayed shape. If you're using the AABB this is set automatically.
      "regY": 0
      //Optional - The Y offset from Y position for the displayed shape. If you're using the AABB this is set automatically.
    }
    
[link1]: http://createjs.com/Docs/EaselJS/Stage.html
*/


platformer.components['render-debug'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		//this.controllerEvents = undefined;
		
		if(definition.acceptInput){
			this.hover = definition.acceptInput.hover || false;
			this.click = definition.acceptInput.click || false;
		} else {
			this.hover = false;
			this.click = false;
		}
		
		this.regX = definition.regX || 0;
		this.regY = definition.regY || 0;
		this.stage = undefined;
		//this.txt = undefined;
		this.shape = undefined;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['handle-render', 'handle-render-load']);
	};
	var proto = component.prototype;

	proto['handle-render-load'] = function(resp){
		var self = this,
		x        = this.owner.x      = this.owner.x || 0,
		y        = this.owner.y      = this.owner.y || 0,
		z        = this.owner.z      = this.owner.z || 0,
		width    = this.owner.width  = this.owner.width  || 300,
		height   = this.owner.height = this.owner.height || 100,
		comps    = platformer.settings.entities[this.owner.type]?(platformer.settings.entities[this.owner.type].components || []):[],
		components = [],
		over     = false;
		
		for (var i in comps) components[i] = comps[i].type;
		
		this.stage = resp.stage;
		
		/*
		this.txt   = new createjs.Text(this.owner.type + '\n(' + components.join(', ') + ')');
		this.txt.x = x + width / 2;
		this.txt.y = y + height / 2;
		this.txt.z = z;
		this.txt.textAlign = "center";
		this.txt.textBaseline = "middle";
		*/
		
		if(this.owner.getAABB){
			var aabb   = this.owner.getAABB();
			width      = this.initialWidth  = aabb.width;
			height     = this.initialHeight = aabb.height;
			this.shape = new createjs.Shape((new createjs.Graphics()).beginFill("rgba(255,0,255,0.1)").setStrokeStyle(3).beginStroke("#f0f").rect(0, 0, width, height));
			this.regX  = width  / 2;
			this.regY  = height / 2;
		} else {
			this.shape = new createjs.Shape((new createjs.Graphics()).beginFill("rgba(0,0,0,0.1)").beginStroke("#880").rect(0, 0, width, height));
		}
		this.shape.z = z + 10000;
		this.stage.addChild(this.shape);
		//this.stage.addChild(this.txt);
		
		// The following appends necessary information to displayed objects to allow them to receive touches and clicks
		if(this.click && createjs.Touch.isSupported()){
			createjs.Touch.enable(this.stage);
		}

		this.shape.onPress     = function(event) {
			if(this.click){
				self.owner.trigger('mousedown', {
					event: event.nativeEvent,
					over: over,
					x: event.stageX,
					y: event.stageY,
					entity: self.owner
				});
				event.onMouseUp = function(event){
					self.owner.trigger('mouseup', {
						event: event.nativeEvent,
						over: over,
						x: event.stageX,
						y: event.stageY,
						entity: self.owner
					});
				};
				event.onMouseMove = function(event){
					self.owner.trigger('mousemove', {
						event: event.nativeEvent,
						over: over,
						x: event.stageX,
						y: event.stageY,
						entity: self.owner
					});
				};
			}
			if(event.nativeEvent.button == 2){
				console.log('This Entity:', self.owner);
			}
		};
		if(this.click){
			this.shape.onMouseOut  = function(){over = false;};
			this.shape.onMouseOver = function(){over = true;};
		}
		if(this.hover){
			this.stage.enableMouseOver();
			this.shape.onMouseOut  = function(event){
				over = false;
				self.owner.trigger('mouseout', {
					event: event.nativeEvent,
					over: over,
					x: event.stageX,
					y: event.stageY,
					entity: self.owner
				});
			};
			this.shape.onMouseOver = function(event){
				over = true;
				self.owner.trigger('mouseover', {
					event: event.nativeEvent,
					over: over,
					x: event.stageX,
					y: event.stageY,
					entity: self.owner
				});
			};
		}
	};
	
	proto['handle-render'] = function(){
		if(this.owner.getAABB){
			var aabb   = this.owner.getAABB();
			this.shape.scaleX = aabb.width / this.initialWidth;
			this.shape.scaleY = aabb.height / this.initialHeight;
			this.shape.x = aabb.x - aabb.halfWidth;
			this.shape.y = aabb.y - aabb.halfHeight;
			this.shape.z = this.owner.z;
			this.shape.z += 10000;
			/*
			this.txt.x = aabb.x;
			this.txt.y = aabb.y;
			this.txt.z = this.owner.z;
			*/
		} else {
			this.shape.x = this.owner.x	- this.regX;
			this.shape.y = this.owner.y	- this.regY;
			this.shape.z = this.owner.z;
			this.shape.z += 10000;
			/*
			this.txt.x = this.owner.x	- this.regX + (this.owner.width / 2);
			this.txt.y = this.owner.y 	- this.regY + (this.owner.height / 2);
			this.txt.z = this.owner.z;
			*/
		}
		if(this.owner.getCollisionGroupAABB){
			var aabb = this.owner.getCollisionGroupAABB();
			if(!this.groupShape){
				this.groupShape = new createjs.Shape((new createjs.Graphics()).beginFill("rgba(0,255,0,0.1)").setStrokeStyle(3).beginStroke("#0f0").rect(0, 0, aabb.width, aabb.height));
				this.groupShapeInitialWidth  = aabb.width;
				this.groupShapeInitialHeight = aabb.height;
				this.stage.addChild(this.groupShape);
			}
			this.groupShape.scaleX = aabb.width  / this.groupShapeInitialWidth;
			this.groupShape.scaleY = aabb.height / this.groupShapeInitialHeight;
			this.groupShape.x      = aabb.x      - aabb.halfWidth;
			this.groupShape.y      = aabb.y      - aabb.halfHeight;
		}
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.stage.removeChild(this.shape);
		//this.stage.removeChild(this.txt);
		this.shape = undefined;
		//this.txt = undefined;
		this.stage = undefined;
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
