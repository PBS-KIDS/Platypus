/**
 * This component handles rendering tile map backgrounds.
 *
 * When rendering the background, this component figures out what tiles are being displayed and caches them so they are rendered as one image rather than individually.
 *
 * As the camera moves, the cache is updated by blitting the relevant part of the old cached image into a new cache and then rendering tiles that have shifted into the camera's view into the cache.
 *
 * @namespace platypus.components
 * @class RenderTiles
 * @uses platypus.Component
 */
/*global include, platypus */
/*jslint nomen:true, bitwise:true, plusplus:true */
(function () {
    "use strict";

    var AABB              = include('platypus.AABB'),
        PIXIAnimation     = include('platypus.PIXIAnimation'),
        Application       = include('springroll.Application'),
        CanvasRenderer    = include('PIXI.CanvasRenderer'),
        Container         = include('PIXI.Container'),
        Graphics          = include('PIXI.Graphics'),
        ParticleContainer = include('PIXI.ParticleContainer'),
        RenderTexture     = include('PIXI.RenderTexture'),
        Sprite            = include('PIXI.Sprite'),

        doNothing = function () {
            return null;
        },
        tempCache = AABB.setUp(),
        sort = function (a, b) {
            return a.z - b.z;
        },
        getPowerOfTwo = function (amount) {
            var x = 1;

            while (x < amount) {
                x *= 2;
            }

            return x;
        },
        transformCheck = function (value, tile) {
            var v = +(value.substring(4)),
                x = 0;

            if (0x80000000 & v) {
                tile.scale.x = -1;
            }
            if (0x40000000 & v) {
                tile.scale.y = -1;
            }
            if (0x20000000 & v) {
                x = tile.scale.x;
                tile.scale.x = tile.scale.y;
                tile.scale.y = -x;
                tile.rotation = Math.PI / 2;
            }

            return 0x0fffffff & v;
        },
        Template = function (tile, id) {
            this.id = id;
            this.instances = Array.setUp(tile);
            this.index = 0;
            tile.template = this; // backwards reference for clearing index later.
        },
        nullTemplate = {
            getNext: doNothing,
            destroy: doNothing
        },
        prototype = Template.prototype;

    prototype.getNext = function () {
        var instance = this.instances[this.index],
            template = null;

        if (!instance) {
            template = this.instances[0];
            instance = this.instances[this.index] = new Sprite(template.texture);

            // Copy properties
            instance.scale    = template.scale;
            instance.rotation = template.rotation;
            instance.anchor   = template.anchor;
        }

        this.index += 1;

        return instance;
    };

    prototype.clear = function () {
        this.index = 0;
    };
    
    prototype.destroy = function () {
        var i = 0;
        
        for (i = 0; i < this.instances.length; i++) {
            this.instances[i].destroy();
        }
        
        this.instances.recycle();
        this.recycle();
    };
    
    platypus.setUpRecycle(Template, 'Template');

    return platypus.createComponentClass({

        id: 'RenderTiles',

        properties: {
            /**
             * The amount of space in pixels around the edge of the camera that we include in the buffered image. If not set, largest buffer allowed by maximumBuffer is used.
             *
             * @property buffer
             * @type number
             * @default 0
             */
            buffer: 0,

            /**
             * Determines whether to cache the entire map across one or more texture caches. By default this is `false`; however, if the entire map fits on one or two texture caches, this is set to `true` since it is more efficient than dynamic buffering.
             *
             * @property cacheAll
             * @type Boolean
             * @default false
             */
            cacheAll: false,

            /**
             * Whether to cache entities on this layer if the entity's render component requests caching.
             *
             * @property entityCache
             * @type boolean
             * @default false
             */
            entityCache: false,

            /**
             * This is a two dimensional array of the spritesheet indexes that describe the map that you're rendering.
             *
             * @property imageMap
             * @type Array
             * @default []
             */
            imageMap: [],

            /**
             * The amount of space that is buffered. Defaults to 2048 x 2048 or a smaller area that encloses the tile layer.
             *
             * @property maximumBuffer
             * @type number
             * @default 2048
             */
            maximumBuffer: 2048,

            /**
             * The x-scale the tilemap is being displayed at.
             *
             * @property scaleX
             * @type number
             * @default 1
             */
            scaleX: 1,

            /**
             * The y-scale the tilemap is being displayed at.
             *
             * @property scaleY
             * @type number
             * @default 1
             */
            scaleY: 1,

            /**
             * A sprite sheet describing all the tile images.
             *
             * @property spriteSheet
             * @type Object | String
             * @default null
             */
            spriteSheet: null,

            /**
             * Whether to cache the tile map to a large texture.
             *
             * @property tileCache
             * @type boolean
             * @default true
             * @since 0.6.4
             */
            tileCache: true,

            /**
             * This is the height in pixels of individual tiles.
             *
             * @property tileHeight
             * @type number
             * @default 10
             */
            tileHeight: 10,

            /**
             * This is the width in pixels of individual tiles.
             *
             * @property tileWidth
             * @type number
             * @default 10
             */
            tileWidth: 10
        },

        constructor: function (definition) {
            var imgMap = this.imageMap;

            this.doMap            = null; //list of display objects that should overlay tile map.
            this.cachedDisplayObjects = null;
            this.populate         = this.populateTiles;

            this.tiles            = {};

            this.renderer         = Application.instance.display.renderer;
            this.tilesSprite      = null;
            this.cacheTexture     = null;
            this.mapContainer      = null;
            this.laxCam = AABB.setUp();

            // temp values
            this.worldWidth    = this.tileWidth;
            this.worldHeight   = this.tileHeight;

            this.cache = AABB.setUp();
            this.cachePixels = AABB.setUp();

            // Set up containers
            if (this.spriteSheet && (typeof this.spriteSheet === 'string')) {
                this.spriteSheet = platypus.game.settings.spriteSheets[this.spriteSheet];
            }
            this.tileContainer = ((this.spriteSheet.images.length > 1) || (this.renderer instanceof CanvasRenderer)) ? new Container() : new ParticleContainer(15000, {position: true, rotation: true, scale: true});
            this.mapContainer = new Container();
            this.mapContainer.addChild(this.tileContainer);
            
            this.reorderedStage = false;
            this.updateCache = false;

            // Prepare map tiles
            this.imageMap = Array.setUp(this.createMap(imgMap));

            this.tilesWidth  = this.imageMap[0].length;
            this.tilesHeight = this.imageMap[0][0].length;
            this.layerWidth  = this.tilesWidth  * this.tileWidth;
            this.layerHeight = this.tilesHeight * this.tileHeight;

            // Set up buffer cache size
            this.cacheWidth = Math.min(getPowerOfTwo(this.layerWidth), this.maximumBuffer);
            this.cacheHeight = Math.min(getPowerOfTwo(this.layerHeight), this.maximumBuffer);

            if (!this.tileCache) {
                this.buffer = 0; // prevents buffer logic from running if tiles aren't being cached.
                this.cacheAll = false; // so tiles are updated as camera moves.
            }
        },

        events: {
            /**
             * This event is triggered before `handle-render` and provides the container that this component will require to display. In this case it compiles the array of tiles that make up the map and adds the tilesSprite displayObject to the stage.
             *
             * @method 'handle-render-load'
             * @param data.container {PIXI.Container} Container to contain this tile-rendering.
             */
            "handle-render-load": function (resp) {
                var z = this.owner.z,
                    renderer = this.renderer,
                    parentContainer = null;

                if (resp && resp.container) {
                    parentContainer = this.parentContainer = resp.container;

                    if (parentContainer && !this.reorderedStage) {
                        parentContainer.reorder = true;
                        this.reorderedStage = true;
                    }

                    this.updateRegion();

                    if (!this.tileCache) {
                        this.render = doNothing;

                        this.mapContainer.scaleX = this.scaleX;
                        this.mapContainer.scaleY = this.scaleY;
                        this.mapContainer.z = z;
                        parentContainer.addChild(this.mapContainer);
                    } else {
                        this.render = this.renderCache;

                        this.mapContainerWrapper = new Container();
                        this.mapContainerWrapper.addChild(this.mapContainer);

                        if ((this.layerWidth <= this.cacheWidth) && (this.layerHeight <= this.cacheHeight)) { // We never need to recache.
                            this.cacheAll   = true;

                            this.cacheTexture = new RenderTexture(renderer, this.cacheWidth, this.cacheHeight);

                            this.tilesSprite = new Sprite(this.cacheTexture);
                            this.tilesSprite.scaleX = this.scaleX;
                            this.tilesSprite.scaleY = this.scaleY;
                            this.tilesSprite.z = z;

                            this.cache.setBounds(0, 0, this.tilesWidth - 1, this.tilesHeight - 1);
                            this.update(this.cacheTexture, this.cache);
                            parentContainer.addChild(this.tilesSprite);
                        } else if (this.cacheAll || ((this.layerWidth <= this.cacheWidth * 2) && (this.layerHeight <= this.cacheHeight)) || ((this.layerWidth <= this.cacheWidth) && (this.layerHeight <= this.cacheHeight * 2))) { // We cache everything across several textures creating a cache grid.
                            this.cacheAll = true;

                            this.cacheGrid = Array.setUp();

                            // Creating this here but instantiating the grid later so that the previous scene has a chance to release gpu textures and reduce memory overhead. - DDD 9-18-15
                            this.createGrid = function () {
                                var w = 0,
                                    h = 0,
                                    x = 0,
                                    y = 0,
                                    z = this.owner.z,
                                    col = null,
                                    ct = null;

                                for (x = 0; x < this.tilesWidth; x += this.cacheTilesWidth) {
                                    col = Array.setUp();
                                    this.cacheGrid.push(col);
                                    for (y = 0; y < this.tilesHeight; y += this.cacheTilesHeight) {
                                        // This prevents us from using too large of a cache for the right and bottom edges of the map.
                                        w = Math.min(getPowerOfTwo((this.tilesWidth  - x) * this.tileWidth),  this.cacheWidth);
                                        h = Math.min(getPowerOfTwo((this.tilesHeight - y) * this.tileHeight), this.cacheHeight);

                                        ct = new RenderTexture(renderer, w, h);

                                        ct = new Sprite(ct);
                                        ct.x = x * this.tileWidth;
                                        ct.y = y * this.tileHeight;
                                        ct.z = z;
                                        ct.scaleX = this.scaleX;
                                        ct.scaleY = this.scaleY;
                                        col.push(ct);
                                        parentContainer.addChild(ct);

                                        z -= 0.000001; // so that tiles of large caches overlap consistently.
                                    }
                                }
                            }.bind(this);

                            this.updateCache = true;
                        } else {
                            this.cacheAll = false;

                            this.cacheTexture = new RenderTexture(renderer, this.cacheWidth, this.cacheHeight);

                            this.tilesSprite = new Sprite(this.cacheTexture);
                            this.tilesSprite.scaleX = this.scaleX;
                            this.tilesSprite.scaleY = this.scaleY;
                            this.tilesSprite.z = z;

                            // Set up copy buffer and circular pointers
                            this.cacheTexture.alternate = new RenderTexture(renderer, this.cacheWidth, this.cacheHeight);
                            this.tilesSpriteCache = new Sprite(this.cacheTexture.alternate);

                            this.cacheTexture.alternate.alternate = this.cacheTexture;
                            parentContainer.addChild(this.tilesSprite);
                        }
                    }
                }
            },

            /**
             * If this component should cache entities, it checks peers for a "renderCache" display object and adds the display object to its list of objects to render on top of the tile set.
             *
             * @method 'cache-sprite'
             * @param entity {platypus.Entity} This is the peer entity to be checked for a renderCache.
             */
            "cache-sprite": function (entity) {
                this.cacheSprite(entity);
            },

            /**
             * If this component should cache entities, it checks peers for a "renderCache" display object and adds the display object to its list of objects to render on top of the tile set.
             *
             * @method 'peer-entity-added'
             * @param entity {platypus.Entity} This is the peer entity to be checked for a renderCache.
             */
            "peer-entity-added": function (entity) {
                this.cacheSprite(entity);
            },

            /**
             * This event adds a layer of tiles to render on top of the existing layer of rendered tiles.
             *
             * @method 'add-tiles'
             * @param message.imageMap {Array} This is a 2D mapping of tile indexes to be rendered.
             */
            "add-tiles": function (definition) {
                var map = definition.imageMap;

                if (map) {
                    this.imageMap.push(this.createMap(map));
                    this.updateCache = true;
                }
            },

            /**
             * Provides the width and height of the world.
             *
             * @method 'camera-loaded'
             * @param camera {Object}
             * @param camera.worldWidth {number} The width of the world.
             * @param camera.worldHeight {number} The height of the world.
             * @param camera.viewport {platypus.AABB} The AABB describing the camera viewport in world units.
             */
            "camera-loaded": function (camera) {
                this.worldWidth  = camera.worldWidth;
                this.worldHeight = camera.worldHeight;

                if (this.buffer && !this.cacheAll) { // do this here to set the correct mask before the first caching.
                    this.updateBufferRegion(camera.viewport);
                }
            },

            /**
             * Triggered when the camera moves, this function updates which tiles need to be rendered and caches the image.
             *
             * @method 'camera-update'
             * @param camera {Object} Provides information about the camera.
             * @param camera.viewport {platypus.AABB} The AABB describing the camera viewport in world units.
             */
            "camera-update": function (camera) {
                var x = 0,
                    y = 0,
                    inFrame = false,
                    sprite  = null,
                    ctw     = 0,
                    cth     = 0,
                    ctw2    = 0,
                    cth2    = 0,
                    cache   = this.cache,
                    cacheP  = this.cachePixels,
                    vp      = camera.viewport,
                    resized = (this.buffer && ((vp.width !== this.laxCam.width) || (vp.height !== this.laxCam.height))),
                    tempC   = tempCache,
                    laxCam  = this.convertCamera(vp);

                if (!this.cacheAll && (cacheP.empty || !cacheP.contains(laxCam)) && (this.imageMap.length > 0)) {
                    if (resized) {
                        this.updateBufferRegion(laxCam);
                    }
                    ctw     = this.cacheTilesWidth - 1;
                    cth     = this.cacheTilesHeight - 1;
                    ctw2    = ctw / 2;
                    cth2    = cth / 2;

                    //only attempt to draw children that are relevant
                    tempC.setAll(Math.round(laxCam.x / this.tileWidth - ctw2) + ctw2, Math.round(laxCam.y / this.tileHeight - cth2) + cth2, ctw, cth);
                    if (tempC.left < 0) {
                        tempC.moveX(tempC.halfWidth);
                    } else if (tempC.right > this.tilesWidth - 1) {
                        tempC.moveX(this.tilesWidth - 1 - tempC.halfWidth);
                    }
                    if (tempC.top < 0) {
                        tempC.moveY(tempC.halfHeight);
                    } else if (tempC.bottom > this.tilesHeight - 1) {
                        tempC.moveY(this.tilesHeight - 1 - tempC.halfHeight);
                    }
                    
                    if (!this.tileCache) {
                        this.update(null, tempC);
                    } else if (cache.empty || !tempC.contains(cache)) {
                        this.tilesSpriteCache.texture = this.cacheTexture;
                        this.cacheTexture = this.cacheTexture.alternate;
                        this.tilesSprite.texture = this.cacheTexture;
                        this.update(this.cacheTexture, tempC, this.tilesSpriteCache, cache);
                    }

                    // Store pixel bounding box for checking later.
                    cacheP.set(cache).setAll((cacheP.x + 0.5) * this.tileWidth, (cacheP.y + 0.5) * this.tileHeight, (cacheP.width + 1) * this.tileWidth, (cacheP.height + 1) * this.tileHeight);
                }

                if (this.cacheGrid) {
                    for (x = 0; x < this.cacheGrid.length; x++) {
                        for (y = 0; y < this.cacheGrid[x].length; y++) {
                            sprite = this.cacheGrid[x][y];
                            cacheP.setAll((x + 0.5) * this.cacheClipWidth, (y + 0.5) * this.cacheClipHeight, this.cacheClipWidth, this.cacheClipHeight);

                            inFrame = cacheP.intersects(laxCam);
                            if (sprite.visible && !inFrame) {
                                sprite.visible = false;
                            } else if (!sprite.visible && inFrame) {
                                sprite.visible = true;
                            }
                            
                            if (sprite.visible && inFrame) {
                                sprite.x = camera.viewport.left - laxCam.left + x * this.cacheClipWidth;
                                sprite.y = camera.viewport.top  - laxCam.top  + y * this.cacheClipHeight;
                            }
                        }
                    }
                } else if (this.tileCache) {
                    this.tilesSprite.x = camera.viewport.left - laxCam.left + cache.left * this.tileWidth;
                    this.tilesSprite.y = camera.viewport.top  - laxCam.top  + cache.top  * this.tileHeight;
                }
            },

            /**
             * On receiving this message, determines whether to update which tiles need to be rendered and caches the image.
             *
             * @method 'handle-render'
             */
            "handle-render": function (camera) {
                if (this.updateCache) {
                    this.updateCache = false;
                    if (this.cacheGrid) {
                        this.updateGrid();
                    } else {
                        this.update(this.cacheTexture, this.cache);
                    }
                }
            }
        },

        methods: {
            cacheSprite: function (entity) {
                var x = 0,
                    y = 0,
                    object = entity.cacheRender,
                    bounds = null,
                    top = 0,
                    bottom = 0,
                    right = 0,
                    left = 0;

                // Determine whether to merge this image with the background.
                if (this.entityCache && object) { //TODO: currently only handles a single display object on the cached entity.
                    if (!this.doMap) {
                        this.doMap = Array.setUp();
                        this.cachedDisplayObjects = Array.setUp();
                        this.populate = this.populateTilesAndEntities;
                    }
                    this.cachedDisplayObjects.push(object);

                    // Determine range:
                    bounds = object.getBounds(object.transformMatrix);
                    top    = Math.max(0, Math.floor(bounds.y / this.tileHeight));
                    bottom = Math.min(this.tilesHeight, Math.ceil((bounds.y + bounds.height) / this.tileHeight));
                    left   = Math.max(0, Math.floor(bounds.x / this.tileWidth));
                    right  = Math.min(this.tilesWidth, Math.ceil((bounds.x + bounds.width) / this.tileWidth));

                    // Find tiles that should include this display object
                    for (x = left; x < right; x++) {
                        if (!this.doMap[x]) {
                            this.doMap[x] = Array.setUp();
                        }
                        for (y = top; y < bottom; y++) {
                            if (!this.doMap[x][y]) {
                                this.doMap[x][y] = Array.setUp();
                            }
                            this.doMap[x][y].push(object);
                        }
                    }

                    // Prevent subsequent draws
                    entity.removeComponent('RenderSprite');

                    this.updateCache = true; //TODO: This currently causes a blanket cache update - may be worthwhile to only recache if this entity's location is currently in a cache (either cacheGrid or the current viewable area).
                }
            },

            convertCamera: function (camera) {
                var worldWidth  = this.worldWidth / this.scaleX,
                    worldPosX   = worldWidth - camera.width,
                    worldHeight = this.worldHeight / this.scaleY,
                    worldPosY   = worldHeight - camera.height,
                    laxCam      = this.laxCam;

                if ((worldWidth === this.layerWidth) || !worldPosX) {
                    laxCam.moveX(camera.x);
                } else {
                    laxCam.moveX(camera.left * (this.layerWidth - camera.width) / worldPosX + camera.halfWidth);
                }

                if ((worldHeight === this.layerHeight) || !worldPosY) {
                    laxCam.moveY(camera.y);
                } else {
                    laxCam.moveY(camera.top * (this.layerHeight - camera.height) / worldPosY + camera.halfHeight);
                }

                if (camera.width !== laxCam.width || camera.height !== laxCam.height) {
                    laxCam.resize(camera.width, camera.height);
                }

                return laxCam;
            },

            createTile: function (imageName) {
                var tile = null,
                    anim = '';

                // "tile-1" is empty, so it remains a null reference.
                if (imageName === 'tile-1') {
                    return nullTemplate;
                }

                tile = new PIXIAnimation(this.spriteSheet);
                anim = 'tile' + transformCheck(imageName, tile);
                tile.gotoAndStop(anim);

                return Template.setUp(tile, imageName);
            },

            createMap: function (mapDefinition) {
                var x = 0,
                    y = 0,
                    index = '',
                    map   = null,
                    tiles = this.tiles,
                    tile  = null;

                if (typeof mapDefinition[0][0] !== 'string') { // This is not a map definition: it's an actual RenderTiles map.
                    return mapDefinition;
                }

                map = Array.setUp();
                for (x = 0; x < mapDefinition.length; x++) {
                    map[x] = Array.setUp();
                    for (y = 0; y < mapDefinition[x].length; y++) {
                        index = mapDefinition[x][y];
                        if (index.id) {
                            index = index.id;
                        }
                        tile = tiles[index];
                        if (!tile && (tile !== null)) { // Empty grid spaces are null, so we needn't create a new tile.
                            tile = tiles[index] = this.createTile(index);
                        }
                        map[x][y] = tiles[index];
                    }
                }
                
                return map;
            },

            updateRegion: function () {
                var clipW = Math.floor(this.cacheWidth  / this.tileWidth),
                    clipH = Math.floor(this.cacheHeight / this.tileHeight);

                this.cacheTilesWidth  = Math.min(this.tilesWidth,  clipW);
                this.cacheTilesHeight = Math.min(this.tilesHeight, clipH);

                this.cacheClipWidth   = this.cacheTilesWidth  * this.tileWidth;
                this.cacheClipHeight  = this.cacheTilesHeight * this.tileHeight;

                if (this.tileCache) {
                    this.mapContainer.mask = new Graphics().beginFill(0x000000).drawRect(0, 0, this.cacheClipWidth, this.cacheClipHeight).endFill();
                }
            },

            updateBufferRegion: function (viewport) {
                var clipW = Math.floor(this.cacheWidth  / this.tileWidth),
                    clipH = Math.floor(this.cacheHeight / this.tileHeight);

                this.cacheTilesWidth  = Math.min(this.tilesWidth,  Math.ceil((viewport.width  + this.buffer * 2) / this.tileWidth),  clipW);
                this.cacheTilesHeight = Math.min(this.tilesHeight, Math.ceil((viewport.height + this.buffer * 2) / this.tileHeight), clipH);

                this.cacheClipWidth   = this.cacheTilesWidth  * this.tileWidth;
                this.cacheClipHeight  = this.cacheTilesHeight * this.tileHeight;

                this.mapContainer.mask = new Graphics().beginFill(0x000000).drawRect(0, 0, this.cacheClipWidth, this.cacheClipHeight).endFill();
            },

            update: function (texture, bounds, tilesSpriteCache, oldBounds) {
                this.populate(bounds, oldBounds);

                this.render(bounds, texture, this.mapContainer, this.mapContainerWrapper, tilesSpriteCache, oldBounds);

                if (oldBounds) {
                    oldBounds.set(bounds);
                }
            },
            
            populateTiles: function (bounds, oldBounds) {
                var x = 0,
                    y = 0,
                    z = 0,
                    layer = 0,
                    tile  = null,
                    tiles = Array.setUp();

                this.tileContainer.removeChildren();
                for (x = bounds.left; x <= bounds.right; x++) {
                    for (y = bounds.top; y <= bounds.bottom; y++) {
                        if (!oldBounds || oldBounds.empty || (y > oldBounds.bottom) || (y < oldBounds.top) || (x > oldBounds.right) || (x < oldBounds.left)) {
                            for (layer = 0; layer < this.imageMap.length; layer++) {
                                tile = this.imageMap[layer][x][y].getNext();
                                if (tile) {
                                    if (tile.template) {
                                        tiles.push(tile.template);
                                    }
                                    tile.x = (x + 0.5) * this.tileWidth;
                                    tile.y = (y + 0.5) * this.tileHeight;
                                    this.tileContainer.addChild(tile);
                                }
                            }
                        }
                    }
                }

                // Clear out tile instances
                for (z = 0; z < tiles.length; z++) {
                    tiles[z].clear();
                }
                tiles.recycle();
            },
            
            populateTilesAndEntities: function (bounds, oldBounds) {
                var x = 0,
                    y = 0,
                    z = 0,
                    layer   = 0,
                    tile    = null,
                    ent     = null,
                    ents    = Array.setUp(),
                    tiles   = Array.setUp(),
                    oList   = null;

                this.tileContainer.removeChildren();
                for (x = bounds.left; x <= bounds.right; x++) {
                    for (y = bounds.top; y <= bounds.bottom; y++) {
                        if (!oldBounds || oldBounds.empty || (y > oldBounds.bottom) || (y < oldBounds.top) || (x > oldBounds.right) || (x < oldBounds.left)) {
                            // draw tiles
                            for (layer = 0; layer < this.imageMap.length; layer++) {
                                tile = this.imageMap[layer][x][y].getNext();
                                if (tile) {
                                    if (tile.template) {
                                        tiles.push(tile.template);
                                    }
                                    tile.x = (x + 0.5) * this.tileWidth;
                                    tile.y = (y + 0.5) * this.tileHeight;
                                    this.tileContainer.addChild(tile);
                                }
                            }

                            // check for cached entities
                            if (this.doMap[x] && this.doMap[x][y]) {
                                oList = this.doMap[x][y];
                                for (z = 0; z < oList.length; z++) {
                                    if (!oList[z].drawn) {
                                        oList[z].drawn = true;
                                        ents.push(oList[z]);
                                    }
                                }
                            }
                        }
                    }
                }

                this.mapContainer.removeChildren();
                this.mapContainer.addChild(this.tileContainer);

                // Draw cached entities
                if (ents.length) {
                    ents.sort(sort);
                    for (z = 0; z < ents.length; z++) {
                        ent = ents[z];
                        delete ent.drawn;
                        this.mapContainer.addChild(ent);
                        if (ent.mask) {
                            this.mapContainer.addChild(ent.mask);
                        }
                    }
                }

                // Clear out tile instances
                for (z = 0; z < tiles.length; z++) {
                    tiles[z].clear();
                }
                
                tiles.recycle();
                ents.recycle();
            },
            
            renderCache: function (bounds, dest, src, wrapper, oldCache, oldBounds) {
                if (oldCache && !oldBounds.empty) {
                    oldCache.x = oldBounds.left * this.tileWidth;
                    oldCache.y = oldBounds.top * this.tileHeight;
                    src.addChild(oldCache); // To copy last rendering over.
                }

                src.x = -bounds.left * this.tileWidth;
                src.y = -bounds.top * this.tileHeight;

                dest.clear();
                dest.render(wrapper);
                dest.requiresUpdate = true;
            },
            
            updateGrid: function () {
                var x = 0,
                    y = 0,
                    grid = this.cacheGrid;

                if (this.createGrid) {
                    this.createGrid();
                    this.createGrid = null;
                }

                for (x = 0; x < grid.length; x++) {
                    for (y = 0; y < grid[x].length; y++) {
                        this.cache.setBounds(x * this.cacheTilesWidth, y * this.cacheTilesHeight, Math.min((x + 1) * this.cacheTilesWidth, this.tilesWidth - 1), Math.min((y + 1) * this.cacheTilesHeight, this.tilesHeight - 1));
                        this.update(grid[x][y].texture, this.cache);
                    }
                }
            },

            destroy: function () {
                var x = 0,
                    y = 0,
                    key = '',
                    grid = this.cacheGrid,
                    map = this.doMap,
                    img = this.imageMap;
                    
                if (grid) {
                    for (x = 0; x < grid.length; x++) {
                        for (y = 0; y < grid[x].length; y++) {
                            grid[x][y].texture.destroy(true);
                            this.parentContainer.removeChild(grid[x][y]);
                        }
                    }
                    grid.recycle(2);
                    delete this.cacheGrid;
                } else if (this.tilesSprite) {
                    if (this.tilesSprite.texture.alternate) {
                        this.tilesSprite.texture.alternate.destroy(true);
                    }
                    this.tilesSprite.texture.destroy(true);
                    this.parentContainer.removeChild(this.tilesSprite);
                } else {
                    this.parentContainer.removeChild(this.mapContainer);
                }
                
                img.recycle(2);
                
                for (key in this.tiles) {
                    if (this.tiles.hasOwnProperty(key)) {
                        this.tiles[key].destroy();
                    }
                }
                this.tiles = null;
                this.parentContainer = null;
                this.tilesSprite = null;
                
                if (map) {
                    for (x = 0; x < this.cachedDisplayObjects.length; x++) {
                        this.cachedDisplayObjects[x].destroy();
                    }
                    this.cachedDisplayObjects.recycle();

                    for (x = 0; x < map.length; x++) {
                        if (map[x]) {
                            for (y = 0; y < map.length; y++) {
                                if (map[x][y]) {
                                    map[x][y].recycle();
                                }
                            }
                            map[x].recycle();
                        }
                    }
                    map.recycle();
                }
                
                this.laxCam.recycle();
                this.cache.recycle();
                this.cachePixels.recycle();
            }
        },
        
        getAssetList: function (component, props, defaultProps) {
            var ss = component.spriteSheet || props.spriteSheet || defaultProps.spriteSheet;
            
            if (typeof ss === 'string') {
                return platypus.game.settings.spriteSheets[ss].images.greenSlice();
            } else {
                return ss.images.greenSlice();
            }
        }
    });
}());
