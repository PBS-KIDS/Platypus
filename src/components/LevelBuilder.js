/* global atob, platypus */
import {arrayCache, greenSlice, greenSplice, union} from '../utils/array.js';
import createComponentClass from '../factory.js';
import {inflate} from 'pako';

const
    maskXFlip = 0x80000000,
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
                step1 = inflate(step1);
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
    decodeLayer = function (layer) {
        if (layer.encoding === 'base64') {
            layer.data = decodeBase64(layer.data, layer.compression);
            layer.encoding = 'csv'; // So we won't have to decode again.
        }
        return layer;
    },
    mergeData = function (levelData, levelMergeAxisLength, segmentData, segmentMergeAxisLength, nonMergeAxisLength, mergeAxis) {
        var x        = 0,
            y        = 0,
            z        = 0,
            combined = greenSlice(levelData);

        if (mergeAxis === 'horizontal') {
            for (y = nonMergeAxisLength - 1; y >= 0; y--) {
                for (x = y * segmentMergeAxisLength, z = 0; x < (y + 1) * segmentMergeAxisLength; x++, z++) {
                    combined.splice(((y + 1) * levelMergeAxisLength) + z, 0, segmentData[x]);
                }
            }
            return combined;
        } else if (mergeAxis === 'vertical') {
            return levelData.concat(segmentData);
        }
        
        return null;
    },
    mergeObjects  = function (obj1s, obj2s, mergeAxisLength, mergeAxis) {
        var i    = 0,
            j    = '',
            list = greenSlice(obj1s),
            obj  = null;

        for (i = 0; i < obj2s.length; i++) {
            obj = {};
            for (j in obj2s[i]) {
                if (obj2s[i].hasOwnProperty(j)) {
                    obj[j] = obj2s[i][j];
                }
            }
            if (mergeAxis === 'horizontal') {
                obj.x += mergeAxisLength;
            } else if (mergeAxis === 'vertical') {
                obj.y += mergeAxisLength;
            }
            list.push(obj);
        }
        return list;
    },
    mergeSegment  = function (level, segment, mergeAxis) {
        var i = 0,
            j = '';

        if (!level.tilewidth && !level.tileheight) {
            //set level tile size data if it's not already set.
            level.tilewidth  = segment.tilewidth;
            level.tileheight = segment.tileheight;
        } else if (level.tilewidth !== segment.tilewidth || level.tileheight !== segment.tileheight) {
            platypus.debug.warn('Component LevelBuilder: Your map has segments with different tile sizes. All tile sizes must match. Segment: ' + segment);
        }

        if (mergeAxis === 'horizontal') {
            if (level.height === 0) {
                level.height = segment.height;
            } else if (level.height !== segment.height) {
                platypus.debug.warn('Component LevelBuilder: You are trying to merge segments with different heights. All segments need to have the same height. Level: ' + level + ' Segment: ' + segment);
            }
        } else if (mergeAxis === 'vertical') {
            if (level.width === 0) {
                level.width = segment.width;
            } else if (level.width !== segment.width) {
                platypus.debug.warn('Component LevelBuilder: You are trying to merge segments with different widths. All segments need to have the same width. Level: ' + level + ' Segment: ' + segment);
            }
        }

        for (i = 0; i < segment.layers.length; i++) {
            if (!level.layers[i]) {
                const layer = level.layers[i] = {};

                //if the level doesn't have a layer yet, we're creating it and then copying it from the segment.
                decodeLayer(segment.layers[i]);
                
                for (j in segment.layers[i]) {
                    if (segment.layers[i].hasOwnProperty(j)) {
                        layer[j] = segment.layers[i][j];
                    }
                }

                // If we're adding objects, make sure that they're offset correctly.
                if (layer.objects) {
                    if (mergeAxis === 'horizontal') {
                        layer.objects = mergeObjects([], layer.objects, level.width * level.tilewidth, mergeAxis);
                    } else if (mergeAxis === 'vertical') {
                        layer.objects = mergeObjects([], layer.objects, level.height * level.tileheight, mergeAxis);
                    }
                }
            } else if (level.layers[i].type === segment.layers[i].type) {
                //if the level does have a layer, we're appending the new data to it.
                if (level.layers[i].data && segment.layers[i].data) {
                    // Make sure we're not trying to merge compressed levels.
                    decodeLayer(segment.layers[i]);
                    
                    if (mergeAxis === 'horizontal') {
                        level.layers[i].data = mergeData(level.layers[i].data, level.width, segment.layers[i].data, segment.width, level.height, mergeAxis);
                        level.layers[i].width += segment.width;
                    } else if (mergeAxis === 'vertical') {
                        level.layers[i].data = mergeData(level.layers[i].data, level.height, segment.layers[i].data, segment.height, level.width, mergeAxis);
                        level.layers[i].height += segment.height;
                    }
                } else if (level.layers[i].objects && segment.layers[i].objects) {
                    if (mergeAxis === 'horizontal') {
                        level.layers[i].objects = mergeObjects(level.layers[i].objects, segment.layers[i].objects, level.width * level.tilewidth, mergeAxis);
                    } else if (mergeAxis === 'vertical') {
                        level.layers[i].objects = mergeObjects(level.layers[i].objects, segment.layers[i].objects, level.height * level.tileheight, mergeAxis);
                    }
                }
            } else {
                platypus.debug.warn('Component LevelBuilder: The layers in your level segments do not match. Level: ' + level + ' Segment: ' + segment);
            }
        }

        if (mergeAxis === 'horizontal') {
            level.width += segment.width;
        } else if (mergeAxis === 'vertical') {
            level.height += segment.height;
        }

        //Go through all the STUFF in segment and copy it to the level if it's not already there.
        for (j in segment) {
            if (segment.hasOwnProperty(j) && !level[j]) {
                level[j] = segment[j];
            }
        }
    },
    mergeLevels = function (levelSegments) {
        var i = 0,
            j = 0,
            levelDefinitions = platypus.game.settings.levels,
            row = {
                height: 0,
                width: 0,
                layers: []
            },
            level = {
                height: 0,
                width: 0,
                layers: []
            };

        for (i = 0; i < levelSegments.length; i++) {
            row = {
                height: 0,
                width: 0,
                layers: []
            };
            for (j = 0; j < levelSegments[i].length; j++) {
                //Merge horizontally
                if (typeof levelSegments[i][j] === 'string') {
                    const
                        levelDefinitionLabel = levelSegments[i][j],
                        transformIndex = levelDefinitionLabel.indexOf(':');
                    let levelDefinition = levelDefinitions[levelDefinitionLabel];
                    
                    // check for transform
                    if (!levelDefinition && (transformIndex >= 0)) {
                        const transform = levelDefinitionLabel.substring(transformIndex + 1);

                        levelDefinition = levelDefinitions[levelDefinitionLabel.substring(0, transformIndex)];
                        if (transform === 'mirror') {
                            levelDefinition = levelDefinitions[levelDefinitionLabel] = mirrorSegment(levelDefinition);
                        }
                    }
                    mergeSegment(row, levelDefinition, 'horizontal');
                } else {
                    mergeSegment(row, levelSegments[i][j], 'horizontal');
                }
            }
            //Then merge vertically
            mergeSegment(level, row, 'vertical');
        }
        return level;
    },
    mirrorSegment = function (segment) {
        const
            newSegment = {
                layers: []
            },
            width = segment.width * segment.tilewidth;

        for (let i = 0; i < segment.layers.length; i++) {
            const
                toLayer = newSegment.layers[i] = {},
                fromLayer = segment.layers[i];

            decodeLayer(fromLayer);
            
            for (const key in fromLayer) {
                if (fromLayer.hasOwnProperty(key)) {
                    toLayer[key] = fromLayer[key];
                }
            }

            if (fromLayer.data) {
                const fromData = fromLayer.data,
                    toData = toLayer.data = [],
                    segmentWidth = segment.width;

                for (let j = 0; j < fromData.length; j++) {
                    const cell = fromData[segmentWidth * ((j / segmentWidth) >> 0) + segmentWidth - 1 - (j % segmentWidth)];

                    toData[j] = cell ? maskXFlip ^ cell : 0;
                }
            }

            // If we're adding objects, make sure that they're mirrored correctly.
            if (fromLayer.objects) {
                const
                    fromObjects = fromLayer.objects,
                    toObjects = toLayer.objects = [];

                for (let j = 0; j < fromObjects.length; j++) {
                    const
                        fromObject = fromObjects[j],
                        toObject = toObjects[j] = {};

                    for (const key in fromObject) {
                        if (fromObject.hasOwnProperty(key)) {
                            toObject[key] = fromObject[key];
                        }
                    }
                    toObject.x = width - fromObject.x - (fromObject.width || 0); // subtract object width since its top-left corner is the origin.
                    if (fromObject.rotation) {
                        toObject.rotation = -fromObject.rotation;
                    }
                    if (fromObject.polygon) {
                        toObject.polygon = mirrorPoints(fromObject.polygon);
                    }
                    if (fromObject.polyline) {
                        toObject.polyline = mirrorPoints(fromObject.polyline);
                    }
                }
            }
        }

        //Go through all the STUFF in segment and copy it to the level if it's not already there.
        for (const key in segment) {
            if (segment.hasOwnProperty(key) && !newSegment[key]) {
                newSegment[key] = segment[key];
            }
        }

        return newSegment;
    },
    mirrorPoints = function (points) {
        const
            arr = [];
        let i = points.length;

        while (i--) {
            arr.push({
                x: -points[i].x,
                y: points[i].y
            });
        }
        arr.unshift(arr.pop()); // so the same point is at the beginning.

        return arr;
    };

