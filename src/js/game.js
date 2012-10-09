platformer.classes.game = (function(){
	
	var game = function (definition){
		this.currentScene = undefined;
		this.settings = definition;
		this.rootElement = document.createElement('div');
		this.rootElement.id = definition.global.rootElement;
		document.getElementsByTagName('body')[0].appendChild(this.rootElement);
		
		this.loadScene(definition.global.initialScene);
		
		var self = this;
		this.input = new platformer.classes.input(function(eventId, event){
			self.currentScene.trigger(eventId, event);
		});
		
		this.prevTime = 0;
		this.timingFunction = false;
		if (window.performance && window.performance.webkitNow)
		{
			this.timingFunction = function() {return window.performance.webkitNow();};
		} else if (window.performance && window.performance.now) {
			this.timingFunction = function() {return window.performance.now();};
		} else {
			this.date = new Date();
			this.timingFunction = function() {return this.date.getTime();};
		}
		this.prevTime = this.timingFunction();
	},
	proto = game.prototype;
	
	proto.tick = function(){
		var now = this.timingFunction();
		var deltaT = now - this.prevTime; 
		this.prevTime = now;
		if(this.currentScene) this.currentScene.tick(deltaT);
	};
	
	proto.loadScene = function(sceneName){
		this.currentScene = new platformer.classes.scene(this.settings.scenes[sceneName], this.rootElement);
	};
	
	return game;
})();