/**
 * This component works in tandem with 'TiledLoader by taking several Tiled maps and combining them before `TiledLoader` processes them. Tiled maps must use the same tilesets for this to function correctly.
 *
 * Note: Set "manuallyLoad" to `true` in the `TiledLoader` component JSON definition so that it will wait for this component's "load-level" call.
 *
 * @namespace platypus.components
 * @class LevelBuilder
 * @uses platypus.Component
 */
/*global platypus */
import {arrayCache, greenSlice, greenSplice, union} from '../utils/array.js';

export default (function () {
    var
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
        mergeSegment  = function (level, segment, mergeAxis, decoder) {
            var i = 0,
                j = '';

            if (!level.tilewidth && !level.tileheight) {
                //set level tile size data if it's not already set.
                level.tilewidth  = segment.tilewidth;
                level.tileheight = segment.tileheight;
            } else if (level.tilewidth !== segment.tilewidth || level.tileheight !== segment.tileheight) {
                platypus.debug.warn('Tiled-Loader: Your map has segments with different tile sizes. All tile sizes must match. Segment: ' + segment);
            }

            if (mergeAxis === 'horizontal') {
                if (level.height === 0) {
                    level.height = segment.height;
                } else if (level.height !== segment.height) {
                    platypus.debug.warn('Tiled-Loader: You are trying to merge segments with different heights. All segments need to have the same height. Level: ' + level + ' Segment: ' + segment);
                }
            } else if (mergeAxis === 'vertical') {
                if (level.width === 0) {
                    level.width = segment.width;
                } else if (level.width !== segment.width) {
                    platypus.debug.warn('Tiled-Loader: You are trying to merge segments with different widths. All segments need to have the same width. Level: ' + level + ' Segment: ' + segment);
                }
            }

            for (i = 0; i < segment.layers.length; i++) {
                if (!level.layers[i]) {
                    //if the level doesn't have a layer yet, we're creating it and then copying it from the segment.
                    decoder(segment.layers[i]);
                    level.layers[i] = {};
                    for (j in segment.layers[i]) {
                        if (segment.layers[i].hasOwnProperty(j)) {
                            level.layers[i][j] = segment.layers[i][j];
                        }
                    }
                } else if (level.layers[i].type === segment.layers[i].type) {
                    //if the level does have a layer, we're appending the new data to it.
                    if (level.layers[i].data && segment.layers[i].data) {
                        // Make sure we're not trying to merge compressed levels.
                        decoder(segment.layers[i]);
                        
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
                    platypus.debug.warn('Tiled-Loader: The layers in your level segments do not match. Level: ' + level + ' Segment: ' + segment);
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
        mergeLevels = function (levelSegments, decoder) {
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
                },
                segmentsWide = levelSegments[i].length;

            for (i = 0; i < levelSegments.length; i++) {
                if (segmentsWide !== levelSegments[i].length) {
                    platypus.debug.warn('Tiled-Loader: Your map is not square. Maps must have an equal number of segments in every row.');
                }
                row = {
                    height: 0,
                    width: 0,
                    layers: []
                };
                for (j = 0; j < levelSegments[i].length; j++) {
                    //Merge horizontally
                    if (typeof levelSegments[i][j] === 'string') {
                        mergeSegment(row, levelDefinitions[levelSegments[i][j]], 'horizontal', decoder);
                    } else {
                        mergeSegment(row, levelSegments[i][j], 'horizontal', decoder);
                    }
                }
                //Then merge vertically
                mergeSegment(level, row, 'vertical', decoder);
            }
            return level;
        };

    return platypus.createComponentClass({
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
             *          "forest" : ["forest-1", "forest-2", "forest-3"]
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
        
        initialize: function () {
            this.levelMessage = {level: null, persistentData: null};
        },

        events: {// These are messages that this component listens for

            /**
             * When the scene has loaded, LevelBuilder compiles the level based on the template and pieces and sends it to the TiledLoader.
             *
             * @method 'scene-loaded'
             * @param persistentData {Object} The persistent data from the previous scene.
             */
            "scene-loaded": function (persistentData) {
                var templateRow  = null,
                    piecesToCopy = null,
                    x            = '',
                    y            = 0,
                    i            = 0,
                    j            = 0;
                
                this.levelMessage.persistentData = persistentData;

                this.levelTemplate = persistentData.levelTemplate || this.levelTemplate;
                this.useUniques = persistentData.useUniques || this.useUniques;
                piecesToCopy = persistentData.levelPieces || this.levelPieces;
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
                        throw ('Level Builder: Template is not defined');
                    }
                } else {
                    throw ('Level Builder: There is no level template.');
                }
                
                if (this.levelMessage.level) {
                    this.levelMessage.level = mergeLevels(this.levelMessage.level, this.owner.decodeLayer);
                    /**
                     * Dispatched when the scene has loaded and the level has been composited so TileLoader can begin loading the level.
                     *
                     * @event 'load-level'
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
            mergeLevels: function (levels) {
                return mergeLevels(levels, this.owner.decodeLayer);
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
}());
