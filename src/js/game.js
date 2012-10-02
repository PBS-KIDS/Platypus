gws.classes.game = (function(){
	
	var game = function (definition){
		this.currentScene = undefined;
		this.settings = definition;
		this.rootElement = document.createElement('div');
		this.rootElement.id = gws.settings.global.rootElement;
		document.getElementsByTagName('body')[0].appendChild(this.rootElement);
		
		this.loadScene(definition.global.initialScene);

		var self = this;
		this.input = new gws.classes.input(function(eventId, event){
			self.currentScene.triggerInputEvent(eventId, event);
		});
		
		this.prevTime = 0;
		this.timingFunction = false;
		if (performance && performance.webkitNow)
		{
			this.timingFunction = function() {return performance.webkitNow();};
		} else if (performance && performance.now) {
			this.timingFunction = function() {return performance.now();};
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
		this.currentScene = new gws.classes.scene(this.settings.scenes[sceneName], this.rootElement);
	};
	
	return game;
})();