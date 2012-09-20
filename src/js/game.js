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
	},
	proto = game.prototype;
	
	proto.tick = function(){
		if(this.currentScene) this.currentScene.tick();
	};
	
	proto.loadScene = function(sceneName){
		this.currentScene = new gws.classes.scene(this.settings.scenes[sceneName], this.rootElement);
	};
	
	return game;
})();