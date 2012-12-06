/**
# COMPONENT **tiled-loader**
This component is attached to a top-level entity (loaded by the [[Scene]]) and, once its peer components are loaded, ingests a JSON file exported from the [Tiled map editor] [link1] and creates the tile maps and entities. Once it has finished loading the map, it removes itself from the list of components on the entity.

## Dependencies:
- Component [[Entity-Container]] (on entity's parent) - This component uses `entity.addEntity()` on the entity, provided by `entity-container`.
- Entity **collision-layer** - Used to create map entities corresponding with Tiled collision layers.
- Entity **render-layer** - Used to create map entities corresponding with Tiled render layers.
- Entity **tile-layer** - Used to create map entities corresponding with Tiled collision and render layers.

## Messages

### Listens for:
- **load** - On receiving this message, the component commences loading the Tiled map JSON definition. Once finished, it removes itself from the entity's list of components.

### Local Broadcasts:
- **world-loaded** - Once finished loading the map, this message is triggered on the entity to notify other components of completion.
  > @param message.width (number) - The width of the world in world units.
  > @param message.height (number) - The height of the world in world units.
  > @param message.camera ([[Entity]]) - If a camera property is found on one of the loaded entities, this property will point to the entity on load that a world camera should focus on.

## JSON Definition:
    {
      "type": "tiled-loader",
      
      "level": "level-4",
      // Required. Specifies the JSON level to load.
      
      "unitsPerPixel": 10,
      // Optional. Sets how many world units in width and height correspond to a single pixel in the Tiled map. Default is 1: One pixel is one world unit.
      
      "images": ["spritesheet-1", "spritesheet-2"],
      // Optional. If specified, the referenced images are used as the game spritesheets instead of the images referenced in the Tiled map. This is useful for using different or better quality art from the art used in creating the Tiled map.
      
      "imagesScale": 5,
      // Optional. If images are set above, this property sets the scale of the art relative to world coordinates. Defaults to the value set in "unitsPerPixel".
      
      "zStep": 500
      // Optional. Adds step number to each additional Tiled layer to maintain z-order. Defaults to 1000.
    }

[link1]: http://www.mapeditor.org/
*/
platformer.components['tiled-loader'] = (function(){
	var component = function(owner, definition){
		this.owner        = owner;
		this.entities     = [];
		this.layerZ       = 0;
		this.followEntity = false;
		this.listeners    = [];

		this.level = platformer.settings.levels[this.owner.level || definition.level];

		this.unitsPerPixel = this.owner.unitsPerPixel || definition.unitsPerPixel || 1;
		this.images        = this.owner.images        || definition.images        || false;
		this.imagesScale   = this.owner.imagesScale   || definition.imagesScale   || this.unitsPerPixel;
		this.layerZStep    = this.owner.zStep         || definition.zStep         || 1000;
		this.separateTiles = this.owner.separateTiles || definition.separateTiles || false;

		// Messages that this component listens for
		this.addListeners(['load']);
	},
	proto = component.prototype; 

	proto['load'] = function(){
		var actionLayer = 0,
		layer = false;
		
		for(; actionLayer < this.level.layers.length; actionLayer++){
			layer = this.setupLayer(this.level.layers[actionLayer], this.level, layer);
			if (this.separateTiles){
				layer = false;
			}
		}
		this.owner.trigger('world-loaded', {
			width:  this.level.width  * this.level.tilewidth  * this.unitsPerPixel,
			height: this.level.height * this.level.tileheight * this.unitsPerPixel,
			camera: this.followEntity
		});
		this.owner.removeComponent(this);
	};
	
	proto.setupLayer = function(layer, level, combineRenderLayer){
		var self       = this,
		images         = self.images || [],
		tilesets       = level.tilesets,
		tileWidth      = level.tilewidth,
		tileHeight     = level.tileheight,
		tileTypes      = (tilesets[tilesets.length - 1].imagewidth / tileWidth) * (tilesets[tilesets.length - 1].imageheight / tileHeight) + tilesets[tilesets.length - 1].firstgid,
		x              = 0,
		y              = 0,
		obj            = 0,
		entity         = undefined,
		entityType     = '',
		tileset        = undefined,
		properties     = undefined,
		layerCollides  = true,
		numberProperty = false,
		createLayer = function(entityKind){
			var width      = layer.width,
			height         = layer.height,
			tileDefinition = undefined,
			importAnimation= undefined,
			importCollision= undefined,
			importRender   = undefined,
			renderTiles    = false;
			
			//TODO: a bit of a hack to copy an object instead of overwrite values
			tileDefinition  = JSON.parse(JSON.stringify(platformer.settings.entities[entityKind]));

			importAnimation = {};
			importCollision = [];
			importRender    = [];

			tileDefinition.properties            = tileDefinition.properties || {};
			tileDefinition.properties.width      = tileWidth  * width  * self.unitsPerPixel;
			tileDefinition.properties.height     = tileHeight * height * self.unitsPerPixel;
			tileDefinition.properties.columns    = width;
			tileDefinition.properties.rows       = height;
			tileDefinition.properties.tileWidth  = tileWidth  * self.unitsPerPixel;
			tileDefinition.properties.tileHeight = tileHeight * self.unitsPerPixel;
			tileDefinition.properties.scaleX     = self.imagesScale;
			tileDefinition.properties.scaleY     = self.imagesScale;
			tileDefinition.properties.layerZ     = self.layerZ;
			tileDefinition.properties.z    		 = self.layerZ;
			
			
			for (x = 0; x < tileTypes; x++){
				importAnimation['tile' + x] = x;
			}
			for (x = 0; x < width; x++){
				importCollision[x] = [];
				importRender[x]    = [];
				for (y = 0; y < height; y++){
					importCollision[x][y] = +layer.data[x + y * width] - 1;
					importRender[x][y] = 'tile' + (+layer.data[x + y * width] - 1);
				}
			}
			for (x = 0; x < tileDefinition.components.length; x++){
				if(tileDefinition.components[x].type === 'render-tiles'){
					renderTiles = tileDefinition.components[x]; 
				}
				if(tileDefinition.components[x].spriteSheet == 'import'){
					tileDefinition.components[x].spriteSheet = {
						images: images,
						frames: {
							width:  tileWidth * self.unitsPerPixel / self.imagesScale,
							height: tileHeight * self.unitsPerPixel / self.imagesScale
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
			self.layerZ += self.layerZStep;
			
			if((entityKind === 'render-layer') && combineRenderLayer){
				combineRenderLayer.trigger('add-tiles', renderTiles);
				return combineRenderLayer; 
			} else {
				return self.owner.addEntity(new platformer.classes.entity(tileDefinition, {properties:{}})); 
			}
		};

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
			
			if(entity === 'tile-layer'){
				createLayer('collision-layer');
				return createLayer('render-layer', combineRenderLayer);
			} else {
				return createLayer(entity, combineRenderLayer);
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
					properties.scaleX = this.imagesScale;//this.unitsPerPixel;
					properties.scaleY = this.imagesScale;//this.unitsPerPixel;
					properties.layerZ = this.layerZ;
					//Setting the z value. All values are getting added to the layerZ value.
					if (properties.z) {
						properties.z += this.layerZ;
					} else if (entityType && platformer.settings.entities[entityType] && platformer.settings.entities[entityType].properties && platformer.settings.entities[entityType].properties.z) {
						properties.z = this.layerZ + platformer.settings.entities[entityType].properties.z;
					} else {
						properties.z = this.layerZ;
					}
					
					entity = this.owner.addEntity(new platformer.classes.entity(platformer.settings.entities[entityType], {properties:properties}));
					if(entity){
						if(entity.camera){
							this.followEntity = {entity: entity, mode: entity.camera}; //used by camera
						}
					}
				}
			}
			this.layerZ += this.layerZStep;
			return false;
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
