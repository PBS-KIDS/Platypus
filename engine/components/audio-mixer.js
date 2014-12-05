/**
# COMPONENT **audio-mixer**
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
	return platformer.createComponentClass({
		id: 'audio-mixer',
			
		constructor: function(definition){
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
			
			this.mixer = platformer.game.audioMixer;
 			this.owner.state.muted  = createjs.Sound.getMute();
 			this.owner.state.paused = this.mixer.paused;
		},

		events: {// These are messages that this component listens for
	 		"toggle-mute": function(channelId){
	 			var mute = false,
	 			channel  = null;
	 			
	 			if(channelId){
	 				channel = this.mixer.getChannel(channelId);
	 				channel.mute = !channel.mute;
	 				channel.update += 1;
	 			} else {
	 				mute = !createjs.Sound.getMute();
		 			this.owner.state.muted = mute;
		 			createjs.Sound.setMute(mute);
	 			}
	 		},
	 	    
	 		"mute-audio": function(channelId){
	 			var channel = null;
	 			
	 			if(channelId){
	 				channel = this.mixer.getChannel(channelId);
	 				if(!channel.mute){
		 				channel.mute = true;
		 				channel.update += 1;
	 				}
	 			} else {
		 			createjs.Sound.setMute(true);
		 			this.owner.state.muted = true;
	 			}
	 		},
	 	    
	 		"unmute-audio": function(channelId){
	 			var channel = null;
	 			
	 			if(channelId){
	 				channel = this.mixer.getChannel(channelId);
	 				if(channel.mute){
	 					channel.mute = false;
		 				channel.update += 1;
	 				}
	 			} else {
		 			createjs.Sound.setMute(false);
		 			this.owner.state.muted = false;
	 			}
	 		},

	 		"pause-audio": function(channelId){
	 			var channel = null;
	 			
	 			if(channelId){
	 				channel = this.mixer.getChannel(channelId);
	 				if(!channel.paused){
	 					channel.paused = true;
		 				channel.update += 1;
	 				}
	 			} else {
		 			this.mixer.paused = true;
		 			this.owner.state.paused = true;
	 			}
	 		},
	 	    
	 		"unpause-audio": function(channelId){
	 			var channel = null;
	 			
	 			if(channelId){
	 				channel = this.mixer.getChannel(channelId);
	 				if(channel.paused){
	 					channel.paused = false;
		 				channel.update += 1;
	 				}
	 			} else {
		 			this.mixer.paused = false;
		 			this.owner.state.paused = false;
	 			}
	 		},
	 		
	 		"set-volume": function(volume){
	 			var channel = null;
	 			
	 			if(volume && volume.channelId){
	 				channel = this.mixer.getChannel(channelId);
	 				if(channel.volume !== volume.volume){
	 					channel.volume = volume.volume;
		 				channel.update += 1;
	 				}
	 			} else {
		 			createjs.Sound.setVolume(volume);
	 			}
	 		}
		}
	});
})();	
