(function(){
  var platformer = {};

  PBS = this.PBS || {};
  PBS.KIDS = this.PBS.KIDS || {};
  PBS.KIDS.platformer = platformer;

platformer.settings = {"global":{"initialScene":"scene-1","fps":60,"rootElement":"root"},"aspects":[{"ogg":["firefox","chrome","opera"],"m4a":["ipod","ipad","iphone","android"],"mp3":["msie","safari"]}],"assets":[{"id":"powerup","src":{"ogg":"a/powerup.ogg","mp3":"a/powerup.mp3","m4a":"a/powerup.mp3"}},{"id":"walk","src":{"ogg":"a/walk.ogg","mp3":"a/walk.mp3","m4a":"a/walk.mp3"}},{"id":"jump","src":{"ogg":"a/jump.ogg","mp3":"a/jump.mp3","m4a":"a/jump.mp3"}},{"id":"alpha","src":"i/test.png","data":{"rows":2,"columns":2,"ids":[["horizon","sky"],["ground","rock"]]}},{"id":"buttons","src":"i/buttons.png"},{"id":"mookie-walk","src":"i/mookie.png"},{"id":"tilemap","src":"i/tile-map.png"},{"id":"test","src":"i/test.png"},{"id":"test-animation","src":"i/test-animation.png"}],"classes":{"Game":{"id":"Game","src":"../src/js/game.js"},"Input":{"id":"Input","src":"../src/js/input.js"},"Entity":{"id":"Entity","src":"../src/js/entity.js"},"Layer":{"id":"Layer","src":"../src/js/layer.js"},"Scene":{"id":"Scene","src":"../src/js/scene.js"},"Collision-Shape":{"id":"Collision-Shape","src":"../src/js/collision-shape.js"}},"components":{"layer-controller":{"id":"layer-controller","src":"../src/js/layer/layer-controller.js"},"tiled-loader":{"id":"tiled-loader","src":"../src/js/layer/tiled-loader.js"},"lc-render":{"id":"lc-render","src":"../src/js/layer/lc-render.js"},"lc-logic":{"id":"lc-logic","src":"../src/js/layer/lc-logic.js"},"lc-camera":{"id":"lc-camera","src":"../src/js/layer/lc-camera.js"},"lc-basic-collision":{"id":"lc-basic-collision","src":"../src/js/layer/lc-basic-collision.js"},"audio":{"id":"audio","src":"../src/js/entity/audio.js"},"broadcast-events":{"id":"broadcast-events","src":"../src/js/entity/broadcast-events.js"},"entity-container":{"id":"entity-container","src":"../src/js/entity/entity-container.js"},"entity-controller":{"id":"entity-controller","src":"../src/js/entity/entity-controller.js"},"render-debug":{"id":"render-debug","src":"../src/js/entity/render-debug.js"},"render-tile":{"id":"render-tile","src":"../src/js/entity/render-tile.js"},"render-tiles":{"id":"render-tiles","src":"../src/js/entity/render-tiles.js"},"render-button":{"id":"render-button","src":"../src/js/entity/render-button.js"},"render-animation":{"id":"render-animation","src":"../src/js/entity/render-animation.js"},"logic-hero":{"id":"logic-hero","src":"../src/js/entity/logic-hero.js"},"collision-hero":{"id":"collision-hero","src":"../src/js/entity/collision-hero.js"},"collision-tiles":{"id":"collision-tiles","src":"../src/js/entity/collision-tiles.js"}},"entities":{"tile":{"id":"tile","components":[{"type":"render-tile","spritesheet":"import"}]},"tile-layer":{"id":"tile-layer","components":[{"type":"render-tiles","spritesheet":"import","imageMap":"import"},{"type":"collision-tiles","collisionMap":"import"}]},"render-layer":{"id":"render-layer","components":[{"type":"render-tiles","spritesheet":"import","imageMap":"import"}],"properties":{}},"collision-layer":{"id":"collision-layer","components":[{"type":"collision-tiles","collisionMap":"import"}]},"button-left":{"id":"button-left","components":[{"type":"entity-controller","controlMap":{"mouse:left-button":"pressed"}},{"type":"broadcast-events","events":{"pressed":"button-left"}},{"type":"render-animation","spriteSheet":{"images":["buttons"],"frames":{"width":46,"height":46},"animations":{"default":0}},"state":"default","acceptInput":{"click":true,"touch":true}}],"properties":{"debug-events":["button-left"],"state":false,"x":17,"y":177,"width":46,"height":46}},"button-right":{"id":"button-right","components":[{"type":"entity-controller","controlMap":{"mouse:left-button":"pressed"}},{"type":"broadcast-events","events":{"pressed":"button-right"}},{"type":"render-animation","spriteSheet":{"images":["buttons"],"frames":{"width":46,"height":46},"animations":{"default":1}},"state":"default","acceptInput":{"click":true,"touch":true}}],"properties":{"debug-events":["button-right"],"state":false,"x":257,"y":177,"width":46,"height":46}},"hero":{"id":"hero","components":[{"type":"entity-controller","controlMap":{"key:w":"key-up","key:up-arrow":"key-up","key:a":"key-left","key:left-arrow":"key-left","button-left":"key-left","key:s":"key-down","key:down-arrow":"key-down","key:d":"key-right","key:right-arrow":"key-right","button-right":"key-right"}},{"type":"logic-hero","speed":0.1},{"type":"collision-hero","shape":{"offset":[12,-12],"type":"rectangle","points":[[-8,-12],[8,12]]},"collisionType":"hero","collidesWith":["solid"]},{"type":"render-animation","spriteSheet":{"images":["mookie-walk"],"frames":{"width":26,"height":27,"regY":26},"animations":{"standing-north":[2],"standing-east":[2],"standing-south":[5],"standing-west":[5],"walking-north":{"frames":[0,1,2,3],"frequency":4},"walking-east":{"frames":[0,1,2,3],"frequency":4},"walking-south":{"frames":[7,6,5,4],"frequency":4},"walking-west":{"frames":[7,6,5,4],"frequency":4}}}},{"type":"audio","audioMap":{"walking":"walk","jumping":"jump"}}],"properties":{"x":10,"y":10,"width":16,"height":24,"state":"standing","heading":"south","camera":"locked"}},"block":{"id":"block","components":[{"type":"collision-hero","shape":{"offset":[12,-12],"type":"rectangle","points":[[-12,-12],[12,12]]},"collisionType":"solid"},{"type":"render-animation","spriteSheet":{"images":["tilemap"],"frames":{"width":24,"height":24,"regY":24},"animations":{"tile":9}},"state":"tile"}],"properties":{"x":50,"y":50,"width":24,"height":24}}},"includes":{"EaselJS":{"id":"EaselJS","src":"http://code.createjs.com/easeljs-0.5.0.min.js"},"TweenJS":{"id":"TweenJS","src":"http://code.createjs.com/tweenjs-0.3.0.min.js"},"SoundJS":{"id":"SoundJS","src":"http://code.createjs.com/soundjs-0.3.0.min.js"},"PreloadJS":{"id":"PreloadJS","src":"http://code.createjs.com/preloadjs-0.2.0.min.js"},"Browser":{"id":"Browser","src":"../src/js/browser.js"},"Main":{"id":"Main","src":"../src/js/main.js"},"GameCSS":{"id":"GameCSS","src":"../src/css/game.css"}},"scenes":{"scene-menu":{"layers":[{"id":"buttons","components":[{"type":"lc-logic"},{"type":"lc-render"},{"type":"layer-controller"},{"type":"entity-container","entities":[{"type":"button"}]}]}],"id":"scene-menu"},"scene-1":{"layers":[{"id":"action","components":[{"type":"lc-camera"},{"type":"lc-logic"},{"type":"lc-basic-collision"},{"type":"lc-render"},{"type":"layer-controller"},{"type":"entity-container"},{"type":"tiled-loader","level":"level-1"}]},{"id":"interface","components":[{"type":"lc-camera"},{"type":"lc-logic"},{"type":"lc-render"},{"type":"layer-controller"},{"type":"entity-container","entities":[{"type":"button-left"},{"type":"button-right"}]}]}],"id":"scene-1"}},"levels":{"level-1":{"height":20,"layers":[{"data":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],"height":20,"name":"background","opacity":1,"properties":{"entity":"render-layer"},"type":"tilelayer","visible":true,"width":20,"x":0,"y":0},{"data":[17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,23,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,0,21,23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,22,16,16,16,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,23,0,15,16,16,16,16,16,17,0,15,17,0,0,15,16,16,16,16,22,23,0,0,0,0,0,0,0,0,0,0,23,0,0,0,0,0,0,0,21,23,0,0,0,0,0,0,0,0,0,0,22,17,0,0,0,0,0,0,21,23,0,0,0,0,0,0,0,0,0,0,0,22,17,0,0,0,0,0,21,22,16,16,16,17,0,0,0,0,0,0,0,0,22,16,16,16,17,0,21,23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,5,0,0,0,0,0,0,9,9,0,0,0,0,0,0,0,0,0,0,21,23,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,21,5,0,0,0,0,0,3,3,15,17,3,3,3,0,0,0,0,0,0,4,5,0,0,0,0,0,3,3,21,23,9,9,9,17,0,0,0,0,0,4,23,0,0,0,0,0,3,3,21,23,9,9,15,22,17,9,9,9,9,21,22,16,16,16,16,16,16,16,22,22,16,16,22,22,22,16,16,16,16,22],"height":20,"name":"action","opacity":1,"properties":{"entity":"tile-layer"},"type":"tilelayer","visible":true,"width":20,"x":0,"y":0},{"height":20,"name":"guys","objects":[{"gid":19,"height":0,"name":"","properties":{},"type":"hero","width":0,"x":49,"y":144},{"gid":6,"height":0,"name":"","properties":{},"type":"","width":0,"x":257,"y":156},{"gid":6,"height":0,"name":"","properties":{},"type":"","width":0,"x":281,"y":142},{"gid":6,"height":0,"name":"","properties":{},"type":"","width":0,"x":306,"y":152},{"gid":6,"height":0,"name":"","properties":{},"type":"","width":0,"x":363,"y":266},{"gid":6,"height":0,"name":"","properties":{},"type":"","width":0,"x":47,"y":272},{"gid":6,"height":0,"name":"","properties":{},"type":"","width":0,"x":142,"y":328},{"gid":6,"height":0,"name":"","properties":{},"type":"","width":0,"x":251,"y":449},{"gid":6,"height":0,"name":"","properties":{},"type":"","width":0,"x":424,"y":428},{"gid":12,"height":0,"name":"","properties":{},"type":"","width":0,"x":167,"y":192},{"gid":18,"height":0,"name":"","properties":{},"type":"","width":0,"x":409,"y":191},{"gid":18,"height":0,"name":"","properties":{},"type":"","width":0,"x":409,"y":166},{"gid":24,"height":0,"name":"","properties":{},"type":"","width":0,"x":364,"y":193},{"gid":28,"height":0,"name":"","properties":{},"type":"","width":0,"x":144,"y":384},{"height":37,"name":"","properties":{},"type":"","width":35,"x":419,"y":64},{"height":29,"name":"","properties":{},"type":"","width":46,"x":73,"y":402},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":96,"y":288},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":192,"y":384},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":144,"y":360},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":216,"y":360},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":120,"y":456},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":96,"y":264},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":216,"y":384},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":120,"y":432},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":120,"y":408},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":72,"y":456},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":96,"y":456},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":240,"y":384},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":288,"y":240},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":288,"y":216},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":288,"y":192},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":96,"y":144},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":360,"y":72}],"opacity":1,"type":"objectgroup","visible":true,"width":20,"x":0,"y":0}],"orientation":"orthogonal","properties":{"timer":"12"},"tileheight":24,"tilesets":[{"firstgid":1,"image":"../src/images/tile-map.png","imageheight":96,"imagewidth":144,"margin":0,"name":"tilemap","properties":{},"spacing":0,"tileheight":24,"tileproperties":{"11":{"entity":"sign"},"17":{"entity":"enemy"},"18":{"entity":"mookie"},"23":{"entity":"flower"},"5":{"entity":"gem"},"9":{"entity":"block"}},"tilewidth":24},{"firstgid":25,"image":"../src/images/test.png","imageheight":48,"imagewidth":48,"margin":0,"name":"test","properties":{},"spacing":0,"tileheight":24,"tileproperties":{"3":{"a":"b"}},"tilewidth":24}],"tilewidth":24,"version":1,"width":20,"id":"level-1"}}};
platformer.classes = {};

