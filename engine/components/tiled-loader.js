/**
# COMPONENT **tiled-loader**
This component is attached to a top-level entity (loaded by the [[Scene]]) and, once its peer components are loaded, ingests a JSON file exported from the [Tiled map editor] [link1] and creates the tile maps and entities. Once it has finished loading the map, it removes itself from the list of components on the entity.

## Dependencies:
- Component [[entity-container]] (on entity's parent) - This component uses `entity.addEntity()` on the entity, provided by `entity-container`.
- Entity **collision-layer** - Used to create map entities corresponding with Tiled collision layers.
- Entity **render-layer** - Used to create map entities corresponding with Tiled render layers.
- Entity **tile-layer** - Used to create map entities corresponding with Tiled collision and render layers.

## Messages

### Listens for:
- **scene-loaded** - On receiving this message, the component commences loading the Tiled map JSON definition. Once finished, it removes itself from the entity's list of components.
- **load-level** - If `manuallyLoad` is set in the JSON definition, the component will wait for this message before loading the Tiled map JSON definition.
  - @param message.level (string or object) - Required. The level to load.
  - @param message.persistentData (object) - Optional. Information passed from the last scene.

### Local Broadcasts:
- **world-loaded** - Once finished loading the map, this message is triggered on the entity to notify other components of completion.
  - @param message.width (number) - The width of the world in world units.
  - @param message.height (number) - The height of the world in world units.
  - @param message.camera ([[Entity]]) - If a camera property is found on one of the loaded entities, this property will point to the entity on load that a world camera should focus on.

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
      
      "zStep": 500,
      // Optional. Adds step number to each additional Tiled layer to maintain z-order. Defaults to 1000.
      
      "separateTiles": true,
      // Optional. Keeps the tile maps in separate render layers. Default is 'false' to for better optimization.
      
      "entityPositionX": "center",
      // Optional. Can be "left", "right", or "center". Defines where entities registered X position should be when spawned. Default is "center".

      "entityPositionY": "center",
      // Optional. Can be "top", "bottom", or "center". Defines where entities registered Y position should be when spawned. Default is "bottom".
      
      "manuallyLoad": true
      // Optional. Whether to wait for a "load-level" event before before loading. Defaults to `false`;
    }

[link1]: http://www.mapeditor.org/
*/
(function(){
	var transformCheck = function(v){
		var a = !!(0x20000000 & v),
		b     = !!(0x40000000 & v),
		c     = !!(0x80000000 & v);
		
		if (a && c){
			return -3;
		} else if (a){
			return -5;
		} else if (b){
			return -4;
		} else {
			return -2;
		}
	};
	
	return platformer.createComponentClass({
		id: 'tiled-loader',
		
		constructor: function(definition){
			this.entities     = [];
			this.layerZ       = 0;
			this.followEntity = false;
			
			this.manuallyLoad  = definition.manuallyLoad || false;
			this.level = this.owner.level || definition.level || null;

			this.unitsPerPixel = this.owner.unitsPerPixel || definition.unitsPerPixel || 1;
			this.images        = this.owner.images        || definition.images        || false;
			this.imagesScale   = this.owner.imagesScale   || definition.imagesScale   || this.unitsPerPixel;
			this.layerZStep    = this.owner.zStep         || definition.zStep         || 1000;
			this.separateTiles = this.owner.separateTiles || definition.separateTiles || false;
			this.entityPositionX = this.owner.entityPositionX || definition.entityPositionX || 'center';
			this.entityPositionY = this.owner.entityPositionY || definition.entityPositionY || 'bottom';
		},
		
		events: {
			"scene-loaded": function(persistentData){
				if (!this.manuallyLoad) {
					this.loadLevel({
						level: this.level || persistentData.level,
						persistentData: persistentData
					});
				}
			},
			
			"load-level": function(levelData){
				this.loadLevel(levelData);
			}
		},
		
		methods: {
			loadLevel: function(levelData){
				var level = levelData.level,
				actionLayer = 0,
				layer = false;

				//format level appropriately
				if(typeof level === 'string'){
					level = platformer.game.settings.levels[level];
				}
				
				for(; actionLayer < level.layers.length; actionLayer++){
					layer = this.setupLayer(level.layers[actionLayer], level, layer);
					if (this.separateTiles){
						layer = false;
					}
				}

				this.owner.trigger('world-loaded', {
					width:  level.width  * level.tilewidth  * this.unitsPerPixel,
					height: level.height * level.tileheight * this.unitsPerPixel,
					camera: this.followEntity
				});
				this.owner.removeComponent(this);
			},
			
			setupLayer: function(layer, level, combineRenderLayer){
				var self       = this,
				images         = self.images || [],
				tilesets       = level.tilesets,
				tileWidth      = level.tilewidth,
				tileHeight     = level.tileheight,
				widthOffset    = 0,
				heightOffset   = 0,
				tileTypes      = (tilesets[tilesets.length - 1].imagewidth / tileWidth) * (tilesets[tilesets.length - 1].imageheight / tileHeight) + tilesets[tilesets.length - 1].firstgid,
				x              = 0,
				y              = 0,
				obj            = 0,
				entity         = null,
				property       = null,
				entityType     = '',
				tileset        = null,
				properties     = null,
				layerCollides  = true,
				numberProperty = false,
				createLayer = function(entityKind){
					var width      = layer.width,
					height         = layer.height,
					tileDefinition = null,
					importAnimation= null,
					importCollision= null,
					importRender   = null,
					renderTiles    = false,
					tileset        = null,
					jumpthroughs   = null,
					index          = 0;
					
					//TODO: a bit of a hack to copy an object instead of overwrite values
					tileDefinition  = JSON.parse(JSON.stringify(platformer.game.settings.entities[entityKind]));

					importAnimation = {};
					importCollision = [];
					importRender    = [];
					
					if(entityKind === 'collision-layer'){
						jumpthroughs = [];
						for (var x = 0; x < tilesets.length; x++){
							tileset = tilesets[x];
							if(tileset.tileproperties){
								for (var y in tileset.tileproperties){
									if(tileset.tileproperties[y].jumpThrough){
										jumpthroughs.push(tileset.firstgid + +y - 1);
									}
								}
							}
						}
					}

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
							index = +layer.data[x + y * width] - 1;
							importRender[x][y] = 'tile' + index;
							if(jumpthroughs){
								for (var z = 0; z < jumpthroughs.length; z++){
									if(jumpthroughs[z] === (0x0fffffff & index)){
										index = transformCheck(index);
									}
									break;
								}
							}
							importCollision[x][y] = index;
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
									height: tileHeight * self.unitsPerPixel / self.imagesScale//,
//									regX: (tileWidth * self.unitsPerPixel / self.imagesScale) / 2,
			//						regY: (tileHeight * self.unitsPerPixel / self.imagesScale) / 2
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
							console.warn('Component tiled-loader: Cannot find the "' + tilesets[x].name + '" sprite sheet. Add it to the list of assets in config.json and give it the id "' + tilesets[x].name + '".');
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
					entity = 'render-layer'; // default
					if(layer.properties && layer.properties.entity){
						entity = layer.properties.entity;
					} else { // If not explicitly defined, try using the name of the layer
						switch(layer.name){
						case "collision":
							entity = 'collision-layer';
							break;
						case "action":
							entity = 'tile-layer';
							for (x = 0; x < level.layers.length; x++){
								if(level.layers[x].name === 'collision' || (level.layers[x].properties && level.layers[x].properties.entity === 'collision-layer')){
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
					} else if (entity === 'collision-layer') {
						createLayer(entity, combineRenderLayer);
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
						} else if(entity.name !== ''){
							entityType = entity.name;
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

							if(tileset.tileproperties && tileset.tileproperties[entity.gid - tileset.firstgid]){
								for (x in tileset.tileproperties[entity.gid - tileset.firstgid]){
									//This is going to assume that if you pass in something that starts with a number, it is a number and converts it to one.
									numberProperty = parseFloat(tileset.tileproperties[entity.gid - tileset.firstgid][x]);
									if (numberProperty == 0 || (!!numberProperty)) {
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
								property = entity.properties[x];
								if(typeof property === 'string'){
									//This is going to assume that if you pass in something that starts with a number, it is a number and converts it to one.
								    numberProperty = parseFloat(property);
									if (numberProperty == 0 || (!!numberProperty))
									{
										properties[x] = numberProperty;
									} else if(property == 'true') {
										properties[x] = true;
									} else if(property == 'false') {
										properties[x] = false;
									} else if((property.length > 2) && (((property[0] === '{') && (property[property.length - 1] === '}')) || ((property[0] === '[') && (property[property.length - 1] === ']')))){
										try {
											properties[x] = JSON.parse(property);
										} catch(e) {
											properties[x] = property;
										}
									} else {
										properties[x] = property;
									}
								} else {
									properties[x] = property;
								}
							}
							widthOffset  = properties.width  = (entity.width  || tileWidth)  * this.unitsPerPixel;
							heightOffset = properties.height = (entity.height || tileHeight) * this.unitsPerPixel;
							if (entityType && platformer.game.settings.entities[entityType] && platformer.game.settings.entities[entityType].properties) {
								properties.width  = platformer.game.settings.entities[entityType].properties.width  || properties.width;
								properties.height = platformer.game.settings.entities[entityType].properties.height || properties.height;
							}

							properties.x = entity.x * this.unitsPerPixel;
							if(this.entityPositionX === 'left'){
								properties.regX = 0;
							} else if(this.entityPositionX === 'center'){
								properties.regX = properties.width / 2;
								properties.x += widthOffset / 2;
							} else if(this.entityPositionX === 'right'){
								properties.regX = properties.width;
								properties.x += widthOffset;
							}

							properties.y = entity.y * this.unitsPerPixel;
							if(typeof entity.gid === 'undefined'){
								properties.y += properties.height;
							}
							if(this.entityPositionY === 'bottom'){
								properties.regY = properties.height;
							} else if(this.entityPositionY === 'center'){
								properties.regY = properties.height / 2;
								properties.y -= heightOffset / 2;
							} else if(this.entityPositionY === 'top'){
								properties.regY = 0;
								properties.y -= heightOffset;
							}

							properties.scaleX = this.imagesScale;//this.unitsPerPixel;
							properties.scaleY = this.imagesScale;//this.unitsPerPixel;
							properties.layerZ = this.layerZ;
							
							//Setting the z value. All values are getting added to the layerZ value.
							if (properties.z) {
								properties.z += this.layerZ;
							} else if (entityType && platformer.game.settings.entities[entityType] && platformer.game.settings.entities[entityType].properties && platformer.game.settings.entities[entityType].properties.z) {
								properties.z = this.layerZ + platformer.game.settings.entities[entityType].properties.z;
							} else {
								properties.z = this.layerZ;
							}
							
							properties.parent = this.owner;
							entity = this.owner.addEntity(new platformer.classes.entity(platformer.game.settings.entities[entityType], {properties:properties}));
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
			},
			
			"destroy": function(){
				this.entities.length = 0;
			}
		}
	});
})();
