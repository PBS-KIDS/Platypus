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

    var transformCheck = function (value, m) {
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
            this.controllerEvents = undefined;
            this.tilesToRender = undefined;
            
            // temp values
            this.worldWidth    = this.tilesWidth    = this.tileWidth;
            this.worldHeight   = this.tilesHeight   = this.tileHeight;
            
            this.cachedSprites = [];
            this.tiles = [];
            
            this.camera = {
                x: -1, //to force camera update
                y: -1
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
                    parentContainer = null;

                if (resp && resp.container) {
                    parentContainer = this.parentContainer = resp.container;
                    
                    if (parentContainer && !this.reorderedStage) {
                        parentContainer.reorder = true;
                        this.reorderedStage = true;
                    }
                    
                    this.tilesToRender = new PIXI.Container();
                    this.tilesToRender.name = 'entity-managed'; //its visibility is self-managed
                    
                    this.tilesWidth  = x * this.tileWidth;
                    this.tilesHeight = y * this.tileHeight;
                    
                    this.tilesToRender.scaleX = this.scaleX;
                    this.tilesToRender.scaleY = this.scaleY;
                    this.tilesToRender.z = this.owner.z;
            
                    parentContainer.addChild(this.tilesToRender);
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
                    i = 0,
                    cache   = this.cache,
                    index   = 0,
                    maxX    = 0,
                    maxY    = 0,
                    minX    = 0,
                    minY    = 0,
                    camL    = this.convertCamera(camera.viewport.left, this.worldWidth, this.tilesWidth, camera.viewport.width),
                    camT    = this.convertCamera(camera.viewport.top, this.worldHeight, this.tilesHeight, camera.viewport.height),
                    vpL     = Math.floor(camL / this.tileWidth)  * this.tileWidth,
                    vpT     = Math.floor(camT / this.tileHeight) * this.tileHeight;
                
                this.tilesToRender.x = camera.viewport.left - camL;
                this.tilesToRender.y = camera.viewport.top  - camT;
                
                if (this.imageMap.length > 0) {
                    this.camera.x = vpL;
                    this.camera.y = vpT;
                    
                    maxX = Math.min(Math.ceil((vpL + camera.viewport.width) / (this.tileWidth * this.scaleX)), this.imageMap.length) - 1;
                    minX = Math.max(Math.floor(vpL / (this.tileWidth * this.scaleX)), 0);
                    maxY = Math.min(Math.ceil((vpT + camera.viewport.height) / (this.tileHeight * this.scaleY)), this.imageMap[0].length) - 1;
                    minY = Math.max(Math.floor(vpT / (this.tileHeight * this.scaleY)), 0);
        
                    //only attempt to handle children if camera has moved more than a tile.
                    if ((maxY !== cache.maxY) || (minY !== cache.minY) || (maxX !== cache.maxX) || (minX !== cache.minX)) {
                        cache.maxX = maxX;
                        cache.maxY = maxY;
                        cache.minX = minX;
                        cache.minY = minY;
                        
                        // Place tiles according to image map.
                        for (x = minX; x <= maxX; x++) {
                            for (y = minY; y <= maxY; y++) {
                                index += this.createTile(index, x, y, this.imageMap[x][y]);
                            }
                        }
                        
                        // Clean up extra tiles if we have some left over.
                        if (index < this.tiles.length) {
                            for (i = index; i < this.tiles.length; i++) {
                                this.tilesToRender.removeChild(this.tiles[i]);
                                this.cachedSprites.push(this.tiles[i]);
                            }
                            this.tiles.length = index;
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
            
            createTile: function (index, x, y, animation) {
                var tile = this.tiles[index],
                    matrix = null,
                    anim = null;
                
                if (animation === 'tile-1') {
                    return 0;
                }

                if (!tile) {
                    tile = this.cachedSprites.pop() || new platypus.PIXIAnimation(this.spriteSheet);
                    if (!tile.transformMatrix) {
                        tile.transformMatrix = PIXI.Matrix();
                    }
                    this.tiles[index] = tile;
                    this.tilesToRender.addChild(tile);
                }
                
                matrix = tile.transformMatrix;

                anim = transformCheck(animation, matrix);
                matrix.tx = (x + 0.5) * this.tileWidth;
                matrix.ty = (y + 0.5) * this.tileHeight;
                tile.gotoAndStop('tile' + anim);
                return 1;
            },
            
            destroy: function () {
                this.tilesToRender.removeChildren();
                this.parentContainer.removeChild(this.tilesToRender);
                this.imageMap.length = 0;
                this.cachedSprites.length = 0;
                this.tiles.length = 0;
                this.camera = null;
                this.parentContainer = null;
                this.tilesToRender = null;
            }
        }
    });
}());