/*--------------------------------------------------
 *   Game - ../src/js/game.js
 */
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

/*--------------------------------------------------
 *   Input - ../src/js/input.js
 */
/*
 * INPUT
 */

platformer.classes.input = (function(){
	var bindEvent = function(eventId, callback){return function(event){callback(eventId, event);};},
	input = function (eventCallback){
		this.mouseX = 0;
		this.mouseY = 0;
		
		var element = this.element = window,
		self = this,
//		events = ['keydown', 'keyup', 'mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend', 'touchcancel'],
		events = ['keydown', 'keyup'],
		bindings = this.bindings = [];
		
		for(eventIndex in events){
			bindings[events[eventIndex]] = bindEvent(events[eventIndex], eventCallback);
			element.addEventListener(events[eventIndex], bindings[events[eventIndex]], true);
		}
	},
	proto = input.prototype;
	
	proto.destroy = function ()
	{
		var element = this.element;
		
		for (binding in this.bindings){
			element.removeEventListener(binding, this.bindings[binding], true);
		}
	};
	
	return input;
})();

/*--------------------------------------------------
 *   Entity - ../src/js/entity.js
 */
platformer.classes.entity = (function(){
	var entity = function(definition, instanceDefinition){
		var self             = this,
		index                = undefined,
		componentDefinition  = undefined,
		def                  = definition || {},
		componentDefinitions = def.components || [],
		defaultProperties    = def.properties || {},
		instance             = instanceDefinition || {},
		instanceProperties   = instance.properties || {};
		
		self.components = [];
		self.messages   = [];
		self.type = def.id;

		for (index in defaultProperties){ // This takes the list of properties in the JSON definition and appends them directly to the object.
			self[index] = defaultProperties[index];
		}
		for (index in instanceProperties){ // This takes the list of options for this particular instance and appends them directly to the object.
			self[index] = instanceProperties[index];
		}
		
		for (index in componentDefinitions){
			componentDefinition = componentDefinitions[index];
			if(platformer.components[componentDefinition.type]){
				self.addComponent(new platformer.components[componentDefinition.type](self, componentDefinition));
			} else {
				console.warn("Component '" + componentDefinition.type + "' is not defined.", componentDefinition);
			}
		}
		
		self.trigger('load');
	};
	var proto = entity.prototype;
	
	proto.addComponent = function(component){
	    this.components.push(component);
	    return component;
	};

	proto.removeComponent = function(component){
	    for (var index in this.components){
		    if(this.components[index] === component){
		    	this.components.splice(index, 1);
		    	component.destroy();
			    return component;
		    }
	    }
	    return false;
	};
	
	proto.bind = function(messageId, func){
		if(!this.messages[messageId]) this.messages[messageId] = [];
		this.messages[messageId].push(func);
	};
	
	proto.unbind = function(messageId, func){
		if(!this.messages[messageId]) this.messages[messageId] = [];
		for (var x in this.messages[messageId]){
			if(this.messages[messageId][x] === func){
				this.messages[messageId].splice(x,1);
				break;
			}
		}
	};
	
	proto.trigger = function(messageId, value){
		var i = 0;
		if(this.messages[messageId]){
			for (i = 0; i < this.messages[messageId].length; i++){
				this.messages[messageId][i](value);
			}
		}
		if(this['debug']){
			if(i){
				console.log('Entity "' + this.type + '": Event "' + messageId + '" has ' + i + ' subscriber' + ((i>1)?'s':'') + '.', value);
			} else {
				console.warn('Entity "' + this.type + '": Event "' + messageId + '" has no subscribers.', value);
			}
		}
	};
	
	proto.getMessageIds = function(){
		var messageIds = [];
		for (var messageId in this.messages){
			messageIds.push(messageId);
		}
		return messageIds;
	};
	
	proto.destroy = function(){
		for (var x in this.components)
		{
			this.removeComponent(this.components[x]);
		}
	};
	
	return entity;
})();

/*--------------------------------------------------
 *   Layer - ../src/js/layer.js
 */
platformer.classes.layer = (function(){
	var layer = function(definition, rootElement){
		var componentDefinitions = definition.components,
		componentDefinition = undefined;
		
		this.type = definition.id || 'layer';
		
		this.rootElement = rootElement;
		this.components = [];
		this.tickMessages = [];
		this.messages   = [];
		
		for (var index in componentDefinitions){
			componentDefinition = componentDefinitions[index];
			this.addComponent(new platformer.components[componentDefinition.type || componentDefinition.id](this, componentDefinition));
		}
		
		this.trigger('load');
	},
	proto = layer.prototype;
	
	proto.tick = function(deltaT){
		for(var message in this.tickMessages){
			this.trigger(this.tickMessages[message], deltaT);
		}
	};
	
	proto.addComponent = function(component){
		var alreadyListed = false,
		i = 0,
		j = 0;
		this.components.push(component);
	    if(component.tickMessages){ //component wants to hear these messages every tick
	    	for (i in component.tickMessages){
	    		alreadyListed = false;
	    		for (j in this.tickMessages){
	    			if(component.tickMessages[i] === this.tickMessages[j]){
	    				alreadyListed = true;
	    			}
	    		}
	    		if(!alreadyListed){
	    			this.tickMessages.push(component.tickMessages[i]);
	    		}
	    	}
	    }
	    return component;
	};

	proto.removeComponent = function(component){
	    for (var index in this.components){
		    if(this.components[index] === component){
		    	this.components.splice(index, 1);
		    	component.destroy();
			    return component;
		    }
	    }
	    return false;
	};
	
	proto.bind = function(message, func){
		if(!this.messages[message]) this.messages[message] = [];
		this.messages[message].push(func);
	};
	
	proto.unbind = function(message, func){
		if(!this.messages[message]) this.messages[message] = [];
		for (var messageIndex in this.messages[message]){
			if(this.messages[message][messageIndex] === func){
				this.messages[message].splice(messageIndex,1);
				break;
			}
		}
	};
	
	proto.trigger = function(messageId, value){
		var i = 0;
		if(this.messages[messageId]){
			for (i = 0; i < this.messages[messageId].length; i++){
				this.messages[messageId][i](value);
			}
		}
		if(this['debug']){
			if(i){
				console.log('Layer "' + this.type + '": Event "' + messageId + '" has ' + i + ' subscriber' + ((i>1)?'s':'') + '.', value);
			} else {
				console.warn('Layer "' + this.type + '": Event "' + messageId + '" has no subscribers.', value);
			}
		}
	};
	
	return layer;
})();

/*--------------------------------------------------
 *   Scene - ../src/js/scene.js
 */
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


/*--------------------------------------------------
 *   Collision-Shape - ../src/js/collision-shape.js
 */
