/**
 * This component is attached to a top-level entity (loaded by the [Scene](platypus.Scene.html)) and, once its peer components are loaded, ingests a JSON file exported from the [Tiled map editor](http://www.mapeditor.org/) and creates the tile maps and entities. Once it has finished loading the map, it removes itself from the list of components on the entity.
 * 
 * This component requires an [EntityContainer](platypus.components.EntityContainer.html) since it calls `entity.addEntity()` on the entity, provided by `EntityContainer`.
 * 
 * This component looks for the following entities, and if not found will load default versions:

        {
            "render-layer": {
                "id": "render-layer",
                "components":[{
                    "type": "RenderTiles",
                    "spriteSheet": "import",
                    "imageMap":    "import",
                    "entityCache": true
                }]
            },
            "collision-layer": {
                "id": "collision-layer",
                "components":[{
                    "type": "CollisionTiles",
                    "collisionMap": "import"
                }]
            },
            "image-layer": {
                "id": "image-layer",
                "components":[{
                    "type": "RenderTiles",
                    "spriteSheet": "import",
                    "imageMap":    "import"
                }]
            }
        }

 * @namespace platypus.components
 * @class TiledLoader
 * @uses platypus.Component
 */
/*global console, include, platypus */
/*jslint bitwise: true, plusplus: true */
(function () {
    "use strict";

    var Application = include('springroll.Application'), // Import SpringRoll classes
        Entity      = include('platypus.Entity'),
        transformCheck = function (v) {
            var a = !!(0x20000000 & v),
                b = !!(0x40000000 & v),
                c = !!(0x80000000 & v);

            if (a && c) {
                return -3;
            } else if (a) {
                return -5;
            } else if (b) {
                return -4;
            } else {
                return -2;
            }
        },
        transform = {
            x: 1,
            y: 1,
            id: -1
        },
        entityTransformCheck = function (v) {
            var resp = transform,
                //        a = !!(0x20000000 & v),
                b = !!(0x40000000 & v),
                c = !!(0x80000000 & v);

            resp.id = 0x0fffffff & v;
            resp.x = 1;
            resp.y = 1;

            if (b) {
                resp.y = -1;
            }
            if (c) {
                resp.x = -1;
            }
            return resp;
        },
        getEntityData = function (obj, tilesets) {
            var x = 0,
                gid = obj.gid || -1,
                properties = {},
                data = {
                    gid: -1,
                    transform: null,
                    properties: properties,
                    type: ''
                },
                props = null,
                tileset = null;
            
            if (gid !== -1) {
                data.transform = entityTransformCheck(gid);
                gid = data.gid = transform.id;
            }
            
            for (x = 0; x < tilesets.length; x++) {
                if (tilesets[x].firstgid > gid) {
                    break;
                } else {
                    tileset = tilesets[x];
                }
            }
            
            if (tileset && tileset.tileproperties && tileset.tileproperties[gid - tileset.firstgid]) {
                props = tileset.tileproperties[gid - tileset.firstgid];
            }

            // Check Tiled data to find this object's type
            if (obj.type !== '') {
                data.type = obj.type;
            } else if (obj.name !== '') {
                data.type = obj.name;
            } else if (props) {
                data.type = props.entity || props.type || '';
            }
            
            if (!data.type) { // undefined entity
                return null;
            }
            
            //Copy properties from Tiled
            if (data.transform) {
                properties.scaleX = data.transform.x;
                properties.scaleY = data.transform.y;
            } else {
                properties.scaleX = 1;
                properties.scaleY = 1;
            }
            
            mergeAndFormatProperties(props, data.properties);
            mergeAndFormatProperties(obj.properties, data.properties);
            
            return data;
        },
        mergeAndFormatProperties = function (src, dest) {
            var key = '';
            
            if (src && dest) {
                for (key in src) {
                    if (src.hasOwnProperty(key)) {
                        dest[key] = formatProperty(src[key]);
                    }
                }
            }
            
            return dest;
        },
        formatProperty = function (value) {
            var numberProperty = 0;
            
            if (typeof value === 'string') {
                //This is going to assume that if you pass in something that starts with a number, it is a number and converts it to one.
                numberProperty = parseFloat(value);
                if (numberProperty === 0 || (!!numberProperty)) {
                    return numberProperty;
                } else if (value === 'true') {
                    return true;
                } else if (value === 'false') {
                    return false;
                } else if ((value.length > 1) && (((value[0] === '{') && (value[value.length - 1] === '}')) || ((value[0] === '[') && (value[value.length - 1] === ']')))) {
                    try {
                        return JSON.parse(value);
                    } catch (e) {
                    }
                }
            }

            return value;
        },
        // These are provided but can be overwritten by entities of the same name in the configuration.
        standardEntityLayers = {
            "render-layer": {
                "id": "render-layer",
                "components": [{
                    "type": "RenderTiles",
                    "spriteSheet": "import",
                    "imageMap":    "import",
                    "entityCache": true
                }]
            },
            "collision-layer": {
                "id": "collision-layer",
                "components": [{
                    "type": "CollisionTiles",
                    "collisionMap": "import"
                }]
            },
            "image-layer": {
                "id": "image-layer",
                "components": [{
                    "type": "RenderTiles",
                    "spriteSheet": "import",
                    "imageMap":    "import"
                }]
            }
        };

    return platypus.createComponentClass({
        id: 'TiledLoader',

        properties: {
            /**
             * If set to `true` and if the game is running in debug mode, this causes the collision layer to appear.
             *
             * @property showCollisionTiles
             * @type Boolean
             * @default false
             */
            showCollisionTiles: false,

            /**
             * If specified, the referenced images are used as the game sprite sheets instead of the images referenced in the Tiled map. This is useful for using different or better quality art from the art used in creating the Tiled map.
             *
             * @property images
             * @type Array
             * @default null
             */
            images: null,

            /**
             * Adds a number to each additional Tiled layer's z coordinate to maintain z-order. Defaults to 1000.
             *
             * @property layerIncrement
             * @type number
             * @default 1000
             */
            layerIncrement: 1000,

            /**
             * Keeps the tile maps in separate render layers. Default is 'false' to for better optimization.
             *
             * @property separateTiles
             * @type boolean
             * @default false
             */
            separateTiles: false,
            
            /**
             * If a particular sprite sheet should be used that's not defined by the level images themselves. This is useful for making uniquely-themed variations of the same level. This is overridden by `"spriteSheet": "import"` in the "render-layer" Entity definition, so be sure to remove that when setting this property.
             * 
             * @property spriteSheet
             * @type String | Object
             * @default null
             * @since 0.6.6
             */
            spriteSheet: null
        },

        publicProperties: {
            /**
             * Specifies the JSON level to load. Available on the entity as `entity.level`.
             *
             * @property level
             * @type String
             * @default null
             */
            level: null,

            /**
             * Sets how many world units in width and height correspond to a single pixel in the Tiled map. Default is 1: One pixel is one world unit. Available on the entity as `entity.unitsPerPixel`.
             *
             * @property unitsPerPixel
             * @type number
             * @default 1
             */
            unitsPerPixel: 1,

            /**
             * If images are provided, this property sets the scale of the art relative to world coordinates. Available on the entity as `entity.imagesScale`.
             *
             * @property imagesScale
             * @type number
             * @default 1
             */
            imagesScale: 1,

            /**
             * Can be "left", "right", or "center". Defines where entities registered X position should be when spawned. Available on the entity as `entity.entityPositionX`.
             *
             * @property entityPositionX
             * @type String
             * @default "center"
             */
            entityPositionX: "center",

            /**
             * Can be "top", "bottom", or "center". Defines where entities registered Y position should be when spawned. Available on the entity as `entity.entityPositionY`.
             *
             * @property entityPositionY
             * @type String
             * @default "bottom"
             */
            entityPositionY: "bottom",

            /**
             * Whether to wait for a "load-level" event before before loading. Available on the entity as `entity.manuallyLoad`.
             *
             * @property manuallyLoad
             * @type boolean
             * @default false
             */
            manuallyLoad: false
        },

        constructor: function (definition) {
            this.assetCache = Application.instance.assetManager.cache;
            this.entities = [];
            this.layerZ = 0;
            this.followEntity = false;
        },

        events: {

            /**
             * On receiving this message, the component commences loading the Tiled map JSON definition. Once finished, it removes itself from the entity's list of components.
             *
             * @method 'scene-loaded'
             * @param persistentData {Object} Data passed from the last scene into this one.
             */
            "scene-loaded": function (persistentData) {
                if (!this.manuallyLoad) {
                    this.loadLevel({
                        level: this.level || persistentData.level,
                        persistentData: persistentData
                    });
                }
            },

            /**
             * If `manuallyLoad` is set, the component will wait for this message before loading the Tiled map JSON definition.
             *
             * @method 'load-level'
             * @param levelData {Object}
             * @param levelData.level {String|Object} The level to load.
             * @param [levelData.persistentData] {Object} Information passed from the last scene.
             */
            "load-level": function (levelData) {
                this.loadLevel(levelData);
            }
        },

        methods: {
            loadLevel: function (levelData) {
                var level = levelData.level,
                    actionLayer = 0,
                    layer = false;

                //format level appropriately
                if (typeof level === 'string') {
                    level = platypus.game.settings.levels[level];
                }

                for (actionLayer = 0; actionLayer < level.layers.length; actionLayer++) {
                    layer = this.setupLayer(level.layers[actionLayer], level, layer);
                    if (this.separateTiles) {
                        layer = false;
                    }
                }

                /**
                 * Once finished loading the map, this message is triggered on the entity to notify other components of completion.
                 *
                 * @event 'world-loaded'
                 * @param world {Object} World data.
                 * @param world.width {number} The width of the world in world units.
                 * @param world.height {number} The height of the world in world units.
                 * @param world.tile {Object} Properties of the world tiles.
                 * @param world.tile.width {number} The width in world units of a single tile.
                 * @param world.tile.height {number} The height in world units of a single tile.
                 * @param world.camera {platypus.Entity} If a camera property is found on one of the loaded entities, this property will point to the entity on load that a world camera should focus on.
                 */
                this.owner.trigger('world-loaded', {
                    width: level.width * level.tilewidth * this.unitsPerPixel,
                    height: level.height * level.tileheight * this.unitsPerPixel,
                    tile: {
                        width: level.tilewidth,
                        height: level.tileheight
                    },
                    camera: this.followEntity
                });
                this.owner.removeComponent(this);
            },

            setupLayer: function (layer, level, combineRenderLayer) {
                var self = this,
                    images = self.images || [],
                    tilesets = level.tilesets,
                    tileWidth = level.tilewidth,
                    tileHeight = level.tileheight,
                    widthOffset = 0,
                    heightOffset = 0,
                    x = 0,
                    p = 0,
                    w = 0,
                    h = 0,
                    a = 0,
                    v = null,
                    obj = 0,
                    entity = null,
                    entityPositionX = "",
                    entityPositionY = "",
                    entityType = '',
                    gid = -1,
                    smallestX = Infinity,
                    largestX = -Infinity,
                    smallestY = Infinity,
                    largestY = -Infinity,
                    entityData = null,
                    properties = null,
                    layerCollides = true,
                    polyPoints = null,
                    fallbackWidth = 0,
                    fallbackHeight = 0,
                    convertImageLayer = function (imageLayer) {
                        var i = 0,
                            dataCells = 0,
                            props = imageLayer.properties || {},
                            tileLayer = {
                                data: [],
                                image: '',
                                height: 1,
                                name: imageLayer.name,
                                type: 'tilelayer',
                                width: 1,
                                tileheight: tileHeight,
                                tilewidth: tileWidth,
                                x: imageLayer.x,
                                y: imageLayer.y,
                                properties: props
                            };

                        if (props.repeat) {
                            tileLayer.width = +props.repeat;
                            tileLayer.height = +props.repeat;
                        }
                        if (props['repeat-x']) {
                            tileLayer.width = +props['repeat-x'];
                        }
                        if (props['repeat-y']) {
                            tileLayer.height = +props['repeat-y'];
                        }
                        dataCells = tileLayer.width * tileLayer.height;
                        for (i = 0; i < dataCells; i++) {
                            tileLayer.data.push(1);
                        }

                        // Prefer to have name in tiled match image id in game
                        if (self.assetCache.read(imageLayer.name)) {
                            tileLayer.image = imageLayer.name;
                            tileLayer.tileheight = self.assetCache.read(imageLayer.name).height;
                            tileLayer.tilewidth = self.assetCache.read(imageLayer.name).width;
                        } else {
                            console.warn('Component TiledLoader: Cannot find the "' + imageLayer.name + '" sprite sheet. Add it to the list of assets in config.json and give it the id "' + imageLayer.name + '".');
                            tileLayer.image = imageLayer.image;
                        }

                        return tileLayer;
                    },
                    createLayer = function (entityKind, layer) {
                        var props = null,
                            width = layer.width,
                            height = layer.height,
                            tHeight = layer.tileheight || tileHeight,
                            tWidth = layer.tilewidth || tileWidth,
                            newWidth = 0,
                            newHeight = 0,
                            tileTypes = 0,
                            tileDefinition = null,
                            importAnimation = null,
                            importCollision = null,
                            importRender = null,
                            renderTiles = false,
                            tileset = null,
                            jumpthroughs = null,
                            index = 0,
                            x = 0,
                            y = 0,
                            prop = "",
                            data = layer.data;

                        //This builds in parallaxing support by allowing the addition of width and height properties into Tiled layers so they pan at a separate rate than other layers.
                        if (layer.properties) {
                            if (layer.properties.width) {
                                newWidth  = parseInt(layer.properties.width,  10);
                            }
                            if (layer.properties.height) {
                                newHeight = parseInt(layer.properties.height, 10);
                            }
                            if (newWidth || newHeight) {
                                newWidth  = newWidth  || width;
                                newHeight = newHeight || height;
                                data      = [];
                                for (x = 0; x < newWidth; x++) {
                                    for (y = 0; y < newHeight; y++) {
                                        if ((x < width) && (y < height)) {
                                            data[x + y * newWidth] = layer.data[x + y * width];
                                        } else {
                                            data[x + y * newWidth] = 0;
                                        }
                                    }
                                }
                                width  = newWidth;
                                height = newHeight;
                            }
                        }

                        //TODO: a bit of a hack to copy an object instead of overwrite values
                        tileDefinition = JSON.parse(JSON.stringify(platypus.game.settings.entities[entityKind] || standardEntityLayers[entityKind]));

                        importAnimation = {};
                        importCollision = [];
                        importRender = [];

                        if (entityKind === 'collision-layer') {
                            jumpthroughs = [];
                            for (x = 0; x < tilesets.length; x++) {
                                tileset = tilesets[x];
                                if (tileset.tileproperties) {
                                    for (prop in tileset.tileproperties) {
                                        if (tileset.tileproperties.hasOwnProperty(prop)) {
                                            if (tileset.tileproperties[prop].jumpThrough) {
                                                jumpthroughs.push(tileset.firstgid + parseInt(prop, 10) - 1);
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        tileDefinition.properties = tileDefinition.properties || {};
                        tileDefinition.properties.width = tWidth * width * self.unitsPerPixel;
                        tileDefinition.properties.height = tHeight * height * self.unitsPerPixel;
                        tileDefinition.properties.columns = width;
                        tileDefinition.properties.rows = height;
                        tileDefinition.properties.tileWidth = tWidth * self.unitsPerPixel;
                        tileDefinition.properties.tileHeight = tHeight * self.unitsPerPixel;
                        tileDefinition.properties.scaleX = self.imagesScale;
                        tileDefinition.properties.scaleY = self.imagesScale;
                        tileDefinition.properties.layerZ = self.layerZ;
                        tileDefinition.properties.z = tileDefinition.properties.z || self.layerZ;

                        tileTypes = (tilesets[tilesets.length - 1].imagewidth / tWidth) * (tilesets[tilesets.length - 1].imageheight / tHeight) + tilesets[tilesets.length - 1].firstgid;
                        for (x = -1; x < tileTypes; x++) {
                            importAnimation['tile' + x] = x;
                        }
                        for (x = 0; x < width; x++) {
                            importCollision[x] = [];
                            importRender[x] = [];
                            for (y = 0; y < height; y++) {
                                index = +data[x + y * width] - 1;
                                importRender[x][y] = 'tile' + index;
                                if (jumpthroughs && jumpthroughs.length && (jumpthroughs[0] === (0x0fffffff & index))) {
                                    index = transformCheck(index);
                                }
                                importCollision[x][y] = index;
                            }
                        }
                        for (x = 0; x < tileDefinition.components.length; x++) {
                            if (tileDefinition.components[x].type === 'RenderTiles') {
                                renderTiles = tileDefinition.components[x];
                            }
                            if (tileDefinition.components[x].spriteSheet === 'import') {
                                tileDefinition.components[x].spriteSheet = {
                                    images: (layer.image ? [layer.image] : images),
                                    frames: {
                                        width: tWidth * self.unitsPerPixel / self.imagesScale,
                                        height: tHeight * self.unitsPerPixel / self.imagesScale,
                                        regX: (tWidth * self.unitsPerPixel / self.imagesScale) / 2,
                                        regY: (tHeight * self.unitsPerPixel / self.imagesScale) / 2
                                    },
                                    animations: importAnimation
                                };
                            } else if (tileDefinition.components[x].spriteSheet) {
                                if (typeof tileDefinition.components[x].spriteSheet === 'string' && platypus.game.settings.spriteSheets[tileDefinition.components[x].spriteSheet]) {
                                    tileDefinition.components[x].spriteSheet = platypus.game.settings.spriteSheets[tileDefinition.components[x].spriteSheet];
                                }
                                if (!tileDefinition.components[x].spriteSheet.animations) {
                                    tileDefinition.components[x].spriteSheet.animations = importAnimation;
                                }
                            }
                            if (tileDefinition.components[x].collisionMap === 'import') {
                                tileDefinition.components[x].collisionMap = importCollision;
                            }
                            if (tileDefinition.components[x].imageMap === 'import') {
                                tileDefinition.components[x].imageMap = importRender;
                            }
                        }
                        self.layerZ += self.layerIncrement;

                        if ((entityKind === 'render-layer') && combineRenderLayer && (combineRenderLayer.tileHeight === tHeight) && (combineRenderLayer.tileWidth === tWidth) && (combineRenderLayer.columns === width) && (combineRenderLayer.rows === height)) {
                            combineRenderLayer.trigger('add-tiles', renderTiles);
                            return combineRenderLayer;
                        } else {
                            props = {};
                            if ((entityKind === 'render-layer') && self.spriteSheet) {
                                if (typeof self.spriteSheet === 'string') {
                                    props.spriteSheet = platypus.game.settings.spriteSheets[self.spriteSheet];
                                } else {
                                    props.spriteSheet = self.spriteSheet;
                                }
                                if (!props.spriteSheet.animations) {
                                    props.spriteSheet.animations = importAnimation;
                                }
                            }
                            return self.owner.addEntity(new Entity(tileDefinition, {
                                properties: props
                            }));
                        }
                    };

                if (images.length === 0) {
                    for (x = 0; x < tilesets.length; x++) {
                        if (this.assetCache.read(tilesets[x].name)) { // Prefer to have name in tiled match image id in game
                            images.push(tilesets[x].name);
                        } else {
                            console.warn('Component TiledLoader: Cannot find the "' + tilesets[x].name + '" sprite sheet. Add it to the list of assets in config.json and give it the id "' + tilesets[x].name + '".');
                            images.push(tilesets[x].image);
                        }
                    }
                } else {
                    images = images.slice(); //so we do not overwrite settings array
                }

                if (layer.type === 'tilelayer') {
                    // First determine which type of entity this layer should behave as:
                    entity = 'render-layer'; // default
                    if (layer.properties && layer.properties.entity) {
                        entity = layer.properties.entity;
                    } else { // If not explicitly defined, try using the name of the layer
                        switch (layer.name) {
                        case "collision":
                            entity = 'collision-layer';
                            break;
                        case "action":
                            entity = 'tile-layer';
                            for (x = 0; x < level.layers.length; x++) {
                                if (level.layers[x].name === 'collision' || (level.layers[x].properties && level.layers[x].properties.entity === 'collision-layer')) {
                                    layerCollides = false;
                                }
                            }
                            if (!layerCollides) {
                                entity = 'render-layer';
                            }
                            break;
                        }
                    }

                    if (entity === 'tile-layer' || (this.showCollisionTiles && platypus.game.settings.debug)) {
                        createLayer('collision-layer', layer);
                        return createLayer('render-layer', layer);
                    } else if (entity === 'collision-layer') {
                        createLayer('collision-layer', layer);
                    } else {
                        return createLayer(entity, layer);
                    }
                } else if (layer.type === 'imagelayer') {
                    // set up temp tile layer to pass in image layer as if it's tiled.
                    return createLayer('image-layer', convertImageLayer(layer));
                } else if (layer.type === 'objectgroup') {
                    entityPositionX = this.entityPositionX;
                    entityPositionY = this.entityPositionY;

                    if (layer.properties) {
                        if (layer.properties.entityPositionX) {
                            entityPositionX = layer.properties.entityPositionX;
                        }
                        if (layer.properties.entityPositionY) {
                            entityPositionY = layer.properties.entityPositionY;
                        }
                    }

                    for (obj = 0; obj < layer.objects.length; obj++) {
                        entity     = layer.objects[obj];
                        entityData = getEntityData(entity, tilesets);
                        if (entityData) {
                            gid = entityData.gid;
                            entityType = entityData.type;

                            properties = entityData.properties;

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
                                properties.width = largestX - smallestX;
                                properties.height = largestY - smallestY;
                                properties.x = entity.x + smallestX;
                                properties.y = entity.y + smallestY;

                                widthOffset = 0;
                                heightOffset = 0;
                                properties.width = properties.width * this.unitsPerPixel;
                                properties.height = properties.height * this.unitsPerPixel;

                                properties.x = properties.x * this.unitsPerPixel;
                                properties.y = properties.y * this.unitsPerPixel;

                                if (entity.polygon) {
                                    properties.shape = {};
                                    properties.shape.type = 'polygon';
                                    properties.shape.points = [];
                                    for (p = 0; p < polyPoints.length; p++) {
                                        properties.shape.points.push({
                                            "x": ((polyPoints[p].x - smallestX) * this.unitsPerPixel),
                                            "y": ((polyPoints[p].y - smallestY) * this.unitsPerPixel)
                                        });
                                    }
                                } else if (entity.polyline) {
                                    properties.shape = {};
                                    properties.shape.type = 'polyline';
                                    properties.shape.points = [];
                                    for (p = 0; p < polyPoints.length; p++) {
                                        properties.shape.points.push({
                                            "x": ((polyPoints[p].x - smallestX) * this.unitsPerPixel),
                                            "y": ((polyPoints[p].y - smallestY) * this.unitsPerPixel)
                                        });
                                    }
                                }
                            } else {
                                fallbackWidth = tileWidth * this.unitsPerPixel;
                                fallbackHeight = tileHeight * this.unitsPerPixel;
                                widthOffset = 0;
                                heightOffset = 0;
                                properties.width = (entity.width || 0) * this.unitsPerPixel;
                                properties.height = (entity.height || 0) * this.unitsPerPixel;

                                if (entityType && platypus.game.settings.entities[entityType] && platypus.game.settings.entities[entityType].properties) {
                                    if (!properties.width) {
                                        properties.width = platypus.game.settings.entities[entityType].properties.width || 0;
                                        widthOffset = fallbackWidth;
                                    }
                                    if (!properties.height) {
                                        properties.height = platypus.game.settings.entities[entityType].properties.height || 0;
                                        heightOffset = fallbackHeight;
                                    }
                                }

                                if (!properties.width) {
                                    properties.width = fallbackWidth;
                                }
                                if (!properties.height) {
                                    properties.height = fallbackHeight;
                                }
                                widthOffset = widthOffset || properties.width;
                                heightOffset = heightOffset || properties.height;

                                properties.x = entity.x * this.unitsPerPixel;
                                properties.y = entity.y * this.unitsPerPixel;

                                if (entity.rotation) {
                                    w = (entity.width || fallbackWidth) / 2;
                                    h = (entity.height || fallbackHeight) / 2;
                                    a = ((entity.rotation / 180) % 2) * Math.PI;
                                    v = new platypus.Vector(w, -h).rotate(a);
                                    properties.rotation = entity.rotation;
                                    properties.x = Math.round((properties.x + v.x - w) * 1000) / 1000;
                                    properties.y = Math.round((properties.y + v.y + h) * 1000) / 1000;
                                }

                                if (entityPositionX === 'left') {
                                    properties.regX = 0;
                                } else if (entityPositionX === 'center') {
                                    properties.regX = properties.width / 2;
                                    properties.x += widthOffset / 2;
                                } else if (entityPositionX === 'right') {
                                    properties.regX = properties.width;
                                    properties.x += widthOffset;
                                }

                                if (gid === -1) {
                                    properties.y += properties.height;
                                }
                                if (entityPositionY === 'bottom') {
                                    properties.regY = properties.height;
                                } else if (entityPositionY === 'center') {
                                    properties.regY = properties.height / 2;
                                    properties.y -= heightOffset / 2;
                                } else if (entityPositionY === 'top') {
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

                            if (platypus.game.settings.entities[entityType].properties) {
                                properties.scaleX *= this.imagesScale * (platypus.game.settings.entities[entityType].properties.scaleX || 1); //this.unitsPerPixel;
                                properties.scaleY *= this.imagesScale * (platypus.game.settings.entities[entityType].properties.scaleY || 1); //this.unitsPerPixel;
                            } else {
                                properties.scaleX *= this.imagesScale;
                                properties.scaleY *= this.imagesScale;
                            }
                            properties.layerZ = this.layerZ;

                            //Setting the z value. All values are getting added to the layerZ value.
                            if (properties.z) {
                                properties.z += this.layerZ;
                            } else if (entityType && platypus.game.settings.entities[entityType] && platypus.game.settings.entities[entityType].properties && platypus.game.settings.entities[entityType].properties.z) {
                                properties.z = this.layerZ + platypus.game.settings.entities[entityType].properties.z;
                            } else {
                                properties.z = this.layerZ;
                            }

                            properties.parent = this.owner;
                            entity = this.owner.addEntity(new Entity(platypus.game.settings.entities[entityType], {
                                properties: properties
                            }));
                            if (entity) {
                                if (entity.camera) {
                                    this.followEntity = {
                                        entity: entity,
                                        mode: entity.camera
                                    }; //used by camera
                                }
                                this.owner.triggerEvent('entity-created', entity);
                            }
                        }
                    }
                    this.layerZ += this.layerIncrement;
                    return false;
                }
            },

            "destroy": function () {
                this.entities.length = 0;
            }
        },
        
        getAssetList: (function () {
            var union = function (a, b) {
                    var i = 0,
                        j = 0,
                        aL = a.length,
                        bL = b.length,
                        found = false;
                        
                    for (i = 0; i < bL; i++) {
                        found = false;
                        for (j = 0; j < aL; j++) {
                            if (b[i] === a[j]) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            a.push(b[i]);
                        }
                    }
                };
            
            return function (def, props, defaultProps) {
                var i = 0,
                    j = 0,
                    ps = props || {},
                    dps = defaultProps || {},
                    level  = def.level || ps.level || dps.level,
                    ss     = def.spriteSheet || ps.spriteSheet || dps.spriteSheet,
                    tilesets = [],
                    images = def.images || ps.images || dps.images,
                    assets = [],
                    entity = null,
                    entityAssets = null;
                
                if (typeof level === 'string') {
                    level = platypus.game.settings.levels[level];
                }

                if (level) {
                    if (level.assets) { // Property added by a previous parse (so that this algorithm isn't run on the same level multiple times)
                        assets.concat(level.assets);
                    } else {
                        for (i = 0; i < level.layers.length; i++) {
                            if (level.layers[i].objects) {
                                for (j = 0; j < level.layers[i].objects.length; j++) {
                                    entity = getEntityData(level.layers[i].objects[j], level.tilesets);
                                    if (entity) {
                                        entityAssets = Entity.getAssetList(entity);
                                        if (entityAssets) {
                                            union(assets, entityAssets);
                                        }
                                    }
                                }
                            }
                        }
                        if (!ss) { //We need to load the tileset images since there is not a separate spriteSheet describing them
                            for (i = 0; i < level.tilesets.length; i++) {
                                tilesets.push(level.tilesets[i].name);
                            }
                            union(assets, tilesets);
                        }
                        level.assets = assets.slice(); // Save for later in case this level is checked again.
                    }
                }
                
                if (ss) {
                    if (typeof ss === 'string') {
                        union(assets, platypus.game.settings.spriteSheets[ss].images);
                    } else {
                        union(assets, ss.images);
                    }
                }
                
                if (images) {
                    union(assets, images);
                }
                
                return assets;
            };
        }())
    });
}());

