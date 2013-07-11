/**
# COMPONENT **render-animation**
This component is attached to entities that will appear in the game world. It renders an animated image. It listens for messages triggered on the entity or changes in the logical state of the entity to play a corresponding animation.

## Dependencies:
- [createjs.EaselJS][link1] - This component requires the EaselJS library to be included for canvas animation functionality.
- [[Handler-Render]] (on entity's parent) - This component listens for a render "handle-render" and "handle-render-load" message to setup and display the content.

## Messages

### Listens for:
- **handle-render-load** - This event is triggered when the entity is added to the render handler before 'handle-render' is called. It adds the animation to the Stage and sets up the mouse input if necessary.
  > @param message.stage ([createjs.Stage][link2]) - Required. Provides the render component with the CreateJS drawing [Stage][link2].
- **handle-render** - On each `handle-render` message, this component checks to see if there has been a change in the state of the entity. If so, it updates its animation play-back accordingly.
- **logical-state** - This component listens for logical state changes and tests the current state of the entity against the animation map. If a match is found, the matching animation is played. Has some reserved values used for special functionality.
  > @param message (object) - Required. Lists various states of the entity as boolean values. For example: {jumping: false, walking: true}. This component retains its own list of states and updates them as `logical-state` messages are received, allowing multiple logical components to broadcast state messages. Reserved values: 'orientation' and 'hidden'. Orientation is used to set the angle value in the object, the angle value will be interpreted differently based on what the 'rotate', 'mirror', and 'flip' properties are set to. Hidden determines whether the animation is rendered.
- **[Messages specified in definition]** - Listens for additional messages and on receiving them, begins playing the corresponding animations.

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
      "type": "render-animation",

      "animationMap":{
      //Optional. If the animation sequence will change, this is required. This defines a mapping from either triggered messages or one or more states for which to choose a new animation to play. The list is processed from top to bottom, so the most important actions should be listed first (for example, a jumping animation might take precedence over an idle animation).
      
          "standing": "default-animation"
          // On receiving a "standing" message, or a "logical-state" where message.standing == true, the "default" animation will begin playing.
          
          "ground,moving": "walking",
          // Comma separated values have a special meaning when evaluating "logical-state" messages. The above example will cause the "walking" animation to play ONLY if the entity's state includes both "moving" and "ground" equal to true.
          
          "ground,striking": "swing!",
          // Putting an exclamation after an animation name causes this animation to complete before going to the next animation. This is useful for animations that would look poorly if interrupted.

          "default": "default-animation",
          // Optional. "default" is a special property that matches all states. If none of the above states are valid for the entity, it will use the default animation listed here.
      }  

      "spriteSheet": {
      //Required. Defines an EaselJS sprite sheet to use for rendering. See http://www.createjs.com/Docs/EaselJS/SpriteSheet.html for the full specification.

	      "images": ["example0", "example1"],
	      //Required: An array of ids of the images from the asset list in config.js.
	      
	      "frames": {
	      //Required: The dimensions of the frames on the image and how to offset them around the entity position. The image is automatically cut up into pieces based on the dimensions. 
	      	"width":  100,
			"height": 100,
			"regY":   100,
			"regX":   50
	      },
	      
	      "animations":{
	      //Required: The list of animation ids and the frames that make up that animation. The frequency determines how long each frame plays. There are other possible parameters. Additional parameters and formatting info can be found in createJS.
			"default-animation":[2],
			"walking": {"frames": [0, 1, 2], "frequency": 4},
			"swing": {"frames": [3, 4, 5], "frequency": 4}
		  }
      }
      
      "acceptInput": {
      	//Optional - What types of input the object should take.
      	"hover": false;
      	"click": false; 
      }, 
      
      "scaleX": 1,
      //Optional - The X scaling factor for the image. Will default to 1.
      
      "scaleY": 1
      //Optional - The Y scaling factor for the image. Will default to 1.
      "rotate": false,
      //Optional - Whether this object can be rotated. It's rotational angle is set by sending an orientation value in the logical state.
      "mirror": true,
      //Optional - Whether this object can be mirrored over X. To mirror it over X set the orientation value in the logical state to be great than 90 but less than 270.
      "flip": false,
      //Optional - Whether this object can be flipped over Y. To flip it over Y set the orientation value in the logical state to be great than 180.
      "hidden": false
      //Optional - Whether this object is visible or not. To change the hidden value dynamically add a 'hidden' property to the logical state object and set it to true or false.
    }
    
[link1]: http://www.createjs.com/Docs/EaselJS/module_EaselJS.html
[link2]: http://createjs.com/Docs/EaselJS/Stage.html
*/
(function(){
	var changeState = function(state){
		return function(value){
			if(this.currentAnimation !== state){
				if(this.animationFinished || (this.lastState >= -1)){
					this.currentAnimation = state;
					this.lastState = -1;
					this.animationFinished = false;
					this.anim.gotoAndPlay(state);
				} else {
					this.waitingAnimation = state;
					this.waitingState = -1;
				}
			}
		};
	},
	createTest = function(testStates, animation){
		var states = testStates.replace(/ /g, '').split(',');
		if(testStates === 'default'){
			return function(state){
				return animation;
			};
		} else {
			return function(state){
				for(var i = 0; i < states.length; i++){
					if(!state[states[i]]){
						return false;
					}
				}
				return animation;
			};
		}
	};
	
	return platformer.createComponentClass({
		
		id: 'render-animation',
		
		constructor: function(definition){
			var spriteSheet = {
				images: definition.spriteSheet.images.slice(),
				frames: definition.spriteSheet.frames,
				animations: definition.spriteSheet.animations
			},
			self = this,
			x = 0,
			animation = '',
			lastAnimation = '',
			map = definition.animationMap;
			
			this.rotate = definition.rotate || false;
			this.mirror = definition.mirror || false;
			this.flip   = definition.flip   || false;
			this.hidden   = definition.hidden   || false;
			
			if(definition.acceptInput){
				this.hover = definition.acceptInput.hover || false;
				this.click = definition.acceptInput.click || false;
				this.touch = definition.acceptInput.touch || false;
			} else {
				this.hover = false;
				this.click = false;
				this.touch = false;
			}
			
			this.followThroughs = {};
			
			if(!map){ // create animation map if none exists
				map = {};
				for (x in spriteSheet.animations){
					map[x] = x;
				}
			}
			
			this.checkStates = [];
			for(var i in map){
				this.addListener(i);
				animation = map[i];
				
				if(animation[animation.length - 1] === '!'){
					animation = animation.substring(0, animation.length - 1);
					this.followThroughs[animation] = true;
				} else {
					this.followThroughs[animation] = false;
				}
				
				this[i] = changeState(animation);
				this.checkStates.push(createTest(i, animation));
			}
			lastAnimation = animation;
			
			this.stage = undefined;
			for (x = 0; x < spriteSheet.images.length; x++){
				spriteSheet.images[x] = platformer.assets[spriteSheet.images[x]];
			}
			var scaleX = spriteSheet.images[0].scaleX || 1,
			scaleY     = spriteSheet.images[0].scaleY || 1;
			if((scaleX !== 1) || (scaleY !== 1)){
				spriteSheet.frames = {
					width: spriteSheet.frames.width * scaleX,	
					height: spriteSheet.frames.height * scaleY,	
					regX: spriteSheet.frames.regX * scaleX,	
					regY: spriteSheet.frames.regY * scaleY
				};
			}
			spriteSheet = new createjs.SpriteSheet(spriteSheet);
			this.anim = new createjs.BitmapAnimation(spriteSheet);
			this.anim.onAnimationEnd = function(animationInstance, lastAnimation){
				self.owner.trigger('animation-ended', lastAnimation);
				if(self.waitingAnimation){
					self.currentAnimation = self.waitingAnimation;
					self.waitingAnimation = false;
					self.lastState = self.waitingState;
					
					self.animationFinished = false;
					self.anim.gotoAndPlay(self.currentAnimation);
				} else {
					self.animationFinished = true;
				}
			};
			this.anim.hidden = this.hidden;
			this.currentAnimation = map['default'] || lastAnimation;
			this.forcePlaythrough = this.owner.forcePlaythrough || definition.forcePlaythrough || false;
			this.scaleX = this.anim.scaleX = ((definition.scaleX || 1) * (this.owner.scaleX || 1)) / scaleX;
			this.scaleY = this.anim.scaleY = ((definition.scaleY || 1) * (this.owner.scaleY || 1)) / scaleY;
			this.state = {};
			this.stateChange = false;
			this.waitingAnimation = false;
			this.waitingState = 0;
			this.playWaiting = false;
			this.animationFinished = false;
			if(this.currentAnimation){
				this.anim.gotoAndPlay(this.currentAnimation);
			}
		},
		
		events: {
			"handle-render-load": function(obj){
				var self = this,
				over     = false;
				
				this.stage = obj.stage;
				if(!this.stage){
					return;
				}
				this.stage.addChild(this.anim);
				
				// The following appends necessary information to displayed objects to allow them to receive touches and clicks
				if(this.click || this.touch){
					if(this.touch && createjs.Touch.isSupported()){
						createjs.Touch.enable(this.stage);
					}

					this.anim.onPress     = function(event) {
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
					this.anim.onMouseOut  = function(){over = false;};
					this.anim.onMouseOver = function(){over = true;};
				}
				if(this.hover){
					this.stage.enableMouseOver();
					this.anim.onMouseOut  = function(event){
						over = false;
						self.owner.trigger('mouseout', {
							event: event.nativeEvent,
							over: over,
							x: event.stageX,
							y: event.stageY,
							entity: self.owner
						});
					};
					this.anim.onMouseOver = function(event){
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
			},
			
			"handle-render": function(resp){
				var testCase = false, i = 0,
				angle = null;
				
				if(!this.stage) { //In case this component was added after handler-render is initiated
					this['handle-render-load'](resp);
					if(!this.stage){
						console.warn('No CreateJS Stage, removing render component from "' + this.owner.type + '".');
						this.owner.removeComponent(this);
						return;
					}
				}
				
				this.anim.x = this.owner.x;
				this.anim.y = this.owner.y;
				this.anim.z = this.owner.z;
				
				//Special case affecting rotation of the animation
				if(this.rotate || this.mirror || this.flip){
					angle = ((this.owner.orientation * 180) / Math.PI + 360) % 360;
					
					if(this.rotate){
						this.anim.rotation = angle;
					}
					
					if(this.mirror){
						if((angle > 90) && (angle < 270)){
							this.anim.scaleX = -this.scaleX;
						} else {
							this.anim.scaleX = this.scaleX;
						}
					}
					
					if(this.flip){
						if(angle > 180){
							this.anim.scaleY = this.scaleY;
						} else {
							this.anim.scaleY = -this.scaleY;
						}
					}
				}
				
				if(this.stateChange){
					if(this.checkStates){
						for(; i < this.checkStates.length; i++){
							testCase = this.checkStates[i](this.state);
							if(testCase){
								if(this.currentAnimation !== testCase){
									if(!this.followThroughs[this.currentAnimation] && (!this.forcePlaythrough || (this.animationFinished || (this.lastState >= +i)))){
										this.currentAnimation = testCase;
										this.lastState = +i;
										this.animationFinished = false;
										this.anim.gotoAndPlay(testCase);
									} else {
										this.waitingAnimation = testCase;
										this.waitingState = +i;
									}
								} else if(this.waitingAnimation && !this.followThroughs[this.currentAnimation]) {// keep animating this animation since this animation has already overlapped the waiting animation.
									this.waitingAnimation = false;
								}
								break;
							}
						}
					}
					this.stateChange = false;
				}
			},
			
			"logical-state": function(state){
				for(var i in state){
					if(this.state[i] !== state[i]){
						this.stateChange = true;
						this.state[i] = state[i];
						
						if(i === 'hidden') {
							this.hidden = state[i];
							this.anim.hidden = this.hidden;
						}
					}
				}
			}			
		},
		
		methods: {
			destroy: function(){
				if (this.stage){
					this.stage.removeChild(this.anim);
					this.stage = undefined;
				}
				this.followThroughs = null;
				this.anim = undefined;
			}
		}
	});
})();
