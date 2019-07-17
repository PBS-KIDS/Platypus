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
/*global atob, pako, platypus */
import AABB from '../AABB.js';
import Data from '../Data.js';
import Entity from '../Entity.js';
import Vector from '../Vector.js';

export default (function () {
    var FILENAME_TO_ID = /^(?:(\w+:)\/{2}(\w+(?:\.\w+)*\/?))?([\/.]*?(?:[^?]+)?\/)?(?:(([^\/?]+)\.(\w+))|([^\/?]+))(?:\?((?:(?:[^&]*?[\/=])?(?:((?:(?:[^\/?&=]+)\.(\w+)))\S*?)|\S+))?)?$/,
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
        getImageId = function (path) {
            var result = path.match(FILENAME_TO_ID);

            return result[5] || result[7];
        },
        finishedLoading = function (level, x, y, width, height, tileWidth, tileHeight, callback) {
            var message = Data.setUp(
                    "level", null,
                    "world", AABB.setUp(),
                    "tile", AABB.setUp(),
                    "camera", null
                );

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

            if (callback) {
                callback();
            }
        },
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
        getProperty = function (obj, key) { // Handle Tiled map versions
            var i = 0;

            if (obj) {
                if (Array.isArray(obj)) {
                    i = obj.length;
                    while (i--) {
                        if (obj[i].name === key) {
                            return obj[i].value;
                        }
                    }
                    return null;
                } else {
                    return obj[key];
                }
            } else {
                return null;
            }
        },
        setProperty = function (obj, key, value) { // Handle Tiled map versions
            var i = 0;

            if (obj) {
                if (Array.isArray(obj)) {
                    i = obj.length;
                    while (i--) {
                        if (obj[i].name === key) {
                            obj[i].type = typeof value;
                            obj[i].value = value;
                            return;
                        }
                    }
                    obj.push({
                        name: key,
                        type: typeof value,
                        value: value
                    });
                } else {
                    obj[key] = value;
                }
            }
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
                tileset = null,
                entityTilesetIndex = 0;
            
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
            
            if (tileset) {
                entityTilesetIndex = gid - tileset.firstgid;
                if (tileset.tileproperties && tileset.tileproperties[entityTilesetIndex]) {
                    props = tileset.tileproperties[entityTilesetIndex];
                }
                if (tileset.tiles && tileset.tiles[entityTilesetIndex]) {
                    data.type = tileset.tiles[entityTilesetIndex].type || '';
                }
            }

            // Check Tiled data to find this object's type
            data.type = obj.type || data.type;
            // Deprecating the following methods in v0.11 due to better "type" property support in Tiled 1.0.0
            if (data.type === '') {
                if (obj.name) {
                    data.type = obj.name;
                    platypus.debug.warn('Component TiledLoader (loading "' + data.type + '"): Defining the entity type using the "name" property has been deprecated. Define the type using the object\'s "type" property in Tiled instead.');
                } else if (props) {
                    if (props.entity) {
                        data.type = props.entity;
                        platypus.debug.warn('Component TiledLoader (loading "' + data.type + '"): Defining the entity type using the "entity" property in the object properties has been deprecated. Define the type using the object\'s "type" property in Tiled instead.');
                    } else if (props.type) {
                        data.type = props.type;
                        platypus.debug.warn('Component TiledLoader (loading "' + data.type + '"): Defining the entity type in the object properties has been deprecated. Define the type using the object\'s "type" property in Tiled instead.');
                    }
                }
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
            var i = 0,
                key = '';
            
            if (src && dest) {
                if (Array.isArray(src)) {
                    for (i = 0; i < src.length; i++) {
                        setProperty(dest, src[i].name, formatProperty(src[i].value));
                    }
                } else {
                    for (key in src) {
                        if (src.hasOwnProperty(key)) {
                            setProperty(dest, key, formatProperty(src[key]));
                        }
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
                if (level.tilesets) {
                    level.tilesets = importTilesetData(level.tilesets);
                }

                if (level.assets) { // Property added by a previous parse (so that this algorithm isn't run on the same level multiple times)
                    assets.union(level.assets);
                } else if (level.layers) {
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
                            assets.union([level.layers[i].image]);
                        } else {
                            entity = getProperty(level.layers[i].properties, 'entity');
                            if (entity) {
                                data = Data.setUp('type', entity);
                                arr = Entity.getAssetList(data);
                                assets.union(arr);
                                arr.recycle();
                                data.recycle();
                            }
                        }
                    }
                    if (!ss) { //We need to load the tileset images since there is not a separate spriteSheet describing them
                        for (i = 0; i < level.tilesets.length; i++) {
                            tilesets.push(level.tilesets[i].image);
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
             * @deprecated since v0.11.9
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

        initialize: function () {
            this.assetCache = platypus.assetCache;
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
             * @param holds {platypus.Data} An object that handles any holds on before making the scene live.
             * @param holds.count {Number} The number of holds to wait for before triggering "scene-live"
             * @param holds.release {Function} The method to trigger to let the scene loader know that one hold has been released.
             */
            "scene-loaded": function (persistentData, holds) {
                if (!this.manuallyLoad) {
                    holds.count += 1;
                    this.loadLevel({
                        level: this.level || persistentData.level,
                        persistentData: persistentData
                    }, holds.release);
                }
            },

            /**
             * If `manuallyLoad` is set, the component will wait for this message before loading the Tiled map JSON definition.
             *
             * @method 'load-level'
             * @param levelData {Object}
             * @param levelData.level {String|Object} The level to load.
             * @param [levelData.persistentData] {Object} Information passed from the last scene.
             * @param callback {Function} The function to call once the level is loaded.
             */
            "load-level": function (levelData, callback) {
                this.loadLevel(levelData, callback);
            }
        },

        methods: {
            createLayer: function (entityKind, layer, mapOffsetX, mapOffsetY, tileWidth, tileHeight, tilesets, images, combineRenderLayer, progress) {
                var lastSet = null,
                    props = null,
                    width = layer.width,
                    height = layer.height,
                    tHeight = layer.tileheight || tileHeight,
                    tWidth = layer.tilewidth || tileWidth,
                    newWidth = 0,
                    newHeight = 0,
                    layerHeight = 0,
                    layerWidth = 0,
                    tileTypes = 0,
                    tileDefinition = JSON.parse(JSON.stringify(platypus.game.settings.entities[entityKind] || standardEntityLayers[entityKind])), //TODO: a bit of a hack to copy an object instead of overwrite values
                    importAnimation = {},
                    importCollision = [],
                    importFrames = [],
                    importRender = [],
                    importSpriteSheet = {
                        images: (layer.image ? [layer.image] : images),
                        frames: importFrames,
                        animations: importAnimation
                    },
                    renderTiles = false,
                    tileset = null,
                    jumpthroughs = null,
                    index = 0,
                    x = 0,
                    y = 0,
                    prop = "",
                    data = null,
                    createFrames = function (frames, index, tileset, modifier) {
                        var margin = tileset.margin || 0,
                            spacing = tileset.spacing || 0,
                            tileWidth = tileset.tilewidth,
                            tileHeight = tileset.tileheight,
                            tileWidthHalf = tileWidth / 2,
                            tileHeightHalf = tileHeight / 2,
                            tileWidthSpace = tileWidth + spacing,
                            tileHeightSpace = tileHeight + spacing,
                            margin2 = margin * 2,
                            marginSpace = margin2 - spacing,
                            cols = tileset.columns || (((tileset.imagewidth / tileWidthSpace) + marginSpace) >> 0),
                            rows = /* Tiled tileset def doesn't seem to have rows */ (((tileset.imageheight / tileHeightSpace) + marginSpace) >> 0),
                            x = 0,
                            y = 0;
                        
                        // deprecated unit/image resizing
                        tileWidth = tileWidth * modifier;
                        tileHeight = tileHeight * modifier;
                        tileWidthHalf = tileWidthHalf * modifier;
                        tileHeightHalf = tileHeightHalf * modifier;
                        tileWidthSpace = tileWidthSpace * modifier;
                        tileHeightSpace = tileHeightSpace * modifier;

                        for (y = 0; y < rows; y++) {
                            for (x = 0; x < cols; x++) {
                                frames.push([
                                    margin + x * tileWidthSpace,
                                    margin + y * tileHeightSpace,
                                    tileWidth,
                                    tileHeight,
                                    index,
                                    tileWidthHalf,
                                    tileHeightHalf
                                ]);
                            }
                        }
                    };
                
                this.decodeLayer(layer);
                data = layer.data;
                mapOffsetX += layer.offsetx || 0;
                mapOffsetY += layer.offsety || 0;

                tileDefinition.properties = tileDefinition.properties || {};

                //This builds in parallaxing support by allowing the addition of width and height properties into Tiled layers so they pan at a separate rate than other layers.
                if (layer.properties) {

                    layerWidth = getProperty(layer.properties, 'width');
                    if (layerWidth) {
                        newWidth  = parseInt(layerWidth,  10);
                    }

                    layerHeight = getProperty(layer.properties, 'height');
                    if (layerHeight) {
                        newHeight = parseInt(layerHeight, 10);
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

                if (tilesets.length) {
                    for (x = 0; x < tilesets.length; x++) {
                        createFrames(importFrames, x, tilesets[x], this.unitsPerPixel / this.imagesScale); // deprecate image resizing for v0.11.9
                    }

                    lastSet = tilesets[tilesets.length - 1];
                    tileTypes = lastSet.firstgid + lastSet.tilecount;
                    for (x = -1; x < tileTypes; x++) {
                        importAnimation['tile' + x] = x;
                    }
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
                        tileDefinition.components[x].spriteSheet = importSpriteSheet;
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
                    this.updateLoadingProgress(progress);
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
                    }, this.updateLoadingProgress.bind(this, progress), this.owner));
                }
            },
            
            convertImageLayer: function (imageLayer) {
                var asset = null,
                    i = 0,
                    dataCells = 0,
                    imageId = '',
                    props = imageLayer.properties || {},
                    repeat = getProperty(props, 'repeat'),
                    repeatX = getProperty(props, 'repeat-x'),
                    repeatY = getProperty(props, 'repeat-y'),
                    tileLayer = {
                        data: [],
                        image: '',
                        height: 1,
                        name: imageLayer.name,
                        type: 'tilelayer',
                        width: 1,
                        tileheight: 1,
                        tilewidth: 1,
                        x: imageLayer.x,
                        y: imageLayer.y,
                        properties: props
                    };

                if (repeat) {
                    tileLayer.width = +repeat;
                    tileLayer.height = +repeat;
                }
                if (repeatX) {
                    tileLayer.width = +repeatX;
                }
                if (repeatY) {
                    tileLayer.height = +repeatY;
                }
                dataCells = tileLayer.width * tileLayer.height;
                for (i = 0; i < dataCells; i++) {
                    tileLayer.data.push(1);
                }

                asset = this.assetCache.get(imageLayer.name);
                if (asset) { // Prefer to have name in tiled match image id in game
                    tileLayer.image = imageLayer.name;
                    tileLayer.tileheight = asset.height;
                    tileLayer.tilewidth = asset.width;
                } else {
                    imageId = getImageId(imageLayer.image);
                    asset = this.assetCache.get(imageId);
                    if (asset) {
                        platypus.debug.warn('Component TiledLoader: Did not find a spritesheet for "' + imageLayer.name + '", so using "' + imageLayer.image + '" instead.');
                        tileLayer.image = imageId;
                        tileLayer.tileheight = asset.height;
                        tileLayer.tilewidth = asset.width;
                    } else {
                        platypus.debug.warn('Component TiledLoader: Cannot find the "' + imageLayer.name + '" sprite sheet. Add it to the list of assets in config.json and give it the id "' + imageLayer.name + '".');
                        tileLayer.image = imageLayer.image;
                    }
                }

                tileLayer.tileset = {
                    "columns": 1,
                    "image": tileLayer.image,
                    "imageheight": tileLayer.tileheight,
                    "imagewidth": tileLayer.tilewidth,
                    "margin": 0,
                    "name": imageLayer.name,
                    "spacing": 0,
                    "tilecount": 1,
                    "tileheight": tileLayer.tileheight,
                    "tilewidth": tileLayer.tilewidth,
                    "type": "tileset"
                };
                
                return tileLayer;
            },
            
            loadLevel: function (levelData, callback) {
                var actionLayerCollides = true,
                    asset = null,
                    layers = null,
                    level = null,
                    height = 0,
                    i = 0,
                    imageId = '',
                    images = null,
                    layer = null,
                    layerDefinition = null,
                    tileset = null,
                    tilesets = null,
                    tileWidth = 0,
                    tileHeight = 0,
                    progress = Data.setUp('count', 0, 'progress', 0, 'total', 0),
                    width = 0,
                    x = 0,
                    y = 0;
                
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
                        tileset = tilesets[i];
                        asset = this.assetCache.get(tileset.name);
                        if (asset) { // Prefer to have name in tiled match image id in game
                            images.push(tileset.name);
                        } else {
                            imageId = getImageId(tileset.image);
                            asset = this.assetCache.get(imageId);
                            if (asset) {
                                platypus.debug.warn('Component TiledLoader: Did not find a spritesheet for "' + tileset.name + '", so using "' + tileset.image + '" instead.');
                                images.push(imageId);
                            } else {
                                platypus.debug.warn('Component TiledLoader: Cannot find the "' + tileset.name + '" sprite sheet. Add it to the list of assets in config.json and give it the id "' + tileset.name + '".');
                                images.push(tileset.image);
                            }
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
                while (i--) { // Preparatory pass through layers.
                    if (layers[i].type === 'objectgroup') {
                        progress.total += layers[i].objects.length;
                    } else if (actionLayerCollides && ((layers[i].name === 'collision') || (getProperty(layers[i].properties, 'entity') === 'collision-layer'))) {
                        actionLayerCollides = false;
                    }
                }

                this.finishedLoading = finishedLoading.bind(this, level, x, y, width, height, tileWidth, tileHeight, callback);

                for (i = 0; i < layers.length; i++) {
                    layerDefinition = layers[i];
                    switch (layerDefinition.type) {
                    case 'imagelayer':
                        layer = this.convertImageLayer(layerDefinition);
                        layer = this.createLayer('image-layer', layer, x, y, layer.tilewidth, layer.tileheight, [layer.tileset], images, layer, progress);
                        break;
                    case 'objectgroup':
                        this.setUpEntities(layerDefinition, x, y, tileWidth, tileHeight, tilesets, progress);
                        layer = null;
                        this.updateLoadingProgress(progress);
                        break;
                    case 'tilelayer':
                        layer = this.setupLayer(layerDefinition, actionLayerCollides, layer, x, y, tileWidth, tileHeight, tilesets, images, progress);
                        break;
                    default:
                        platypus.debug.warn('Component TiledLoader: Platypus does not support Tiled layers of type "' + layerDefinition.type + '". This layer will not be loaded.');
                        this.updateLoadingProgress(progress);
                    }
                }
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
                    entityPositionX = getProperty(layer.properties, 'entityPositionX') || this.entityPositionX,
                    entityPositionY = getProperty(layer.properties, 'entityPositionY') || this.entityPositionY,
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

                mapOffsetX += layer.offsetx || 0;
                mapOffsetY += layer.offsety || 0;

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

                            if (!entity.point) {
                                if (!properties.width) {
                                    properties.width = fallbackWidth;
                                }
                                if (!properties.height) {
                                    properties.height = fallbackHeight;
                                }
                                widthOffset = widthOffset || properties.width;
                                heightOffset = heightOffset || properties.height;
                            }

                            properties.x = entity.x * this.unitsPerPixel;
                            properties.y = entity.y * this.unitsPerPixel;

                            if (entity.rotation) {
                                w = (entity.width || fallbackWidth) / 2;
                                h = (entity.height || fallbackHeight) / 2;
                                a = ((entity.rotation / 180) % 2) * Math.PI;
                                v = Vector.setUp(w, -h).rotate(a);
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
                                properties.shape.type = 'circle';//'ellipse';
                                properties.shape.width = properties.width * this.unitsPerPixel;
                                properties.shape.height = properties.height * this.unitsPerPixel;

                                // Tiled has ellipses, but Platypus only accepts circles. Setting a radius based on the average of width and height in case a non-circular ellipse is imported.
                                properties.shape.radius = (properties.width + properties.height) * this.unitsPerPixel / 4;
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

                        entity = this.owner.addEntity(new Entity(entityDefinition, {
                            properties: properties
                        }, this.updateLoadingProgress.bind(this, progress), this.owner));
                        if (entity) {
                            if (entity.camera) {
                                this.followEntity = {
                                    entity: entity,
                                    mode: entity.camera
                                }; //used by camera
                            }
                            this.owner.triggerEvent('entity-created', entity);
                        }
                    } else {
                        this.updateLoadingProgress(progress);
                    }
                }
                this.layerZ += this.layerIncrement;
            },

            setupLayer: function (layer, layerCollides, combineRenderLayer, mapOffsetX, mapOffsetY, tileWidth, tileHeight, tilesets, images, progress) {
                var canCombine = false,
                    specified = getProperty(layer.properties, 'entity'),
                    entity = specified || 'render-layer', // default
                    entityDefinition = null,
                    i = 0;
                
                // First determine which type of entity this layer should behave as:
                if (!specified) {
                    if (layer.name === "collision") {
                        entity = 'collision-layer';
                    } else if (layer.name === "action") {
                        if (layerCollides) {
                            entity = 'tile-layer';
                        } else {
                            entity = 'render-layer';
                        }
                    }
                }

                if (entity === 'tile-layer' || (this.showCollisionTiles && platypus.game.settings.debug)) {
                    progress.count += 1; // to compensate for creating 2 layers. The "tile-layer" option should probably be deprecated as soon as support for Tiled's tile collision is added.
                    this.createLayer('collision-layer', layer, mapOffsetX, mapOffsetY, tileWidth, tileHeight, tilesets, images, combineRenderLayer, progress);
                    return this.createLayer('render-layer', layer, mapOffsetX, mapOffsetY, tileWidth, tileHeight, tilesets, images, combineRenderLayer, progress);
                } else if (entity === 'collision-layer') {
                    this.createLayer('collision-layer', layer, mapOffsetX, mapOffsetY, tileWidth, tileHeight, tilesets, images, combineRenderLayer, progress);
                    return null;
                } else {
                    // Need to check whether the entity can be combined for optimization. This combining of tile layers might be a nice addition to the compilation tools so it's not happening here.
                    entityDefinition = platypus.game.settings.entities[entity];
                    if (entityDefinition) {
                        i = entityDefinition.components.length;
                        while (i--) {
                            if (entityDefinition.components[i].type === "RenderTiles") {
                                canCombine = true;
                                break;
                            }
                        }
                    }

                    if (canCombine) {
                        return this.createLayer(entity, layer, mapOffsetX, mapOffsetY, tileWidth, tileHeight, tilesets, images, combineRenderLayer, progress);
                    } else {
                        this.createLayer(entity, layer, mapOffsetX, mapOffsetY, tileWidth, tileHeight, tilesets, images, combineRenderLayer, progress);
                        return null;
                    }
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

                if (progress.count === progress.total) {
                    progress.recycle();
                    this.finishedLoading();
                }
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