export default createComponentClass(/** @lends platypus.components.LevelBuilder.prototype */{
    id: 'LevelBuilder',
    
    properties: {
        /**
         * If true, no single map piece is used twice in the creation of the combined map.
         *
         * @property useUniques
         * @type Boolean
         * @default true
         */
        useUniques: true,

        /**
         * A 1D or 2D array of level piece ids. The template defines how the pieces will be arranged and which pieces can be used where. The template must be rectangular in dimensions.
         *
         *      "levelTemplate": [ ["start", "forest"], ["forest", "end"] ]
         *
         * @property levelTemplate
         * @type Array
         * @default null
         */
        levelTemplate: null,

        /**
         * This is an object of key/value pairs listing the pieces that map to an id in the level template. The value can be specified as a string or array. A piece will be randomly chosen from an array when that idea is used. If levelPieces is not defined, ids in the template map directly to level names.
         *
         *      "levelPieces": {
         *          "start"  : "start-map",
         *          "end"      : "end-map",
         *          "forest" : ["forest-1", "forest-2", "forest-3"],
         *          "river": ["river-1", "river-1:mirror"] // adding ":mirror" takes the referenced map and flips it horizontally to add variety.
         *      }
         *
         * @property levelPieces
         * @type Object
         * @default null
         */
        levelPieces: null
    },

    publicProperties: {
    },
    
    /**
     * This component works in tandem with `TiledLoader` by taking several Tiled maps and combining them before `TiledLoader` processes them. Tiled maps must use the same tilesets for this to function correctly.
     *
     * Note: Set "manuallyLoad" to `true` in the `TiledLoader` component JSON definition so that it will wait for this component's "load-level" call.
     *
     * @memberof platypus.components
     * @uses platypus.Component
     * @constructs
     * @listens platypus.Entity#layer-loaded
     * @fires platypus.Entity#created-level
     * @fires platypus.Entity#load-level
     */
    initialize: function () {
        this.levelMessage = {level: null, persistentData: null};
    },

    events: {
        "layer-loaded": function (data) {
            var templateRow  = null,
                piecesToCopy = null,
                x            = '',
                y            = 0,
                i            = 0,
                j            = 0;
            
            this.levelMessage.persistentData = data;

            this.levelTemplate = (data && data.levelTemplate) || this.levelTemplate;
            this.useUniques = (data && data.useUniques) || this.useUniques;
            piecesToCopy = (data && data.levelPieces) || this.levelPieces;
            this.levelPieces = {};
            if (piecesToCopy) {
                for (x in piecesToCopy) {
                    if (piecesToCopy.hasOwnProperty(x)) {
                        if (typeof piecesToCopy[x] === "string") {
                            this.levelPieces[x] = piecesToCopy[x];
                        } else if (piecesToCopy[x].length) {
                            this.levelPieces[x] = [];
                            for (y = 0; y < piecesToCopy[x].length; y++) {
                                this.levelPieces[x].push(piecesToCopy[x][y]);
                            }
                        } else {
                            throw ('Level Builder: Level pieces of incorrect type: ' + piecesToCopy[x]);
                        }
                    }
                }
            }

            if (this.levelTemplate) {
                if (this.levelTemplate) {
                    this.levelMessage.level = [];
                    for (i = 0; i < this.levelTemplate.length; i++) {
                        templateRow = this.levelTemplate[i];
                        if (typeof templateRow === "string") {
                            this.levelMessage.level[i] = this.getLevelPiece(templateRow);
                        } else if (templateRow.length) {
                            this.levelMessage.level[i] = [];
                            for (j = 0; j < templateRow.length; j++) {
                                this.levelMessage.level[i][j] = this.getLevelPiece(templateRow[j]);
                            }
                        } else {
                            throw ('Level Builder: Template row is neither a string or array. What is it?');
                        }
                    }
                } else {
                    platypus.debug.warn('Level Builder: Template is not defined');
                }
            } else {
                platypus.debug.warn('Level Builder: There is no level template.');
            }
            
            if (this.levelMessage.level) {
                this.levelMessage.level = mergeLevels(this.levelMessage.level);
                /**
                 * Dispatched when the scene has loaded and the level has been composited. This occurs before "load-level" to send out level before it's loaded in case it needs to be saved or edited before being loaded.
                 *
                 * @event platypus.Entity#created-level
                 * @param data {Object}
                 * @param data.level {Object} An object describing the level dimensions, tiles, and entities.
                 * @param data.persistentData {Object} The persistent data passed from the last scene. We add levelBuilder data to it to pass on.
                 * @param data.persistentData.levelTemplate {Object} A 1D or 2D array of level piece ids. The template defines how the pieces will be arranged and which pieces can be used where. The template must be rectangular in dimensions.
                 * @param data.persistentData.levelPieces {Object} An object of key/value pairs listing the pieces that map to an id in the level template.
                 * @param data.persistentData.useUniques {Boolean} If true, no single map piece is used twice in the creation of the combined map.
                 */
                this.owner.triggerEvent('created-level', this.levelMessage);

                /**
                 * Dispatched when the scene has loaded and the level has been composited so TileLoader can begin loading the level.
                 *
                 * @event platypus.Entity#load-level
                 * @param data {Object}
                 * @param data.level {Object} An object describing the level dimensions, tiles, and entities.
                 * @param data.persistentData {Object} The persistent data passed from the last scene. We add levelBuilder data to it to pass on.
                 * @param data.persistentData.levelTemplate {Object} A 1D or 2D array of level piece ids. The template defines how the pieces will be arranged and which pieces can be used where. The template must be rectangular in dimensions.
                 * @param data.persistentData.levelPieces {Object} An object of key/value pairs listing the pieces that map to an id in the level template.
                 * @param data.persistentData.useUniques {Boolean} If true, no single map piece is used twice in the creation of the combined map.
                 */
                this.owner.triggerEvent('load-level', this.levelMessage);
            }
        }
    },
    
    methods: {// These are methods that are called by this component.
        getLevelPiece: function (type) {
            var pieces = this.levelPieces[type] || type,
                temp   = null,
                random = 0;
            
            if (pieces) {
                if (typeof pieces === "string") {
                    if (this.useUniques) {
                        temp = pieces;
                        this.levelPieces[type] = null;
                        return temp;
                    } else {
                        return pieces;
                    }
                } else if (pieces.length) {
                    random = Math.floor(Math.random() * pieces.length);
                    if (this.useUniques) {
                        return greenSplice(this.levelPieces[type], random);
                    } else {
                        return pieces[random];
                    }
                } else {
                    throw ('Level Builder: There are no MORE level pieces of type: ' + type);
                }
            } else {
                throw ('Level Builder: There are no level pieces of type: ' + type);
            }
        },
        destroy: function () {
            this.levelMessage.level = null;
            this.levelMessage.persistentData = null;
            this.levelMessage = null;
        }
    },
    
    publicMethods: {
        /**
         * Accepts a list of levels to be merged and returns a level definition with the references combined.
         *
         * @memberof LevelBuilder.prototype
         * @param {Array} levels
         * @return {Object}
         */
        mergeLevels: function (levels) {
            return mergeLevels(levels);
        }
    },
    
    getAssetList: function (def, props, defaultProps) {
        var i = 0,
            arr = null,
            assets = arrayCache.setUp(),
            key = '',
            levels = null;
        
        if (def && def.levelPieces) {
            levels = def.levelPieces;
        } else if (props && props.levelPieces) {
            levels = props.levelPieces;
        } else if (defaultProps && defaultProps.levelPieces) {
            levels = defaultProps.levelPieces;
        }
        
        if (levels) {
            for (key in levels) {
                if (levels.hasOwnProperty(key)) {
                    // Offload to TiledLoader since it has level-parsing handling
                    if (Array.isArray(levels[key])) {
                        for (i = 0; i < levels[key].length; i++) {
                            arr = platypus.components.TiledLoader.getAssetList({
                                level: levels[key][i]
                            }, props, defaultProps);
                            union(assets, arr);
                            arrayCache.recycle(arr);
                        }
                    } else {
                        arr = platypus.components.TiledLoader.getAssetList({
                            level: levels[key]
                        }, props, defaultProps);
                        union(assets, arr);
                        arrayCache.recycle(arr);
                    }
                }
            }
        }
        
        return assets;
    }
});
