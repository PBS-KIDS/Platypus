gws.classes.scene = (function(){
	var scene = function(definition, rootElement){
		var layers = definition.layers;
		
		this.rootElement = rootElement;
		this.layers = [];
		for(var layer in layers){
			this.layers.push(new gws.classes.layer(layers[layer], this.rootElement));
		}
	},
	proto = scene.prototype;
	
	proto.tick = function(){
		for(var layer in this.layers){
			this.layers[layer].tick();
		}
	};
	
	proto.triggerInputEvent = function(eventId, event){
		for(var layer in this.layers){
			this.layers[layer].trigger(eventId, event);
		}
	};
	
	return scene;
})();
