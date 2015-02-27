/**
# COMPONENT **audio-mobile**
Activates audio on mobile devices by handling asset loading after a user interaction. This component should be included on the same entity as the asset loader and have a dom-element component to capture the user interaction.

Example "progress-bar" entity that could use this component:

	{
	    "id": "progress-bar",
	    "components":[{
	        "type": "audio-mobile"
	    },{
	        "type": "asset-loader",
	        "progressBar": "progress-bar",
	        "automatic": false
	    },{
	        "type": "dom-element",
	        "id": "mobile-start",
	        "innerHTML": "Play",
	        "className": "mobile-start",
	        "updateClassName": true,
	        "ontouchstart": "activate-audio"
	    },{
	        "type": "dom-element",
	        "id": "progress-bar-container",
	        "updateClassName": true
	    },{
	        "type": "dom-element",
	        "id": "progress-bar",
	        "parent": "progress-bar-container"
	    },{
	        "type": "change-scene",
	        "scene": "menu",
	        "aliases": {"complete": "new-scene"}
	    }]
	}

To make the mobile-start button appear on mobile devices, the CSS might look something like this:

	.mobile-start {
	  display: none;
	  position: absolute;
	  top: 11em;
	  left: 50%;
	  width: 3em;
	  text-align: center;
	  margin-left: -1.5em;
	  background: rgba(255,255,255,0.4);
	  cursor: pointer;
	}
	
	.mobile-start.mobile {
	  display: block;
	}
	
	#progress-bar-container {
	  position: absolute;
	  text-align: center;
	  width: 4.6em;
	  top: 11em;
	  height: 0.75em;
	  left: 50%;
	  margin-left: -2.3em;
	  background: #000;
	}
	
	#progress-bar-container.mobile {
	  display: none;
	}
	
	#progress-bar {
	  left: 0;
	  top: 0;
	  position: absolute;
	  height: 100%;
	  width: 0;
	  background: #fff;
	}

## Dependencies:
- [createjs.SoundJS] [link1] - This component requires the SoundJS library to be included for audio functionality.

## Messages

### Listens for:
- **load** - On hearing this event, this component will trigger "load-assets" on non-mobile devices.
- **activate-audio** - On hearing this event, this component will play audio on iOS devices to force audio file download and then trigger "load-assets".

### Local Broadcasts:
- **low-quality-audio** - This message is triggered if the mobile device does not support the Web Audio API. This is useful if audio behavior should be augmented in some way when this is the case.
- **load-assets** - This message is triggered automatically when not on a mobile device. Otherwise it triggers when "activate-audio" has been triggered.

## JSON Definition
    {
      "type": "audio-mobile"

      "audioId": "audio-sprite"
      // Required. The SoundJS audio id for the audio clip to be enabled for future play-back.
    }

[link1]: http://www.createjs.com/Docs/SoundJS/module_SoundJS.html
*/
(function(){
	/*********************************************************************
	 TODO: Place helper functions here that are suitable across all
	       component instances and should never be accessible from
	       outside this component.
	*********************************************************************/

	return platformer.createComponentClass({
		
		id: 'audio-mobile',
		
		constructor: function(definition){
			this.audioId = definition.audioId;
		},

		events: {// These are messages that this component listens for
			"load": function(){
				if(platformer.game.settings.supports.mobile){
					this.owner.state.mobile = true;
					if((platformer.game.settings.supports.android || platformer.game.settings.supports.iOS) && !platformer.game.settings.supports.audioAPI){
						this.owner.triggerEvent('low-quality-audio');
					}
				} else {
					this.owner.triggerEvent('load-assets');
				}
			},
			"activate-audio": function(){
				var audio = platformer.game.settings.assets[this.audioId],
				instance  = null;
				
				if(audio && platformer.game.settings.supports.iOS && !platformer.game.settings.supports.audioAPI){
					delete platformer.game.settings.assets[this.audioId];
					
					audio.data.channels = 1;
					audio.src = audio.src.replace('ogg', 'm4a');
					createjs.Sound.registerSounds([audio]);
					
					instance = createjs.Sound.play(this.audioId);
					console.log('Initializing iOS fallback audio.');
					if(instance.playState === 'playSucceeded'){
						instance.stop();
					}
				}
				
				this.owner.state.mobile = false;
				this.owner.triggerEvent('load-assets');
			}
		}
	});
})();
