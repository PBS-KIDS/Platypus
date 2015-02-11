/**
# COMPONENT **audio**
This component plays audio. Audio is played in one of two ways, by triggering specific messages defined in the audio component definition or using an audio map which plays sounds when the entity enters specified states (like render-sprite).

## Dependencies:
- [createjs.SoundJS] [link1] - This component requires the SoundJS library to be included for audio functionality.
- [[handler-render-createjs]] (on entity's parent) - This component listens for a render "tick" message in order to stop audio clips that have a play length set.

## Messages

### Listens for:
- **handle-render** - On each `handle-render` message, this component checks its list of playing audio clips and stops any clips whose play length has been reached.
  - @param message.delta (number) - uses the value of delta (time since last `handle-render`) to track progess of the audio clip and stop clip if play length has been reached.
- **audio-mute-toggle** - On receiving this message, the audio will mute if unmuted, and unmute if muted.
  - @param message (string) - If a message is included, a string is expected that specifies an audio id, and that particular sound instance is toggled. Otherwise all audio is toggled from mute to unmute or vice versa.
- **audio-mute** - On receiving this message all audio will mute, or a particular sound instance will mute if an id is specified.
  - @param message (string) - If a message is included, a string is expected that specifies an audio id, and that particular sound instance is muted.
- **audio-unmute** - On receiving this message all audio will unmute, or a particular sound instance will unmute if an id is specified.
  - @param message (string) - If a message is included, a string is expected that specifies an audio id, and that particular sound instance is unmuted.
- **audio-stop** - On receiving this message all audio will stop playing.
- **logical-state** - This component listens for logical state changes and tests the current state of the entity against the audio map. If a match is found, the matching audio clip is played.
  - @param message (object) - Required. Lists various states of the entity as boolean values. For example: {jumping: false, walking: true}. This component retains its own list of states and updates them as `logical-state` messages are received, allowing multiple logical components to broadcast state messages.
- **[Messages specified in definition]** - Listens for additional messages and on receiving them, begins playing corresponding audio clips. Audio play message can optionally include several parameters, many of which correspond with [SoundJS play parameters] [link2].
  - @param message.interrupt (string) - Optional. Can be "any", "early", "late", or "none". Determines how to handle the audio when it's already playing but a new play request is received. Default is "any".
  - @param message.delay (integer) - Optional. Time in milliseconds to wait before playing audio once the message is received. Default is 0.
  - @param message.offset (integer) - Optional. Time in milliseconds determining where in the audio clip to begin playback. Default is 0.
  - @param message.length (integer) - Optional. Time in milliseconds to play audio before stopping it. If 0 or not specified, play continues to the end of the audio clip.
  - @param message.loop (integer) - Optional. Determines how many more times to play the audio clip once it finishes. Set to -1 for an infinite loop. Default is 0.
  - @param message.volume (float) - Optional. Used to specify how loud to play audio on a range from 0 (mute) to 1 (full volume). Default is 1.
  - @param message.pan (float) - Optional. Used to specify the pan of audio on a range of -1 (left) to 1 (right). Default is 0.
  - @param message.next (string) - Optional. Used to specify the next audio clip to play once this one is complete.

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
          
          "pan": -0.25,
          // Optional. Used to specify the pan of audio on a range of -1 (left) to 1 (right). Default is 0.

          "next": ["audio-id"]
          // Optional. Used to specify a list of audio clips to play once this one is finished.
        }
      }
    }

[link1]: http://www.createjs.com/Docs/SoundJS/module_SoundJS.html
[link2]: http://www.createjs.com/Docs/SoundJS/SoundJS.html#method_play
*/
(function(){
	var channels = {},
	defaultSettings = {
		interrupt: createjs.Sound.INTERRUPT_ANY, //INTERRUPT_ANY, INTERRUPT_EARLY, INTERRUPT_LATE, or INTERRUPT_NONE
		delay:     0,
		offset:    0,
		loop:      0,
		volume:    1,
		pan:       0,
		mute:      false,
		paused:    false,		
		next:      false,
		events:    false
	},
	stop = {
		stop: true,
		playthrough: true
	},
	audioInProgress = function(channel){
		var list = channels[channel];
			
		if(!list || !list.length){
			return false;
		}
		for (var i in list){
			if(list[i].priorityTrack){
				return list[i].priorityTrack;
			}
		}
		return false;
	},
	sortByTime = function(a,b){
		return a.time - b.time;
	},
	playSound = function(soundDefinition){
		var sound = '',
		attributes = undefined;
		if(typeof soundDefinition === 'string'){
			sound      = soundDefinition;
			attributes = {};
		} else if (Array.isArray(soundDefinition)){
			if(typeof soundDefinition[0] === 'string'){
				sound      = soundDefinition[0];
				attributes = {next: []};
			} else {
				sound      = soundDefinition[0].sound;
				attributes = {};
				for (var property in soundDefinition[0]){
					attributes[property] = soundDefinition[0][property];
				}
				if(attributes.next){
					attributes.next = attributes.next.slice();
				} else {
					attributes.next = [];
				}
			}
			for(var i = 1; i < soundDefinition.length; i++){
				attributes.next.push(soundDefinition[i]);
			}
		} else {
			sound      = soundDefinition.sound;
			attributes = {
				interrupt: soundDefinition.interrupt,
				delay:     soundDefinition.delay,
				offset:    soundDefinition.offset,
				loop:      soundDefinition.loop,
				volume:    soundDefinition.volume,
				pan:       soundDefinition.pan,
				startTime: soundDefinition.startTime,
				duration:  soundDefinition.duration,
				mute:      soundDefinition.mute,
				paused:    soundDefinition.paused,
				next:      soundDefinition.next,
				events:    soundDefinition.events
			};
		}

		return function(value){
			var self = this,
			audio = undefined,
			next = false,
			events = false,
			willOverlap = audioInProgress(this.channel);
			
			if((this.preventOverlaps !== 'ignore') && willOverlap){
				if(this.priority >= willOverlap.priority){
					willOverlap.component.stopAudio();
				} else if(this.preventOverlaps === 'append'){
					willOverlap.next.push(soundDefinition);
					return ;
				} else {
					return ;
				}
			}

			value = value || attributes;
			if(value.stop){
				this.stopAudio(sound, value.playthrough);
			} else {
				audio = createjs.Sound.createInstance(sound, value.startTime || attributes.startTime || null, value.duration || attributes.duration || null);
				
				// Adding object on to SoundInstance for delayed playback and storing properties apart from instance due to channel overrides.
				audio.options = {
					interrupt:  value.interrupt || attributes.interrupt || defaultSettings.interrupt,
					delay:      value.delay     || attributes.delay  || defaultSettings.delay,
					loop:       value.loop      || attributes.loop   || defaultSettings.loop,
					offset:     value.offset    || attributes.offset || defaultSettings.offset,
					volume:     (typeof value.volume !== 'undefined')? value.volume: ((typeof attributes.volume !== 'undefined')? attributes.volume: defaultSettings.volume),
					pan:        value.pan       || attributes.pan    || defaultSettings.pan,
					mute:       value.mute      || attributes.mute   || defaultSettings.mute,
					paused:     value.paused    || attributes.paused || defaultSettings.paused
				};
				
				next          = value.next      || attributes.next   || defaultSettings.next;
				events        = value.events    || attributes.events || defaultSettings.events;

				if(!this.mixer.paused && !this.channelSettings.paused && !audio.options.paused){
					audio.play(audio.options);
				} else {
					audio.options.unplayed = true;
				}
				this.setChannelSettings(audio);
				
				if(this.preventOverlaps && (this.preventOverlaps !== 'ignore')){
					this.priorityTrack = {
						audio: audio,
						component: this,
						priority: this.priority,
						next: next || []
					};
				}

				if(events){
					audio.sequenceEvents = [];
					for(var i = 0; i < events.length; i++){
						audio.sequenceEvents.push({
							event: events[i].event,
							time: events[i].time || 0,
							message: events[i].message
						});
					}
					audio.sequenceEvents.sort(sortByTime);
				}

				audio.addEventListener('complete', function(){
					self.onComplete(audio, next);
				});

				if(audio.playState === 'playFailed'){
					if(this.owner.debug){
						console.warn('Unable to play "' + sound + '".', audio);
					}
					this.onComplete(audio, next);
				} else {
					audio.soundId = sound;
					this.activeAudioClips.push(audio);
				}
			}
		};
	},
	createTest = function(testStates, audio, play){
		var states = testStates.replace(/ /g, '').split(',');
		if(testStates === 'default'){
			return function(state){
				play.call(this);
				return testStates;
			};
		} else {
			return function(state){
				for(var i = 0; i < states.length; i++){
					if(!state[states[i]]){
						return false;
					}
				}
				play.call(this);
				return testStates;
			};
		}
	};
	
	return platformer.createComponentClass({
		id: 'audio',
			
		constructor: function(definition){
			var playClip = null;
			
			this.channel = definition.channel || 'default';

			this.activeAudioClips = [];		
	
			this.state = {};
			this.stateChange = false;
			this.currentState = false;
	
			this.forcePlaythrough = this.owner.forcePlaythrough || definition.forcePlaythrough;
			if(typeof this.forcePlaythrough !== 'boolean') {
				this.forcePlaythrough = true;
			}
			
			if(definition.audioMap){
				this.checkStates = [];
				for (var key in definition.audioMap){
					playClip = playSound(definition.audioMap[key]);
					this.addEventListener(key, playClip);
					this.checkStates.push(createTest(key, definition.audioMap[key], playClip));
				}
			}
			
			if(definition.preventOverlaps) {
				this.preventOverlaps = definition.preventOverlaps;
				if(this.preventOverlaps !== 'ignore'){
					if(!channels[this.channel]){
						channels[this.channel] = [];
					}
					channels[this.channel].push(this);
				}
			}
			
			this.priority = definition.priority || 0;
			this.priorityTrack = null;
			
			if(!platformer.game.audioMixer){
				platformer.game.audioMixer = {
					channels: {},
					paused: false,
					getChannel: function(id){
						if(!this.channels[id]){
							this.channels[id] = {
								volume: 1,
								mute: false,
								paused: false,
								pan: 0,
								update: 0
							};
						}

						return this.channels[id];
					}
				};
			}
			this.mixer           = platformer.game.audioMixer;
			this.channelSettings = this.mixer.getChannel(this.channel);
			this.channelUpdate   = this.channelSettings.update;
			this.paused          = this.mixer.paused;
		},

		events: {// These are messages that this component listens for
		    "handle-render": function(resp){
				var self  = this,
				i         = 0,
				audioClip = undefined;
				
				if(this.paused !== this.mixer.paused){
					this.paused = this.mixer.paused;
		 			this.getAllClips(function(clip){
						self.setChannelSettings(clip);
		 			});
		 			// Avoid potential channel check below since we've already handled this for the global pause.
					this.channelUpdate = this.channelSettings.update;
				}
				if(this.paused){
					return;
				}
				
				if(this.channelUpdate !== this.channelSettings.update){
					//Channel settings have changed.
					this.channelUpdate = this.channelSettings.update;
					
		 			this.getAllClips(function(clip){
						self.setChannelSettings(clip);
		 			});
				}
				
	 			this.getAllClips(function(clip){
					self.checkTimeEvents(clip);
	 			});

				if(this.stateChange){
					if(this.checkStates){
						if(this.currentState){
							this.stopAudio(this.currentState.soundId, this.forcePlaythrough);
						}
						this.currentState = false;
						for(i = 0; i < this.checkStates.length; i++){
							audioClip = this.checkStates[i].call(this, this.state);
							if(audioClip){
								this.currentState = audioClip;
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
	 				}
	 			}
	 		},
	 	    
	 		"toggle-mute": function(audioId){
	 			var self = this;
	 			
	 			this.handleClip(audioId, function(clip){
	 				if(clip){
		 				clip.options.mute = !clip.options.mute;
		 				self.setChannelSettings(clip);
	 				}
	 			});
	 		},
	 	    
	 		"stop-audio": function(audioId){
	 			if(!audioId){
		 			this.stopAudio();
	 			} else if(typeof audioId === 'string'){
		 			this.stopAudio(audioId);
	 			} else {
		 			this.stopAudio(audioId.audioId || false, audioId.playthrough || false);
	 			}
	 		},
	 	    
	 		"mute-audio": function(audioId){
	 			var self = this;
	 			
	 			this.handleClip(audioId, function(clip){
	 				if(clip){
		 				clip.options.mute = true;
		 				self.setChannelSettings(clip);
	 				}
	 			});
	 		},
	 	    
	 		"unmute-audio": function(audioId){
	 			var self = this;
	 			
	 			this.handleClip(audioId, function(clip){
	 				if(clip){
		 				clip.options.mute = false;
		 				self.setChannelSettings(clip);
	 				}
	 			});
	 		},
	 	    
	 		"pause-audio": function(audioId){
	 			var self = this;
	 			
	 			this.handleClip(audioId, function(clip){
	 				if(clip){
		 				clip.options.paused = true;
		 				self.setChannelSettings(clip);
	 				}
	 			});
	 		},
	 	    
	 		"unpause-audio": function(audioId){
	 			var self = this;
	 			
	 			this.handleClip(audioId, function(clip){
	 				if(clip){
		 				clip.options.paused = false;
		 				self.setChannelSettings(clip);
	 				}
	 			});
	 		},
	 		
	 		"set-volume": function(volume){
	 			var self = this,
	 			vol      = 0,
	 			handler  = function(clip){
	 				clip.options.volume = vol;
	 				self.setChannelSettings(clip);
	 			};
	 			
	 			if(typeof volume === 'number'){
	 				vol = volume;
		 			this.getAllClips(handler);
	 			} else if(volume.volume){
	 				vol = volume.volume;
	 				this.handleClip(volume.soundId, handler);
	 			}	 			
	 		},

	 		"audio-stop":        function(){console.warn(this.owner.type + " - audio component: The 'audio-stop' event has been deprecated. Use 'stop-audio' instead.");},
	 		"audio-mute-toggle": function(){console.warn(this.owner.type + " - audio component: The 'audio-mute-toggle' event has been deprecated. Use 'toggle-mute' instead.");},
	 		"audio-mute":        function(){console.warn(this.owner.type + " - audio component: The 'audio-mute' event has been deprecated. Use 'mute-audio' instead.");},
	 		"audio-unmute":      function(){console.warn(this.owner.type + " - audio component: The 'audio-unmute' event has been deprecated. Use 'unmute-audio' instead.");},
	 		"audio-pause":       function(){console.warn(this.owner.type + " - audio component: The 'audio-pause' event has been deprecated. Use 'pause-audio' instead.");},
	 		"audio-unpause":     function(){console.warn(this.owner.type + " - audio component: The 'audio-unpause' event has been deprecated. Use 'unpause-audio' instead.");}
		},
		
		methods: {
			handleClip: function(audioId, handler){
				if (typeof audioId === 'string') {
					this.getClipById(audioId, handler);
				} else {
		 			this.getAllClips(handler);
				}
			},
			
			getClipById: function(id, onGet){
				var i = 0,
				clips = this.activeAudioClips;
				
				for (; i < clips.length; i++){
					if(clips[i].soundId === id){
						if (onGet) onGet(clips[i]);
						return clips[i];
					}
				}
				
				if(onGet) onGet(null);

				return null;
			},
			
			getAllClips: function(onGet){
				var i = 0,
				clips = this.activeAudioClips;
				
				if (onGet) for (; i < clips.length; i++) onGet(clips[i]);

				return clips;
			},
			
			setChannelSettings: function(clip){
				var channel = this.channelSettings,
				pause       = (this.mixer.paused || channel.paused || clip.options.paused);
				
				clip.setMute(clip.options.mute || channel.mute);
				clip.setPan((clip.options.pan + channel.pan) / 2);
				clip.setVolume(clip.options.volume * channel.volume);
				if(clip.paused !== pause){
					if(pause){
						clip.pause();
					} else {
						clip.resume();
					}
				} else if(!pause && clip.options.unplayed){
					delete clip.options.unplayed;
					clip.play(clip.options);
				}
			},
			
			stopAudio: function(audioId, playthrough){
				var i = 0,
				clips = this.activeAudioClips,
				self  = this;
				
	 			if(audioId){
		 			for (i = clips.length - 1; i >= 0; i--){
		 				if(clips[i].soundId === audioId){
		 					if(playthrough){
		 						clips[i].addEventListener('loop', function(instance){
		 							self.stopAudioInstance(instance.currentTarget);
		 						});
		 					} else {
				 				clips[i].stop();
				 				clips.splice(i, 1);
			 					if(this.priorityTrack && (clips[i] === this.priorityTrack.audio)){
			 						this.priorityTrack = null;
			 					}
		 					}
		 				}
		 			}
	 			} else {
		 			if(playthrough){
			 			for (; i < clips.length; i++){
	 						clips[i].addEventListener('loop', function(instance){
	 							self.stopAudioInstance(instance.currentTarget);
	 						});
			 			}
		 			} else {
			 			for (; i < this.activeAudioClips.length; i++){
			 				clips[i].stop();
			 			}
			 			clips.length = 0;
 						this.priorityTrack = null;
		 			}
	 			}
			},
			
			stopAudioInstance: function(instance){
				var i = 0,
				clips = this.activeAudioClips;
				
	 			for (i = clips.length - 1; i >= 0; i--){
	 				if(clips[i] === instance){
		 				clips[i].stop();
		 				clips.splice(i, 1);
	 					if(this.priorityTrack && (clips[i] === this.priorityTrack.audio)){
	 						this.priorityTrack = null;
	 					}
	 				}
	 			}
			},
			
			checkTimeEvents: function(audioClip, finished){
				var events  = audioClip.sequenceEvents,
				currentTime = 0;
				
				if(events && events.length){
					currentTime = audioClip.getPosition();

					while(events.length && (finished || (events[0].time <= currentTime))){
						this.owner.trigger(events[0].event, events[0].message);
						events.splice(0,1);
					}
				}
			},
		
			onComplete: function(audioClip, next){
				//clean up active clips
				this.removeClip(audioClip);
				
				this.checkTimeEvents(audioClip, true);
				
				this.owner.triggerEvent('clip-complete');
				
				if(this.priorityTrack && (audioClip === this.priorityTrack.audio)){
					next = this.priorityTrack.next;
					this.priorityTrack = null;
				}
				
				if(next && next.length){
					if(typeof next === 'string'){
						(playSound(next)).call(this);
					} else {
						var arr = next.slice();
						arr.splice(0,1);
						if(arr.length > 0){
							(playSound(next[0])).call(this, {'next': arr});
						} else {
							(playSound(next[0])).call(this);
						}
					}
				} else {
					this.owner.triggerEvent('sequence-complete');
				}
			},
			
			removeClip: function(audioClip){
				for (var i = 0; i < this.activeAudioClips.length; i++){
					if (this.activeAudioClips[i] === audioClip){
						this.activeAudioClips.splice(i,1);
						break;
					}
				}
			},
			
			destroy: function(){
				this.stopAudio();
				if(this.preventOverlaps){
					for(var i in channels[this.channel]){
						if(channels[this.channel][i] === this){
							channels[this.channel].splice(i, 1);
							break;
						}
					}
				}
			}
		}
	});
})();	
