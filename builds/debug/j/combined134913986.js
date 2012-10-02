gws = this.gws || {};
gws.settings = {"global":{"initialScene":"scene-1","fps":60,"rootElement":"root"},"assets":[{"id":"powerup","src":{"ogg":"a/powerup.ogg","mp3":"a/powerup.mp3"}},{"id":"alpha","src":"i/test.png","data":{"rows":2,"columns":2,"ids":[["horizon","sky"],["ground","rock"]]}},{"id":"beta","src":"i/mookie.png"},{"id":"tilemap","src":"i/tile-map.png"},{"id":"test","src":"i/test.png"},{"id":"test-animation","src":"i/test-animation.png"}],"classes":{"Game":{"id":"Game","src":"../src/js/game.js"},"Input":{"id":"Input","src":"../src/js/input.js"},"Entity":{"id":"Entity","src":"../src/js/entity.js"},"Layer":{"id":"Layer","src":"../src/js/layer.js"},"Scene":{"id":"Scene","src":"../src/js/scene.js"}},"components":{"entity-container":{"id":"entity-container","src":"../src/js/entity/entity-container.js"},"entity-controller":{"id":"entity-controller","src":"../src/js/entity/entity-controller.js"},"layer-controller":{"id":"layer-controller","src":"../src/js/layer/layer-controller.js"},"tiled-loader":{"id":"tiled-loader","src":"../src/js/layer/tiled-loader.js"},"lc-render":{"id":"lc-render","src":"../src/js/layer/lc-render.js"},"lc-logic":{"id":"lc-logic","src":"../src/js/layer/lc-logic.js"},"lc-camera":{"id":"lc-camera","src":"../src/js/layer/lc-camera.js"},"lc-basic-collision":{"id":"lc-basic-collision","src":"../src/js/layer/lc-basic-collision.js"},"render-debug":{"id":"render-debug","src":"../src/js/entity/render-debug.js"},"render-tile":{"id":"render-tile","src":"../src/js/entity/render-tile.js"},"render-tiles":{"id":"render-tiles","src":"../src/js/entity/render-tiles.js"},"render-button":{"id":"render-button","src":"../src/js/entity/render-button.js"},"render-hero":{"id":"render-hero","src":"../src/js/entity/render-hero.js"},"logic-button":{"id":"logic-button","src":"../src/js/entity/logic-button.js"},"logic-hero":{"id":"logic-hero","src":"../src/js/entity/logic-hero.js"},"collision-hero":{"id":"collision-hero","src":"../src/js/entity/collision-hero.js"}},"entities":{"tile":{"id":"tile","components":[{"type":"render-tile","spritesheet":"import"}]},"tile-layer":{"id":"tile-layer","components":[{"type":"render-tiles","spritesheet":"import","imageMap":"import"}]},"button":{"id":"button","assets":[{"id":"mookie-standing","src":"../../images/mookie.png"}],"components":[{"type":"entity-controller","controlMap":{"key:a":"go-left","key:left-arrow":"go-left","key:d":"go-right","key:right-arrow":"go-right","mouse:left-button":"go-left","mouse:right-button":"go-right"}},{"type":"logic-button"},{"type":"render-button"},{"type":"render-debug"}],"properties":{"debug-events":["go-left","go-right"],"state":false,"x":10,"y":10,"width":24,"height":24}},"hero":{"id":"hero","components":[{"type":"entity-controller","controlMap":{"key:w":"key-up","key:up-arrow":"key-up","key:a":"key-left","key:left-arrow":"key-left","key:s":"key-down","key:down-arrow":"key-down","key:d":"key-right","key:right-arrow":"key-right"}},{"type":"logic-hero"},{"type":"collision-hero","AABB":[0,0,24,24],"collisionType":"hero","collidesWith":["solid"]},{"type":"render-hero","spriteSheet":{"images":["test-animation"],"frames":{"width":24,"height":24},"animations":{"standing-north":[0],"standing-east":[3],"standing-south":[6],"standing-west":[9],"walking-north":{"frames":[0,1,2,1],"frequency":4},"walking-east":{"frames":[3,4,5,4],"frequency":4},"walking-south":{"frames":[6,7,8,7],"frequency":4},"walking-west":{"frames":[9,10,11,10],"frequency":4}}}},{"type":"render-debug"}],"properties":{"debug-events":["key:a:up","key:a:down","go-left"],"x":10,"y":10,"width":24,"height":24,"state":"standing","heading":"south"}},"block":{"id":"block","components":[{"type":"collision-hero","AABB":[0,0,24,24]},{"type":"render-debug"}],"properties":{"debug-events":["key:a:up","key:a:down","go-left"],"x":50,"y":50,"width":24,"height":24}}},"includes":{"EaselJS":{"id":"EaselJS","src":"http://code.createjs.com/easeljs-0.5.0.min.js"},"TweenJS":{"id":"TweenJS","src":"http://code.createjs.com/tweenjs-0.3.0.min.js"},"SoundJS":{"id":"SoundJS","src":"http://code.createjs.com/soundjs-0.3.0.min.js"},"PreloadJS":{"id":"PreloadJS","src":"http://code.createjs.com/preloadjs-0.2.0.min.js"},"Browser":{"id":"Browser","src":"../src/js/browser.js"},"Main":{"id":"Main","src":"../src/js/main.js"},"GameCSS":{"id":"GameCSS","src":"../src/css/game.css"}},"scenes":{"scene-menu":{"layers":[{"id":"buttons","components":[{"type":"lc-logic"},{"type":"lc-render"},{"type":"layer-controller"},{"type":"entity-container","entities":[{"type":"button"}]}]}],"id":"scene-menu"},"scene-1":{"layers":[{"id":"action","components":[{"type":"lc-logic"},{"type":"lc-basic-collision"},{"type":"lc-render"},{"type":"layer-controller"},{"type":"entity-container"},{"type":"tiled-loader","level":"level-1"}]}],"id":"scene-1"}},"levels":{"level-1":{"height":20,"layers":[{"data":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],"height":20,"name":"background","opacity":1,"type":"tilelayer","visible":true,"width":20,"x":0,"y":0},{"data":[17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,22,16,16,16,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,23,0,15,16,16,16,16,16,17,0,15,17,0,0,15,16,16,16,16,22,23,0,0,0,0,0,0,0,0,0,0,23,0,0,0,0,0,0,0,21,23,0,0,0,0,0,0,0,0,0,0,22,17,0,0,0,0,0,0,21,23,0,0,0,0,0,0,0,0,0,0,0,22,17,0,0,0,0,0,21,22,16,16,16,17,0,0,0,0,0,0,0,0,22,16,16,16,17,0,21,23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,5,0,0,0,0,0,0,9,9,0,0,0,0,0,0,0,0,0,0,21,23,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,21,5,0,0,0,0,0,3,3,15,17,3,3,3,0,0,0,0,0,0,4,5,0,0,0,0,0,3,3,21,23,9,9,9,17,0,0,0,0,0,4,23,0,0,0,0,0,3,3,21,23,9,9,15,22,17,9,9,9,9,21,22,16,16,16,16,16,16,16,22,22,16,16,22,22,22,16,16,16,16,22],"height":20,"name":"map","opacity":1,"type":"tilelayer","visible":true,"width":20,"x":0,"y":0},{"height":20,"name":"guys","objects":[{"gid":19,"height":0,"name":"","properties":{},"type":"hero","width":0,"x":49,"y":144},{"gid":6,"height":0,"name":"","properties":{},"type":"","width":0,"x":257,"y":156},{"gid":6,"height":0,"name":"","properties":{},"type":"","width":0,"x":281,"y":142},{"gid":6,"height":0,"name":"","properties":{},"type":"","width":0,"x":306,"y":152},{"gid":6,"height":0,"name":"","properties":{},"type":"","width":0,"x":363,"y":266},{"gid":6,"height":0,"name":"","properties":{},"type":"","width":0,"x":47,"y":272},{"gid":6,"height":0,"name":"","properties":{},"type":"","width":0,"x":142,"y":328},{"gid":6,"height":0,"name":"","properties":{},"type":"","width":0,"x":251,"y":449},{"gid":6,"height":0,"name":"","properties":{},"type":"","width":0,"x":424,"y":428},{"gid":12,"height":0,"name":"","properties":{},"type":"","width":0,"x":167,"y":192},{"gid":18,"height":0,"name":"","properties":{},"type":"","width":0,"x":409,"y":191},{"gid":18,"height":0,"name":"","properties":{},"type":"","width":0,"x":409,"y":166},{"gid":24,"height":0,"name":"","properties":{},"type":"","width":0,"x":364,"y":193},{"gid":28,"height":0,"name":"","properties":{},"type":"","width":0,"x":144,"y":384},{"height":37,"name":"","properties":{},"type":"","width":35,"x":419,"y":64},{"height":29,"name":"","properties":{},"type":"","width":46,"x":73,"y":402},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":96,"y":288},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":192,"y":384},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":144,"y":360},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":216,"y":360},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":120,"y":456},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":96,"y":264},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":216,"y":384},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":120,"y":432},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":120,"y":408},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":72,"y":456},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":96,"y":456},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":240,"y":384},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":288,"y":240},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":288,"y":216},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":288,"y":192},{"gid":10,"height":0,"name":"","properties":{},"type":"","width":0,"x":96,"y":144}],"opacity":1,"type":"objectgroup","visible":true,"width":20,"x":0,"y":0}],"orientation":"orthogonal","properties":{"timer":"12"},"tileheight":24,"tilesets":[{"firstgid":1,"image":"../src/images/tile-map.png","imageheight":96,"imagewidth":144,"margin":0,"name":"tilemap","properties":{},"spacing":0,"tileheight":24,"tileproperties":{"11":{"entity":"sign"},"17":{"entity":"enemy"},"18":{"entity":"mookie"},"23":{"entity":"flower"},"5":{"entity":"gem"},"9":{"entity":"block"}},"tilewidth":24},{"firstgid":25,"image":"../src/images/test.png","imageheight":48,"imagewidth":48,"margin":0,"name":"test","properties":{},"spacing":0,"tileheight":24,"tileproperties":{"3":{"a":"b"}},"tilewidth":24}],"tilewidth":24,"version":1,"width":20,"id":"level-1"}}};
gws.classes = {};

