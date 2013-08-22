/**
# COMPONENT **render-image**
This component is attached to entities that will appear in the game world. It renders a static image. It can render a whole image or a portion of a larger images depending on the definition.

## Dependencies
- [[Handler-Render]] (on entity's parent) - This component listens for a render "handle-render" and "handle-render-load" message to setup and display the content.

## Messages

### Listens for:
- **handle-render** - Repositions the image in preparation for rendering
- **handle-render-load** - The image added to the stage. Setting up the mouse input stuff.
  > @param obj.stage ([createjs.Stage][link1]) - This is the stage on which the component will be displayed.
- **logical-state** - This component listens for logical state changes. Handles orientation of the object and visibility.
  > @param message (object) - Required. Lists parameters and their values. For example: {hidden: false, orientation: 90}. Accepted parameters: 'orientation' and 'hidden'. Orientation is used to set the angle value in the object, the angle value will be interpreted differently based on what the 'rotate', 'mirror', and 'flip' properties are set to. Hidden determines whether the image is rendered.

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
      "type": "render-image",
      "image": "example",
      //Required: The id of the image from the asset list in config.js.
      "source": {
      //Optional - The portion of the image you are going to use.
		"width":  100,
		"height": 100,
		"y": 100,
		"x": 100   
      },
      "acceptInput": {
      	//Optional - What types of input the object should take.
      	"hover": false;
      	"click": false; 
      }, 
      "regX": 0,
      //Optional - The X offset from X position for the image.
      "regY": 0,
      //Optional - The Y offset from Y position for the image.
      "scaleX": 1,
      //Optional - The X scaling factor for the image.  Will default to 1.
      "scaleY": 1
      //Optional - The Y scaling factor for the image.  Will default to 1.
      "rotate": false,
      //Optional - Whether this object can be rotated. It's rotational angle is set by sending an orientation value in the logical state.
      "mirror": true,
      //Optional - Whether this object can be mirrored over X. To mirror it over X set the orientation value in the logical state to be great than 90 but less than 270.
      "flip": false,
      //Optional - Whether this object can be flipped over Y. To flip it over Y set the orientation value in the logical state to be great than 180.
      "hidden": false
      //Optional - Whether this object is visible or not. To change the hidden value dynamically add a 'hidden' property to the logical state object and set it to true or false.
    }
    
[link1]: http://createjs.com/Docs/EaselJS/Stage.html
*/

platformer.components['render-image'] = (function(){
	var component = function(owner, definition){
		var image = definition.image,
		source    = definition.source;
		
		this.owner = owner;
		this.rotate = definition.rotate || false;
		this.mirror = definition.mirror || false;
		this.flip   = definition.flip   || false;
		this.hidden   = definition.hidden   || false;
		
		this.state = {};
		
		if(definition.acceptInput){
			this.hover = definition.acceptInput.hover || false;
			this.click = definition.acceptInput.click || false;
		} else {
			this.hover = false;
			this.click = false;
		}
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['handle-render-load', 'handle-render', 'logical-state']);
		this.stage = undefined;
		this.image = new createjs.Bitmap(platformer.assets[image]);
		var scaleX = platformer.assets[image].scaleX || 1,
		scaleY     = platformer.assets[image].scaleY || 1;
		if(source){
			source.x = source.x || 0;
			source.y = source.y || 0;
			this.image.sourceRect = new createjs.Rectangle(source.x * scaleX, source.y * scaleY, source.width * scaleX, source.height * scaleY);
		}
		this.image.hidden = this.hidden;
		this.image.regX   = (definition.regX || 0) * scaleX;
		this.image.regY   = (definition.regY || 0) * scaleY;
		this.image.scaleX = ((definition.scaleX || 1) * (this.owner.scaleX || 1)) / scaleX;
		this.image.scaleY = ((definition.scaleY || 1) * (this.owner.scaleY || 1)) / scaleY;
	};
	var proto = component.prototype;
	
	proto['handle-render-load'] = function(obj){
		var self = this,
		over     = false;
		
		this.stage = obj.stage;
		this.stage.addChild(this.image);
		
		// The following appends necessary information to displayed objects to allow them to receive touches and clicks
		if(this.click){
			if(createjs.Touch.isSupported()){
				createjs.Touch.enable(this.stage);
			}

			this.image.onPress     = function(event) {
				self.owner.trigger('mousedown', {
					//debug: true,
					event: event.nativeEvent,
					over: over,
					x: event.stageX,
					y: event.stageY,
					entity: self.owner
				});
				event.onMouseUp = function(event){
					self.owner.trigger('mouseup', {
						//debug: true,
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
			};
			this.image.onMouseOut  = function(){over = false;};
			this.image.onMouseOver = function(){over = true;};
		}
		if(this.hover){
			this.stage.enableMouseOver();
			this.image.onMouseOut  = function(event){
				over = false;
				self.owner.trigger('mouseout', {
					event: event.nativeEvent,
					over: over,
					x: event.stageX,
					y: event.stageY,
					entity: self.owner
				});
			};
			this.image.onMouseOver = function(event){
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
	
	proto['handle-render'] = function(obj){
		var angle = null;
		
		if(!this.stage) { //In case this component was added after handler-render is initiated
			this['handle-render-load'](resp);
			if(!this.stage){
				console.warn('No CreateJS Stage, removing render component from "' + this.owner.type + '".');
				this.owner.removeComponent(this);
				return;
			}
		}

		if(this.rotate || this.mirror || this.flip){
			angle = ((this.owner.orientation * 180) / Math.PI + 360) % 360;
			
			if(this.rotate){
				this.image.rotation = angle;
			}
			
			if(this.mirror){
				if((angle > 90) && (angle < 270)){
					this.image.scaleX = -this.scaleX;
				} else {
					this.image.scaleX = this.scaleX;
				}
			}
			
			if(this.flip){
				if(angle > 180){
					this.image.scaleY = this.scaleY;
				} else {
					this.image.scaleY = -this.scaleY;
				}
			}
		}
		
		this.image.x = this.owner.x;
		this.image.y = this.owner.y;

		if(this.anim.z !== this.owner.z){
			this.stage.reorder = true;
			this.anim.z = this.owner.z;
		}
		
		if(this.owner.opacity || (this.owner.opacity === 0)){
			this.anim.alpha = this.owner.opacity;
		}
	};
	
	proto['logical-state'] = function(state){
		for(var i in state){
			if(this.state[i] !== state[i]){
				this.state[i] = state[i];
				
				if(i === 'hidden') {
					this.hidden = state[i];
					this.image.hidden = this.hidden;
				}
			}
		}
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.stage.removeChild(this.image);
		this.stage = undefined;
		this.image = undefined;
		this.removeListeners(this.listeners);
		this.owner = undefined;
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