platformer.classes.collisionShape = (function(){
	var collisionShape = function(location, type, points, offset, radius){
		this.x = location[0];
		this.y = location[1];
		this.prevX = location[0];
		this.prevY = location[1];
		this.offset = offset || [0,0];
		this.type = type || 'rectangle';
		this.subType = '';
		this.points = points; //Points should distributed as if the 0,0 is the focal point of the object.
		this.radius = radius || 0;
		this.aABB = {};
		this.aABBPos = {};
		switch (this.type)
		{
		case 'rectangle': //need TL and BR points
			this.aABB.left = this.points[0][0];
			this.aABB.right = this.points[1][0];
			this.aABB.top = this.points[0][1];
			this.aABB.bottom = this.points[1][1];
			break;
		case 'circle': //need Center point
			this.aABB.left = this.points[0][0] - this.radius;
			this.aABB.top = this.points[0][1] - this.radius;
			this.aABB.bottom = this.points[0][0] + this.radius;
			this.aABB.right = this.points[0][1] + this.radius;
			break;
		case 'triangle': //Need three points, start with the right angle corner and go clockwise.
			if (this.points[0][1] == this.points[1][1] && this.points[0][0] == this.points[2][0])
			{
				if (this.points[0][0] < this.points[1][0])
				{
					//TOP LEFT CORNER IS RIGHT
					this.subType = 'tl';
					this.aABB.left = this.points[0][0];
					this.aABB.right = this.points[1][0];
					this.aABB.top = this.points[0][1];
					this.aABB.bottom = this.points[2][1];
				} else {
					//BOTTOM RIGHT CORNER IS RIGHT
					this.subType = 'br';
					this.aABB.left = this.points[1][0];
					this.aABB.right = this.points[0][0];
					this.aABB.top = this.points[2][1];
					this.aABB.bottom = this.points[0][1];
				}
				
			} else if (this.points[0][1] == this.points[2][1] && this.points[0][0] == this.points[1][0]) {
				if (this.points[0][1] < this.points[1][1])
				{
					//TOP RIGHT CORNER IS RIGHT
					this.subType = 'tr';
					this.aABB.left = this.points[2][0];
					this.aABB.right = this.points[0][0];
					this.aABB.top = this.points[0][1];
					this.aABB.bottom = this.points[1][1];
				} else {
					//BOTTOM LEFT CORNER IS RIGHT
					this.subType = 'bl';
					this.aABB.left = this.points[0][0];
					this.aABB.right = this.points[2][0];
					this.aABB.top = this.points[1][1];
					this.aABB.bottom = this.points[0][1];
				}
			} 
		}
		this.aABB.width = (this.aABB.right - this.aABB.left);
		this.aABB.height = (this.aABB.bottom - this.aABB.top);
		this.aABB.halfWidth = (this.aABB.right - this.aABB.left) / 2;
		this.aABB.halfHeight = (this.aABB.bottom - this.aABB.top) / 2;
		this.aABBPos.left = this.aABB.left + this.x;
		this.aABBPos.right = this.aABB.right + this.x;
		this.aABBPos.top = this.aABB.top + this.y;
		this.aABBPos.bottom = this.aABB.bottom + this.y;
	};
	var proto = collisionShape.prototype;
	
	proto.update = function(x, y){
		this.prevX = this.x;
		this.prevY = this.y;
		this.x = x + this.offset[0];
		this.y = y + this.offset[1];
		this.aABBPos.left = this.aABB.left + this.x;
		this.aABBPos.right = this.aABB.right + this.x;
		this.aABBPos.top = this.aABB.top + this.y;
		this.aABBPos.bottom = this.aABB.bottom + this.y;
	};
	
	proto.getPrevLocation = function () {
		return [this.prevX, this.prevY];
	};
	
	proto.getAABB = function(){
		return this.aABBPos;
	};
	
	proto.getXOffset = function(){
		return this.offset[0];
	};
	
	proto.getYOffset = function(){
		return this.offset[1];
	};
	
	return collisionShape;
})();
platformer.components = {};

/*--------------------------------------------------
 *   layer-controller - ../src/js/layer/layer-controller.js
 */
platformer.components['layer-controller'] = (function(){
	var relay = function(event, self){
		return function(value){
			var suffix = value.released?':up':':down';
			for (var x = 0; x < self.entities.length; x++) {
				self.entities[x].trigger(event + suffix, value);
			}
		}; 
	},
	keyMap = {
		kc0:   'unknown',         
		kc8:   'backspace',
		kc9:   'tab',
		kc12:  'numpad-5-shift',
		kc13:  'enter',
		kc16:  'shift',
		kc17:  'ctrl',
		kc18:  'alt',
		kc19:  'pause',
		kc20:  'caps-lock',
		kc27:  'esc',
		kc32:  'space',
		kc33:  'page-up',
		kc34:  'page-down',
		kc35:  'end',
		kc36:  'home',
		kc37:  'left-arrow',
		kc38:  'up-arrow',
		kc39:  'right-arrow',
		kc40:  'down-arrow',
		kc42:  'numpad-multiply',
		kc43:  'numpad-add',
		kc44:  'print-screen',
		kc45:  'insert',
		kc46:  'delete',
		kc47:  'numpad-division',
		kc48:  '0',
		kc49:  '1',
		kc50:  '2',
		kc51:  '3',
		kc52:  '4',
		kc53:  '5',
		kc54:  '6',
		kc55:  '7',
		kc56:  '8',
		kc57:  '9',
		kc59:  'semicolon',
		kc61:  'equals',
		kc65:  'a',
		kc66:  'b',
		kc67:  'c',
		kc68:  'd',
		kc69:  'e',
		kc70:  'f',
		kc71:  'g',
		kc72:  'h',
		kc73:  'i',
		kc74:  'j',
		kc75:  'k',
		kc76:  'l',
		kc77:  'm',
		kc78:  'n',
		kc79:  'o',
		kc80:  'p',
		kc81:  'q',
		kc82:  'r',
		kc83:  's',
		kc84:  't',
		kc85:  'u',
		kc86:  'v',
		kc87:  'w',
		kc88:  'x',
		kc89:  'y',
		kc90:  'z',
		kc91:  'left-windows-start',
		kc92:  'right-windows-start',
		kc93:  'windows-menu',
		kc96:  'back-quote',
		kc106: 'numpad-multiply',
		kc107: 'numpad-add',
		kc109: 'numpad-minus',
		kc110: 'numpad-period',
		kc111: 'numpad-division',
		kc112: 'f1',
		kc113: 'f2',
		kc114: 'f3',
		kc115: 'f4',
		kc116: 'f5',
		kc117: 'f6',
		kc118: 'f7',
		kc119: 'f8',
		kc120: 'f9',
		kc121: 'f10',
		kc122: 'f11',
		kc123: 'f12',
		kc144: 'num-lock',
		kc145: 'scroll-lock',
		kc186: 'semicolon',
		kc187: 'equals',
		kc188: 'comma',
		kc189: 'hyphen',
		kc190: 'period',
		kc191: 'forward-slash',
		kc192: 'back-quote',
		kc219: 'open-bracket',
		kc220: 'back-slash',
		kc221: 'close-bracket',
		kc222: 'quote'
	},
	component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		
		this.tickMessages = ['check-inputs'];
		this.addListeners(['entity-added', 'check-inputs', 'keydown', 'keyup', 'mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend', 'touchcancel']);
	},
	proto = component.prototype; 

	proto['keydown'] = function(value){
		for (var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger('key:' + (keyMap['kc' + value.keyCode] || ('key-code-' + value.keyCode)) + ':down', value);
		}
	}; 
		
	proto['keyup'] = function(value){
		for (var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger('key:' + (keyMap['kc' + value.keyCode] || ('key-code-' + value.keyCode)) + ':up', value);
		}
	};
	
/* this has been moved to individual entities	
	proto['mousedown'] = function(value){
		for (var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger('mouse:' + mouseMap[value.button] + ':down', value);
		}
	}; 
		
	proto['mouseup'] = function(value){
		for (var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger('mouse:' + mouseMap[value.button] + ':up', value);
		}
	};
	
	proto['touchstart'] = function(value){
		for (var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger('touch:down', value);
		}
	}; 
		
	proto['touchend'] = function(value){
		for (var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger('touch:up', value);
		}
	};
	
	proto['touchmove'] = proto['touchcancel'] = proto['mousemove'] = function(value){
		for (var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger(value.type, value);
		}
	};
*/
	
	proto['check-inputs'] = function(resp){
		for (var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger('controller:tick');
		}
	};

	proto['entity-added'] = function(entity){
		var messageIds = entity.getMessageIds(); 
		
		for (var x = 0; x < messageIds.length; x++)
		{
			if (messageIds[x] == 'controller')
			{
				// Check for custom input messages that should be relayed from scene.
				if(entity.controlMap){
					for(var y in entity.controlMap){
						if((y.indexOf('key:') < 0) || (y.indexOf('mouse:') < 0)){
							if(!this[y]){
								this.addListener(y);
								this[y] = relay(y, this);
							}
						}
					}
				}
				
				this.entities.push(entity);
				entity.trigger('controller:load');
				break;
			}
		}
	};

	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.entities.length = 0;
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/
	
	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   tiled-loader - ../src/js/layer/tiled-loader.js
 */
platformer.components['tiled-loader'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['load']);

		this.level = platformer.settings.levels[definition.level];
		this.tileEntityId = definition.tileEntityId || 'tile';
	},
	proto = component.prototype; 

	proto['load'] = function(){
		//TODO: load tiled map into layer here
		var actionLayer = 0;
		
		for(; actionLayer < this.level.layers.length; actionLayer++){
			this.setupLayer(this.level.layers[actionLayer], this.level);
		}
		this.owner.removeComponent(this);
	};
	
	proto.setupLayer = function(layer, level){
		var width      = layer.width,
		height         = layer.height,
		images         = [],
		tilesets       = level.tilesets,
		tileWidth      = level.tilewidth,
		tileHeight     = level.tileheight,
		x              = 0,
		y              = 0,
		obj            = 0,
		entity         = undefined,
		entityType     = '',
		tileset        = undefined,
		properties     = undefined,
		tileDefinition = undefined,
		importAnimation= undefined,
		importCollision= undefined,
		importRender   = undefined,
		followEntity   = undefined;

		for (x = 0; x < tilesets.length; x++){
			if(platformer.assets[tilesets[x].name]){ // Prefer to have name in tiled match image id in game
				images.push(platformer.assets[tilesets[x].name]);
			} else {
				images.push(tilesets[x].image);
			}
		}
		if(layer.type == 'tilelayer'){
			// First determine which type of entity this layer should behave as:
			entity = 'tile-layer'; // default
			if(layer.properties.entity){
				entity = layer.properties.entity;
			} else { // If not explicitly defined, try using the name of the layer
				switch(layer.name){
				case "background":
				case "foreground":
					entity = 'render-layer';
					break;
				case "collision":
					entity = 'collision-layer';
					break;
				}
			}
			
			//TODO: a bit of a hack to copy an object instead of overwrite values
			tileDefinition  = JSON.parse(JSON.stringify(platformer.settings.entities[entity]));

			importAnimation = {};
			importCollision = [];
			importRender    = [];

			tileDefinition.properties            = tileDefinition.properties || {};
			tileDefinition.properties.width      = tileWidth  * width;
			tileDefinition.properties.height     = tileHeight * height;
			tileDefinition.properties.columns    = width;
			tileDefinition.properties.rows       = height;
			tileDefinition.properties.tileWidth  = tileWidth;
			tileDefinition.properties.tileHeight = tileHeight;

			for (x = 0; x < height; x++){
				importCollision[x] = [];
				importRender[x]    = [];
				for (y = 0; y < height; y++){
					if(typeof importAnimation['tile' + (+layer.data[x + y * width] - 1)] == 'undefined'){
						importAnimation['tile' + (+layer.data[x + y * width] - 1)] = +layer.data[x + y * width] - 1;
					};
					importCollision[x][y] = +layer.data[x + y * width] - 1;
					importRender[x][y] = 'tile' + (+layer.data[x + y * width] - 1);
				}
			}
			for (x = 0; x < tileDefinition.components.length; x++){
				if(tileDefinition.components[x].spritesheet == 'import'){
					tileDefinition.components[x].spritesheet = {
						images: images,
						frames: {
							width:  tileWidth,
							height: tileHeight
						},
						animations: importAnimation
					};
				}
				if(tileDefinition.components[x].collisionMap == 'import'){
					tileDefinition.components[x].collisionMap = importCollision;
				}
				if(tileDefinition.components[x].imageMap == 'import'){
					tileDefinition.components[x].imageMap = importRender;
				}
			}
			this.owner.addEntity(new platformer.classes.entity(tileDefinition, {properties:{}}));
		} else if(layer.type == 'objectgroup'){
			for (obj = 0; obj < layer.objects.length; obj++){
				entity = layer.objects[obj];
				for (x = 0; x < tilesets.length; x++){
					if(tilesets[x].firstgid > entity.gid){
						break;
					} else {
						tileset = tilesets[x];
					}
				}
				
				// Check Tiled data to find this object's type
				entityType = '';
				if(entity.type !== ''){
					entityType = entity.type;
				} else if(tileset.tileproperties[entity.gid - 1]){
					if(tileset.tileproperties[entity.gid - 1].entity){
						entityType = tileset.tileproperties[entity.gid - 1].entity;
					} else if (tileset.tileproperties[entity.gid - 1].type){
						entityType = tileset.tileproperties[entity.gid - 1].type;
					}
				}
				
				if(entityType !== ''){
					//Copy properties from Tiled
					properties = {};
					for (x in entity.properties){
						properties[x] = entity.properties[x];
					}
					properties.x = entity.x;
					properties.y = entity.y;
					properties.width  = entity.width  || tileWidth;
					properties.height = entity.height || tileHeight;
					
					entity = this.owner.addEntity(new platformer.classes.entity(platformer.settings.entities[entityType], {properties:properties}));
					if(entity){
						if(entity.camera){
							followEntity = {entity: entity, mode: entity.camera}; //used by camera
						}
					}
				}
			}
		}
		this.owner.trigger('world-loaded', {
			width:  width  * tileWidth,
			height: height * tileHeight,
			camera: followEntity
		});
	};

	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.entities.length = 0;
	};
	
	/*********************************************************************************************************
	 * The stuff below here can be left alone. 
	 *********************************************************************************************************/
	
	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   lc-render - ../src/js/layer/lc-render.js
 */
