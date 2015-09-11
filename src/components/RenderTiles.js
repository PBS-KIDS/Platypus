/**
 * This component handles rendering tile map backgrounds. When rendering the background, this component figures out what tiles are being displayed as caches them so they are rendered as one image rather than individually. As the camera moves, the cache is updated by blitting the relevant part of the old cached image into the new cached image and then rendering the tiles that have shifted into the camera's view into the cache.
 * 
 * @namespace platypus.components
 * @class RenderTiles
 * @uses Component
 */
/*global createjs, platypus */
/*jslint nomen:true, bitwise:true, plusplus:true */
(function () {
    "use strict";

    var tempCache = {
            minX: -1,
            minY: -1,
            maxX: -1,
            maxY: -1
        },
        sort = function (a, b) {
            return a.z - b.z;
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
                    m.c = 1;
                    m.d = 0;
                } else if (b && c) {
                    m.a = -1;
                    m.b = 0;
                    m.c = 0;
                    m.d = -1;
                } else if (a && b) {
                    m.a = 0;
                    m.b = 1;
                    m.c = -1;
                    m.d = 0;
                } else if (a) {
                    m.a = 0;
                    m.b = -1;
                    m.c = 1;
                    m.d = 0;
                } else if (b) {
                    m.a = 1;
                    m.b = 0;
                    m.c = 0;
                    m.d = -1;
                } else if (c) {
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
        Template = function(tile){
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
             * The amount of space in pixels around the edge of the camera that we include in the buffered image. Is multiplied by the scaleX to get the actual buffersize. Defaults to the tileWidth.
             * 
             * @property buffer
             * @type number
             * @default 0
             */
            buffer: 0,
    
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
            var buffer = 0;
            
            this.controllerEvents = undefined;
            this.doMap            = null; //list of display objects that should overlay tile map.
            this.tiles            = {};
            
            this.renderer         = springroll.Application.instance.display.renderer;
            this.tilesSprite      = null;
            this.cacheTexture     = null;
            this.cacheCamera      = null;
            
            // temp values
            this.worldWidth    = this.layerWidth    = this.tileWidth;
            this.worldHeight   = this.layerHeight   = this.tileHeight;
            
            
            buffer = (this.buffer || (this.tileWidth * 3 / 4)) * this.scaleX;
            this.camera = {
                x: -buffer - 1, //to force camera update
                y: -buffer - 1,
                buffer: buffer
            };
            this.cache = {
                minX: -1,
                minY: -1,
                maxX: -1,
                maxY: -1
            };
            
            this.reorderedStage = false;
        },

        events: {
            /**
             * This event is triggered before `handle-render` and provides the CreateJS stage that this component will require to display. In this case it compiles the array of tiles that make up the map and adds the tilesSprite displayObject to the stage.
             * 
             * @method 'handle-render-load'
             * @param data.container {createjs.Container} Container to contain this tile-rendering.
             */
            "handle-render-load": function (resp) {
                var x = 0,
                    y = 0,
                    parentContainer = null,
                    imgMap = this.imageMap;

                if (resp && resp.container) {
                    parentContainer = this.parentContainer = resp.container;
                    
                    if (parentContainer && !this.reorderedStage) {
                        parentContainer.reorder = true;
                        this.reorderedStage = true;
                    }
                    
                    //this.tilesToRender = initializeCanvasConservation(new PIXI.Container());
                    //this.tilesToRender.name = 'entity-managed'; //its visibility is self-managed
                    
                    this.imageMap = [];
                    this.addImageMap(imgMap);
                    
                    this.tilesWidth  = this.imageMap[0].length;
                    this.tilesHeight = this.imageMap[0][0].length;
                    this.layerWidth  = this.tilesWidth  * this.tileWidth;
                    this.layerHeight = this.tilesHeight * this.tileHeight;
                    
                    // May be too generous? Check for performance impact
                    this.cacheWidth = 2048;
                    this.cacheHeight = 2048;
                    for (x = 1; x < 2048; x *= 2) {
                        if (x > this.layerWidth) {
                            this.cacheWidth = x;
                            break;
                        }
                    }
                    for (y = 1; y < 2048; y *= 2) {
                        if (y > this.layerHeight) {
                            this.cacheHeight = y;
                            break;
                        }
                    }
                    this.cacheTilesWidth = Math.floor(this.cacheWidth  / this.tileWidth);
                    this.cacheTilesHeight = Math.floor(this.cacheHeight / this.tileHeight);

                    this.cacheCamera = new PIXI.Container();
                    this.cacheCameraWrapper = new PIXI.Container();
                    this.cacheCameraWrapper.addChild(this.cacheCamera);
                    this.cacheCamera.transformMatrix = new PIXI.Matrix();
                    this.cacheTexture = new PIXI.RenderTexture(this.renderer, this.cacheWidth, this.cacheHeight);

                    //TODO: Temp fix for broken SpringRoll PIXI implementation.
                    this.cacheTexture.baseTexture.realWidth = this.cacheWidth;
                    this.cacheTexture.baseTexture.realHeight = this.cacheHeight;
                    this.cacheTexture._updateUvs();
                    
                    this.tilesSprite = new PIXI.Sprite(this.cacheTexture);
                    this.tilesSprite.scaleX = this.scaleX;
                    this.tilesSprite.scaleY = this.scaleY;
                    this.tilesSprite.z = this.owner.z;
                    
                    if ((this.layerWidth <= this.cacheWidth) && (this.layerHeight <= this.cacheHeight)) { // We never need to recache.
                        this.fullyCached = true;
                        
                        this.cache.minX = 0,
                        this.cache.minY = 0,
                        this.cache.maxX = this.tilesWidth - 1;
                        this.cache.maxY = this.tilesHeight - 1;
                        this.updateCache(this.cacheTexture, this.cache);
                    } else {
                        this.fullyCached = false;
                        
                        // Set up copy buffer and circular pointers
                        this.cacheTexture.alternate = new PIXI.RenderTexture(this.renderer, this.cacheWidth, this.cacheHeight);
                        this.tilesSpriteCache = new PIXI.Sprite(this.cacheTexture.alternate);
                        
                        //TODO: Temp fix for broken SpringRoll PIXI implementation.
                        this.cacheTexture.alternate.baseTexture.realWidth = this.cacheWidth;
                        this.cacheTexture.alternate.baseTexture.realHeight = this.cacheHeight;
                        this.cacheTexture.alternate._updateUvs();

                        this.cacheTexture.alternate.alternate = this.cacheTexture;
                    }

                    parentContainer.addChild(this.tilesSprite);
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
                var buffer  = this.camera.buffer,
                    cache   = this.cache,
                    tempC   = tempCache,
                    camL    = this.convertCamera(camera.viewport.left, this.worldWidth, this.layerWidth, camera.viewport.width),
                    camT    = this.convertCamera(camera.viewport.top, this.worldHeight, this.layerHeight, camera.viewport.height),
                    vpL     = Math.floor(camL / this.tileWidth)  * this.tileWidth,
                    vpT     = Math.floor(camT / this.tileHeight) * this.tileHeight;
                
                this.tilesSprite.x = camera.viewport.left - camL;
                this.tilesSprite.y = camera.viewport.top  - camT;
                
                if (!this.fullyCached && ((Math.abs(this.camera.x - vpL) > buffer) || (Math.abs(this.camera.y - vpT) > buffer)) && (this.imageMap.length > 0)) {
                    this.camera.x = vpL;
                    this.camera.y = vpT;
                    
                    //only attempt to draw children that are relevant
                    tempC.maxX = Math.min(Math.ceil((vpL + camera.viewport.width + buffer) / (this.tileWidth * this.scaleX)), this.tilesWidth) - 1;
                    tempC.minX = Math.max(Math.floor((vpL - buffer) / (this.tileWidth * this.scaleX)), 0);
                    tempC.maxY = Math.min(Math.ceil((vpT + camera.viewport.height + buffer) / (this.tileHeight * this.scaleY)), this.tilesHeight) - 1;
                    tempC.minY = Math.max(Math.floor((vpT - buffer) / (this.tileHeight * this.scaleY)), 0);
        
                    if ((tempC.maxY > cache.maxY) || (tempC.minY < cache.minY) || (tempC.maxX > cache.maxX) || (tempC.minX < cache.minX)) {
                        this.tilesSpriteCache.texture = this.cacheTexture;
                        this.cacheTexture = this.cacheTexture.alternate;
                        this.tilesSprite.texture = this.cacheTexture;
                        this.updateCache(this.cacheTexture, tempC, this.tilesSpriteCache, cache);
                    }
                    
                    this.tilesSprite.x += cache.minX * this.tilesWidth;
                    this.tilesSprite.y += cache.minY * this.tilesHeight;
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
                    bounds = object.getBounds();
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
                }
            },

            convertCamera: function (distance, worldDistance, tileDistance, viewportDistance) {
                if (((worldDistance / this.scaleX) === tileDistance) || ((worldDistance / this.scaleX) === viewportDistance)) {
                    return distance;
                } else {
                    return distance * (tileDistance - viewportDistance) / ((worldDistance / this.scaleX) - viewportDistance);
                }
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
            
            updateCache: function (texture, bounds, tilesSpriteCache, oldBounds) {
                var x = 0,
                    y = 0,
                    z = 0,
                    layer   = 0,
                    tile    = null,
                    ents    = [],
                    tiles   = [],
                    oList   = null;
                
                for (x = bounds.minX; x <= bounds.maxX; x++) {
                    for (y = bounds.minY; y <= bounds.maxY; y++) {
                        if (!oldBounds || (y > oldBounds.maxY) || (y < oldBounds.minY) || (x > oldBounds.maxX) || (x < oldBounds.minX)) {
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
                        delete ents[z].drawn;
                        this.cacheCamera.addChild(ents[z]);
                    }
                }
                
                // Clear out tile instances
                for (z = 0; z < tiles.length; z++) {
                    tiles[z].clear();
                }
                
                if (tilesSpriteCache) {
                    this.cacheCamera.addChild(tilesSpriteCache); // To copy last rendering over.
                }
                this.cacheCamera.transformMatrix.tx = -bounds.minX * this.tileWidth;
                this.cacheCamera.transformMatrix.ty = -bounds.minY * this.tileHeight;
                this.cacheTexture.clear();
                this.cacheTexture.render(this.cacheCameraWrapper);
                this.cacheCamera.removeChildren();
                this.cacheTexture.requiresUpdate = true;
                
                if (oldBounds) {
                    oldBounds.minX = bounds.minX;
                    oldBounds.minY = bounds.minY;
                    oldBounds.maxX = bounds.maxX;
                    oldBounds.maxY = bounds.maxY;
                }
            },
            
            destroy: function () {
                this.parentContainer.removeChild(this.tilesToRender);
                this.imageMap.length = 0;
                this.tiles = null;
                this.camera = null;
                this.parentContainer = null;
                this.tilesSprite = null;
            }
        }
    });
}());
