/**
# CLASS game
This class is used to create the `platformer.game` object. The `game` object handles loading [[Scene]]s and transitions between scenes. It also accepts external events and passes them on to the current scene.

## Methods
- **constructor** - Creates an object from the game class.
  > @param definition (object) - Collection of settings from config.json.
- **tick** - Called by the CreateJS ticker. This calls tick on the scene.
  > @param deltaT (number) - The time passed since the last tick.
- **loadScene** - Loads a scene. If there's a transition, performs the transition.
  > @param sceneId (string) - The scene to load.
  > @param transition (string) - What type of transition to make. Currently there are: 'fade-to-black' and 'instant'
- **loadNextScene** - Sets the currentScene to the specified scene. Called by loadScene, shouldn't be called on its own.
  > @param sceneId (string) - The scene to load.
- **completeSceneTransition** - Ends the transition and destroys the old scene. Called when the scene effect is finished.
- **addEventListener** - Adding event listeners to the specified element and assigning callback functions.
  > @param element (DOM element) - The element to add the eventListener to.
  > @param event (DOM events) - The event to listen for.
  > @param callback (function) - The function to call when the event occurs.
- **destroy** - Destroys the object so that it's ready to garbage collect.

## Helper Function
- **bindEvent** - Returns a function which takes in an event and calls the callback function passing it the eventId and the event.
  > @param eventId (string) - The id of the event we're binding to.
  > @param callback (function) - The function to call.
*/

platformer.classes.game = (function(){
	var bindEvent = function(eventId, callback){return function(event){callback(eventId, event);};};
	var game      = function (definition){
		this.currentScene = undefined;
		this.tickContent = {deltaT: 0};
		this.settings = definition;
		if(document.getElementById(definition.global.rootElement || "root")){
			this.rootElement = document.getElementById(definition.global.rootElement || "root");
		} else {
			this.rootElement = document.createElement('div');
			this.rootElement.id = definition.global.rootElement || "root";
			document.getElementsByTagName('body')[0].appendChild(this.rootElement);
		}
		
		this.loadScene(definition.global.initialScene);
		
		// Send the following events along to the scene to handle as necessary:
		var self = this,
		callback = function(eventId, event){
			self.currentScene.trigger(eventId, event);
		};
		this.bindings = [];
		this.addEventListener(window, 'keydown', callback);
		this.addEventListener(window, 'keyup',   callback);

		// If aspect ratio of game area should be maintained on resizing, create new callback to handle it
		if(definition.global.aspectRatio){
			callback = function(eventId, event){
				var element = self.rootElement;
				var ratio   = definition.global.aspectRatio;
				var newW = window.innerWidth;
				var newH = window.innerHeight;
				if(definition.global.maxWidth && (definition.global.maxWidth < newW)){
					newW = definition.global.maxWidth;
				}
				var bodyRatio = newW / newH;
				if (bodyRatio > ratio)
				{  //Width is too wide
					element.style.height = newH + 'px';
				    newW = newH * ratio;
				    element.style.width = newW + 'px';
				} else {  //Height is too tall
					element.style.width = newW + 'px';
				    newH = newW / ratio;
				    element.style.height = newH + 'px';
				}
				if(definition.global.resizeFont){
					element.style.fontSize = Math.round(newW / 100) + 'px';
				}
				element.style.marginTop = '-' + Math.round(newH / 2) + 'px';
				element.style.marginLeft = '-' + Math.round(newW / 2) + 'px';
				self.currentScene.trigger(eventId, event);
			};
			callback('resize');
		} else if(definition.global.resizeFont) {
			callback = function(eventId, event){
				self.rootElement.style.fontSize = parseInt(window.innerWidth / 100) + 'px';
				self.currentScene.trigger(eventId, event);
			};
			callback('resize');
		}
		this.addEventListener(window, 'orientationchange', callback);
		this.addEventListener(window, 'resize',            callback);
	};
	var proto = game.prototype;
	
	proto.tick = function(deltaT){
		this.tickContent.deltaT = deltaT;
		
		if(this.currentScene){
			this.currentScene.trigger('tick', this.tickContent);
		}
	};
	
	proto.loadScene = function(sceneId, transition){
		var self = this;
		this.inTransition = true;
		this.leavingScene = this.currentScene;
		switch(transition){
		case 'fade-to-black':
			var element = document.createElement('div');
			this.rootElement.appendChild(element);
			element.style.width = '100%';
			element.style.height = '100%';
			element.style.position = 'absolute';
			element.style.zIndex = '12';
			element.style.opacity = '0';
			element.style.background = '#000';
			new createjs.Tween(element.style).to({opacity:0}, 500).to({opacity:1}, 500).call(function(t){
				self.loadNextScene(sceneId);
			}).wait(500).to({opacity:0}, 500).call(function(t){
				self.rootElement.removeChild(element);
				element = undefined;
				self.completeSceneTransition();
			});
			break;
		case 'instant':
		default:
			this.loadNextScene(sceneId);
			this.completeSceneTransition();
		}
	};
	
	proto.loadNextScene = function(sceneId){
		this.currentScene = new platformer.classes.scene(this.settings.scenes[sceneId], this.rootElement);
	};
	
	proto.completeSceneTransition = function(){
		this.inTransition = false;
		if(this.leavingScene){
			this.leavingScene.destroy();
			this.leavingScene = false;
		}
	};
	
	proto.addEventListener = function(element, event, callback){
		this.bindings[event] = {element: element, callback: bindEvent(event, callback)};
		element.addEventListener(event, this.bindings[event].callback, true);
	};
	
	proto.destroy = function ()
	{
		for (var binding in this.bindings){
			element.removeEventListener(this.bindings[binding].element, this.bindings[binding].callback, true);
		}
		this.bindings.length = 0;
	};
	
	return game;
})();