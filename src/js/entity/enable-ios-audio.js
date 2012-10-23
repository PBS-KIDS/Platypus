platformer.components['enable-ios-audio'] = (function(){
	var iOSAudioEnabled = false, debug = false,
	component = function(owner, definition){
		var self = this;
		
		this.owner = owner;
		
		if(!iOSAudioEnabled){
			this.touchOverlay        = document.createElement('div');
			debug = this.touchOverlay;
			this.touchOverlay.width  = '100%';
			this.touchOverlay.height = '100%';
			this.owner.rootElement.appendChild(this.touchOverlay);
			enableIOSAudio(this.touchOverlay, definition.audioId, function(){
				self.removeComponent();
			});
		} else {
			this.removeComponent();
		}
	},
	enableIOSAudio  = function(element, audioId, functionCallback){
		var callback = false,
	    click        = false;
		
		iOSAudioEnabled = true;
		click = function(e){
			var cjsAudio = createjs.SoundJS.play(audioId),
			audio        = cjsAudio.tag,
			forceStop    = function () {
			    audio.removeEventListener('play', forceStop, false);
			    audio.pause();
			    debug.innerHTML += 'f';
			},
			progress  = function () {
			    audio.removeEventListener('canplaythrough', progress, false);
			    if (callback) callback();
			    debug.innerHTML += 'g';
			};
			
			if(cjsAudio.playState === 'playSucceeded'){
				cjsAudio.stop();
			} else {
				debug.innerHTML = 'a';

				audio.addEventListener('play', forceStop, false);
			    audio.addEventListener('canplaythrough', progress, false);

			    try {
					audio.play();
					debug.innerHTML += 'b';
			    } catch (e) {
			    	callback = function () {
			    		debug.innerHTML += 'd';
			    		callback = false;
			    		audio.play();
			    		debug.innerHTML += 'e';
			    	};
			    	debug.innerHTML += 'c';
			    }
			}
			element.removeEventListener('touchstart', click, false);
			if(functionCallback){
				functionCallback();
			}
		};
		element.addEventListener('touchstart', click, false);
	},
	proto = component.prototype;
	
	proto.removeComponent = function(){
		this.owner.removeComponent(this);
	};
	
	proto.destroy = function(){
		this.owner.rootElement.removeChild(this.touchOverlay);
		this.touchOverlay = undefined;
	};
	
	return component;
})();
