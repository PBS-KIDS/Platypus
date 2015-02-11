/*--------------------------------------------------
 *   tiled-loader - ../engine/components/tiled-loader.js
 */
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
				polyPoints		= null,
				fallbackWidth   = 0,
				fallbackHeight  = 0,
				convertImageLayer = function(imageLayer){
					var i     = 0,
					dataCells = 0,
					props     = imageLayer.properties || {},
					tileLayer = {
						data:   [],
						image:  '',
						height: 1,
						name:   imageLayer.name,
						type:   'tilelayer',
						width:  1,
						tileheight: tileHeight,
						tilewidth: tileWidth,
						x:      imageLayer.x,
						y:      imageLayer.y,
						properties: props
					};
					
					if(props.repeat){
						tileLayer.width  = +props.repeat;
						tileLayer.height = +props.repeat;
					}
					if(props['repeat-x']){
						tileLayer.width  = +props['repeat-x'];
					}
					if(props['repeat-y']){
						tileLayer.height = +props['repeat-y'];
					}
					dataCells = tileLayer.width * tileLayer.height;
					for (i = 0; i < dataCells; i++){
						tileLayer.data.push(1);
					}
					
					if(platformer.assets[imageLayer.name]){ // Prefer to have name in tiled match image id in game
						tileLayer.image      = platformer.assets[imageLayer.name];
						tileLayer.tileheight = tileLayer.image.height;
						tileLayer.tilewidth  = tileLayer.image.width;
					} else {
						console.warn('Component tiled-loader: Cannot find the "' + imageLayer.name + '" sprite sheet. Add it to the list of assets in config.json and give it the id "' + imageLayer.name + '".');
						tileLayer.image = imageLayer.image;
					}
					
					return tileLayer;
				},
				createLayer = function(entityKind, layer){
					var width       = layer.width,
					height          = layer.height,
					tHeight         = layer.tileheight || tileHeight,
					tWidth          = layer.tilewidth  || tileWidth,
					tileTypes       = 0,
					tileDefinition  = null,
					importAnimation = null,
					importCollision = null,
					importRender    = null,
					renderTiles     = false,
					tileset         = null,
					jumpthroughs    = null,
					index           = 0,
					x               = 0,
					y               = 0;
					
					//TODO: a bit of a hack to copy an object instead of overwrite values
					tileDefinition  = JSON.parse(JSON.stringify(platformer.game.settings.entities[entityKind]));

					importAnimation = {};
					importCollision = [];
					importRender    = [];
					
					if(entityKind === 'collision-layer'){
						jumpthroughs = [];
						for (x = 0; x < tilesets.length; x++){
							tileset = tilesets[x];
							if(tileset.tileproperties){
								for (y in tileset.tileproperties){
									if(tileset.tileproperties[y].jumpThrough){
										jumpthroughs.push(tileset.firstgid + +y - 1);
									}
								}
							}
						}
					}

					tileDefinition.properties            = tileDefinition.properties || {};
					tileDefinition.properties.width      = tWidth  * width  * self.unitsPerPixel;
					tileDefinition.properties.height     = tHeight * height * self.unitsPerPixel;
					tileDefinition.properties.columns    = width;
					tileDefinition.properties.rows       = height;
					tileDefinition.properties.tileWidth  = tWidth  * self.unitsPerPixel;
					tileDefinition.properties.tileHeight = tHeight * self.unitsPerPixel;
					tileDefinition.properties.scaleX     = self.imagesScale;
					tileDefinition.properties.scaleY     = self.imagesScale;
					tileDefinition.properties.layerZ     = self.layerZ;
					tileDefinition.properties.z    		 = tileDefinition.properties.z || self.layerZ;
					
					if(layer.image){
						tileTypes = (layer.image.width / tWidth) * (layer.image.height / tHeight);
					} else {
						tileTypes = (tilesets[tilesets.length - 1].imagewidth / tWidth) * (tilesets[tilesets.length - 1].imageheight / tHeight) + tilesets[tilesets.length - 1].firstgid;
					}
					for (x = -1; x < tileTypes; x++){
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
								images: (layer.image?[layer.image]:images),
								frames: {
									width:  tWidth * self.unitsPerPixel / self.imagesScale,
									height: tHeight * self.unitsPerPixel / self.imagesScale//,
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
					
					if((entityKind === 'render-layer') && combineRenderLayer && (combineRenderLayer.tileHeight === tHeight) && (combineRenderLayer.tileWidth === tWidth)){
						combineRenderLayer.trigger('add-tiles', renderTiles);
						return combineRenderLayer; 
					} else {
						return self.owner.addEntity(new platformer.Entity(tileDefinition, {properties:{
							
						}})); 
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
						createLayer('collision-layer', layer);
						return createLayer('render-layer', layer);
					} else if (entity === 'collision-layer') {
						createLayer(entity, layer);
					} else {
						return createLayer(entity, layer);
					}
				} else if(layer.type == 'imagelayer'){
					// set up temp tile layer to pass in image layer as if it's tiled.
					return createLayer('render-layer', convertImageLayer(layer));
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
							
							if (entity.polygon || entity.polyline) {
								//Figuring out the width of the polygon and shifting the origin so it's in the top-left.
								smallestX = Infinity;
								largestX = -Infinity;
								smallestY = Infinity;
								largestY = -Infinity;
								
								polyPoints = null;
								if (entity.polygon) {
									polyPoints = entity.polygon;
								} else if (entity.polyline) {
									polyPoints = entity.polyline;
								}
								
								for (x = 0; x < polyPoints.length; x++) {
									if (polyPoints[x].x > largestX) {
										largestX = polyPoints[x].x;
									}
									if (polyPoints[x].x < smallestX) {
										smallestX = polyPoints[x].x;
									}
									if (polyPoints[x].y > largestY) {
										largestY = polyPoints[x].y;
									}
									if (polyPoints[x].y < smallestY) {
										smallestY = polyPoints[x].y;
									}
								}
								properties.width  = largestX - smallestX;
								properties.height = largestY - smallestY;
								properties.x      = entity.x + smallestX;
								properties.y      = entity.y + smallestY;
								
								widthOffset  = 0;
								heightOffset = 0;
								properties.width  = properties.width  * this.unitsPerPixel;
								properties.height = properties.height * this.unitsPerPixel;
								
								properties.x = properties.x * this.unitsPerPixel;
								properties.y = properties.y * this.unitsPerPixel;
								
								if (entity.polygon) {
									properties.shape = {};
									properties.shape.type = 'polygon';
									properties.shape.points = [];
									for (var p = 0; p < polyPoints.length; p++) {
										properties.shape.points.push({"x": ((polyPoints[p].x - smallestX) * this.unitsPerPixel), "y": ((polyPoints[p].y - smallestY) * this.unitsPerPixel)});  
									}
								} else if (entity.polyline) {
									properties.shape = {};
									properties.shape.type = 'polyline';
									properties.shape.points = [];
									for (var p = 0; p < polyPoints.length; p++) {
										properties.shape.points.push({"x": ((polyPoints[p].x - smallestX) * this.unitsPerPixel), "y": ((polyPoints[p].y - smallestY) * this.unitsPerPixel)});  
									}
								}
							} else {
								fallbackWidth   = tileWidth  * this.unitsPerPixel;
								fallbackHeight  = tileHeight * this.unitsPerPixel;
								widthOffset  = 0;
								heightOffset = 0;
								properties.width  = (entity.width  || 0) * this.unitsPerPixel;
								properties.height = (entity.height || 0) * this.unitsPerPixel;

								if (entityType && platformer.game.settings.entities[entityType] && platformer.game.settings.entities[entityType].properties) {
									if (!properties.width) {
										properties.width  = platformer.game.settings.entities[entityType].properties.width  || 0;
										widthOffset = fallbackWidth;
									}
									if (!properties.height) {
										properties.height = platformer.game.settings.entities[entityType].properties.height || 0;
										heightOffset = fallbackHeight;
									}
								}

								if (!properties.width) {
									properties.width  = fallbackWidth;
								}
								if (!properties.height) {
									properties.height = fallbackHeight;
								}
								widthOffset  = widthOffset  || properties.width;
								heightOffset = heightOffset || properties.height;

								properties.x = entity.x * this.unitsPerPixel;
								properties.y = entity.y * this.unitsPerPixel;
								
								if(this.entityPositionX === 'left'){
									properties.regX = 0;
								} else if(this.entityPositionX === 'center'){
									properties.regX = properties.width / 2;
									properties.x += widthOffset / 2;
								} else if(this.entityPositionX === 'right'){
									properties.regX = properties.width;
									properties.x += widthOffset;
								}

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

								if (entity.ellipse) {
									properties.shape = {};
									properties.shape.type = 'ellipse';
									properties.shape.width = properties.width * this.unitsPerPixel;
									properties.shape.height = properties.height * this.unitsPerPixel;
								} else if (entity.width && entity.height) {
									properties.shape = {};
									properties.shape.type = 'rectangle';
									properties.shape.width = properties.width * this.unitsPerPixel;
									properties.shape.height = properties.height * this.unitsPerPixel;
								}
							}
							
							if (platformer.game.settings.entities[entityType].properties) {
								properties.scaleX = this.imagesScale * (platformer.game.settings.entities[entityType].properties.scaleX || 1);//this.unitsPerPixel;
								properties.scaleY = this.imagesScale * (platformer.game.settings.entities[entityType].properties.scaleY || 1);//this.unitsPerPixel;
							} else {
								properties.scaleX = this.imagesScale;
								properties.scaleY = this.imagesScale;
							}
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
							entity = this.owner.addEntity(new platformer.Entity(platformer.game.settings.entities[entityType], {properties:properties}));
							if(entity){
								if(entity.camera){
									this.followEntity = {entity: entity, mode: entity.camera}; //used by camera
								}
								this.owner.triggerEvent('entity-created', entity);
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
