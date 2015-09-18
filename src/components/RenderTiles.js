/**
 * This component handles rendering tile map backgrounds.
 * 
 * When rendering the background, this component figures out what tiles are being displayed and caches them so they are rendered as one image rather than individually.
 * 
 * As the camera moves, the cache is updated by blitting the relevant part of the old cached image into a new cache and then rendering tiles that have shifted into the camera's view into the cache.
 * 
 * @namespace platypus.components
 * @class RenderTiles
 * @uses Component
 */
/*global PIXI, platypus, springroll */
/*jslint nomen:true, bitwise:true, plusplus:true */
(function () {
    "use strict";

    var tempCache = new platypus.AABB(),
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
        transformCheck = function (value, m) {
            var v = +(value.substring(4)),
                a = !!(0x20000000 & v),
                b = !!(0x40000000 & v),
                c = !!(0x80000000 & v);

            if (a || b || c) {
                if (a && b && c) {
                    m.a = 0;
                    m.b = -1;
                    m.c = -1;
                    m.d = 0;
                } else if (a && c) {
                    m.a = 0;
                    m.b = 1;
                    m.c = -1;
                    m.d = 0;
                } else if (b && c) { // 180 deg
                    m.a = -1;
                    m.b = 0;
                    m.c = 0;
                    m.d = -1;
                } else if (a && b) {
                    m.a = 0;
                    m.b = -1;
                    m.c = 1;
                    m.d = 0;
                } else if (a) {
                    m.a = 0;
                    m.b = 1;
                    m.c = 1;
                    m.d = 0;
                } else if (b) { // vertical flip
                    m.a = 1;
                    m.b = 0;
                    m.c = 0;
                    m.d = -1;
                } else if (c) { // horizontal flip
                    m.a = -1;
                    m.b = 0;
                    m.c = 0;
                    m.d = 1;
                }
            } else {
                m.a = 1;
                m.b = 0;
                m.c = 0;
                m.d = 1;
            }
            return 0x0fffffff & v;
        },
        Template = function (tile) {
            this.instances = [tile];
            this.index = 0;
            tile.template = this; // backwards reference for clearing index later.
        },
        nullTemplate = {
            getNext: function () {
                return null;
            }
        },
        prototype = Template.prototype;
        
    prototype.getNext = function () {
        var instance = this.instances[this.index],
            template = null;
        
        if (!instance) {
            template = this.instances[0];
            instance = this.instances[this.index] = new PIXI.Sprite(template.texture);
            instance.transformMatrix = template.transformMatrix.clone();
            instance.anchor = template.anchor;
        }
        
        this.index += 1;
        
        return instance;
    };
    
    prototype.clear = function () {
        this.index = 0;
    };

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
             * EaselJS SpriteSheet describing all the tile images.
             * 
             * @property spriteSheet
             * @type SpriteSheet
             * @default null
             */
            spriteSheet: null,
            
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
            this.controllerEvents = undefined;
            this.doMap            = null; //list of display objects that should overlay tile map.
            this.tiles            = {};
            
            this.renderer         = springroll.Application.instance.display.renderer;
            this.tilesSprite      = null;
            this.cacheTexture     = null;
            this.cacheCamera      = null;
            this.laxCam = new platypus.AABB();
            
            // temp values
            this.worldWidth    = this.layerWidth    = this.tileWidth;
            this.worldHeight   = this.layerHeight   = this.tileHeight;
            
            this.cache = new platypus.AABB();
            this.cachePixels = new platypus.AABB();
            
            this.reorderedStage = false;
            this.updateCache = false;
        },

        events: {
            /**
             * This event is triggered before `handle-render` and provides the container that this component will require to display. In this case it compiles the array of tiles that make up the map and adds the tilesSprite displayObject to the stage.
             * 
             * @method 'handle-render-load'
             * @param data.container {PIXI.Container} Container to contain this tile-rendering.
             */
            "handle-render-load": function (resp) {
                var w = 0,
                    h = 0,
                    x = 0,
                    y = 0,
                    z = this.owner.z,
                    col = null,
                    ct = null,
                    parentContainer = null,
                    imgMap = this.imageMap,
                    maxBuffer = this.maximumBuffer;

                if (resp && resp.container) {
                    parentContainer = this.parentContainer = resp.container;
                    
                    if (parentContainer && !this.reorderedStage) {
                        parentContainer.reorder = true;
                        this.reorderedStage = true;
                    }
                    
                    this.imageMap = [];
                    this.addImageMap(imgMap);
                    
                    this.tilesWidth  = this.imageMap[0].length;
                    this.tilesHeight = this.imageMap[0][0].length;
                    this.layerWidth  = this.tilesWidth  * this.tileWidth;
                    this.layerHeight = this.tilesHeight * this.tileHeight;
                    
                    // Set up buffer cache size
                    this.cacheWidth = Math.min(getPowerOfTwo(this.layerWidth), maxBuffer);
                    this.cacheHeight = Math.min(getPowerOfTwo(this.layerHeight), maxBuffer);

                    this.cacheCamera = new PIXI.Container();
                    this.updateBufferRegion();
                    this.cacheCameraWrapper = new PIXI.Container();
                    this.cacheCameraWrapper.addChild(this.cacheCamera);

                    if ((this.layerWidth <= this.cacheWidth) && (this.layerHeight <= this.cacheHeight)) { // We never need to recache.
                        this.cacheAll   = true;
                        
                        this.cacheTexture = new PIXI.RenderTexture(this.renderer, this.cacheWidth, this.cacheHeight);
    
                        //TODO: Temp fix for broken SpringRoll PIXI implementation.
                        this.cacheTexture.baseTexture.realWidth = this.cacheWidth;
                        this.cacheTexture.baseTexture.realHeight = this.cacheHeight;
                        this.cacheTexture._updateUvs();
                        
                        this.tilesSprite = new PIXI.Sprite(this.cacheTexture);
                        this.tilesSprite.scaleX = this.scaleX;
                        this.tilesSprite.scaleY = this.scaleY;
                        this.tilesSprite.z = z;

                        this.cache.setBounds(0, 0, this.tilesWidth - 1, this.tilesHeight - 1);
                        this.update(this.cacheTexture, this.cache);
                        parentContainer.addChild(this.tilesSprite);
                    } else if (this.cacheAll || ((this.layerWidth <= this.cacheWidth * 2) && (this.layerHeight <= this.cacheHeight)) || ((this.layerWidth <= this.cacheWidth) && (this.layerHeight <= this.cacheHeight * 2))) { // We cache everything across several textures creating a cache grid.
                        this.cacheAll = true;
                        
                        this.cacheGrid = [];
                        for (x = 0; x < this.tilesWidth; x += this.cacheTilesWidth) {
                            col = [];
                            this.cacheGrid.push(col);
                            for (y = 0; y < this.tilesHeight; y += this.cacheTilesHeight) {
                                // This prevents us from using too large of a cache for the right and bottom edges of the map.
                                w = Math.min(getPowerOfTwo((this.tilesWidth  - x) * this.tileWidth),  this.cacheWidth);
                                h = Math.min(getPowerOfTwo((this.tilesHeight - y) * this.tileHeight), this.cacheHeight);                                
                                
                                ct = new PIXI.RenderTexture(this.renderer, w, h);
                                ct.baseTexture.realWidth  = w;
                                ct.baseTexture.realHeight = h;
                                ct._updateUvs();
                                
                                ct = new PIXI.Sprite(ct);
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
                        
                        this.updateGrid();
                    } else {
                        this.cacheAll = false;
                        
                        this.cacheTexture = new PIXI.RenderTexture(this.renderer, this.cacheWidth, this.cacheHeight);
    
                        //TODO: Temp fix for broken SpringRoll PIXI implementation.
                        this.cacheTexture.baseTexture.realWidth = this.cacheWidth;
                        this.cacheTexture.baseTexture.realHeight = this.cacheHeight;
                        this.cacheTexture._updateUvs();
                        
                        this.tilesSprite = new PIXI.Sprite(this.cacheTexture);
                        this.tilesSprite.scaleX = this.scaleX;
                        this.tilesSprite.scaleY = this.scaleY;
                        this.tilesSprite.z = z;

                        // Set up copy buffer and circular pointers
                        this.cacheTexture.alternate = new PIXI.RenderTexture(this.renderer, this.cacheWidth, this.cacheHeight);
                        this.tilesSpriteCache = new PIXI.Sprite(this.cacheTexture.alternate);
                        
                        //TODO: Temp fix for broken SpringRoll PIXI implementation.
                        this.cacheTexture.alternate.baseTexture.realWidth = this.cacheWidth;
                        this.cacheTexture.alternate.baseTexture.realHeight = this.cacheHeight;
                        this.cacheTexture.alternate._updateUvs();

                        this.cacheTexture.alternate.alternate = this.cacheTexture;
                        parentContainer.addChild(this.tilesSprite);
                    }
                }
            },
            
            /**
             * If this component should cache entities, it checks peers for a "renderCache" display object and adds the display object to its list of objects to render on top of the tile set.
             * 
             * @method 'cache-sprite'
             * @param entity {Entity} This is the peer entity to be checked for a renderCache.
             */
            "cache-sprite": function (entity) {
                this.cacheSprite(entity);
            },

            /**
             * If this component should cache entities, it checks peers for a "renderCache" display object and adds the display object to its list of objects to render on top of the tile set.
             *
             * @method 'peer-entity-added'
             * @param entity {Entity} This is the peer entity to be checked for a renderCache.
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
                    this.addImageMap(map);
                }
            },

            /**
             * Provides the width and height of the world.
             * 
             * @method 'camera-loaded'
             * @param dimensions {Object}
             * @param dimensions.width {number} The width of the world.
             * @param dimensions.height {number} The height of the world.
             */
            "camera-loaded": function (dimensions) {
                this.worldWidth  = dimensions.width;
                this.worldHeight = dimensions.height;
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
        
                    if (cache.empty || !tempC.contains(cache)) {
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
                            
                            inFrame = cacheP.intersects(laxCam)
                            if (sprite.visible && !inFrame) {
                                sprite.visible = false;
                                sprite.texture.baseTexture.dispose();
                            } else if (!sprite.visible && inFrame) {
                                sprite.visible = true;
                            }
                        }
                    }
                } else {
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
                        this.doMap = [];
                    }

                    // Determine range:
                    bounds = object.getBounds(object.transformMatrix);
                    top    = Math.max(0, Math.floor(bounds.y / this.tileHeight));
                    bottom = Math.min(this.tilesHeight, Math.ceil((bounds.y + bounds.height) / this.tileHeight));
                    left   = Math.max(0, Math.floor(bounds.x / this.tileWidth));
                    right  = Math.min(this.tilesWidth, Math.ceil((bounds.x + bounds.width) / this.tileWidth));

                    // Find tiles that should include this display object
                    for (x = left; x < right; x++) {
                        if (!this.doMap[x]) {
                            this.doMap[x] = [];
                        }
                        for (y = top; y < bottom; y++) {
                            if (!this.doMap[x][y]) {
                                this.doMap[x][y] = [];
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
                
                tile = new platypus.PIXIAnimation(this.spriteSheet);
                tile.transformMatrix = new PIXI.Matrix();
                anim = 'tile' + transformCheck(imageName, tile.transformMatrix);
                tile.gotoAndStop(anim);
                
                return new Template(tile);
            },
            
            addImageMap: function (map) {
                var x = 0,
                    y = 0,
                    index  = '',
                    newMap = [],
                    tiles  = this.tiles,
                    tile   = null;
                
                for (x = 0; x < map.length; x++) {
                    newMap[x] = [];
                    for (y = 0; y < map[x].length; y++) {
                        index = map[x][y];
                        tile = tiles[index];
                        if (!tile && (tile !== null)) { // Empty grid spaces are null, so we needn't create a new tile.
                            tile = tiles[index] = this.createTile(index);
                        }
                        newMap[x][y] = tiles[index];
                    }
                }
                
                this.imageMap.push(newMap);
            },
            
            updateBufferRegion: function (viewport) {
                var clipW = Math.floor(this.cacheWidth  / this.tileWidth),
                    clipH = Math.floor(this.cacheHeight / this.tileHeight);
                    
                this.cacheClipWidth  = clipW * this.tileWidth;
                this.cacheClipHeight = clipH * this.tileHeight;
                
                if (viewport) {
                    this.cacheTilesWidth  = Math.min(this.tilesWidth,  Math.ceil((viewport.width  + this.buffer * 2) / this.tileWidth),  clipW);
                    this.cacheTilesHeight = Math.min(this.tilesHeight, Math.ceil((viewport.height + this.buffer * 2) / this.tileHeight), clipH);
                } else {
                    this.cacheTilesWidth  = Math.min(this.tilesWidth,  clipW);
                    this.cacheTilesHeight = Math.min(this.tilesHeight, clipH);
                }
                this.cacheCamera.mask = new PIXI.Graphics().beginFill(0x000000).drawRect(0, 0, this.cacheClipWidth, this.cacheClipHeight).endFill();
            },
            
            update: function (texture, bounds, tilesSpriteCache, oldBounds) {
                var x = 0,
                    y = 0,
                    z = 0,
                    layer   = 0,
                    tile    = null,
                    ent     = null,
                    ents    = [],
                    tiles   = [],
                    oList   = null;
                
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
                                    tile.transformMatrix.tx = (x + 0.5) * this.tileWidth;
                                    tile.transformMatrix.ty = (y + 0.5) * this.tileHeight;
                                    this.cacheCamera.addChild(tile);
                                }
                            }
                                
                            // check for cached entities
                            if (this.doMap && this.doMap[x] && this.doMap[x][y]) {
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

                // Draw cached entities
                if (ents.length) {
                    ents.sort(sort);
                    for (z = 0; z < ents.length; z++) {
                        ent = ents[z];
                        delete ent.drawn;
                        this.cacheCamera.addChild(ent);
                        if (ent.mask) {
                            this.cacheCamera.addChild(ent.mask);
                        }
                    }
                }
                
                // Clear out tile instances
                for (z = 0; z < tiles.length; z++) {
                    tiles[z].clear();
                }
                
                if (tilesSpriteCache && !oldBounds.empty) {
                    tilesSpriteCache.x = oldBounds.left * this.tileWidth;
                    tilesSpriteCache.y = oldBounds.top * this.tileHeight;
                    this.cacheCamera.addChild(tilesSpriteCache); // To copy last rendering over.
                }
                this.cacheCamera.x = -bounds.left * this.tileWidth;
                this.cacheCamera.y = -bounds.top * this.tileHeight;
                texture.clear();
                texture.render(this.cacheCameraWrapper);
                texture.requiresUpdate = true;
                this.cacheCamera.removeChildren();
                
                if (oldBounds) {
                    oldBounds.set(bounds);
                }
            },
            
            updateGrid: function () {
                var x = 0,
                    y = 0,
                    grid = this.cacheGrid;
                
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
                    grid = this.cacheGrid;
                    
                if (grid) {
                    for (x = 0; x < grid.length; x++) {
                        for (y = 0; y < grid[x].length; y++) {
                            grid[x][y].texture.destroy(true);
                            this.parentContainer.removeChild(grid[x][y]);
                        }
                    }
                    delete this.cacheGrid;
                } else {
                    if (this.tilesSprite.texture.alternate) {
                        this.tilesSprite.texture.alternate.destroy(true);
                    }
                    this.tilesSprite.texture.destroy(true);
                    this.parentContainer.removeChild(this.tilesSprite);
                }
                this.imageMap.length = 0;
                this.tiles = null;
                this.parentContainer = null;
                this.tilesSprite = null;
            }
        }
    });
}());
