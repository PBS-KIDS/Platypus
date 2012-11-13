platformer.components['audio'] = (function(){
	var defaultSettings = {
		interrupt: createjs.SoundJS.INTERRUPT_ANY, //INTERRUPT_ANY, INTERRUPT_EARLY, INTERRUPT_LATE, or INTERRUPT_NONE
		delay:     0,
		offset:    0,
		loop:      0,
		volume:    1,
		pan:       0,
		length:    0
	},
	playSound = function(soundDefinition){
		var sound = '',
		attributes = undefined;
		if(typeof soundDefinition === 'string'){
			sound      = soundDefinition;
			attributes = {};
		} else {
			sound      = soundDefinition.sound;
			attributes = soundDefinition;
		}
		if(platformer.settings.assets[sound].data){
			for(var item in platformer.settings.assets[sound].data){
				attributes[item] = attributes[item] || platformer.settings.assets[sound].data[item];
			}
		}
		if(platformer.settings.assets[sound].assetId){
			sound = platformer.settings.assets[sound].assetId;
		}
		return function(value){
			var audio = undefined,
			length    = 0;
			value = value || attributes;
			if(value){
				var interrupt = value.interrupt || attributes.interrupt || defaultSettings.interrupt,
				delay         = value.delay     || attributes.delay  || defaultSettings.delay,
				offset        = value.offset    || attributes.offset || defaultSettings.offset,
				loop          = value.loop      || attributes.loop   || defaultSettings.loop,
				volume        = (typeof value.volume !== 'undefined')? value.volume: ((typeof attributes.volume !== 'undefined')? attributes.volume: defaultSettings.volume),
				pan           = value.pan       || attributes.pan    || defaultSettings.pan;
				length        = value.length    || attributes.length || defaultSettings.length;
				
				audio = createjs.SoundJS.play(sound, interrupt, delay, offset, loop, volume, pan);
			} else {
				audio = createjs.SoundJS.play(sound, defaultSettings.interrupt, defaultSettings.delay, defaultSettings.offset, defaultSettings.loop, defaultSettings.volume, defaultSettings.pan);
			}

			if(audio.playState === 'playFailed'){
				if(this.owner.debug){
					console.warn('Unable to play "' + sound + '".', audio);
				}
			} else {
				if(length){ // Length is specified so we need to turn off the sound at some point.
					this.timedAudioClips.push({length: length, progress: 0, audio: audio});
				}
			}
		};
	},
	component = function(owner, definition){
		this.owner = owner;
		this.timedAudioClips = [],
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['layer:render', 'audio-mute-toggle', 'audio-mute', 'audio-unmute']);

		if(definition.audioMap){
			for (var key in definition.audioMap){
				this.addListener(key);
				this[key] = playSound(definition.audioMap[key]);
			}
		}
	};
	var proto = component.prototype;
	
	proto['layer:render'] = function(resp){
		if (this.destroyMe && this.timedAudioClips.length == 0)
		{
			this.timedAudioClips = undefined;
			this.removeListeners(this.listeners);
		} else {
			var i     = 0,
			audioClip = undefined;
			newArray  = undefined;
			if(this.timedAudioClips.length){
				newArray = [];
				for (i in this.timedAudioClips){
					audioClip = this.timedAudioClips[i];
					audioClip.progress += resp.deltaT;
					if(audioClip.progress >= audioClip.length){
						audioClip.audio.stop();
					} else {
						newArray.push(audioClip);
					}
				}
				this.timedAudioClips = newArray;
			}
		}
	};
	
	proto['audio-mute-toggle'] = function(sound){
		createjs.SoundJS.setMute(!createjs.SoundJS.muted, sound);
	};
	
	proto['audio-mute'] = function(sound){
		createjs.SoundJS.setMute(true, sound);
	};
	
	proto['audio-unmute'] = function(sound){
		createjs.SoundJS.setMute(false, sound);
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		//Handling things in 'render'
		this.destroyMe = true;
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