platformer.components['lc-render'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		this.tickMessages = ['render'];
		this.addListeners(['entity-added','render', 'camera-update']);
		
		this.canvas = document.createElement('canvas');
		this.owner.rootElement.appendChild(this.canvas);
		this.canvas.style.width = '100%';
		this.canvas.style.height = '100%';
		this.canvas.width  = 320; //TODO: figure out where to specify this
		this.canvas.height = 240;
		this.stage = new createjs.Stage(this.canvas);
		
	};
	var proto = component.prototype; 

	proto['entity-added'] = function(entity){
		var self = this,
		messageIds = entity.getMessageIds(); 
		
		for (var x = 0; x < messageIds.length; x++)
		{
			if (messageIds[x] == 'layer:render')
			{
				this.entities.push(entity);
				entity.trigger('layer:render-load', {
					stage: this.stage,
					parentElement: this.owner.rootElement
					//TODO: send along scaling functions to convert world coordinates to window coordinates // somehow get these from camera?
				});
				break;
			}
		}
	};
	
	proto['render'] = function(){
		for (var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger('layer:render');
			
		}
		this.stage.update();
	};
	
	proto['camera-update'] = function(cameraInfo){
		this.stage.setTransform(-cameraInfo.x, -cameraInfo.y);
		
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.stage = undefined;
		this.owner.rootElement.removeChild(this.canvas);
		this.canvas = undefined;
		this.entities.length = 0;
	};
	
	/*********************************************************************************************************
	 * The stuff below here can be left alone. 
	 *********************************************************************************************************/
	
	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   lc-logic - ../src/js/layer/lc-logic.js
 */
platformer.components['lc-logic'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		
		this.tickMessages = ['logic'];
		this.addListeners(['entity-added', 'logic']);  
		
	};
	var proto = component.prototype; 

	proto['entity-added'] = function(entity){
		var self = this,
		messageIds = entity.getMessageIds(); 
		
		for (var x = 0; x < messageIds.length; x++)
		{
			if (messageIds[x] == 'layer:logic')
			{
				this.entities.push(entity);
				break;
			}
		}
	};

	proto['logic'] = function(deltaT){
		for (var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger('layer:logic', deltaT);
		}
	};
	
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/
	
	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   lc-camera - ../src/js/layer/lc-camera.js
 */
