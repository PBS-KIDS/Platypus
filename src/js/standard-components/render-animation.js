/*
- **logical-state** - This component also listens for logical state changes and tests the current state of the entity against the audio map. If a match is found, the matching audio clip is played.
  > @param message (object) - Required. Lists various states of the entity as boolean values. For example: {jumping: false, walking: true}. This component retains its own list of states and updates them as `logical-state` messages are received, allowing multiple logical components to broadcast state messages.
 */
platformer.components['render-animation'] = (function(){
	var changeState = function(state){
		return function(value){
			if (this.currentAnimation !== state){
				this.currentAnimation = state;
				this.anim.gotoAndPlay(state);
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
	var component = function(owner, definition){
		var spriteSheet = {
			images: definition.spriteSheet.images.slice(),
			frames: definition.spriteSheet.frames,
			animations: definition.spriteSheet.animations
		};
		this.owner = owner;
		
		if(definition.acceptInput){
			this.hover = definition.acceptInput.hover || false;
			this.click = definition.acceptInput.click || false;
			this.touch = definition.acceptInput.touch || false;
		} else {
			this.hover = false;
			this.click = false;
			this.touch = false;
		}
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['handle-render-load', 'handle-render', 'logical-state']);

		if(definition.animationMap){
			this.checkStates = [];
			for(var i in definition.animationMap){
				this.addListener(i);
				this[i] = changeState(definition.animationMap[i]);
				this.checkStates.push(createTest(i, definition.animationMap[i]));
			}
		}
		
		this.stage = undefined;
		for (var x = 0; x < spriteSheet.images.length; x++){
			spriteSheet.images[x] = platformer.assets[spriteSheet.images[x]];
		}
		spriteSheet = new createjs.SpriteSheet(spriteSheet);
		this.anim = new createjs.BitmapAnimation(spriteSheet);
		this.currentAnimation = definition.state || this.owner.state || 'default';
		this.anim.scaleX = definition.scaleX || this.owner.scaleX || 1;
		this.anim.scaleY = definition.scaleY || this.owner.scaleY || 1;
		this.state = {};
		this.stateChange = false;
		if(this.currentAnimation){
			this.anim.gotoAndPlay(this.currentAnimation);
		}
	};
	var proto = component.prototype;
	
	proto['handle-render-load'] = function(obj){
		var self = this,
		over     = false;
		
		this.stage = obj.stage;
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
	};
	
	proto['handle-render'] = function(obj){
		var testCase = false, i = 0;
		this.anim.x = this.owner.x;
		this.anim.y = this.owner.y;
		this.anim.z = this.owner.z;
		
		if(this.stateChange){
			if(this.checkStates){
				for(; i < this.checkStates.length; i++){
					testCase = this.checkStates[i](this.state);
					if(testCase){
						if(this.currentAnimation !== testCase){
							this.currentAnimation = testCase;
							this.anim.gotoAndPlay(testCase);
						}
						break;
					}
				}
			}
			this.stateChange = false;
		}
	};
	
	proto['logical-state'] = function(state){
		for(var i in state){
			if(this.state[i] !== state[i]){
				this.stateChange = true;
				this.state[i] = state[i];
			}
		}
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.stage.removeChild(this.anim);
		this.anim = undefined;
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
