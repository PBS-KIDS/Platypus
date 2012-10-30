platformer.classes.scene = (function(){
	var scene = function(definition, rootElement){
		var layers = definition.layers,
		supportedLayer = true;
		this.rootElement = rootElement;
		this.layers = [];
		for(var layer in layers){
			supportedLayer = true;
			if(layers[layer].filter){
				if(layers[layer].filter.includes){
					supportedLayer = false;
					for(var filter in layers[layer].filter.includes){
						if(platformer.settings.supports[layers[layer].filter.includes[filter]]){
							supportedLayer = true;
						}
					}
				}
				if(layers[layer].filter.excludes){
					for(var filter in layers[layer].filter.excludes){
						if(platformer.settings.supports[layers[layer].filter.excludes[filter]]){
							supportedLayer = false;
						}
					}
				}
			}
			if (supportedLayer){
				this.layers.push(new platformer.classes.layer(layers[layer], this.rootElement));
			}
		}
	};
	var proto = scene.prototype;
	
	proto.tick = function(deltaT){
		for(var layer in this.layers){
			this.layers[layer].tick(deltaT);
		}
	};

	proto.destroy = function(deltaT){
		for(var layer in this.layers){
			this.layers[layer].destroy();
		}
		this.layers.length = 0;
	};
	
	proto.trigger = function(eventId, event){
		for(var layer in this.layers){
			this.layers[layer].trigger(eventId, event);
		}
	};
	
	return scene;
})();
