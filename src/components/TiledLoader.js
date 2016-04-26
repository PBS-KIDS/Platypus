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
/*global atob, console, include, pako, platypus */
/*jslint bitwise: true, plusplus: true */
(function () {
    "use strict";

    var Application = include('springroll.Application'), // Import SpringRoll classes
        AABB        = include('platypus.AABB'),
        Data        = include('platypus.Data'),
        Entity      = include('platypus.Entity'),
        maskId = 0x0fffffff,
        maskJumpThrough = 0x10000000, // This is not passed in via Tiled - rather it's additional information sent to CollisionTiles.
        maskXFlip = 0x80000000,
        maskYFlip = 0x40000000,
        decodeBase64 = (function () {
            var decodeString = function (str, index) {
                    return (((str.charCodeAt(index)) + (str.charCodeAt(index + 1) << 8) + (str.charCodeAt(index + 2) << 16) + (str.charCodeAt(index + 3) << 24 )) >>> 0);
                },
                decodeArray = function (arr, index) {
                    return ((arr[index] + (arr[index + 1] << 8) + (arr[index + 2] << 16) + (arr[index + 3] << 24 )) >>> 0);
                };
            
            return function (data, compression) {
                var index = 4,
                    arr   = [],
                    step1 = atob(data.replace(/\\/g, ''));
                    
                if (compression === 'zlib') {
                    step1 = pako.inflate(step1);
                    while (index <= step1.length) {
                        arr.push(decodeArray(step1, index - 4));
                        index += 4;
                    }
                } else {
                    while (index <= step1.length) {
                        arr.push(decodeString(step1, index - 4));
                        index += 4;
                    }
                }
                
                return arr;
            };
        }()),
        getPowerOfTen = function (amount) {
            var x = 1;

            while (x < amount) {
                x *= 10;
            }

            return x;
        },
        transform = {
            x: 1,
            y: 1,
            id: -1
        },
        entityTransformCheck = function (v) {
            var resp = transform,
                b = !!(maskYFlip & v),
                c = !!(maskXFlip & v);

            resp.id = maskId & v;
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
        checkLevel = function (level, ss) {
            var i = 0,
                j = 0,
                tilesets = Array.setUp(),
                arr = null,
                assets = Array.setUp(),
                data = null,
                entity = null,
                entityAssets = null;

            if (typeof level === 'string') {
                level = platypus.game.settings.levels[level];
            }

            if (level) {
                level.tilesets = importTilesetData(level.tilesets);

                if (level.assets) { // Property added by a previous parse (so that this algorithm isn't run on the same level multiple times)
                    assets.union(level.assets);
                } else {
                    for (i = 0; i < level.layers.length; i++) {
                        if (level.layers[i].type === 'objectgroup') {
                            for (j = 0; j < level.layers[i].objects.length; j++) {
                                entity = getEntityData(level.layers[i].objects[j], level.tilesets);
                                if (entity) {
                                    entityAssets = Entity.getAssetList(entity);
                                    assets.union(entityAssets);
                                    entityAssets.recycle();
                                }
                            }
                        } else if (level.layers[i].type === 'imagelayer') {
                            assets.union([level.layers[i].name]);
                        } else if (level.layers[i].properties && level.layers[i].properties.entity) {
                            data = Data.setUp('type', level.layers[i].properties.entity);
                            arr = Entity.getAssetList(data);
                            assets.union(arr);
                            arr.recycle();
                            data.recycle();
                        }
                    }
                    if (!ss) { //We need to load the tileset images since there is not a separate spriteSheet describing them
                        for (i = 0; i < level.tilesets.length; i++) {
                            tilesets.push(level.tilesets[i].name);
                        }
                        assets.union(tilesets);
                        tilesets.recycle();
                    }
                    level.assets = assets.greenSlice(); // Save for later in case this level is checked again.
                }
            }
            
            return assets;
        },
        // These are provided but can be overwritten by entities of the same name in the configuration.
        standardEntityLayers = {
            "render-layer": {
                "id": "render-layer",
                "components": [{
                    "type": "RenderTiles",
                    "spriteSheet": "import",
                    "imageMap": "import",
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
                    "imageMap": "import"
                }]
            }
        },
        importTileset = function (tileset) {
            var key = '',
                source = platypus.game.settings.levels[tileset.source.replace('.json', '')];
            
            for (key in source) {
                if (source.hasOwnProperty(key)) {
                    tileset[key] = source[key];
                }
            }
            
            delete tileset.source; // We remove this so we never have to rerun this import. Note that we can't simply replace the tileset properties since the tileset's firstgid property may change from level to level.
            
            return tileset;
        },
        importTilesetData = function (tilesets) {
            var i = 0;
            
            for (i = 0; i < tilesets.length; i++) {
                if (tilesets[i].source) {
                    tilesets[i] = importTileset(tilesets[i]);
                }
            }
            
            return tilesets;
        };

    return platypus.createComponentClass({
        id: 'TiledLoader',

        properties: {
            /**
             * This causes the entire map to be offset automatically by an order of magnitude higher than the height and width of the world so that the number of digits below zero is constant throughout the world space. This fixes potential floating point issues when, for example, 97 is added to 928.0000000000001 giving 1025 since a significant digit was lost when going into the thousands.
             *
             * @property offsetMap
             * @type Boolean
             * @default false
             * @since 0.7.5
             */
            offsetMap: false,
            
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

        constructor: function () {
            this.assetCache = Application.instance.assetManager.cache;
            this.layerZ = 0;
            this.followEntity = false;
        },

        events: {

            /**
             * On receiving this message, the component commences loading the Tiled map JSON definition. Once finished, it removes itself from the entity's list of components.
             *
             * @method 'scene-loaded'
             * @param persistentData {Object} Data passed from the last scene into this one.
             * @param persistentData.level {Object} A level name or definition to load if the level is not already specified.
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
            createLayer: function (entityKind, layer, mapOffsetX, mapOffsetY, tileWidth, tileHeight, tilesets, images, combineRenderLayer) {
                var props = null,
                    width = layer.width,
                    height = layer.height,
                    tHeight = layer.tileheight || tileHeight,
                    tWidth = layer.tilewidth || tileWidth,
                    newWidth = 0,
                    newHeight = 0,
                    tileTypes = 0,
                    tileDefinition = JSON.parse(JSON.stringify(platypus.game.settings.entities[entityKind] || standardEntityLayers[entityKind])), //TODO: a bit of a hack to copy an object instead of overwrite values
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
                    data = null;
                
                this.decodeLayer(layer);
                data = layer.data;
                
                tileDefinition.properties = tileDefinition.properties || {};

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
                    
                    mergeAndFormatProperties(layer.properties, tileDefinition.properties);
                }

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
                                        jumpthroughs.push(tileset.firstgid + parseInt(prop, 10));
                                    }
                                }
                            }
                        }
                    }
                }
                
                tileDefinition.properties.width = tWidth * width * this.unitsPerPixel;
                tileDefinition.properties.height = tHeight * height * this.unitsPerPixel;
                tileDefinition.properties.columns = width;
                tileDefinition.properties.rows = height;
                tileDefinition.properties.tileWidth = tWidth * this.unitsPerPixel;
                tileDefinition.properties.tileHeight = tHeight * this.unitsPerPixel;
                tileDefinition.properties.scaleX = this.imagesScale;
                tileDefinition.properties.scaleY = this.imagesScale;
                tileDefinition.properties.layerZ = this.layerZ;
                tileDefinition.properties.left = tileDefinition.properties.x || mapOffsetX;
                tileDefinition.properties.top = tileDefinition.properties.y || mapOffsetY;
                tileDefinition.properties.z = tileDefinition.properties.z || this.layerZ;

                tileTypes = (tilesets[tilesets.length - 1].imagewidth / tWidth) * (tilesets[tilesets.length - 1].imageheight / tHeight) + tilesets[tilesets.length - 1].firstgid;
                for (x = -1; x < tileTypes; x++) {
                    importAnimation['tile' + x] = x;
                }
                for (x = 0; x < width; x++) {
                    importCollision[x] = [];
                    importRender[x] = [];
                    for (y = 0; y < height; y++) {
                        index = +data[x + y * width] - 1; // -1 from original src to make it zero-based.
                        importRender[x][y] = 'tile' + index;
                        index += 1; // So collision map matches original src indexes. Render (above) should probably be changed at some point as well. DDD 3/30/2016
                        if (jumpthroughs && jumpthroughs.length && (jumpthroughs[0] === (maskId & index))) {
                            index = maskJumpThrough | index;
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
                                width: tWidth * this.unitsPerPixel / this.imagesScale,
                                height: tHeight * this.unitsPerPixel / this.imagesScale,
                                regX: (tWidth * this.unitsPerPixel / this.imagesScale) / 2,
                                regY: (tHeight * this.unitsPerPixel / this.imagesScale) / 2
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
                this.layerZ += this.layerIncrement;

                if ((entityKind === 'render-layer') && (!this.separateTiles) && combineRenderLayer && (combineRenderLayer.tileHeight === tHeight) && (combineRenderLayer.tileWidth === tWidth) && (combineRenderLayer.columns === width) && (combineRenderLayer.rows === height)) {
                    combineRenderLayer.triggerEvent('add-tiles', renderTiles);
                    return combineRenderLayer;
                } else {
                    props = {};
                    if ((entityKind === 'render-layer') && this.spriteSheet) {
                        if (typeof this.spriteSheet === 'string') {
                            props.spriteSheet = platypus.game.settings.spriteSheets[this.spriteSheet];
                        } else {
                            props.spriteSheet = this.spriteSheet;
                        }
                        if (!props.spriteSheet.animations) {
                            props.spriteSheet.animations = importAnimation;
                        }
                    }
                    return this.owner.addEntity(new Entity(tileDefinition, {
                        properties: props
                    }));
                }
            },
            
            convertImageLayer: function (imageLayer, tileHeight, tileWidth) {
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
                if (this.assetCache.read(imageLayer.name)) {
                    tileLayer.image = imageLayer.name;
                    tileLayer.tileheight = this.assetCache.read(imageLayer.name).height;
                    tileLayer.tilewidth = this.assetCache.read(imageLayer.name).width;
                } else {
                    console.warn('Component TiledLoader: Cannot find the "' + imageLayer.name + '" sprite sheet. Add it to the list of assets in config.json and give it the id "' + imageLayer.name + '".');
                    tileLayer.image = imageLayer.image;
                }

                return tileLayer;
            },
            
            loadLevel: function (levelData) {
                var actionLayerCollides = true,
                    layers = null,
                    level = null,
                    height = 0,
                    i = 0,
                    images = null,
                    layer = null,
                    layerDefinition = null,
                    tilesets = null,
                    tileWidth = 0,
                    tileHeight = 0,
                    progress = Data.setUp('count', 0, 'progress', 0, 'total', 0),
                    width = 0,
                    x = 0,
                    y = 0,
                    message = Data.setUp(
                        "level", null,
                        "world", AABB.setUp(),
                        "width", 0, // deprecate in 0.8.0
                        "height", 0, // deprecate in 0.8.0
                        "tile", AABB.setUp(),
                        "camera", null
                    );
                
                //format level appropriately
                if (typeof levelData.level === 'string') {
                    level = platypus.game.settings.levels[levelData.level];
                } else {
                    level = levelData.level;
                }
                layers = level.layers;
                tilesets = importTilesetData(level.tilesets);
                tileWidth = level.tilewidth;
                tileHeight = level.tileheight;

                if (level.properties) {
                    mergeAndFormatProperties(level.properties, this.owner);
                }
                
                if (this.images) {
                    images = this.images.greenSlice();
                } else {
                    images = Array.setUp();
                }
                if (images.length === 0) {
                    for (i = 0; i < tilesets.length; i++) {
                        if (this.assetCache.read(tilesets[i].name)) { // Prefer to have name in tiled match image id in game
                            images.push(tilesets[i].name);
                        } else {
                            console.warn('Component TiledLoader: Cannot find the "' + tilesets[x].name + '" sprite sheet. Add it to the list of assets in config.json and give it the id "' + tilesets[x].name + '".');
                            images.push(tilesets[i].image);
                        }
                    }
                }
                
                width = level.width * tileWidth * this.unitsPerPixel;
                height = level.height * tileHeight * this.unitsPerPixel;

                if (this.offsetMap) {
                    x = getPowerOfTen(width);
                    y = getPowerOfTen(height);
                }

                progress.total = i = layers.length;
                while (i--) { // Prepatory pass through layers.
                    if (layers[i].type === 'objectgroup') {
                        progress.total += layers[i].objects.length;
                    } else if (actionLayerCollides && ((layers[i].name === 'collision') || (layers[i].properties && layers[i].properties.entity === 'collision-layer'))) {
                        actionLayerCollides = false;
                    }
                }

                for (i = 0; i < layers.length; i++) {
                    layerDefinition = layers[i];
                    switch (layerDefinition.type) {
                    case 'imagelayer':
                        layer = this.createLayer('image-layer', this.convertImageLayer(layerDefinition, tileHeight, tileWidth), x, y, tileWidth, tileHeight, tilesets, images, layer);
                        break;
                    case 'objectgroup':
                        this.setUpEntities(layerDefinition, x, y, tileWidth, tileHeight, tilesets, progress);
                        layer = null;
                        break;
                    case 'tilelayer':
                        layer = this.setupLayer(layerDefinition, actionLayerCollides, layer, x, y, tileWidth, tileHeight, tilesets, images);
                        break;
                    default:
                        if (platypus.game.settings.debug) {
                            console.warn('TiledLoader: Platypus does not support Tiled layers of type "' + layerDefinition.type + '". This layer will not be loaded.');
                        }
                    }
                    this.updateLoadingProgress(progress);
                }
                
                progress.recycle();

                /**
                 * Once finished loading the map, this message is triggered on the entity to notify other components of completion.
                 *
                 * @event 'world-loaded'
                 * @param message {platypus.Data} World data.
                 * @param message.level {Object} The Tiled level data used to load the level.
                 * @param message.width {number} The width of the world in world units.
                 * @param message.height {number} The height of the world in world units.
                 * @param message.tile {platypus.AABB} Dimensions of the world tiles.
                 * @param message.world {platypus.AABB} Dimensions of the world.
                 * @param message.camera {platypus.Entity} If a camera property is found on one of the loaded entities, this property will point to the entity on load that a world camera should focus on.
                 */
                message.level = level;
                message.camera = this.followEntity; // TODO: in 0.9.0 this should probably be removed, using something like "child-entity-added" instead. Currently this is particular to TiledLoader and Camera and should be generalized. - DDD 3/15/2016
                message.width = width;
                message.height = height;
                message.world.setBounds(x, y, x + width, y + height);
                message.tile.setBounds(0, 0, tileWidth, tileHeight);
                this.owner.triggerEvent('world-loaded', message);
                message.world.recycle();
                message.tile.recycle();
                message.recycle();
                
                this.owner.removeComponent(this);
            },
            
            setUpEntities: function (layer, mapOffsetX, mapOffsetY, tileWidth, tileHeight, tilesets, progress) {
                var clamp = 1000,
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
                    entityDefinition = null,
                    entityDefProps = null,
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
                    polyPoints = null,
                    fallbackWidth = 0,
                    fallbackHeight = 0;

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
                        entityDefinition = platypus.game.settings.entities[entityType];
                        if (entityDefinition) {
                            entityDefProps = entityDefinition.properties || null;
                        } else {
                            entityDefProps = null;
                        }
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

                            properties.x = properties.x * this.unitsPerPixel + mapOffsetX;
                            properties.y = properties.y * this.unitsPerPixel + mapOffsetY;

                            if (entity.polygon) {
                                properties.shape = {};
                                properties.shape.type = 'polygon';
                                properties.shape.points = [];
                                for (p = 0; p < polyPoints.length; p++) {
                                    properties.shape.points.push({
                                        "x": ((polyPoints[p].x - smallestX) * this.unitsPerPixel + mapOffsetX),
                                        "y": ((polyPoints[p].y - smallestY) * this.unitsPerPixel + mapOffsetY)
                                    });
                                }
                            } else if (entity.polyline) {
                                properties.shape = {};
                                properties.shape.type = 'polyline';
                                properties.shape.points = [];
                                for (p = 0; p < polyPoints.length; p++) {
                                    properties.shape.points.push({
                                        "x": ((polyPoints[p].x - smallestX) * this.unitsPerPixel + mapOffsetX),
                                        "y": ((polyPoints[p].y - smallestY) * this.unitsPerPixel + mapOffsetY)
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

                            if (entityDefProps) {
                                if (typeof entityDefProps.width === 'number') {
                                    properties.width = entityDefProps.width;
                                    widthOffset = fallbackWidth;
                                }
                                if (typeof entityDefProps.height === 'number') {
                                    properties.height = entityDefProps.height;
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
                                v = platypus.Vector.setUp(w, -h).rotate(a);
                                properties.rotation = entity.rotation;
                                properties.x = Math.round((properties.x + v.x - w) * clamp) / clamp;
                                properties.y = Math.round((properties.y + v.y + h) * clamp) / clamp;
                                v.recycle();
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
                            properties.x += mapOffsetX;

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
                            properties.y += mapOffsetY;

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

                        if (entityDefProps) {
                            properties.scaleX *= this.imagesScale * (entityDefProps.scaleX || 1); //this.unitsPerPixel;
                            properties.scaleY *= this.imagesScale * (entityDefProps.scaleY || 1); //this.unitsPerPixel;
                        } else {
                            properties.scaleX *= this.imagesScale;
                            properties.scaleY *= this.imagesScale;
                        }
                        properties.layerZ = this.layerZ;

                        //Setting the z value. All values are getting added to the layerZ value.
                        if (properties.z) {
                            properties.z += this.layerZ;
                        } else if (entityDefProps && (typeof entityDefProps.z === 'number')) {
                            properties.z = this.layerZ + entityDefProps.z;
                        } else {
                            properties.z = this.layerZ;
                        }

                        properties.parent = this.owner;
                        entity = this.owner.addEntity(new Entity(entityDefinition, {
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
                    this.updateLoadingProgress(progress);
                }
                this.layerZ += this.layerIncrement;
            },

            setupLayer: function (layer, layerCollides, combineRenderLayer, mapOffsetX, mapOffsetY, tileWidth, tileHeight, tilesets, images) {
                var entity = 'render-layer'; // default
                
                // First determine which type of entity this layer should behave as:
                if (layer.properties && layer.properties.entity) {
                    entity = layer.properties.entity;
                } else if (layer.name === "collision") {
                    entity = 'collision-layer';
                } else if (layer.name === "action") {
                    if (layerCollides) {
                        entity = 'tile-layer';
                    } else {
                        entity = 'render-layer';
                    }
                }

                if (entity === 'tile-layer' || (this.showCollisionTiles && platypus.game.settings.debug)) {
                    this.createLayer('collision-layer', layer, mapOffsetX, mapOffsetY, tileWidth, tileHeight, tilesets, images, combineRenderLayer);
                    return this.createLayer('render-layer', layer, mapOffsetX, mapOffsetY, tileWidth, tileHeight, tilesets, images, combineRenderLayer);
                } else if (entity === 'collision-layer') {
                    this.createLayer('collision-layer', layer, mapOffsetX, mapOffsetY, tileWidth, tileHeight, tilesets, images, combineRenderLayer);
                    return null;
                } else {
                    return this.createLayer(entity, layer, mapOffsetX, mapOffsetY, tileWidth, tileHeight, tilesets, images, combineRenderLayer);
                }
            },
            
            updateLoadingProgress: function (progress) {
                progress.count += 1;
                progress.progress = progress.count / progress.total;

                /**
                 * As a level is loaded, this event is triggered to show progress.
                 *
                 * @event 'level-loading-progress'
                 * @param message {platypus.Data} Contains progress data.
                 * @param message.count {Number} The number of loaded entities.
                 * @param message.progress {Number} A fraction of count / total.
                 * @param message.total {Number} The total number of entities being loaded by this component.
                 * @since 0.8.3
                 */
                this.owner.triggerEvent('level-loading-progress', progress);
            },

            destroy: function () {
            }
        },
        
        publicMethods: {
            /**
             * This method decodes a Tiled layer and sets its data to CSV format.
             *
             * @method decodeLayer
             * @param layer {Object} An object describing a Tiled JSON-exported layer.
             * @return {Object} The same object provided, but with the data field updated.
             * @chainable
             * @since 0.7.1
             */
            decodeLayer: function (layer) {
                if (layer.encoding === 'base64') {
                    layer.data = decodeBase64(layer.data, layer.compression);
                    layer.encoding = 'csv'; // So we won't have to decode again.
                }
                return layer;
            }
        },
        
        getAssetList: function (def, props, defaultProps) {
            var ps = props || {},
                dps = defaultProps || {},
                ss     = def.spriteSheet || ps.spriteSheet || dps.spriteSheet,
                images = def.images || ps.images || dps.images,
                assets = checkLevel(def.level || ps.level || dps.level, ss);
            
            if (ss) {
                if (typeof ss === 'string') {
                    assets.union(platypus.game.settings.spriteSheets[ss].images);
                } else {
                    assets.union(ss.images);
                }
            }
            
            if (images) {
                assets.union(images);
            }
            
            return assets;
        },
        
        getLateAssetList: function (def, props, defaultProps, data) {
            var ps  = props || {},
                dps = defaultProps || {},
                ss  = def.spriteSheet || ps.spriteSheet || dps.spriteSheet;

            if (data && data.level) {
                return checkLevel(data.level, ss);
            } else {
                return Array.setUp();
            }
        }
    });
}());