/*--------------------------------------------------
 *   Game - ../src/js/game.js
 */
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

/*--------------------------------------------------
 *   Input - ../src/js/input.js
 */
/*
 * INPUT
 */

gws.classes.input = (function(){
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
gws.classes.entity = (function(){
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
			if(gws.components[componentDefinition.type]){
				self.addComponent(new gws.components[componentDefinition.type](self, componentDefinition));
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
		if(this['debug-events']) {
			for (var i in this['debug-events']) if(this['debug-events'][i] == messageId) console.log(messageId, value);
		}
		if(this.messages[messageId]){
			for (var x in this.messages[messageId]){
				this.messages[messageId][x](value);
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
gws.classes.layer = (function(){
	var layer = function(definition, rootElement){
		var componentDefinitions = definition.components,
		componentDefinition = undefined;
		
		this.rootElement = rootElement;
		this.components = [];
		this.tickMessages = [];
		this.messages   = [];
		
		for (var index in componentDefinitions){
			componentDefinition = componentDefinitions[index];
			this.addComponent(new gws.components[componentDefinition.type || componentDefinition.id](this, componentDefinition));
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
	
	proto.trigger = function(message, value){
		if(this.messages[message]){
			for (messageIndex in this.messages[message]){
				this.messages[message][messageIndex](value);
			}
		}
	};
	
	return layer;
})();

/*--------------------------------------------------
 *   Scene - ../src/js/scene.js
 */
gws.classes.scene = (function(){
	var scene = function(definition, rootElement){
		var layers = definition.layers;
		this.rootElement = rootElement;
		this.layers = [];
		for(var layer in layers){
			this.layers.push(new gws.classes.layer(layers[layer], this.rootElement));
		}
	};
	var proto = scene.prototype;
	
	proto.tick = function(deltaT){
		for(var layer in this.layers){
			this.layers[layer].tick(deltaT);
		}
	};
	
	proto.triggerInputEvent = function(eventId, event){
		for(var layer in this.layers){
			this.layers[layer].trigger(eventId, event);
		}
	};
	
	return scene;
})();

gws.components = {};

/*--------------------------------------------------
 *   entity-container - ../src/js/entity/entity-container.js
 */
gws.components['entity-container'] = (function(){
	var component = function(owner, definition){
		var self = this,
		x        = 0;

		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.entities = [];
		this.definedEntities = definition.entities; //saving for load message
		
		this.owner.entities     = self.entities;
		this.owner.addEntity    = function(entity){self.addEntity(entity);};
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
				 this.addEntity(new gws.classes.entity(gws.settings.entities[entities[x].type], entities[x]));
			}
		}
	};
	
	proto.addEntity = proto['add-entity'] = function (entity) {
		this.entities.push(entity);
		this.owner.trigger('entity-added', entity);
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
gws.components['entity-controller'] = (function(){
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
		this.addListeners(['load', 'controller', 'controller:load', 'controller:tick']);
		
		this.acceptMouseInput = false; //Don't accept mouse input by default
		this.acceptTouchInput = false; //Don't accept touch input by default
		if(definition && definition.controlMap){
			this.actions  = {};
			for(key in definition.controlMap){
				actionState = this.actions[definition.controlMap[key]]; // If there's already a state storage object for this action, reuse it: there are multiple keys mapped to the same action.
				if(!actionState){                                // Otherwise create a new state storage object
					actionState = this.actions[definition.controlMap[key]] = new state();
				}
				proto[key + ':up']   = createUpHandler(actionState);
				proto[key + ':down'] = createDownHandler(actionState);
				this.addListener(key + ':up');
				this.addListener(key + ':down');
				if(key.indexOf('mouse') > -1){
					this.acceptMouseInput = true;
				}
				if(key.indexOf('touch') > -1){
					this.acceptTouchInput = true;
				}
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
		//TODO: make sure rendering components send along touch and click events, and turn them off appropriately
		self  = this;
		if(this.acceptMouseInput){
			this.owner.trigger('controller:input-handler', {
				mousedown: function(event, over) {self.owner.trigger('mouse:' + mouseMap[event.button] + ':down', {over: over});},
				mouseup:   function(event, over) {self.owner.trigger('mouse:' + mouseMap[event.button] + ':up',   {over: over});},
				mousemove: function(event, over) {self.owner.trigger('mouse:move',   {over: over});}
			});
		}
		if(this.acceptTouchInput){
			this.owner.trigger('controller:input-handler', {
				touchdown: function(event, over) {self.owner.trigger('touch:down', {over: over});},
				touchup:   function(event, over) {self.owner.trigger('touch:up',   {over: over});},
				touchmove: function(event, over) {self.owner.trigger('touch:move', {over: over});}
			});
		}
	};
	
	proto['mouse:move'] = function(value){
		if(this.actions['mouse:left-button'] && (this.actions['mouse:left-button'].over !== value.over))     this.actions['mouse:left-button'].over = value.over;
		if(this.actions['mouse:middle-button'] && (this.actions['mouse:middle-button'].over !== value.over)) this.actions['mouse:middle-button'].over = value.over;
		if(this.actions['mouse:right-button'] && (this.actions['mouse:right-button'].over !== value.over))   this.actions['mouse:right-button'].over = value.over;
	};
	
	proto['touch:move'] = function(value){
		if(this.actions['touch'] && (this.actions['touch'].over !== value.over))  this.actions['touch'].over = value.over;
	};

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
 *   layer-controller - ../src/js/layer/layer-controller.js
 */
gws.components['layer-controller'] = (function(){
	var keyMap = {
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
gws.components['tiled-loader'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['load']);

		this.level = gws.settings.levels[definition.level];
		this.tileEntityId = definition.tileEntityId || 'tile';
		this.tileLayerEntityId = definition.tileLayerEntityId || 'tile-layer';
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
		importRender   = undefined;

		for (x = 0; x < tilesets.length; x++){
			if(gws.assets[tilesets[x].name]){ // Prefer to have name in tiled match image id in game
				images.push(gws.assets[tilesets[x].name]);
			} else {
				images.push(tilesets[x].image);
			}
		}
		if(layer.type == 'tilelayer'){
			//TODO: a bit of a hack to copy an object instead of overwrite values
			tileDefinition  = JSON.parse(JSON.stringify(gws.settings.entities[this.tileLayerEntityId]));

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
			this.owner.addEntity(new gws.classes.entity(tileDefinition, {properties:{}}));
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
					
					this.owner.addEntity(new gws.classes.entity(gws.settings.entities[entityType], {properties:properties}));
				}
			}
		}
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
gws.components['lc-render'] = (function(){
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
		this.canvas.width = 1024;
		this.canvas.height = 768;
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
gws.components['lc-logic'] = (function(){
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
gws.components['lc-camera'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		
		this.tickMessages = ['camera'];
		this.addListeners(['resize', 'camera', 'load']);  
		
		
		//The dimensions of the camera in the window
		this.portalTop = this.owner.rootElement.innerTop;
		this.portalLeft = this.owner.rootElement.innerLeft;
		this.portalWidth = this.owner.rootElement.offsetWidth;
		this.portalHeight = this.owner.rootElement.offsetHeight;
		
		//The dimensions of the camera in the game world
		this.width = definition.width; 
		this.height = definition.height;
		this.left = 0;
		this.top = 0; 
		
		this.worldWidth = 0; //definition.worldWidth;
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
		this.worldWidth = this.owner.worldWidth || 2048;
		this.worldHeight = this.owner.worldHeight || 768;		
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
				if (this.left == this.worldWidth - this.width)
				{
					this.direction = !this.direction;
				}
			} else {
				this.move(this.left - speed, this.top);
				if (this.left == 0)
				{
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
	
	proto['follow'] = function (mode, entity, def)
	{
		switch (mode)
		{
		case 'locked':
			this.following = entity;
			this.followingFunction = this.lockedFollow;
		case 'bounding':
			this.following = entity;
			this.setBoundingArea(def.top, def.left, def.width, def.height);
			this.followingFunction = this.boundingFollow;
		case 'custom':
			this.following = entity;
			this.followingFunction = def.followingFunction;
		case 'static':
		default:
			this.following = undefined;
			this.followingFunction = undefined;
		}
		
	};
	
	proto.move = function (newleft, newtop)
	{
		if (newleft + this.width > this.worldWidth)
		{
			this.left = this.worldWidth - this.width;
		} else if (newleft < 0) {
			this.left = 0; 
		} else {
			this.left = newleft;
		}
		
		if (newtop + this.height > this.worldHeight)
		{
			this.top = this.worldHeight - this.height;
		} else if (newtop < 0) {
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
gws.components['lc-basic-collision'] = (function(){
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
		
		for (var x = 0; x < messageIds.length; x++)
		{
			if (messageIds[x] == 'layer:collision')
			{
				this.entities.push(entity);
				if(!this.collisionMatrix[entity.type])
				{
					this.collisionMatrix[entity.type] = {};
					for (var x = 0; x < entity.collidesWith.length; x++)
					{
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
		this.checkCollision();
		this.resolveCollisions();
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
					if(this.AABBCollision(this.entities[x], this.entities[y]))
					{
						if (this.preciseCollision(this.entities[x], this.entities[y]))
						{
							if (this.collisionMatrix[this.entities[x].type][this.entities[y].collisionType])
							{
								var index = this.toResolve.length;
								this.toResolve[index] = [];
								this.toResolve[index][0] = this.entities[x];
								this.toResolve[index][1] = this.entities[y];
							}
							
							if (this.collisionMatrix[this.entities[y].type][this.entities[x].collisionType])
							{
								var index = this.toResolve.length;
								this.toResolve[index] = [];
								this.toResolve[index][0] = this.entities[y];
								this.toResolve[index][1] = this.entities[x];
							}
						}
					}
				}
			}
		}
	};
	
	proto.AABBCollision = function (entityA, entityB)
	{
		//TODO: Find a way to not repeat this over and over each time we check this.
		//Maybe call all the entities and have them update their AABB box locations.
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
	};
	
	proto.preciseCollision = function (entityX, entityY)
	{
		return true;
	};
	
	
	proto.resolveCollisions = function ()
	{
		for (var x = 0; x < this.toResolve.length; x++)
		{
			this.toResolve[x][0].trigger('layer:resolve-collision', this.toResolve[x][1]);
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
 *   render-debug - ../src/js/entity/render-debug.js
 */
gws.components['render-debug'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		this.controllerEvents = undefined;
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['layer:render', 'layer:render-load', 'controller:input-handler']);
	};
	var proto = component.prototype;

	proto['layer:render'] = function(stage){
		this.shape.x = this.owner.x;
		this.shape.y = this.owner.y;
		this.txt.x = this.owner.x + (this.owner.width / 2);
		this.txt.y = this.owner.y + (this.owner.height / 2);
		
	};

	proto['layer:render-load'] = function(resp){
		var x  = this.owner.x      = this.owner.x || 0,
		y      = this.owner.y      = this.owner.y || 0,
		width  = this.owner.width  = this.owner.width  || 300,
		height = this.owner.height = this.owner.height || 100,
		comps = gws.settings.entities[this.owner.type]?(gws.settings.entities[this.owner.type].components || []):[],
		components = [];
		
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
		
		this.shape = new createjs.Shape((new createjs.Graphics()).beginStroke("#880").rect(0, 0, width, height));

		this.stage.addChild(this.shape);
		this.stage.addChild(this.txt);
		
		if(this.controllerEvents){
			this['controller:input-handler'](this.controllerEvents);
		}
	};
	
	/*
	 *  This handler appends necessary information to displayed objects to allow them to receive touches and clicks
	 */
	proto['controller:input-handler'] = function(events){
		var over  = false,
		mousedown = events.mousedown,
		mouseup   = events.mouseup,
		mousemove = events.mousemove;
		//TODO: receive touch input; maybe try moving most of this to input controller if possible with a reference to the stage?
		if(this.stage){
			if (mousedown || mouseup || mousemove){
				
				this.stage.enableMouseOver();
				this.shape.onPress     = function(event) {
					if(mousedown){
						mousedown(event.nativeEvent, over, event.stageX, event.stageY);
					}
					if(mouseup){
						event.onMouseUp = function(event){
							mouseup(event.nativeEvent, over, event.stageX, event.stageY);
						};
					}
					if(mousemove){
						event.onMouseMove = function(event){
							mousemove(event.nativeEvent, over, event.stageX, event.stageY);
						};
					}
				};
				this.shape.onMouseOut  = function(){over = false;};
				this.shape.onMouseOver = function(){over = true;};
			}
		} else {
			this.controllerEvents = events; //save until we have an object to attach these events to.
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
gws.components['render-tile'] = (function(){
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
gws.components['render-tiles'] = (function(){
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
gws.components['render-button'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['layer:render-load', 'layer:render', 'controller:input']);
		this.stage = undefined;
		this.upBitmap = new createjs.Bitmap(gws.assets[definition.upImg]);
		this.downBitmap = new createjs.Bitmap(gws.assets[definition.downImg]);
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
 *   render-hero - ../src/js/entity/render-hero.js
 */
gws.components['render-hero'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['layer:render-load','layer:render', 'logical-state']);
		this.stage = undefined;
		for (var x = 0; x < definition.spriteSheet.images.length; x++)
		{
			definition.spriteSheet.images[x] = gws.assets[definition.spriteSheet.images[x]];
		}
		var spriteSheet = new createjs.SpriteSheet(definition.spriteSheet);
		this.anim = new createjs.BitmapAnimation(spriteSheet);
		this.currentAnimation = '';
	};
	var proto = component.prototype;
	
	proto['layer:render-load'] = function(obj){
		this.stage = obj.stage;
		this.stage.addChild(this.anim);
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
 *   logic-button - ../src/js/entity/logic-button.js
 */
gws.components['logic-button'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['layer:logic', 'go-left', 'go-right']);
		
		this.leftMax = 10;
		this.rightMax = 100;
		this.direction = 0;
	};
	var proto = component.prototype;
	
	proto['go-left'] = function (state) {
		if(state.pressed){
			this.direction = -1; 
		} else {
			this.direction = 0; 
		}
	};
	
	proto['go-right'] = function (state) {
		if(state.pressed){
			this.direction = 1; 
		} else {
			this.direction = 0; 
		}
	};
	
	proto['layer:logic'] = function(obj){
		if (this.direction)
		{
			this.owner.x += this.direction;
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
gws.components['logic-hero'] = (function(){
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
		}
		
		this.owner.x += (vX * deltaT);
		this.owner.y += (vY * deltaT);
		
		this.left = false;
		this.right = false;
		this.up = false;
		this.down = false;
		
		this.owner.trigger('logical-state', {state: this.owner.state + '-' + this.owner.heading});
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
gws.components['collision-hero'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		
		// Messages that this component listens for
		this.listeners = [];

		this.addListeners(['load', 'layer:collision']);
		this.owner.AABB = definition.AABB || [0, 0, 16, 16]; //offsetX, offsetY, width, height
		this.owner.collisionType = definition.collisionType || 'solid';
		this.owner.collidesWith = definition.collidesWith || [];
	};
	var proto = component.prototype;
	
	
	proto['load'] = function(resp){
		
	};
	
	proto['layer:resolve-collision'] = function(entity){
		switch (entity.type)
		{
		case 'block':
			console.log(this.owner.type + ': There is a collision!');
			break;
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
 *   Browser - ../src/js/browser.js
 */
/*
 * gws.browserCheck() should be called once the document is loaded to determine what's supported.
 * Ideally run it once and store the checks so it's a simple variable request when you need to
 * know whether something is supported. Like so:
 * 
 *     gws.browser = gws.browserCheck();
 *     
 *     elsewhere:
 *     
 *     if(gws.browser.transitions) {
 *         Implement something that uses transitions
 *     } else {
 *         Alternative for browsers who don't
 *     }
 *     
 * - DDD
 */
(function(){
	var uagent   = navigator.userAgent.toLowerCase(),
        iPod     = (uagent.search('ipod')    > -1),
        iPhone   = (uagent.search('iphone')  > -1),
        iPad     = (uagent.search('ipad')    > -1),
        safari   = (uagent.search('safari')  > -1),
        ie       = (uagent.search('msie')    > -1),
        android  = (uagent.search('android') > -1),
        silk     = (uagent.search('silk')    > -1),
	    firefox  = (uagent.search('firefox') > -1),
	    
	    myAudio  = document.createElement('audio'),
	    doc      = document.documentElement,
	    manifest = doc.getAttribute("manifest"),
	    
	    supportsOgg = true,
	    supportsM4a = true,
	    
	    supportsTouch = TouchEvent in window;
	
	//Turn off manifest for firefox and iOS since they show awkward pop-ups about storage - DDD
//	if(firefox || iPad || iPod || iPhone){
//		document.documentElement.removeAttribute("manifest");
//	}

	//Determine relevant aspects:
	if ((myAudio.canPlayType) && !(!!myAudio.canPlayType && "" != myAudio.canPlayType('audio/ogg; codecs="vorbis"'))){
	    supportsOgg = false;
	    if(ie || !(!!myAudio.canPlayType && "" != myAudio.canPlayType('audio/mp4'))){
	    	supportsM4a = false; //make IE use mp3's since it doesn't like the version of m4a made for mobiles
	        if(manifest) doc.setAttribute("manifest", manifest.replace('ogg','mp3'));
	    } else {
	        if(manifest) doc.setAttribute("manifest", manifest.replace('ogg','m4a'));
	    }
	}
	
	/* 
	 * Handle app cache here so we don't download assets a browser can't use.
	 */
	if(manifest){
		
	}
	
	gws.browserCheck = function(){
		var checks = {
			canvas:      false,
			mobile:      false,
			webgl:       false,
			transitions: false,
			progress:    false,
			css3dTransforms:false,
			
			// specific browsers as determined above
			iPod:        iPod,
			iPhone:      iPhone,
			iPad:        iPad,
			iOS:         iPod || iPhone || iPad,
			safari:      safari,
			ie:          ie,
			android:     android,
			silk:        silk,
			
			// audio support as determined above
			ogg:         supportsOgg,
			m4a:         supportsM4a,
			
			touch:       supportsTouch
		};
		
		// Does the browser support canvas?
		var canvas = document.createElement('canvas');
		try
		{
			checks.canvas = !!(canvas.getContext('2d')); // S60
		} catch(e) {
			checks.canvas = !!(canvas.getContext); // IE
		}
		delete canvas;
		
		// Does the browser support webgl?
		checks.webgl = false;
		if (window.WebGLRenderingContext)
		{
			try{if (document.createElement('canvas').getContext("webgl")) checks.webgl = true;}catch(e){}
			try{if (document.createElement('canvas').getContext("experimental-webgl")) checks.webgl = true;}catch(e){}
		} 
		
		// Are transitions supported?
	    var div = document.createElement('div');
	    div.setAttribute('style', 'transition:top 1s ease;-webkit-transition:top 1s ease;-moz-transition:top 1s ease;-o-transition:top 1s ease;');
	    checks.transitions = !!((div.style.transition || div.style.webkitTransition || div.style.MozTransition || div.style.OTransition) && !(document.all)); // the last bit knocks out IE9 since it returns true for transitions support but doesn't actually support them.
	    delete div;
	    
	    if(window.Modernizr) checks.css3dTransforms = Modernizr.csstransforms3d;
	    
	    // Does it support the progress bar?
	    checks.progress = ('position' in document.createElement('progress'));
	    
	    checks.mobile = checks.android || checks.iOS || checks.silk;
	    
	    return checks;
	};
})();


/*--------------------------------------------------
 *   Main - ../src/js/main.js
 */
window.addEventListener('load', function(){
	//gws.settings.assets
	var root = this;
	
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
						gws.assets[data.ids[i][j]] = createjs.SpriteSheetUtils.extractFrame(ss, +j + (i * data.rows));
					} else {
						gws.assets[event.id + '-' + i + '_' + j] = createjs.SpriteSheetUtils.extractFrame(ss, +j + (i * data.rows));
					}
				}
				return ;
			}
		}
		
		gws.assets[event.id] = result;
	};
	
	loader.onError = function (event) {
		console.log('Your stuff broke!');
	};
	
	loader.onComplete = function (event) {
		
		root.game = new gws.classes.game(gws.settings);
		createjs.Ticker.setFPS(gws.settings.global.fps);
		createjs.Ticker.addListener(root.game);
	};
	
	
	gws.browser = gws.browserCheck();
	for(var i in gws.settings.assets){
		if(typeof gws.settings.assets[i].src !== 'string'){
			for(var j in gws.settings.assets[i].src){
				if(gws.browser[j]){
					gws.settings.assets[i].src = gws.settings.assets[i].src[j];
					break;
				}
			}
			if(typeof gws.settings.assets[i].src !== 'string'){
				if(gws.settings.assets[i].src['default']){
					gws.settings.assets[i].src = gws.settings.assets[i].src['default'];
				} else {
					console.warning('Asset has no valid source for this browser.', gws.settings.assets[i]);
				}
			}
		}
	}
	
	loader.loadManifest(gws.settings.assets);
	gws.assets = [];
});
