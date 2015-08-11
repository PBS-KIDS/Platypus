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
        initializeCanvasConservation = function (displayObject) { //To make CreateJS Display Object have better canvas conservation.
            var canvas  = [document.createElement("canvas"), document.createElement("canvas")],
                current = 0;

            if (!displayObject.___cache) { //make sure this is only set up once
                displayObject.___cache = displayObject.cache;

                displayObject.cache = function (x, y, width, height, scale) {
                    current = 1 - current;
                    this.cacheCanvas = canvas[current];
                    this.___cache(x, y, width, height, scale);
                };
            }

            return displayObject;
        },
        transform = {
            x: 1,
            y: 1,
            t: -1,
            r: 0
        },
        transformCheck = function (value) {
            var v = +(value.substring(4)),
                resp  = transform,
                a = !!(0x20000000 & v),
                b = !!(0x40000000 & v),
                c = !!(0x80000000 & v);

            resp.t = 0x0fffffff & v;
            resp.x = 1;
            resp.y = 1;
            resp.r = 0;

            if (a || b || c) {
                if (a && b && c) {
                    resp.x = -1;
                    resp.r = 90;
                } else if (a && c) {
                    resp.r = 90;
                } else if (b && c) {
                    resp.r = 180;
                } else if (a && b) {
                    resp.r = 270;
                } else if (a) {
                    resp.y = -1;
                    resp.r = 90;
                } else if (b) {
                    resp.y = -1;
                } else if (c) {
                    resp.x = -1;
                }
            }
            return resp;
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
            var x = 0,
                images = this.spriteSheet.images.slice(),
                spriteSheet = null,
                buffer = 0;
            
            if (images[0] && (typeof images[0] === 'string')) {
                images = images.slice(); //so we do not overwrite settings array
                for (x = 0; x < images.length; x++) {
                    if (platypus.assets[images[x]] && platypus.assets[images[x]].asset) {
                        images[x] = platypus.assets[images[x]].asset;
                    }
                }
            }
    
            spriteSheet = {
                images: images,
                frames: this.spriteSheet.frames,
                animations: this.spriteSheet.animations
            };
    
            this.controllerEvents = undefined;
            this.spriteSheet   = new createjs.SpriteSheet(spriteSheet);
            this.doMap         = null; //list of display objects that should overlay tile map.
            this.tiles         = {};
            this.tilesToRender = undefined;
            
            // temp values
            this.worldWidth    = this.tilesWidth    = this.tileWidth;
            this.worldHeight   = this.tilesHeight   = this.tileHeight;
            
            
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
             * This event is triggered before `handle-render` and provides the CreateJS stage that this component will require to display. In this case it compiles the array of tiles that make up the map and adds the tilesToRender displayObject to the stage.
             * 
             * @method 'handle-render-load'
             * @param data.container {createjs.Container} Container to contain this tile-rendering.
             */
            "handle-render-load": function (resp) {
                var x = 0,
                    y = 0,
                    parentContainer = null,
                    index = '',
                    imgMapDefinition = this.imageMap,
                    newImgMap = [];

                if (resp && resp.container) {
                    parentContainer = this.parentContainer = resp.container;
                    
                    if (parentContainer && !this.reorderedStage) {
                        parentContainer.reorder = true;
                        this.reorderedStage = true;
                    }
                    
                    this.tilesToRender = initializeCanvasConservation(new createjs.Container());
                    this.tilesToRender.name = 'entity-managed'; //its visibility is self-managed
                    
                    for (x = 0; x < imgMapDefinition.length; x++) {
                        newImgMap[x] = [];
                        for (y = 0; y < imgMapDefinition[x].length; y++) {
                            newImgMap[x][y] = index = imgMapDefinition[x][y];
                            if (!this.tiles[index]) {
                                this.tiles[index] = this.createTile(index);
                            }
                        }
                    }
                    this.imageMap = newImgMap;
                    
                    this.tilesWidth  = x * this.tileWidth;
                    this.tilesHeight = y * this.tileHeight;
                    
                    this.tilesToRender.scaleX = this.scaleX;
                    this.tilesToRender.scaleY = this.scaleY;
                    this.tilesToRender.z = this.owner.z;
            
                    parentContainer.addChild(this.tilesToRender);
                }
            },
            
            /**
             * If this component should cache entities, it checks peers for a "renderCache" display object and adds the display object to its list of objects to render on top of the tile set.
             * 
             * @method 'peer-entity-added'
             * @param entity {Entity} This is the peer entity to be checked for a renderCache.
             */
            "peer-entity-added": function (entity) {
                var x = 0,
                    y = 0,
                    imgMap = this.imageMap,
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
                    bounds = object.getTransformedBounds();
                    top    = Math.max(0, Math.floor(bounds.y / this.tileHeight));
                    bottom = Math.min(imgMap[0].length, Math.ceil((bounds.y + bounds.height) / this.tileHeight));
                    left   = Math.max(0, Math.floor(bounds.x / this.tileWidth));
                    right  = Math.min(imgMap.length, Math.ceil((bounds.x + bounds.width) / this.tileWidth));
                    
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
            
            /**
             * This event adds a layer of tiles to render on top of the existing layer of rendered tiles.
             * 
             * @method 'add-tiles'
             * @param message.imageMap {Array} This is a 2D mapping of tile indexes to be rendered.
             */
            "add-tiles": function (definition) {
                var x = 0,
                    y = 0,
                    map   = definition.imageMap,
                    index = '',
                    newIndex = 0;
                
                if (map) {
                    for (x = 0; x < this.imageMap.length; x++) {
                        for (y = 0; y < this.imageMap[x].length; y++) {
                            newIndex = map[x][y];
                            index = this.imageMap[x][y];
                            if (this.tiles[index]) {
                                delete this.tiles[index];
                            }
                            index = this.imageMap[x][y] += ' ' + newIndex;
                            if (!this.tiles[index]) {
                                this.tiles[index] = this.createTile(index);
                            }
                        }
                    }
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
                    buffer  = this.camera.buffer,
                    cache   = this.cache,
                    context = null,
                    canvas  = null,
                    width   = 0,
                    height  = 0,
                    maxX    = 0,
                    maxY    = 0,
                    minX    = 0,
                    minY    = 0,
                    camL    = this.convertCamera(camera.viewport.left, this.worldWidth, this.tilesWidth, camera.viewport.width),
                    camT    = this.convertCamera(camera.viewport.top, this.worldHeight, this.tilesHeight, camera.viewport.height),
                    vpL     = Math.floor(camL / this.tileWidth)  * this.tileWidth,
                    vpT     = Math.floor(camT / this.tileHeight) * this.tileHeight,
                    tile    = null,
                    ents    = [],
                    oList   = null;
                
                this.tilesToRender.x = camera.viewport.left - camL;
                this.tilesToRender.y = camera.viewport.top  - camT;
                
                if (((Math.abs(this.camera.x - vpL) > buffer) || (Math.abs(this.camera.y - vpT) > buffer)) && (this.imageMap.length > 0)) {
                    this.camera.x = vpL;
                    this.camera.y = vpT;
                    
                    //only attempt to draw children that are relevant
                    maxX = Math.min(Math.ceil((vpL + camera.viewport.width + buffer) / (this.tileWidth * this.scaleX)), this.imageMap.length) - 1;
                    minX = Math.max(Math.floor((vpL - buffer) / (this.tileWidth * this.scaleX)), 0);
                    maxY = Math.min(Math.ceil((vpT + camera.viewport.height + buffer) / (this.tileHeight * this.scaleY)), this.imageMap[0].length) - 1;
                    minY = Math.max(Math.floor((vpT - buffer) / (this.tileHeight * this.scaleY)), 0);
        
                    if ((maxY > cache.maxY) || (minY < cache.minY) || (maxX > cache.maxX) || (minX < cache.minX)) {
                        if (this.tilesToRender.cacheCanvas) {
                            canvas = this.tilesToRender.cacheCanvas;
                            this.tilesToRender.uncache();
                        }
                        
                        this.tilesToRender.removeChildAt(0);
                        this.tilesToRender.cache(minX * this.tileWidth, minY * this.tileHeight, (maxX - minX + 1) * this.tileWidth, (maxY - minY + 1) * this.tileHeight, 1);
                        
                        for (x = minX; x <= maxX; x++) {
                            for (y = minY; y <= maxY; y++) {
                                if ((y > cache.maxY) || (y < cache.minY) || (x > cache.maxX) || (x < cache.minX)) {
                                    // draw tiles
                                    tile = this.tiles[this.imageMap[x][y]];
                                    this.tilesToRender.removeChildAt(0); // Leaves one child in the display object so createjs will render the cached image.
                                    this.tilesToRender.addChild(tile);
                                    tile.x = (x + 0.5) * this.tileWidth;
                                    tile.y = (y + 0.5) * this.tileHeight;
                                    this.tilesToRender.updateCache('source-over');

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
                                this.tilesToRender.removeChildAt(0); // Leaves one child in the display object so createjs will render the cached image.
                                this.tilesToRender.addChild(ents[z]);
                                this.tilesToRender.updateCache('source-over');
                            }
                        }

                        if (canvas) {
                            context = this.tilesToRender.cacheCanvas.getContext('2d');
                            width   = (cache.maxX - cache.minX + 1) * this.tileWidth;
                            height  = (cache.maxY - cache.minY + 1) * this.tileHeight;
                            context.drawImage(canvas, 0, 0, width, height, (cache.minX - minX) * this.tileWidth, (cache.minY - minY) * this.tileHeight, width, height);
                            cache.minX = minX;
                            cache.minY = minY;
                            cache.maxX = maxX;
                            cache.maxY = maxY;
                        }
                    }
                }
            }
        },
    
        methods: {
            convertCamera: function (distance, worldDistance, tileDistance, viewportDistance) {
                if (((worldDistance / this.scaleX) === tileDistance) || ((worldDistance / this.scaleX) === viewportDistance)) {
                    return distance;
                } else {
                    return distance * (tileDistance - viewportDistance) / ((worldDistance / this.scaleX) - viewportDistance);
                }
            },
            
            createTile: function (imageName) {
                var i = 1,
                    imageArray = imageName.split(' '),
                    mergedTile = null,
                    tile  = new createjs.Sprite(this.spriteSheet, 0),
                    layer = null;
                
                tile.x = 0;
                tile.y = 0;
                tile.regX = this.tileWidth / 2;
                tile.regY = this.tileHeight / 2;
                if (imageArray[0] !== 'tile-1') {
                    layer = transformCheck(imageArray[0]);
                    tile.scaleX = layer.x;
                    tile.scaleY = layer.y;
                    tile.rotation = layer.r;
                    tile.gotoAndStop('tile' + layer.t);
                } else {
                    tile.gotoAndStop('tile-1');
                }
                
                for (i = 1; i < imageArray.length; i++) {
                    if (imageArray[i] !== 'tile-1') {
                        if (!mergedTile) {
                            mergedTile = new createjs.Container();
                            mergedTile.addChild(tile);
                            mergedTile.cache(-this.tileWidth / 2, -this.tileHeight / 2, this.tileWidth, this.tileHeight, 1);
                        }
                        layer = transformCheck(imageArray[i]);
                        tile.scaleX = layer.x;
                        tile.scaleY = layer.y;
                        tile.rotation = layer.r;
                        tile.gotoAndStop('tile' + layer.t);
                        mergedTile.updateCache('source-over');
                    }
                }

                if (mergedTile) {
                    return mergedTile;
                } else {
                    tile.cache(0, 0, this.tileWidth, this.tileHeight, 1);
                    return tile;
                }
            },
            
            destroy: function () {
                this.tilesToRender.removeAllChildren();
                this.parentContainer.removeChild(this.tilesToRender);
                this.imageMap.length = 0;
                this.tiles = undefined;
                this.camera = undefined;
                this.parentContainer = undefined;
                this.tilesToRender = undefined;
            }
        }
    });
}());
