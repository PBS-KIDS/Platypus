platformer.classes.scene = (function(){
	var scene = function(definition, rootElement){
		var layers = definition.layers;
		this.rootElement = rootElement;
		this.layers = [];
		for(var layer in layers){
			this.layers.push(new platformer.classes.layer(layers[layer], this.rootElement));
		}
	};
	var proto = scene.prototype;
	
	proto.tick = function(deltaT){
		for(var layer in this.layers){
			this.layers[layer].tick(deltaT);
		}
	};
	
	proto.trigger = function(eventId, event){
		for(var layer in this.layers){
			this.layers[layer].trigger(eventId, event);
		}
	};
	
	return scene;
})();
