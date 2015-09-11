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

    var sort = function (a, b) {
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
                    } else {
                        this.fullyCached = false;
                        
                        // Set up copy buffer and circular pointers
                        this.cacheTexture.alternate = new PIXI.RenderTexture(this.renderer, this.cacheWidth, this.cacheHeight);
                        
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
                var x = 0,
                    y = 0,
                    z = 0,
                    layer   = 0,
                    buffer  = this.camera.buffer,
                    cache   = this.cache,
                    width   = 0,
                    height  = 0,
                    maxX    = 0,
                    maxY    = 0,
                    minX    = 0,
                    minY    = 0,
                    camL    = this.convertCamera(camera.viewport.left, this.worldWidth, this.layerWidth, camera.viewport.width),
                    camT    = this.convertCamera(camera.viewport.top, this.worldHeight, this.layerHeight, camera.viewport.height),
                    vpL     = Math.floor(camL / this.tileWidth)  * this.tileWidth,
                    vpT     = Math.floor(camT / this.tileHeight) * this.tileHeight,
                    tile    = null,
                    ents    = [],
                    oList   = null;
                
                this.tilesSprite.x = camera.viewport.left - camL;
                this.tilesSprite.y = camera.viewport.top  - camT;
                
                if (!this.fullyCached && ((Math.abs(this.camera.x - vpL) > buffer) || (Math.abs(this.camera.y - vpT) > buffer)) && (this.imageMap.length > 0)) {
                    this.camera.x = vpL;
                    this.camera.y = vpT;
                    
                    //only attempt to draw children that are relevant
                    maxX = Math.min(Math.ceil((vpL + camera.viewport.width + buffer) / (this.tileWidth * this.scaleX)), this.tilesWidth) - 1;
                    minX = Math.max(Math.floor((vpL - buffer) / (this.tileWidth * this.scaleX)), 0);
                    maxY = Math.min(Math.ceil((vpT + camera.viewport.height + buffer) / (this.tileHeight * this.scaleY)), this.tilesHeight) - 1;
                    minY = Math.max(Math.floor((vpT - buffer) / (this.tileHeight * this.scaleY)), 0);
        
                    if ((maxY > cache.maxY) || (minY < cache.minY) || (maxX > cache.maxX) || (minX < cache.minX)) {
                        this.cacheTexture = this.cacheTexture.alternate;
                        this.tilesSprite.texture = this.cacheTexture;
                        
                        for (x = minX; x <= maxX; x++) {
                            for (y = minY; y <= maxY; y++) {
                                if ((y > cache.maxY) || (y < cache.minY) || (x > cache.maxX) || (x < cache.minX)) {
                                    // draw tiles
                                    for (layer = 0; layer < this.imageMap.length; layer++) {
                                        tile = this.imageMap[layer][x][y];
                                        if (tile) {
                                            tile.transformMatrix.tx = x * this.tileWidth;
                                            tile.transformMatrix.ty = y * this.tileHeight;
                                            this.cacheCamera.addChild(tile);
//                                            this.cacheTexture.render(tile);
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

                        this.cacheTexture.render(this.cacheCamera);
                        this.cacheCamera.removeChildren();
                        this.cacheTexture.requiresUpdate = true;

//                        context = this.tilesToRender.cacheCanvas.getContext('2d');
//                        width   = (cache.maxX - cache.minX + 1) * this.tileWidth;
//                        height  = (cache.maxY - cache.minY + 1) * this.tileHeight;
                        //context.drawImage(canvas, 0, 0, width, height, (cache.minX - minX) * this.tileWidth, (cache.minY - minY) * this.tileHeight, width, height);
                        //this.cacheTexture.render(this.tilesSprite.alternate);
                        //this.cacheTexture.update();
                        
                        cache.minX = minX;
                        cache.minY = minY;
                        cache.maxX = maxX;
                        cache.maxY = maxY;
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
                    return null;
                }
                
                tile = new platypus.PIXIAnimation(this.spriteSheet);
                tile.transformMatrix = new PIXI.Matrix();
                anim = transformCheck(imageName, tile.transformMatrix);
                tile.gotoAndStop('tile' + anim);
                
                return tile;
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
