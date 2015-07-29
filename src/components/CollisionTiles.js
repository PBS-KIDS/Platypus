/**
 * This component causes the tile-map to collide with other entities. It must be part of a collision group and will cause "hit-by-tile" messages to fire on colliding entities.
 * 
 * @class "CollisionTiles" Component
 * @uses Component
 */
// Requires: ["../collision-shape.js"]
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";
    
    var storedTiles = [],
        storedTileIndex = 0,
        serveTiles      = [],
        flip = function (num, arr) {
            if (num < -1) {
                num = Math.abs(num) - 2;
                return arr[num];
            } else {
                return num;
            }
        },
        copySection = function (array, originX, originY, width, height) {
            var x   = 0,
                y   = 0,
                arr = [];

            for (y = 0; y < height; y++) {
                arr[y] = [];
                for (x = 0; x < width; x++) {
                    arr[y][x] = array[originX + x][originY + y];
                }
            }
            return arr;
        },
        cutSection = function (array, originX, originY, width, height) {
            var x   = 0,
                y   = 0,
                arr = [];

            for (y = 0; y < height; y++) {
                arr[y] = [];
                for (x = 0; x < width; x++) {
                    arr[y][x] = array[originX + x][originY + y];
                    array[originX + x][originY + y] = -1;
                }
            }
            return arr;
        },
        pasteSection = function (destinationArray, sourceArray, originX, originY, width, height) {
            var x = 0,
                y = 0;

            for (y = 0; y < height; y++) {
                for (x = 0; x < width; x++) {
                    destinationArray[originX + x][originY + y] = sourceArray[y][x];
                }
            }
            return destinationArray;
        },
        transforms = {
            "diagonal": function (array, originX, originY, width, height) {
                var arr   = copySection(array, originX, originY, width, height),
                    x     = 0,
                    y     = 0,
                    flips = [-5, -4, -3, -2];

                for (y = 0; y < height; y++) {
                    for (x = 0; x < width; x++) {
                        array[originX + x][originY + y] = flip(arr[x][y], flips);
                    }
                }
                return array;
            },
            "diagonal-inverse": function (array, originX, originY, width, height) {
                var arr   = copySection(array, originX, originY, width, height),
                    x     = 0,
                    y     = 0,
                    flips = [-3, -2, -5, -4];

                for (y = 0; y < height; y++) {
                    for (x = 0; x < width; x++) {
                        array[originX + width - x - 1][originY + height - y - 1] = flip(arr[x][y], flips);
                    }
                }
                return array;
            },
            "horizontal": function (array, originX, originY, width, height) {
                var arr   = copySection(array, originX, originY, width, height),
                    x     = 0,
                    y     = 0,
                    flips = [-2, -5, -4, -3];

                for (y = 0; y < height; y++) {
                    for (x = 0; x < width; x++) {
                        array[originX + width - x - 1][originY + y] = flip(arr[y][x], flips);
                    }
                }
                return array;
            },
            "vertical": function (array, originX, originY, width, height) {
                var arr   = copySection(array, originX, originY, width, height),
                    x     = 0,
                    y     = 0,
                    flips = [-4, -3, -2, -5];

                for (y = 0; y < height; y++) {
                    for (x = 0; x < width; x++) {
                        array[originX + x][originY + height - y - 1] = flip(arr[y][x], flips);
                    }
                }
                return array;
            },
            "rotate-90": function (array, originX, originY, width, height) {
                var arr   = copySection(array, originX, originY, width, height),
                    x     = 0,
                    y     = 0,
                    flips = [-3, -4, -5, -2];

                for (y = 0; y < height; y++) {
                    for (x = 0; x < width; x++) {
                        array[originX + height - y - 1][originY + x] = flip(arr[y][x], flips);
                    }
                }
                return array;
            },
            "rotate-180": function (array, originX, originY, width, height) {
                var arr   = copySection(array, originX, originY, width, height),
                    x     = 0,
                    y     = 0,
                    flips = [-4, -5, -2, -3];

                for (y = 0; y < height; y++) {
                    for (x = 0; x < width; x++) {
                        array[originX + width - x - 1][originY + height - y - 1] = flip(arr[y][x], flips);
                    }
                }
                return array;
            },
            "rotate-270": function (array, originX, originY, width, height) {
                var arr   = copySection(array, originX, originY, width, height),
                    x     = 0,
                    y     = 0,
                    flips = [-5, -2, -3, -4];

                for (y = 0; y < height; y++) {
                    for (x = 0; x < width; x++) {
                        array[originX + y][originY + width - x - 1] = flip(arr[y][x], flips);
                    }
                }
                return array;
            },
            "translate": function (array, originX, originY, width, height, dx, dy) {
                var arr = cutSection(array, originX, originY, width, height),
                    x   = 0,
                    y   = 0;

                for (y = 0; y < height; y++) {
                    for (x = 0; x < width; x++) {
                        array[originX + x + dx][originY + y + dy] = arr[y][x];
                    }
                }
                return array;
            }
        };

    return platypus.createComponentClass({
        id: 'CollisionTiles',
        
        publicProperties: {
            /**
             * A 2D array describing the tile-map with off (-1) and on (!-1) states. Numbers > -1 are solid and numbers -2, -3, -4, and -5 provide for jumpthrough tiles with the solid side being top, right, bottom, and left respectively. Example: `[[-1,-1,-1], [1,-1,-1], [1,1,1]]`. Available on the entity as `entity.collisionMap`.
             * 
             * @property collisionMap
             * @type Array
             * @default []
             */
            collisionMap: [],
            
            /**
             * The width of tiles in world coordinates. Available on the entity as `entity.tileWidth`.
             * 
             * @property tileWidth
             * @type number
             * @default 10
             */
            tileWidth: 10,

            /**
             * The height of tiles in world coordinates. Available on the entity as `entity.tileHeight`.
             * 
             * @property tileWidth
             * @type number
             * @default 10
             */
            tileHeight: 10
        },
        constructor: function (definition) {
            this.tileHalfWidth  = this.tileWidth  / 2;
            this.tileHalfHeight = this.tileHeight / 2;
        },
        
        events: {
            /**
             * Performs a transform of a subset of the collision tile grid.
             * 
             * @method 'transform'
             * @param [transform] {Object} A list of key/value pairs describing the transform.
             * @param [transform.type="horizontal"] {String} The type of transform; one of the following: "horizontal", "vertical", "diagonal", "diagonal-inverse", "rotate-90", "rotate-180", "rotate-270". Height and width should match for diagonal flips and 90 degree rotations.
             * @param [transform.left=0] {number} Grid coordinate for the left side of the bounding box.
             * @param [transform.top=0] {number} Grid coordinate for the top of the bounding box.
             * @param [transform.width=grid.width] {number} Cell width of the bounding box.
             * @param [transform.height=grid.height] {number} Cell height of the bounding box.
             */
            "transform": function (transform) {
                this.transform(transform);
            },

            /**
             * Performs a translation of a subset of the collision tile grid.
             * 
             * @method 'translate'
             * @param [translate] {Object} A list of key/value pairs describing the translation.
             * @param [translate.dx=0] {number} Movement in columns.
             * @param [translate.dy=0] {number} Movement in rows.
             * @param [translate.left=0] {number} Grid coordinate for the left side of the bounding box.
             * @param [translate.top=0] {number} Grid coordinate for the top of the bounding box.
             * @param [translate.width=grid.width] {number} Cell width of the bounding box.
             * @param [translate.height=grid.height] {number} Cell height of the bounding box.
             */
            "translate": function (translate) {
                this.translate(translate);
            }
        },
        
        methods: {
            getShape: function (prevAABB, x, y) {
                var shape = null;
                
                if (storedTileIndex < storedTiles.length) {
                    shape = storedTiles[storedTileIndex];
                    storedTileIndex += 1;
                    shape.update(x * this.tileWidth + this.tileHalfWidth, y * this.tileHeight + this.tileHalfHeight);
                } else {
                    storedTiles.push(new platypus.CollisionShape(null, {
                        x:      x * this.tileWidth  + this.tileHalfWidth,
                        y:      y * this.tileHeight + this.tileHalfHeight,
                        type:   'rectangle',
                        width:  this.tileWidth,
                        height: this.tileHeight
                    }, 'tiles'));
                    shape = storedTiles[storedTileIndex];
                }
                
                return shape;
            },
            
            addShape: function (shapes, prevAABB, x, y) {
                if (this.collisionMap[x][y] > -1) {
                    shapes.push(this.getShape(prevAABB, x, y));
                } else if (this.collisionMap[x][y] < -1) {
                    switch (this.collisionMap[x][y]) {
                    case -2: //Top
                        if (prevAABB.bottom <= y * this.tileHeight) {
                            shapes.push(this.getShape(prevAABB, x, y));
                        }
                        break;
                    case -3: //Right
                        if (prevAABB.left >= (x + 1) * this.tileWidth) {
                            shapes.push(this.getShape(prevAABB, x, y));
                        }
                        break;
                    case -4: //Bottom
                        if (prevAABB.top >= (y + 1) * this.tileHeight) {
                            shapes.push(this.getShape(prevAABB, x, y));
                        }
                        break;
                    case -5: //Left
                        if (prevAABB.right <= x * this.tileWidth) {
                            shapes.push(this.getShape(prevAABB, x, y));
                        }
                        break;
                    }
                }
                return shapes;
            }
        },
        
        publicMethods: {
            /**
             * Returns the axis-aligned bounding box of the entire map.
             * 
             * @method getAABB
             * @return aabb {AABB} The returned object provides the top, left, width, and height of the collision map.
             */
            getAABB: function () {
                return {
                    left: 0,
                    top:  0,
                    right: this.tileWidth * this.collisionMap.length,
                    bottom: this.tileHeight * this.collisionMap.length[0]
                };
            },
            
            /**
             * Confirms whether a particular map grid coordinate contains a tile.
             * 
             * @method isTile
             * @param x {number} Integer specifying the column of tiles in the collision map to check.
             * @param y {number} Integer specifying the row of tiles in the collision map to check.
             * @return {boolean} Returns `true` if the coordinate contains a collision tile, `false` if it does not.
             */
            isTile: function (x, y) {
                return !((x < 0) || (y < 0) || (x >= this.collisionMap.length) || (y >= this.collisionMap[0].length) || (this.collisionMap[x][y] === -1));
            },
            
            /**
             * Returns all the collision tiles within the provided axis-aligned bounding box as an array of shapes.
             * 
             * @method getTileShapes
             * @param aabb {AABB} The axis-aligned bounding box for which tiles should be returned.
             * @param prevAABB {AABB} The axis-aligned bounding box for a previous location to test for jump-through tiles.
             * @return {Array} Each returned object provides the [CollisionShape](CollisionShape.html) of a tile.
             */
            getTileShapes: function (aabb, prevAABB) {
                var left   = Math.max(Math.floor(aabb.left   / this.tileWidth),  0),
                    top    = Math.max(Math.floor(aabb.top    / this.tileHeight), 0),
                    right  = Math.min(Math.ceil(aabb.right   / this.tileWidth),  this.collisionMap.length),
                    bottom = Math.min(Math.ceil(aabb.bottom  / this.tileHeight), this.collisionMap[0].length),
                    x      = 0,
                    y      = 0,
                    shapes = serveTiles;
                
                serveTiles.length = 0;
                storedTileIndex   = 0;
                
                for (x = left; x < right; x++) {
                    for (y = top; y < bottom; y++) {
                        this.addShape(shapes, prevAABB, x, y);
                    }
                }
                
                return shapes;
            },
            
            /**
             * Performs a transform of a subset of the collision tile grid.
             * 
             * @method transform
             * @param [transform] {Object} A list of key/value pairs describing the transform.
             * @param [transform.type="horizontal"] {String} The type of transform; one of the following: "horizontal", "vertical", "diagonal", "diagonal-inverse", "rotate-90", "rotate-180", "rotate-270". Height and width should match for diagonal flips and 90 degree rotations.
             * @param [transform.left=0] {number} Grid coordinate for the left side of the bounding box.
             * @param [transform.top=0] {number} Grid coordinate for the top of the bounding box.
             * @param [transform.width=grid.width] {number} Cell width of the bounding box.
             * @param [transform.height=grid.height] {number} Cell height of the bounding box.
             */
            transform: function (transform) {
                var t      = transform || {},
                    x      = t.left    || 0,
                    y      = t.top     || 0,
                    width  = t.width   || this.collisionMap[0].length,
                    height = t.height  || this.collisionMap.length,
                    type   = t.type    || "horizontal";
                
                if (transforms[type]) {
                    return transforms[type](this.collisionMap, x, y, width, height);
                } else {
                    return null;
                }
            },
            
            /**
             * Performs a translation of a subset of the collision tile grid.
             * 
             * @method translate
             * @param [translate] {Object} A list of key/value pairs describing the translation.
             * @param [translate.dx=0] {number} Movement in columns.
             * @param [translate.dy=0] {number} Movement in rows.
             * @param [translate.left=0] {number} Grid coordinate for the left side of the bounding box.
             * @param [translate.top=0] {number} Grid coordinate for the top of the bounding box.
             * @param [translate.width=grid.width] {number} Cell width of the bounding box.
             * @param [translate.height=grid.height] {number} Cell height of the bounding box.
             */
            translate: function (translate) {
                var t      = translate || {},
                    x      = t.left    || 0,
                    y      = t.top     || 0,
                    width  = t.width   || this.collisionMap[0].length,
                    height = t.height  || this.collisionMap.length,
                    dx     = t.dx      || 0,
                    dy     = t.dy      || 0;
                
                return transforms.translate(this.collisionMap, x, y, width, height, dx, dy);
            },
            
            /**
             * Gets a subset of the collision tile grid as a 2D array.
             * 
             * @method getCollisionMatrix
             * @param originX {number} Grid coordinate for the left side of the bounding box.
             * @param originY {number} Grid coordinate for the top of the bounding box.
             * @param width {number} Cell width of the bounding box.
             * @param height {number} Cell height of the bounding box.
             * @return {Array}
             */
            getCollisionMatrix: function (originX, originY, width, height) {
                return copySection(this.collisionMap, originX, originY, width, height);
            },
            
            /**
             * Sets a subset of the collision tile grid.
             * 
             * @method setCollisionMatrix
             * @param sourceArray {Array} A 2D array describing the collision tiles to insert into the collision tile grid.
             * @param originX {number} Grid coordinate for the left side of the bounding box.
             * @param originY {number} Grid coordinate for the top of the bounding box.
             * @param width {number} Cell width of the bounding box.
             * @param height {number} Cell height of the bounding box.
             */
            setCollisionMatrix: function (sourceArray, originX, originY, width, height) {
                return pasteSection(this.collisionMap, sourceArray, originX, originY, width, height);
            }
        }
    });
}());
