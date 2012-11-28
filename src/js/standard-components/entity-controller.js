/**
# COMPONENT **entity-controller**
This component listens for input messages triggered on the entity and updates the state of any controller inputs it is listening for. It then broadcasts messages on the entity corresponding to the input it received.

## Dependencies:
- [[Handler-Controller]] (on entity's parent) - This component listens for a controller "tick" message in order to trigger messages regarding the state of its inputs.

## Messages

### Listens for:
- **handle-controller** - On each `handle-controller` message, this component checks its list of actions and if any of their states are currently true or were true on the last call, that action message is triggered.
- **mousedown** - This message is re-triggered on the entity as a new message including the button that was pressed: "mouse:left-button:down", "mouse:middle-button:down", or "mouse:right-button:down".
  > @param message.event (DOM Event object) - This event object is passed along with the new message.
- **mouseup** - This message is re-triggered on the entity as a new message including the button that was released: "mouse:left-button:up", "mouse:middle-button:up", or "mouse:right-button:up".
  > @param message.event (DOM Event object) - This event object is passed along with the new message.
- **mousemove** - This message is re-triggered on the entity as a new message "mouse:move".
  > @param message (object) - This message object is passed along with the new message.
- **[Messages specified in definition]** - Listens for additional messages and on receiving them, sets the appropriate state and broadcasts the associated message on the next `handle-controller` message.
  > @param message.interrupt (string) - Optional. Can be "any", "early", "late", or "none". Determines how to handle the audio when it's already playing but a new play request is received. Default is "any".
  > @param message.delay (integer) - Optional. Time in milliseconds to wait before playing audio once the message is received. Default is 0.
  > @param message.offset (integer) - Optional. Time in milliseconds determining where in the audio clip to begin playback. Default is 0.
  > @param message.length (integer) - Optional. Time in milliseconds to play audio before stopping it. If 0 or not specified, play continues to the end of the audio clip.
  > @param message.loop (integer) - Optional. Determines how many more times to play the audio clip once it finishes. Set to -1 for an infinite loop. Default is 0.
  > @param message.volume (float) - Optional. Used to specify how loud to play audio on a range from 0 (mute) to 1 (full volume). Default is 1.
  > @param message.pan (float) - Optional. Used to specify the pan of audio on a range of -1 (left) to 1 (right). Default is 0.

## JSON Definition:
    {
      "type": "audio",
      
      "audioMap":{
      // Required. Use the audioMap property object to map messages triggered with audio clips to play. At least one audio mapping should be included for audio to play.
      
        "message-triggered": "audio-id",
        // This simple form is useful to listen for "message-triggered" and play "audio-id" using default audio properties.
        
        "another-message": {
        // To specify audio properties, instead of mapping the message to an audio id string, map it to an object with one or more of the properties shown below. Many of these properties directly correspond to [SoundJS play parameters] (http://www.createjs.com/Docs/SoundJS/SoundJS.html#method_play).
        
          "sound": "another-audio-id",
          // Required. This is the audio clip to play when "another-message" is triggered.
          
          "interrupt": "none",
          // Optional. Can be "any", "early", "late", or "none". Determines how to handle the audio when it's already playing but a new play request is received. Default is "any".
          
          "delay": 500,
          // Optional. Time in milliseconds to wait before playing audio once the message is received. Default is 0.
          
          "offset": 1500,
          // Optional. Time in milliseconds determining where in the audio clip to begin playback. Default is 0.
          
          "length": 2500,
          // Optional. Time in milliseconds to play audio before stopping it. If 0 or not specified, play continues to the end of the audio clip.

          "loop": 4,
          // Optional. Determines how many more times to play the audio clip once it finishes. Set to -1 for an infinite loop. Default is 0.
          
          "volume": 0.75,
          // Optional. Used to specify how loud to play audio on a range from 0 (mute) to 1 (full volume). Default is 1.
          
          "pan": -0.25
          // Optional. Used to specify the pan of audio on a range of -1 (left) to 1 (right). Default is 0.
        }
      }
    }
*/
platformer.components['entity-controller'] = (function(){
	var state = function(){
		this.current = false;
		this.last    = false;
		this.state   = false;
		this.stateSummary = {
			pressed:   false,
			released:  false,
			triggered: false,
			over:      false
		};
	},
	mouseMap = ['left-button', 'middle-button', 'right-button'],
	createUpHandler = function(state){
		return function(value){
			state.state = false;
		};
	},
	createDownHandler = function(state){
		return function(value){
			state.current = true;
			state.state   = true;
			if(value && (typeof (value.over) !== 'undefined')) state.over = value.over;
		};
	},
	component = function(owner, definition){
		var key     = '',
		actionState = undefined;
		this.owner  = owner;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['handle-controller', 'mousedown', 'mouseup', 'mousemove', 'mouse:move']);
		
		if(definition && definition.controlMap){
			this.owner.controlMap = definition.controlMap;
			this.actions  = {};
			for(key in definition.controlMap){
				actionState = this.actions[definition.controlMap[key]]; // If there's already a state storage object for this action, reuse it: there are multiple keys mapped to the same action.
				if(!actionState){                                // Otherwise create a new state storage object
					actionState = this.actions[definition.controlMap[key]] = new state();
				}
				this[key + ':up']   = createUpHandler(actionState);
				this[key + ':down'] = createDownHandler(actionState);
				this.addListener(key + ':up');
				this.addListener(key + ':down');
			}
		}
	},
	stateProto = state.prototype,
	proto      = component.prototype;
	
	stateProto.update = function(){
		this.last    = this.current;
		this.current = this.state;
	};

	stateProto.isPressed = function(){
		return this.current;
	};
	
	stateProto.isTriggered = function(){
		return this.current && !this.last;
	};

	stateProto.isReleased = function(){
		return !this.current && this.last;
	};
	
	stateProto.getState = function(){
		this.stateSummary.pressed   = this.current;
		this.stateSummary.released  = !this.current && this.last;
		this.stateSummary.triggered = this.current && !this.last;
		this.stateSummary.over      = this.over;
		return this.stateSummary;
	};
	
	proto['mouse:move'] = function(value){
		if(this.actions['mouse:left-button'] && (this.actions['mouse:left-button'].over !== value.over))     this.actions['mouse:left-button'].over = value.over;
		if(this.actions['mouse:middle-button'] && (this.actions['mouse:middle-button'].over !== value.over)) this.actions['mouse:middle-button'].over = value.over;
		if(this.actions['mouse:right-button'] && (this.actions['mouse:right-button'].over !== value.over))   this.actions['mouse:right-button'].over = value.over;
	};
	
	proto['handle-controller'] = function(){
		var state = undefined,
		action    = '';
		
		if(this.actions){
			for (action in this.actions){
				state = this.actions[action];
				if(state.current || state.last){
					this.owner.trigger(action, state.getState());
				}
				state.update();
			}
		}
	};
	
	// The following translate CreateJS mouse and touch events into messages that this controller can handle in a systematic way
	
	proto['mousedown'] = function(value){
		this.owner.trigger('mouse:' + mouseMap[value.event.button || 0] + ':down', value.event);
	}; 
		
	proto['mouseup'] = function(value){
		this.owner.trigger('mouse:' + mouseMap[value.event.button || 0] + ':up', value.event);
	};
	
	proto['mousemove'] = function(value){
		this.owner.trigger('mouse:move', value);
	};
/*
	proto['mouseover'] = function(value){
		this.owner.trigger('mouse:' + mouseMap[value.event.button] + ':over', value.event);
	};

	proto['mouseout'] = function(value){
		this.owner.trigger('mouse:' + mouseMap[value.event.button] + ':out', value.event);
	};
*/
	
	
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
