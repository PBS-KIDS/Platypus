platformer.components['tiled-loader'] = (function(){
	var component = function(owner, definition){
		this.owner = owner;
		this.entities = [];
		
		// Messages that this component listens for
		this.listeners = [];
		this.addListeners(['load']);

		this.level = platformer.settings.levels[definition.level];
		this.tileEntityId = definition.tileEntityId || 'tile';
		this.unitsPerPixel = definition.unitsPerPixel || 1;
		this.images = definition.images || false;
		this.imagesScale = definition.imagesScale || this.unitsPerPixel;
		this.layerZ = 0;
		this.layerZStep = 1000;
	},
	proto = component.prototype; 

	proto['load'] = function(){
		var actionLayer = 0;
		
		for(; actionLayer < this.level.layers.length; actionLayer++){
			this.setupLayer(this.level.layers[actionLayer], this.level);
		}
		this.owner.removeComponent(this);
	};
	
	proto.setupLayer = function(layer, level){
		var width      = layer.width,
		height         = layer.height,
		images         = this.images || [],
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
		followEntity   = undefined,
		layerCollides  = true,
		numberProperty = false;

		if(images.length == 0){
			for (x = 0; x < tilesets.length; x++){
				if(platformer.assets[tilesets[x].name]){ // Prefer to have name in tiled match image id in game
					images.push(platformer.assets[tilesets[x].name]);
				} else {
					images.push(tilesets[x].image);
				}
			}
		} else {
			images = images.slice(); //so we do not overwrite settings array
			for (x = 0; x < images.length; x++){
				if(platformer.assets[images[x]]){
					images[x] = platformer.assets[images[x]];
				}
			}
		}

		if(layer.type == 'tilelayer'){
			// First determine which type of entity this layer should behave as:
			entity = 'tile-layer'; // default
			if(layer.properties && layer.properties.entity){
				entity = layer.properties.entity;
			} else { // If not explicitly defined, try using the name of the layer
				switch(layer.name){
				case "background":
					entity = 'render-layer';
					break;
				case "foreground":
					entity = 'render-layer';
					break;
				case "collision":
					entity = 'collision-layer';
					break;
				case "action":
					for (x = 0; x < level.layers.length; x++){
						if(level.layers[x].name === 'collision'){
							layerCollides = false;
						}
					}
					if(!layerCollides){
						entity = 'render-layer';
					}
					break;
				}
			}
			
			//TODO: a bit of a hack to copy an object instead of overwrite values
			tileDefinition  = JSON.parse(JSON.stringify(platformer.settings.entities[entity]));

			importAnimation = {};
			importCollision = [];
			importRender    = [];

			tileDefinition.properties            = tileDefinition.properties || {};
			tileDefinition.properties.width      = tileWidth  * width  * this.unitsPerPixel;
			tileDefinition.properties.height     = tileHeight * height * this.unitsPerPixel;
			tileDefinition.properties.columns    = width;
			tileDefinition.properties.rows       = height;
			tileDefinition.properties.tileWidth  = tileWidth  * this.unitsPerPixel;
			tileDefinition.properties.tileHeight = tileHeight * this.unitsPerPixel;
			tileDefinition.properties.scaleX     = this.imagesScale;
			tileDefinition.properties.scaleY     = this.imagesScale;
			tileDefinition.properties.layerZ     = this.layerZ;
			tileDefinition.properties.z    		 = this.layerZ;
			
			
			for (x = 0; x < width; x++){
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
							width:  tileWidth * this.unitsPerPixel / this.imagesScale,
							height: tileHeight * this.unitsPerPixel / this.imagesScale
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
				} else if(tileset.tileproperties[entity.gid - tileset.firstgid]){
					if(tileset.tileproperties[entity.gid - tileset.firstgid].entity){
						entityType = tileset.tileproperties[entity.gid - tileset.firstgid].entity;
					} else if (tileset.tileproperties[entity.gid - tileset.firstgid].type){
						entityType = tileset.tileproperties[entity.gid - tileset.firstgid].type;
					}
				}
				
				if(entityType !== ''){
					properties = {};
					//Copy properties from Tiled

					if(tileset.tileproperties[entity.gid - tileset.firstgid]){
						for (x in tileset.tileproperties[entity.gid - tileset.firstgid]){
							//This is going to assume that if you pass in something that starts with a number, it is a number and converts it to one.
							numberProperty = parseFloat(tileset.tileproperties[entity.gid - tileset.firstgid][x]);
							if (numberProperty == 0 || (!!numberProperty))
							{
								properties[x] = numberProperty;
							} else if(tileset.tileproperties[entity.gid - tileset.firstgid][x] == 'true') {
								properties[x] = true;
							} else if(tileset.tileproperties[entity.gid - tileset.firstgid][x] == 'false') {
								properties[x] = false;
							} else {
								properties[x] = tileset.tileproperties[entity.gid - tileset.firstgid][x];
							}
						}
					}
					
					for (x in entity.properties){
						//This is going to assume that if you pass in something that starts with a number, it is a number and converts it to one.
					    numberProperty = parseFloat(entity.properties[x]);
						if (numberProperty == 0 || (!!numberProperty))
						{
							properties[x] = numberProperty;
						} else if(entity.properties[x] == 'true') {
							properties[x] = true;
						} else if(entity.properties[x] == 'false') {
							properties[x] = false;
						} else {
							properties[x] = entity.properties[x];
						}
					}
					properties.width  = (entity.width  || tileWidth)  * this.unitsPerPixel;
					properties.height = (entity.height || tileHeight) * this.unitsPerPixel;
					properties.x = entity.x * this.unitsPerPixel + (properties.width / 2);
					properties.y = entity.y * this.unitsPerPixel;
					properties.scaleX = this.unitsPerPixel;
					properties.scaleY = this.unitsPerPixel;
					properties.layerZ = this.layerZ;
					//Setting the z value. All values are getting added to the layerZ value.
					if (properties.z) {
						properties.z += this.layerZ;
					} else if (entityType && platformer.settings.entities[entityType] && platformer.settings.entities[entityType].properties.z) {
						properties.z = this.layerZ + platformer.settings.entities[entityType].properties.z;
					} else {
						properties.z = this.layerZ;
					}
					
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
			width:  width  * tileWidth  * this.unitsPerPixel,
			height: height * tileHeight * this.unitsPerPixel,
			unitsPerPixel: this.unitsPerPixel,
			camera: followEntity
		});
		this.layerZ += this.layerZStep;
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
		func = callback || function(value, debug){
			self[messageId](value, debug);
		};
		this.owner.bind(messageId, func);
		this.listeners[messageId] = func;
	};

	proto.removeListener = function(boundMessageId, callback){
		this.owner.unbind(boundMessageId, callback);
	};
	
	return component;
})();
