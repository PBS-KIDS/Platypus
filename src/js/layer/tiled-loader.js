gws.components['tiled-loader'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['load']);

		this.level = gws.settings.levels[definition.level];
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
		tileDefinition = gws.settings.entities[this.tileEntityId];

		tileDefinition.properties        = tileDefinition.properties || {};
		tileDefinition.properties.width  = tileWidth;
		tileDefinition.properties.height = tileHeight;
		
		for (x = 0; x < tilesets.length; x++){
			if(gws.assets[tilesets[x].name]){ // Prefer to have name in tiled match image id in game
				images.push(gws.assets[tilesets[x].name]);
			} else {
				images.push(tilesets[x].image);
			}
		}
		for (x = 0; x < tileDefinition.components.length; x++){
			if(tileDefinition.components[x].spritesheet == 'import'){
				tileDefinition.components[x].spritesheet = {
					images: images,
					frames: {
						width:  tileWidth,
						height: tileHeight
					}
				};
			}
		}
		if(layer.type == 'tilelayer'){
			for (y = 0; y < height; y++){
				for (x = 0; x < height; x++){
					tileDefinition.components[0].spritesheet.animations = {
						tile: +layer.data[x + y * width] - 1
					};
					this.owner.addEntity(new gws.classes.entity(tileDefinition, {properties:{x:x * tileWidth, y:y * tileHeight}}));
				}
			}
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
