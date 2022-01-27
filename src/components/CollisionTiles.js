import AABB from '../AABB.js';
import CollisionShape from '../CollisionShape.js';
import Data from '../Data.js';
import {arrayCache} from '../utils/array.js';
import createComponentClass from '../factory.js';

export default (function () {
    var maskJumpThrough = 0x10000000,
        maskRotation = 0x20000000,
        maskXFlip = 0x80000000,
        maskYFlip = 0x40000000,
        maskIndex = 0x0fffffff,
        getDefaultType = function () {
            return this.collisionType;
        },
        getCollisionType = function (index) {
            return this.collisionTypeMap[index & maskIndex] || this.collisionType;
        },
        flipDiagonal = function (num) {
            if (num === 0) {
                return num;
            } else {
                return num ^ maskYFlip ^ maskRotation;
            }
        },
        flipDiagonalInverse = function (num) {
            if (num === 0) {
                return num;
            } else {
                return num ^ maskXFlip ^ maskRotation;
            }
        },
        flipX = function (num) {
            if (num === 0) {
                return num;
            } else {
                return num ^ maskXFlip;
            }
        },
        flipY = function (num) {
            if (num === 0) {
                return num;
            } else {
                return num ^ maskYFlip;
            }
        },
        rotate90 = function (num) {
            if (num === 0) {
                return num;
            } else if (maskRotation & num) {
                return num ^ maskYFlip ^ maskRotation;
            } else {
                return num ^ maskXFlip ^ maskRotation;
            }
        },
        rotate180 = function (num) {
            if (num === 0) {
                return num;
            } else {
                return num ^ maskXFlip ^ maskYFlip;
            }
        },
        rotate270 = function (num) {
            if (num === 0) {
                return num;
            } else if (maskRotation & num) {
                return num ^ maskXFlip ^ maskRotation;
            } else {
                return num ^ maskYFlip ^ maskRotation;
            }
        },
        copySection = function (array, originX, originY, width, height) {
            var x   = 0,
                y   = 0,
                arr = arrayCache.setUp();

            for (y = 0; y < height; y++) {
                arr[y] = arrayCache.setUp();
                for (x = 0; x < width; x++) {
                    arr[y][x] = array[originX + x][originY + y];
                }
            }
            return arr;
        },
        cutSection = function (array, originX, originY, width, height) {
            var x   = 0,
                y   = 0,
                arr = arrayCache.setUp();

            for (y = 0; y < height; y++) {
                arr[y] = arrayCache.setUp();
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
                    fD    = flipDiagonal,
                    x     = 0,
                    y     = 0;

                for (x = 0; x < width; x++) {
                    for (y = 0; y < height; y++) {
                        array[originX + x][originY + y] = fD(arr[x][y]);
                    }
                }
                arrayCache.recycle(arr, 2);
                return array;
            },
            "diagonal-inverse": function (array, originX, originY, width, height) {
                var arr   = copySection(array, originX, originY, width, height),
                    fDI   = flipDiagonalInverse,
                    x     = 0,
                    y     = 0;

                for (x = 0; x < width; x++) {
                    for (y = 0; y < height; y++) {
                        array[originX + width - x - 1][originY + height - y - 1] = fDI(arr[x][y]);
                    }
                }
                arrayCache.recycle(arr, 2);
                return array;
            },
            "horizontal": function (array, originX, originY, width, height) {
                var arr   = copySection(array, originX, originY, width, height),
                    fX    = flipX,
                    x     = 0,
                    y     = 0;

                for (y = 0; y < height; y++) {
                    for (x = 0; x < width; x++) {
                        array[originX + width - x - 1][originY + y] = fX(arr[y][x]);
                    }
                }
                arrayCache.recycle(arr, 2);
                return array;
            },
            "vertical": function (array, originX, originY, width, height) {
                var arr   = copySection(array, originX, originY, width, height),
                    fY    = flipY,
                    x     = 0,
                    y     = 0;

                for (y = 0; y < height; y++) {
                    for (x = 0; x < width; x++) {
                        array[originX + x][originY + height - y - 1] = fY(arr[y][x]);
                    }
                }
                arrayCache.recycle(arr, 2);
                return array;
            },
            "rotate-90": function (array, originX, originY, width, height) {
                var arr   = copySection(array, originX, originY, width, height),
                    r90   = rotate90,
                    x     = 0,
                    y     = 0;

                for (y = 0; y < height; y++) {
                    for (x = 0; x < width; x++) {
                        array[originX + height - y - 1][originY + x] = r90(arr[y][x]);
                    }
                }
                arrayCache.recycle(arr, 2);
                return array;
            },
            "rotate-180": function (array, originX, originY, width, height) {
                var arr   = copySection(array, originX, originY, width, height),
                    r180  = rotate180,
                    x     = 0,
                    y     = 0;

                for (y = 0; y < height; y++) {
                    for (x = 0; x < width; x++) {
                        array[originX + width - x - 1][originY + height - y - 1] = r180(arr[y][x]);
                    }
                }
                arrayCache.recycle(arr, 2);
                return array;
            },
            "rotate-270": function (array, originX, originY, width, height) {
                var arr   = copySection(array, originX, originY, width, height),
                    r270  = rotate270,
                    x     = 0,
                    y     = 0;

                for (y = 0; y < height; y++) {
                    for (x = 0; x < width; x++) {
                        array[originX + y][originY + width - x - 1] = r270(arr[y][x]);
                    }
                }
                arrayCache.recycle(arr, 2);
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
                arrayCache.recycle(arr, 2);
                return array;
            }
        };

    return createComponentClass(/** @lends platypus.components.CollisionTiles.prototype */{
        id: 'CollisionTiles',
        
        properties: {
            /**
             * Maps tile indexes to particular collision types. This defaults to a "tiles" collision type for all non-zero values if a particular collision map is not provided.
             *
             * @property collisionTypeMap
             * @type Object
             * @default null
             */
            collisionTypeMap: null,
            
            /**
             * Sets the default collision type for non-zero map tiles.
             *
             * @property collisionType
             * @type String
             * @default "tiles"
             */
            collisionType: 'tiles',
            
            /**
             * The map's top offset.
             *
             * @property top
             * @type Number
             * @default 0
             */
            top: 0,
            
            /**
             * The map's left offset.
             *
             * @property left
             * @type Number
             * @default 0
             */
            left: 0
        },
        
        publicProperties: {
            /**
             * A 2D array describing the tile-map with off (0) and on (!0) states. The indexes match Tiled map data indexes with an additional bit setting (0x2000000) for jumpthrough tiles. Example: `[[0, 0, 0], [1, 0, 0], [1, 1, 1]]`. Available on the entity as `entity.collisionMap`.
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

        /**
         * This component causes the tile-map to collide with other entities. It must be part of a collision group and will cause "hit-by-tile" messages to fire on colliding entities.
         *
         * @memberof platypus.components
         * @uses platypus.Component
         * @constructs
         * @listens platypus.Entity#transform
         * @listens platypus.Entity#translate
         */
        initialize: function () {
            this.tileOffsetLeft  = this.tileWidth / 2 + this.left;
            this.tileOffsetTop = this.tileHeight / 2 + this.top;
            
            this.columns = this.collisionMap.length;
            this.rows = this.collisionMap[0].length;
            
            this.shapeDefinition = Data.setUp(
                "x", 0,
                "y", 0,
                "type", 'rectangle',
                "width", this.tileWidth,
                "height", this.tileHeight
            );
            
            this.storedTiles = arrayCache.setUp();
            this.serveTiles = arrayCache.setUp();
            this.storedTileIndex = 0;
            
            this.aabb = AABB.setUp();
            this.aabb.setBounds(this.left, this.top, this.tileWidth * this.columns + this.left, this.tileHeight * this.rows + this.top);
            
            if (this.collisionTypeMap) {
                this.getType = getCollisionType;
            } else {
                this.getType = getDefaultType;
            }
        },
        
        events: {
            "transform": function (transform) {
                this.transform(transform);
            },

            "translate": function (translate) {
                this.translate(translate);
            }
        },
        
        methods: {
            getShape: function (x, y, type) {
                var i = this.storedTileIndex,
                    shape = null,
                    storedTiles = this.storedTiles;
                
                if (i === storedTiles.length) {
                    shape = CollisionShape.setUp(null, this.shapeDefinition, type);
                    storedTiles.push(shape);
                } else {
                    shape = storedTiles[i];
                    shape.collisionType = type;
                }
                
                shape.update(x * this.tileWidth + this.tileOffsetLeft, y * this.tileHeight + this.tileOffsetTop);

                this.storedTileIndex += 1;
                
                return shape;
            },
            
            addShape: function (shapes, prevAABB, x, y, collisionType) {
                var xy = this.collisionMap[x][y],
                    index = xy & maskIndex,
                    jumpThrough = maskJumpThrough,
                    rotation = maskRotation,
                    xFlip = maskXFlip,
                    yFlip = maskYFlip;
                
                if (xy && (this.getType(index) === collisionType)) {
                    jumpThrough &= xy;
                    if (jumpThrough) {
                        rotation &= xy;
                        xFlip &= xy;
                        yFlip &= xy;
                        if (rotation && xFlip) { // Right
                            if (prevAABB.left >= (x + 1) * this.tileWidth + this.left) {
                                shapes.push(this.getShape(x, y, collisionType));
                            }
                        } else if (rotation) { // Left
                            if (prevAABB.right <= x * this.tileWidth + this.left) {
                                shapes.push(this.getShape(x, y, collisionType));
                            }
                        } else if (yFlip) { // Bottom
                            if (prevAABB.top >= (y + 1) * this.tileHeight + this.top) {
                                shapes.push(this.getShape(x, y, collisionType));
                            }
                        } else if (prevAABB.bottom <= y * this.tileHeight + this.top) { // Top
                            shapes.push(this.getShape(x, y, collisionType));
                        }
                    } else {
                        shapes.push(this.getShape(x, y, collisionType));
                    }
                }

                return shapes;
            },
            
            destroy: function () {
                var store = this.storedTiles,
                    i = store.length;
                
                this.shapeDefinition.recycle();
                this.shapeDefinition = null;
                
                while (i--) {
                    store[i].recycle();
                }
                arrayCache.recycle(store);
                this.storedTiles = null;

                arrayCache.recycle(this.serveTiles);
                this.serveTiles = null;
                
                this.aabb.recycle();
                this.aabb = null;
            }
        },
        
        publicMethods: {
            /**
             * Returns the axis-aligned bounding box of the entire map.
             *
             * @method platypus.components.CollisionTiles#getAABB
             * @return aabb {platypus.AABB} The returned object provides the top, left, width, and height of the collision map.
             */
            getAABB: function () {
                return this.aabb;
            },
            
            /**
             * Confirms whether a particular map grid coordinate contains a tile.
             *
             * @method platypus.components.CollisionTiles#isTile
             * @param x {number} Integer specifying the column of tiles in the collision map to check.
             * @param y {number} Integer specifying the row of tiles in the collision map to check.
             * @return {boolean} Returns `true` if the coordinate contains a collision tile, `false` if it does not.
             */
            isTile: function (x, y) {
                return !((x < 0) || (y < 0) || (x >= this.columns) || (y >= this.rows) || (this.collisionMap[x][y] === -1));
            },
            
            /**
             * Returns all the collision tiles within the provided axis-aligned bounding box as an array of shapes.
             *
             * @method platypus.components.CollisionTiles#getTileShapes
             * @param aabb {platypus.AABB} The axis-aligned bounding box for which tiles should be returned.
             * @param prevAABB {platypus.AABB} The axis-aligned bounding box for a previous location to test for jump-through tiles.
             * @param [collisionType] {String} The type of collision to check for. If not specified, "tiles" is used. (Since 0.8.3)
             * @return {Array} Each returned object provides the [CollisionShape](CollisionShape.html) of a tile.
             */
            getTileShapes: function (aabb, prevAABB, collisionType) {
                var colType = collisionType || 'tiles',
                    l = this.left,
                    t = this.top,
                    th = this.tileHeight,
                    tw = this.tileWidth,
                    left   = Math.max(Math.floor((aabb.left - l) / tw),  0),
                    top    = Math.max(Math.floor((aabb.top - t) / th), 0),
                    right  = Math.min(Math.ceil((aabb.right - l) / tw),  this.columns),
                    bottom = Math.min(Math.ceil((aabb.bottom - t) / th), this.rows),
                    x      = 0,
                    y      = 0,
                    shapes = this.serveTiles;
                
                shapes.length = 0;
                this.storedTileIndex = 0;
                
                for (x = left; x < right; x++) {
                    for (y = top; y < bottom; y++) {
                        this.addShape(shapes, prevAABB, x, y, colType);
                    }
                }
                
                return shapes;
            },
            
            /**
             * Performs a transform of a subset of the collision tile grid.
             *
             * @method platypus.components.CollisionTiles#transform
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
                    width  = t.width   || this.rows,
                    height = t.height  || this.columns,
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
             * @method platypus.components.CollisionTiles#translate
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
                    width  = t.width   || this.rows,
                    height = t.height  || this.columns,
                    dx     = t.dx      || 0,
                    dy     = t.dy      || 0;
                
                return transforms.translate(this.collisionMap, x, y, width, height, dx, dy);
            },
            
            /**
             * Gets a subset of the collision tile grid as a 2D array.
             *
             * @method platypus.components.CollisionTiles#getCollisionMatrix
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
             * @method platypus.components.CollisionTiles#setCollisionMatrix
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