platformer.components['lc-camera'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		
		this.tickMessages = ['camera'];
		this.addListeners(['resize', 'camera', 'load', 'world-loaded']);  
		
		//The dimensions of the camera in the window
		this.portalTop = this.owner.rootElement.innerTop;
		this.portalLeft = this.owner.rootElement.innerLeft;
		this.portalWidth = this.owner.rootElement.offsetWidth;
		this.portalHeight = this.owner.rootElement.offsetHeight;
		
		//The dimensions of the camera in the game world
		this.width       = definition.width       || 0; 
		this.height      = definition.height      || 0;
		this.aspectRatio = definition.aspectRatio || 0;
		this.left        = definition.left        || 0;
		this.top         = definition.top         || 0;
		
		if(this.width && this.height){
			this.aspectRatio = this.aspectRatio || (this.height      / this.width); 
		} else {
			this.aspectRatio = this.aspectRatio || (this.portalHeight / this.portalWidth);
			if (this.width || this.height){
				this.width       = this.width       || (this.height      / this.aspectRatio); 
				this.height      = this.height      || (this.aspectRatio / this.width); 
			} else {
				this.width       = this.portalWidth;
				this.height      = this.aspectRatio * this.width;
			}
		}
		
		// The dimensions of the entire world
		this.worldWidth  = 0; //definition.worldWidth;
		this.worldHeight = 0; //definition.worldHeight;
		
		this.worldPerScreenUnitWidth = this.width / this.portalWidth;
		this.worldPerScreenUnitHeight = this.height / this.portalHeight;
		
		this.screenPerWorldUnitWidth =  this.portalWidth / this.width;
		this.screenPerWorldUnitHeight =  this.portalHeight/ this.height;
		
		this.following = undefined;
		this.state = 'static';//'roaming';
		
		//FOLLOW MODE VARIABLES
		
		//--Bounding
		this.boundingBoxLeft = 100;
		this.boundingBoxTop = 100;
		this.boundingBoxWidth = this.width - (2 * this.boundingBoxLeft);
		this.boundingBoxHeight = this.height - (2 * this.boundingBoxTop);
		
		
		this.direction = true;  
	};
	var proto = component.prototype; 

	proto['load'] = function(){
	};

	proto['world-loaded'] = function(values){
		this.worldWidth   = this.owner.worldWidth  = values.width;
		this.worldHeight  = this.owner.worldHeight = values.height;
		if(values.camera){
			this.follow(values.camera);
		}
	};
	
	proto['camera'] = function(deltaT){
		
		switch (this.state)
		{
		case 'following':
			this.followingFunction(this.following);
			break;
		case 'roaming':
			var speed = .3 * deltaT;
			if (this.direction)
			{
				this.move(this.left + speed, this.top);
				if (this.worldWidth && (this.left == this.worldWidth - this.width)) {
					this.direction = !this.direction;
				}
			} else {
				this.move(this.left - speed, this.top);
				if (this.worldWidth && (this.left == 0)) {
					this.direction = !this.direction;
				}
			}
			break;
		case 'static':
		default:
			break;
		}
		this.owner.trigger('camera-update', {x: this.left, y: this.top});
	};
	
	proto['resize'] = function ()
	{
		//TODO: need to call this on screen resize!!
		this.portalTop = rootElement.innerTop;
		this.portalLeft = rootElement.innerLeft;
		this.portalWidth = rootElement.offsetWidth;
		this.portalHeight = rootElement.offsetHeight;
		
		this.worldPerScreenUnitWidth = this.width / this.portalWidth;
		this.worldPerScreenUnitHeight = this.height / this.portalHeight;
		
		this.screenPerWorldUnitWidth =  this.portalWidth / this.width;
		this.screenPerWorldUnitHeight =  this.portalHeight/ this.height;
	};
	
	proto['follow'] = function (def)
	{
		switch (def.mode)
		{
		case 'locked':
			this.state = 'following';
			this.following = def.entity;
			this.followingFunction = this.lockedFollow;
			break;
		case 'bounding':
			this.state = 'following';
			this.following = def.entity;
			this.setBoundingArea(def.top, def.left, def.width, def.height);
			this.followingFunction = this.boundingFollow;
			break;
		case 'custom':
			this.state = 'following';
			this.following = def.entity;
			this.followingFunction = def.followingFunction;
			break;
		case 'static':
		default:
			this.state = 'static';
			this.following = undefined;
			this.followingFunction = undefined;
			break;
		}
		
	};
	
	proto.move = function (newleft, newtop)
	{
		if (this.worldWidth && (newleft + this.width > this.worldWidth)) {
			this.left = this.worldWidth - this.width;
		} else if (this.worldWidth && (newleft < 0)) {
			this.left = 0; 
		} else {
			this.left = newleft;
		}
		
		if (this.worldHeight && (newtop + this.height > this.worldHeight)) {
			this.top = this.worldHeight - this.height;
		} else if (this.worldHeight && (newtop < 0)) {
			this.top = 0; 
		} else {
			this.top = newtop;
		}
		
	};
	
	proto.lockedFollow = function (entity)
	{
		this.move(entity.x - (this.width / 2), entity.y - (this.height / 2));
	};
	
	proto.setBoundingArea = function (top, left, width, height)
	{
		this.boundingBoxTop = top || 100;
		this.boundingBoxLeft = left || 100;
		this.boundingBoxWidth = width || this.width - (2 * this.boundingBoxLeft);
		this.boundingBoxHeight = height || this.height - (2 * this.boundingBoxTop);
	};
	
	proto.boundingFollow = function (entity)
	{
		var newLeft = 0;
		var newTop = 0;
		
		if (entity.x > this.x + this.boundingBoxLeft + this.BoundingBoxWidth) 
		{
			newLeft = entity.x -(this.boundingBoxLeft + this.BoundingBoxWidth);
		} else if (entity.x < this.x + this.boundingBoxLeft) {
			newLeft = entity.x - this.boundingBoxLeft;
		}
		
		if (entity.y > this.y + this.boundingBoxTop + this.BoundingBoxHeight) 
		{
			newTop = entity.y - this.boundingBoxTop + this.BoundingBoxHeight;
		} else if (entity.y < this.y + this.boundingBoxTop) {
			newTop = entity.y - this.boundingBoxTop;
		}
		
		this.move(newLeft, newTop);
	};
	
	/*
	proto.transition = function (coords, type, def)
	{
		this.state = 'transitioning';
		switch (type)
		{
		case 'linear':
			if (def.entity)
			{
				this.transitionEntity = def.entity;
			} else {
				this.transitionX = def.x;
				this.transitionY = def.y;
			}
			this.transitionFunction = this.linearTransition;
			break;
		case 'custom':
			this.transitionFunction = def.transitionFunction;
			break;
		case 'instant':
		default:
			this.move(coords.x - (this.width / 2), coords.y - (this.height / 2));
			break;
		
		
		}
		
	};
	
	proto.linearTransition = function ()
	{
		
		
	};
	*/
	
	proto.screenToWorld = function (sCoords)
	{
		var wCoords = [];
		wCoords[0] = Math.round((sCoords[0] - this.portalLeft) * this.worldPerScreenUnitWidth);
		wCoords[1] = Math.round((sCoords[1] - this.portalTop)  * this.worldPerScreenUnitHeight);
		return wCoords; 
	};
	
	proto.worldToScreen = function (wCoords)
	{
		var sCoords = [];
		sCoords[0] = Math.round((wCoords[0] * this.screenPerWorldUnitWidth) + this.portalLeft);
		sCoords[1] = Math.round((wCoords[1] * this.screenPerWorldUnitHeight) + this.portalTop);
		return sCoords;
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.entities.length = 0;
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/
	
	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   lc-basic-collision - ../src/js/layer/lc-basic-collision.js
 */
platformer.components['lc-basic-collision'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		
		this.tickMessages = ['collision'];
		this.addListeners(['load','entity-added','collision']);  
		this.toResolve = [];
		
		this.collisionMatrix = {};
	};
	var proto = component.prototype; 

	proto['entity-added'] = function(entity){
		var self = this;
		var messageIds = entity.getMessageIds(); 
		
		for (var x = 0; x < messageIds.length; x++){
			if (messageIds[x] == 'layer:resolve-collision'){
				this.entities.push(entity);
				if(!this.collisionMatrix[entity.type]){
					this.collisionMatrix[entity.type] = {};
					for (var x = 0; x < entity.collidesWith.length; x++){
						this.collisionMatrix[entity.type][entity.collidesWith[x]] = true;
					}
				}
				break;
			} else if (messageIds[x] == 'getShapes'){
				this.entities.push(entity); // same as above for now
				if(!this.collisionMatrix[entity.type]){
					this.collisionMatrix[entity.type] = {};
					for (var x = 0; x < entity.collidesWith.length; x++){
						this.collisionMatrix[entity.type][entity.collidesWith[x]] = true;
					}
				}
				break;
			}

		}
	};
	
	proto['load'] = function(){
		
	};
	
	proto['collision'] = function(deltaT){
		this.prepareCollision();
		this.checkCollision();
		this.resolveCollisions();
	};
	
	proto.prepareCollision = function ()
	{
		for(var x = 0; x < this.entities.length; x++)
		{
			this.entities[x].trigger('layer:prep-collision');
		}
	};
	
	/*
	 * Collision Matrix is set up so that [x,y] is a check to see if X cares about Y
	 */
	
	proto.checkCollision = function ()
	{
		for(var x = 0; x < this.entities.length - 1; x++)
		{
			for (var y = x + 1; y < this.entities.length; y++)
			{
				if (this.collisionMatrix[this.entities[x].type][this.entities[y].collisionType] || this.collisionMatrix[this.entities[y].type][this.entities[x].collisionType])
				{
					var aabbCollision = this.AABBCollision(this.entities[x], this.entities[y]); 
					if(aabbCollision)
					{
						if (this.preciseCollision(this.entities[x], this.entities[y]))
						{
							if (this.collisionMatrix[this.entities[x].type][this.entities[y].collisionType])
							{
								this.toResolve.push({
									entity:  this.entities[x],
									message:{
										entity: this.entities[y],
										type:   this.entities[y].type,
										shape:  aabbCollision.shapeB
									}
								});
							}
							
							if (this.collisionMatrix[this.entities[y].type][this.entities[x].collisionType])
							{
								this.toResolve.push({
									entity:  this.entities[y],
									message:{
										entity: this.entities[x],
										type:   this.entities[x].type,
										shape:  aabbCollision.shapeA
									}
								});
							}
						}
					}
				}
			}
		}
	};
	
	proto.AABBCollision = function (entityA, entityB)
	{
		/*
		var aLeft = entityA.x + entityA.AABB[0];
		var aRight = entityA.x + entityA.AABB[0] + entityA.AABB[2];
		var aTop = entityA.y + entityA.AABB[1];
		var aBottom = entityA.y + entityA.AABB[1] + entityA.AABB[3];
		
		var bLeft = entityB.x + entityB.AABB[0];
		var bRight = entityB.x + entityB.AABB[0] + entityB.AABB[2];
		var bTop = entityB.y + entityB.AABB[1];
		var bBottom = entityB.y + entityB.AABB[1] + entityB.AABB[3];
		
		if(aLeft > bRight) return false;
		if(aRight < bLeft) return false;
		if(aTop  > bBottom) return false;
		if(aBottom < bTop) return false;
		return true;
		*/
		var i   = 0,
		j       = 0,
		shapeA  = undefined,
		shapeB  = undefined,
		shapesA = entityA.getShapes?entityA.getShapes(entityB.getAABB()):[entityA.shape],
		shapesB = entityB.getShapes?entityB.getShapes(entityA.getAABB()):[entityB.shape];
		
		for (i = 0; i < shapesA.length; i++){
			shapeA = shapesA[i].getAABB();
			for (j = 0; j < shapesB.length; j++){
				shapeB = shapesB[j].getAABB();
				if(shapeA.left   >=  shapeB.right)  break;
				if(shapeA.right  <=  shapeB.left)   break;
				if(shapeA.top    >=  shapeB.bottom) break;
				if(shapeA.bottom <=  shapeB.top)    break;
				return {
					shapeA: shapesA[i],
					shapeB: shapesB[j]
				};
			}
		}
		
		return false;	
	};
	
	proto.preciseCollision = function (entityX, entityY)
	{
		return true;
	};
	
	
	proto.resolveCollisions = function ()
	{
		for (var x = 0; x < this.toResolve.length; x++)
		{
			this.toResolve[x].entity.trigger('layer:resolve-collision', this.toResolve[x].message);
		}
		this.toResolve = [];
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.entities.length = 0;
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/
	
	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   audio - ../src/js/entity/audio.js
 */
platformer.components['audio'] = (function(){
	var sounds = {}, 
	playSound = function(sound){
		return function(value){
			var audio = sounds[sound];
			if (!audio || (audio.playState !== 'playSucceeded')){ //prevent playing when this audio is already playing.
				audio = createjs.SoundJS.play(sound);
				sounds[sound] = audio;
			}
			if(audio.playState === 'playFailed'){
				console.warn('Unable to play "' + sound + '".', audio);
			}
		};
	},
	component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		if(definition.audioMap){
			for (var key in definition.audioMap){
				this.addListener(key);
				this[key] = playSound(definition.audioMap[key]);
			}
		}
	};
	var proto = component.prototype;
	
	/*********************************************************************
	 TODO: Add functions that handle the various messages. There should be a corresponding function for each 
	       listener added above. 
		
		e.g.
		proto['load'] = function(resp){
			// Run loading code here
		};
	**********************************************************************/
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/

	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   broadcast-events - ../src/js/entity/broadcast-events.js
 */
platformer.components['broadcast-events'] = (function(){
	var broadcast = function(event){
		return function(value){
			platformer.game.currentScene.trigger(event, value);
		};
	}, 
	component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for and then broadcasts to all layers.
		// Make sure it does not receive and broadcast matching messages or an infinite loop will result.
		this.listeners = [];
		if(definition.events){
			for(var event in definition.events){
				this[event] = broadcast(definition.events[event]);
				this.addListener(event);
			}
		}
		
	},
	proto = component.prototype;
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/

	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   entity-container - ../src/js/entity/entity-container.js
 */
platformer.components['entity-container'] = (function(){
	var component = function(owner, definition){
		var self = this,
		x        = 0;

		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.entities = [];
		this.definedEntities = definition.entities; //saving for load message
		
		this.owner.entities     = self.entities;
		this.owner.addEntity    = function(entity){return self.addEntity(entity);};
		this.owner.removeEntity = function(){return self.removeEntity();};
		
		this.addListeners(['load', 'add-entity', 'remove-entity']);
	};
	var proto = component.prototype;
	
	proto['load'] = function(){
		// putting this here so all other components will have been loaded and can listen for "entity-added" calls.
		var x    = 0,
		entities = this.definedEntities;
		
		this.definedEntities = false;
		
		if(entities){
			for (x = 0; x < entities.length; x++)
			{
				 this.addEntity(new platformer.classes.entity(platformer.settings.entities[entities[x].type], entities[x]));
			}
		}
	};
	
	proto.addEntity = proto['add-entity'] = function (entity) {
		this.entities.push(entity);
		this.owner.trigger('entity-added', entity);
		return entity;
	};
	
	proto.removeEntity = proto['remove-entity'] = function (entity) {
		for (var x = 0; x < this.entities.length; x++){
		    if(this.entities[x] === entity){
		    	this.entities.splice(x, 1);
		    	entity.destroy();
			    return entity;
		    }
	    }
	    return false;
	};
	
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		for (var i in this.entities){
			entity.destroy();
		}
		this.entities.length = 0;
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/

	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   entity-controller - ../src/js/entity/entity-controller.js
 */
platformer.components['entity-controller'] = (function(){
	var state = function(){
		this.current = false;
		this.last    = false;
		this.state   = false;
	},
	mouseMap = ['left-button', 'middle-button', 'right-button'],
	createUpHandler = function(state){
		return function(value){
			state.state = false;
		};
	},
	createDownHandler = function(state){
		return function(value){
			state.current = true;
			state.state   = true;
			if(value && (typeof (value.over) !== 'undefined')) state.over = value.over;
		};
	},
	component = function(owner, definition){
		var key     = '',
		actionState = undefined;
		this.owner  = owner;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['load', 'controller', 'controller:load', 'controller:tick', 'mousedown', 'mouseup', 'mousemove']);
		
		if(definition && definition.controlMap){
			this.owner.controlMap = definition.controlMap;
			this.actions  = {};
			for(key in definition.controlMap){
				actionState = this.actions[definition.controlMap[key]]; // If there's already a state storage object for this action, reuse it: there are multiple keys mapped to the same action.
				if(!actionState){                                // Otherwise create a new state storage object
					actionState = this.actions[definition.controlMap[key]] = new state();
				}
				this[key + ':up']   = createUpHandler(actionState);
				this[key + ':down'] = createDownHandler(actionState);
				this.addListener(key + ':up');
				this.addListener(key + ':down');
			}
		}
	},
	stateProto = state.prototype,
	proto      = component.prototype;
	
	stateProto.update = function(){
		this.last    = this.current;
		this.current = this.state;
	};

	stateProto.isPressed = function(){
		return this.current;
	};
	
	stateProto.isTriggered = function(){
		return this.current && !this.last;
	};

	stateProto.isReleased = function(){
		return !this.current && this.last;
	};
	
	proto['load'] = function(){
	};
	
	proto['mouse:move'] = function(value){
		if(this.actions['mouse:left-button'] && (this.actions['mouse:left-button'].over !== value.over))     this.actions['mouse:left-button'].over = value.over;
		if(this.actions['mouse:middle-button'] && (this.actions['mouse:middle-button'].over !== value.over)) this.actions['mouse:middle-button'].over = value.over;
		if(this.actions['mouse:right-button'] && (this.actions['mouse:right-button'].over !== value.over))   this.actions['mouse:right-button'].over = value.over;
	};
	
//	proto['touch:move'] = function(value){
//		if(this.actions['touch'] && (this.actions['touch'].over !== value.over))  this.actions['touch'].over = value.over;
//	};

	proto['controller'] = function(){
		
	};

	proto['controller:load'] = function(){

	};

	proto['controller:tick'] = function(resp){
		var state = undefined,
		action    = '';
		
		if(this.actions){
			for (action in this.actions){
				state = this.actions[action];
				if(state.current || state.last){
					this.owner.trigger(action, {
						pressed:   state.current,
						released: !state.current && state.last,
						triggered: state.current && !state.last,
						over:      state.over
					});
				}
				state.update();
			}
		}
	};
	
	// The following translate CreateJS mouse and touch events into messages that this controller can handle in a systematic way
	
	proto['mousedown'] = function(value){
		this.owner.trigger('mouse:' + mouseMap[value.event.button || 0] + ':down', value.event);
	}; 
		
	proto['mouseup'] = function(value){
		this.owner.trigger('mouse:' + mouseMap[value.event.button || 0] + ':up', value.event);
	};
	
	proto['mousemove'] = function(value){
		this.owner.trigger('mouse:move', value);
	};
/*
	proto['mouseover'] = function(value){
		this.owner.trigger('mouse:' + mouseMap[value.event.button] + ':over', value.event);
	};

	proto['mouseout'] = function(value){
		this.owner.trigger('mouse:' + mouseMap[value.event.button] + ':out', value.event);
	};
*/
	
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/

	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   render-debug - ../src/js/entity/render-debug.js
 */
platformer.components['render-debug'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		//this.controllerEvents = undefined;
		
		if(definition.acceptInput){
			this.hover = definition.acceptInput.hover || false;
			this.click = definition.acceptInput.click || false;
			this.touch = definition.acceptInput.touch || false;
		} else {
			this.hover = false;
			this.click = false;
			this.touch = false;
		}
		
		this.regX = definition.regX || 0;
		this.regY = definition.regY || 0;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['layer:render', 'layer:render-load']); ///TODO: removing input event for now because it's confusing this way, 'controller:input-handler']);
	};
	var proto = component.prototype;

	proto['layer:render'] = function(stage){
		this.shape.x = this.owner.x	- this.regX;
		this.shape.y = this.owner.y	- this.regY;
		this.txt.x = this.owner.x	- this.regX + (this.owner.width / 2);
		this.txt.y = this.owner.y 	- this.regY + (this.owner.height / 2);
		
	};

	proto['layer:render-load'] = function(resp){
		var self = this,
		x        = this.owner.x      = this.owner.x || 0,
		y        = this.owner.y      = this.owner.y || 0,
		width    = this.owner.width  = this.owner.width  || 300,
		height   = this.owner.height = this.owner.height || 100,
		comps    = platformer.settings.entities[this.owner.type]?(platformer.settings.entities[this.owner.type].components || []):[],
		components = [],
		over     = false;
		
		for (var i in comps) components[i] = comps[i].type;
		
		this.stage = resp.stage;
		
		this.txt   = new createjs.Text(this.owner.type + '\n(' + components.join(', ') + ')');
		this.txt.x = x + width / 2;
		this.txt.y = y + height / 2;
		this.txt.textAlign = "center";
		this.txt.textBaseline = "middle";
		
/*		this.mookieImg   = new createjs.Bitmap('i/mookie.png');
		this.mookieImg.x = this.owner.x;
		this.mookieImg.y = this.owner.y;*/
		
		this.shape = new createjs.Shape((new createjs.Graphics()).beginFill("rgba(0,0,0,0.1)").beginStroke("#880").rect(0, 0, width, height));

		this.stage.addChild(this.shape);
		this.stage.addChild(this.txt);
		
		// The following appends necessary information to displayed objects to allow them to receive touches and clicks
		if(this.touch && createjs.Touch.isSupported()){
			createjs.Touch.enable(this.stage);
		}

		this.shape.onPress     = function(event) {
			if(this.click || this.touch){
				self.owner.trigger('mousedown', {
					event: event.nativeEvent,
					over: over,
					x: event.stageX,
					y: event.stageY,
					entity: self.owner
				});
				event.onMouseUp = function(event){
					self.owner.trigger('mouseup', {
						event: event.nativeEvent,
						over: over,
						x: event.stageX,
						y: event.stageY,
						entity: self.owner
					});
				};
				event.onMouseMove = function(event){
					self.owner.trigger('mousemove', {
						event: event.nativeEvent,
						over: over,
						x: event.stageX,
						y: event.stageY,
						entity: self.owner
					});
				};
			}
			if(event.nativeEvent.button == 2){
				console.log('This Entity:', self.owner);
			}
		};
		if(this.click || this.touch){
			this.shape.onMouseOut  = function(){over = false;};
			this.shape.onMouseOver = function(){over = true;};
		}
		if(this.hover){
			this.stage.enableMouseOver();
			this.shape.onMouseOut  = function(event){
				over = false;
				self.owner.trigger('mouseout', {
					event: event.nativeEvent,
					over: over,
					x: event.stageX,
					y: event.stageY,
					entity: self.owner
				});
			};
			this.shape.onMouseOver = function(event){
				over = true;
				self.owner.trigger('mouseover', {
					event: event.nativeEvent,
					over: over,
					x: event.stageX,
					y: event.stageY,
					entity: self.owner
				});
			};
		}
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/
	
	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   render-tile - ../src/js/entity/render-tile.js
 */
platformer.components['render-tile'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		this.spriteSheet = new createjs.SpriteSheet(definition.spritesheet);
		
		this.state = definition.state || 'tile';
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['layer:render', 'layer:render-load']);
	};
	var proto = component.prototype;

	proto['layer:render'] = function(stage){
		this.shape.x = this.owner.x;
		this.shape.y = this.owner.y;
	};

	proto['layer:render-load'] = function(resp){
		this.stage = resp.stage;
		
		this.shape = new createjs.BitmapAnimation(this.spriteSheet);
		this.stage.addChild(this.shape);
		this.shape.gotoAndPlay(this.state);
	};
	
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/
	
	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   render-tiles - ../src/js/entity/render-tiles.js
 */
platformer.components['render-tiles'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		this.controllerEvents = undefined;
		this.spriteSheet = new createjs.SpriteSheet(definition.spritesheet);
		this.imageMap    = definition.imageMap   || [];
		this.tileWidth   = definition.tileWidth  || this.owner.tileWidth  || 10;
		this.tileHeight  = definition.tileHeight || this.owner.tileHeight || 10;
		
		this.state = definition.state || 'tile';
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['layer:render', 'layer:render-load']);
	};
	var proto = component.prototype;

	proto['layer:render'] = function(stage){
	};

	proto['layer:render-load'] = function(resp){
		var x = 0,
		y     = 0,
		stage = this.stage = resp.stage;
		tile  = undefined;
		
		
		for(x = 0; x < this.imageMap.length; x++){
			for (y = 0; y < this.imageMap[x].length; y++){
				//TODO: Test speed of this - would non-animations perform better?
				tile = new createjs.BitmapAnimation(this.spriteSheet);
				tile.x = x * this.tileWidth;
				tile.y = y * this.tileHeight;
				stage.addChild(tile);
				tile.gotoAndPlay(this.imageMap[x][y]);
			}
		}
	};
	
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/
	
	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   render-button - ../src/js/entity/render-button.js
 */
platformer.components['render-button'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['layer:render-load', 'layer:render', 'controller:input']);
		this.stage = undefined;
		this.upBitmap = new createjs.Bitmap(platformer.assets[definition.upImg]);
		this.downBitmap = new createjs.Bitmap(platformer.assets[definition.downImg]);
		//this.shape = new createjs.Shape();;
	};
	var proto = component.prototype;
	
	proto['controller:input-handler'] = function (settings){
		
	};
	
	proto['layer:render-load'] = function (obj) {
		this.stage = obj.stage;
		this.stage.addChild(this.upBitmap);
		this.stage.addChild(this.downBitmap);
		
		this.upBitmap.x = this.owner.x;
		this.downBitmap.x = this.owner.x;
		this.upBitmap.y = this.owner.y;
		this.downBitmap.y = this.owner.y;
		
		
		/*
		var g = this.shape.graphics;
		if(this.owner.state)
		{
			g.beginFill('#333');
		} else {
			g.beginFill('#888');
		}
		g.rect(this.owner.x, this.owner.y, this.owner.width, this.owner.height);
		g.endFill();
		
		this.stage.addChild(this.shape);
		*/
	};
	
	proto['layer:render'] = function () {
		/*
		this.shape.x = this.owner.x;
		*/
		this.upBitmap.x = this.owner.x;
		this.downBitmap.x = this.owner.x;
		if(this.owner.state)
		{
			this.downBitmap.alpha = 0;
		} else {
			this.downBitmap.alpha = 1;
		}
		
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
		this.stage.removeChild(this.shape);
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/

	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   render-animation - ../src/js/entity/render-animation.js
 */
platformer.components['render-animation'] = (function(){
	var component = function(owner, definition){
		var spriteSheet = {
			images: definition.spriteSheet.images.slice(),
			frames: definition.spriteSheet.frames,
			animations: definition.spriteSheet.animations
		};
		this.owner = owner;
		
		if(definition.acceptInput){
			this.hover = definition.acceptInput.hover || false;
			this.click = definition.acceptInput.click || false;
			this.touch = definition.acceptInput.touch || false;
		} else {
			this.hover = false;
			this.click = false;
			this.touch = false;
		}
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['layer:render-load','layer:render', 'logical-state']);
		this.stage = undefined;
		for (var x = 0; x < spriteSheet.images.length; x++)
		{
			spriteSheet.images[x] = platformer.assets[spriteSheet.images[x]];
		}
		spriteSheet = new createjs.SpriteSheet(spriteSheet);
		this.anim = new createjs.BitmapAnimation(spriteSheet);
		this.currentAnimation = definition.state || this.owner.state || '';
		if(this.currentAnimation){
			this.anim.gotoAndPlay(this.currentAnimation);
		}
	};
	var proto = component.prototype;
	
	proto['layer:render-load'] = function(obj){
		var self = this,
		over     = false;
		
		this.stage = obj.stage;
		this.stage.addChild(this.anim);
		
		// The following appends necessary information to displayed objects to allow them to receive touches and clicks
		if(this.click || this.touch){
			if(this.touch && createjs.Touch.isSupported()){
				createjs.Touch.enable(this.stage);
			}

			this.anim.onPress     = function(event) {
				self.owner.trigger('mousedown', {
					event: event.nativeEvent,
					over: over,
					x: event.stageX,
					y: event.stageY,
					entity: self.owner
				});
				event.onMouseUp = function(event){
					self.owner.trigger('mouseup', {
						event: event.nativeEvent,
						over: over,
						x: event.stageX,
						y: event.stageY,
						entity: self.owner
					});
				};
				event.onMouseMove = function(event){
					self.owner.trigger('mousemove', {
						event: event.nativeEvent,
						over: over,
						x: event.stageX,
						y: event.stageY,
						entity: self.owner
					});
				};
			};
			this.anim.onMouseOut  = function(){over = false;};
			this.anim.onMouseOver = function(){over = true;};
		}
		if(this.hover){
			this.stage.enableMouseOver();
			this.anim.onMouseOut  = function(event){
				over = false;
				self.owner.trigger('mouseout', {
					event: event.nativeEvent,
					over: over,
					x: event.stageX,
					y: event.stageY,
					entity: self.owner
				});
			};
			this.anim.onMouseOver = function(event){
				over = true;
				self.owner.trigger('mouseover', {
					event: event.nativeEvent,
					over: over,
					x: event.stageX,
					y: event.stageY,
					entity: self.owner
				});
			};
		}
	};
	
	proto['layer:render'] = function(obj){
		this.anim.x = this.owner.x;
		this.anim.y = this.owner.y;
	};
	
	proto['logical-state'] = function(obj){
		if (this.currentAnimation != obj.state)
		{
			this.currentAnimation = obj.state;
			this.anim.gotoAndPlay(obj.state);
		}
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/

	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   logic-hero - ../src/js/entity/logic-hero.js
 */
platformer.components['logic-hero'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['layer:logic','key-left','key-right','key-up','key-down']);
		
		this.owner.state = 'standing';
		this.owner.heading = 'south';
		this.speed = definition.speed || .3;
		this.left = false;
		this.right = false;
		this.up = false;
		this.down = false;
	};
	var proto = component.prototype;
	
	proto['layer:logic'] = function(deltaT){
		var vX = 0;
		var vY = 0;
		
		if(this.left)
		{
			vX = -this.speed;
			this.owner.heading = 'west';
			this.owner.state = 'walking';
		} else if (this.right) {
			vX = this.speed;
			this.owner.heading = 'east';
			this.owner.state = 'walking';
		} else if (this.up) {
			vY = -this.speed;
			this.owner.heading = 'north';
			this.owner.state = 'walking';
		} else if (this.down) {
			vY = this.speed;
			this.owner.heading = 'south';
			this.owner.state = 'walking';
		} else {
			this.owner.state = 'standing';
// test for gravity			vY = 0.3; //gravity!
		}
		
		this.owner.x += (vX * deltaT);
		this.owner.y += (vY * deltaT);
		
		this.left = false;
		this.right = false;
		this.up = false;
		this.down = false;
		
		this.owner.trigger('logical-state', {state: this.owner.state + '-' + this.owner.heading});
		this.owner.trigger(this.owner.state);
	};
	
	proto['key-left'] = function (state)
	{
		if(state.pressed)
		{
			this.left = true;
		}
	};
	
	proto['key-up'] = function (state)
	{
		if(state.pressed)
		{
			this.up = true;
		}
	};
	
	proto['key-right'] = function (state)
	{
		if(state.pressed)
		{
			this.right = true;
		}
	};
	
	proto['key-down'] = function (state)
	{
		if(state.pressed)
		{
			this.down = true;
		}
	};

	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/

	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   collision-hero - ../src/js/entity/collision-hero.js
 */
platformer.components['collision-hero'] = (function(){
	var component = function(owner, definition){
		var self = this;
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['load','layer:prep-collision', 'layer:resolve-collision']);
		
		//this.owner.AABB = definition.AABB || [0, 0, 16, 16]; //offsetX, offsetY, width, height

		this.owner.shape = new platformer.classes.collisionShape([this.owner.x, this.owner.y],definition.shape.type, definition.shape.points, definition.shape.offset, definition.shape.radius); 
		this.owner.getAABB = function(){
			return self.getAABB();
		};
		this.owner.collisionType = definition.collisionType || 'solid';
		this.owner.collidesWith = definition.collidesWith || [];
	};
	var proto = component.prototype;
	
	
	proto['load'] = function(resp){
		
	};
	
	proto['layer:prep-collision'] = function(){
		this.owner.shape.update(this.owner.x, this.owner.y);
		//var prevLocation = this.owner.shape.getPrevLocation();
		//this.pX = prevLocation[0];
		//this.pY = prevLocation[1];
	};
	
	proto['layer:resolve-collision'] = function(other){
		var x = this.owner.shape.x;
		var y = this.owner.shape.y;
		var pX = this.owner.shape.prevX;
		var pY = this.owner.shape.prevY;
		
		var otherX = other.shape.x;
		var otherY = other.shape.y;
		
		switch (other.type)
		{
		case 'block':
		case 'tile-layer':
		case 'collision-layer':
			var deltaX = x - pX; 
			var deltaY = y - pY;
			var m = deltaY / deltaX; 
			var b = y - x * m;
			var targetX = undefined; 
			var targetY = undefined; 
			var yAtTargetX = undefined;
			var xAtTargetY = undefined;
			var thisAABB = this.owner.shape.aABB;
			var otherAABB = other.shape.aABB;
			
			var leftPlane = otherX - otherAABB.halfWidth - thisAABB.halfWidth;
			var rightPlane = otherX + otherAABB.halfWidth + thisAABB.halfWidth;
			var topPlane = otherY - otherAABB.halfHeight - thisAABB.halfHeight;
			var bottomPlane = otherY + otherAABB.halfHeight + thisAABB.halfHeight;
			
			if (m !== Infinity && m !== -Infinity)
			{
				if (pX <= leftPlane)
				{
					targetX = leftPlane;
				} else if (pX >= rightPlane) {
					targetX = rightPlane;
				}
			}
			
			if (pY <= topPlane)
			{
				targetY = topPlane;
			} else if (pY >= bottomPlane) {
				targetY = bottomPlane;
			}	
			
			
			if (typeof targetX !== 'undefined')
			{
				yAtTargetX = m * targetX + b;
			}
			
			if (typeof targetY !== 'undefined')
			{
				if (m === Infinity || m === -Infinity)
				{
					xAtTargetY = x;
				} else {
					xAtTargetY = (targetY - b) / m ;
				}
			}
			
			if (targetX && yAtTargetX >= topPlane && yAtTargetX <= bottomPlane)
			{
				console.warn('Collide on Side');
				this.owner.x = targetX - this.owner.shape.getXOffset();
				this.owner.shape.x = targetX;
				this.owner.y = yAtTargetX - this.owner.shape.getYOffset();
				this.owner.shape.y = yAtTargetX;
			} else if (targetY && xAtTargetY >= leftPlane && xAtTargetY <= rightPlane){
				console.warn('Collide on Top/Bottom');
				this.owner.x = xAtTargetY - this.owner.shape.getXOffset();
				this.owner.shape.x = xAtTargetY;
				this.owner.y = targetY - this.owner.shape.getYOffset();
				this.owner.shape.y = targetY;
			} else {
				console.warn('Hero is inside the block.');
			}
			
			break;
		}
	};
	
	proto.getAABB = function(){
		return this.owner.shape.getAABB();
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/

	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   collision-tiles - ../src/js/entity/collision-tiles.js
 */
platformer.components['collision-tiles'] = (function(){
	var component = function(owner, definition){
		var self = this;
		this.owner = owner;
		
		this.collisionMap   = definition.collisionMap   || [];
		this.tileWidth      = definition.tileWidth  || this.owner.tileWidth  || 10;
		this.tileHeight     = definition.tileHeight || this.owner.tileHeight || 10;
		this.tileHalfWidth  = this.tileWidth  / 2;
		this.tileHalfHeight = this.tileHeight / 2;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['layer:prep-collision', 'getShapes']); //TODO: currently placing "getShapes" here to trigger correct handling by layer collision handler - may not be the best way to do this? - DDD
		
		this.owner.collisionType = definition.collisionType || 'solid';
		this.owner.collidesWith = definition.collidesWith || [];
		this.owner.getShapes = function(aabb){
			return self.getShapes(aabb);
		};
		this.owner.getAABB = function(){
			return self.getAABB();
		};
	};
	var proto = component.prototype;

	proto['layer:prep-collision'] = function(){
		
	};
	
	proto.getAABB = function(){
		return {
			left: 0,
			top:  0,
			right: this.tileWidth * this.collisionMap.length,
			bottom: this.tileHeight * this.collisionMap.length[0]
		};
	};
	
	proto.getShapes = function(aabb){
		var left = Math.max(Math.floor(aabb.left   / this.tileWidth),  0),
		top      = Math.max(Math.floor(aabb.top    / this.tileHeight), 0),
		right    = Math.min(Math.ceil(aabb.right   / this.tileWidth),  this.collisionMap.length),
		bottom   = Math.min(Math.ceil(aabb.bottom  / this.tileHeight), this.collisionMap[0].length),
		x        = 0,
		y        = 0,
		shapes   = [];
		
		for (x = left; x < right; x++){
			for (y = top; y < bottom; y++){
				if (this.collisionMap[x][y] > 0) {
					shapes.push(new platformer.classes.collisionShape([x * this.tileWidth + this.tileHalfWidth, y * this.tileHeight + this.tileHalfHeight], 'rectangle', [[-this.tileHalfWidth, -this.tileHalfHeight],[this.tileHalfWidth, this.tileHalfHeight]]));
				}
			}
		}
		
		return shapes;
	};
	
	// This function should never be called by the component itself. Call this.owner.removeComponent(this) instead.
	proto.destroy = function(){
		this.removeListeners(this.listeners);
	};
	
	/*********************************************************************************************************
	 * The stuff below here will stay the same for all components. It's BORING!
	 *********************************************************************************************************/
	
	proto.addListeners = function(messageIds){
		for(var message in messageIds) this.addListener(messageIds[message]);
	};

	proto.removeListeners = function(listeners){
		for(var messageId in listeners) this.removeListener(messageId, listeners[messageId]);
	};
	
	proto.addListener = function(messageId, callback){
		var self = this,
		func = callback || function(value){
			self[messageId](value);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();


/*--------------------------------------------------
 *   Browser - ../src/js/browser.js
 */
(function(){
	var uagent   = navigator.userAgent.toLowerCase(),
	    
	    myAudio  = document.createElement('audio'),
	    
	    supports = {
			canvas:      false, // determined below
			touch:       TouchEvent in window,

			// specific browsers as determined above
			iPod:      (uagent.search('ipod')    > -1),
			iPhone:    (uagent.search('iphone')  > -1),
			iPad:      (uagent.search('ipad')    > -1),
			safari:    (uagent.search('safari')  > -1),
			ie:        (uagent.search('msie')    > -1),
		    firefox:   (uagent.search('firefox') > -1),
			android:   (uagent.search('android') > -1),
			silk:      (uagent.search('silk')    > -1),
			iOS:       false, //determined below
			mobile:    false, //determined below
			desktop:   false, //determined below
			
			// audio support as determined below
			ogg:         true,
			m4a:         true,
			mp3:         true
		},
	    aspects = platformer.settings.aspects,
	    supportsAspects = {},
	    i = 0,
	    j = 0,
	    k = 0,
	    foundAspect = false,
	    listAspects = '';
	
	supports.iOS     = supports.iPod || supports.iPhone  || supports.iPad;
	supports.mobile  = supports.iOS  || supports.android || supports.silk;
	supports.desktop = !supports.mobile;
	
	// Determine audio support
	if ((myAudio.canPlayType) && !(!!myAudio.canPlayType && "" != myAudio.canPlayType('audio/ogg; codecs="vorbis"'))){
	    supports.ogg = false;
	    if(supports.ie || !(!!myAudio.canPlayType && "" != myAudio.canPlayType('audio/mp4'))){
	    	supports.m4a = false; //make IE use mp3's since it doesn't like the version of m4a made for mobiles
	    }
	}

	// Does the browser support canvas?
	var canvas = document.createElement('canvas');
	try	{
		supports.canvas = !!(canvas.getContext('2d')); // S60
	} catch(e) {
		supports.canvas = !!(canvas.getContext); // IE
	}
	delete canvas;

		//replace settings aspects build array with actual support of aspects
		platformer.settings.aspects = supportsAspects;
	platformer.settings.aspects = {};
	for (i in aspects){
		foundAspect = false;
		listAspects = '';
		for (j in aspects[i]){
			listAspects += ' ' + j;
			for (k in aspects[i][j]){
				if (uagent.search(aspects[i][j][k]) > -1){
					platformer.settings.aspects[j] = true;
					foundAspect = true;
					break;
				}
			}
			if(foundAspect) break;
		}
		if(!foundAspect){
			console.warn('This browser doesn\'t support any of the following: ' + listAspects);
		}
	}

})();


/*--------------------------------------------------
 *   Main - ../src/js/main.js
 */
window.addEventListener('load', function(){
	var count = 0;
	loader = new createjs.PreloadJS();
	loader.onProgress = function (event) {
		console.log('Progress:', event);	
	};
	
	loader.onFileLoad = function (event) {
		var i  = 0,
		j      = 0,
		data   = event.data,
		result = event.result,
		ss     = undefined;
		
		console.log('Load:', event);
		
		if((event.type == "image") && data){
			//split up image if it's a sprite sheet
			if(data.rows && data.columns){
				ss = new createjs.SpriteSheet({
					images: [result],
					frames: {width: result.width / data.columns, height: result.height / data.rows}
				});
				for (j = 0; j < data.rows; j++) for (i = 0; i < data.columns; i++){
					if(data.ids && data.ids[i] && data.ids[i][j]){
						platformer.assets[data.ids[i][j]] = createjs.SpriteSheetUtils.extractFrame(ss, +j + (i * data.rows));
					} else {
						platformer.assets[event.id + '-' + i + '_' + j] = createjs.SpriteSheetUtils.extractFrame(ss, +j + (i * data.rows));
					}
				}
				return ;
			}
		}
		
		platformer.assets[event.id] = result;
	};
	
	loader.onError = function (event) {
		console.log('Your stuff broke!');
	};
	
	loader.onComplete = function (event) {
		platformer.game = new platformer.classes.game(platformer.settings);
		createjs.Ticker.setFPS(platformer.settings.global.fps);
		createjs.Ticker.addListener(platformer.game);
	};
	
	
	for(var i in platformer.settings.assets){
		if(typeof platformer.settings.assets[i].src !== 'string'){
			for(var j in platformer.settings.assets[i].src){
				if(platformer.settings.aspects[j] && platformer.settings.assets[i].src[j]){
					platformer.settings.assets[i].src = platformer.settings.assets[i].src[j];
					break;
				}
			}
			if(typeof platformer.settings.assets[i].src !== 'string'){
				if(platformer.settings.assets[i].src['default']){
					platformer.settings.assets[i].src = platformer.settings.assets[i].src['default'];
				} else {
					console.warn('Asset has no valid source for this browser.', platformer.settings.assets[i]);
				}
			}
		}
	}
	
	loader.installPlugin(createjs.SoundJS);
	loader.installPlugin(createjs.EaselJS);
	loader.loadManifest(platformer.settings.assets);
	platformer.assets = [];

}, false);
})();