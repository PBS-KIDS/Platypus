/**
# COMPONENT **level-builder**
This component works in tandem with [[tiled-loader]] by taking several Tiled maps and combining them before `tiled-loader` processes them. Tiled maps must use the same tilesets for this to function correctly.

Note: Set "manuallyLoad" to `true` in the `tiled-loader` component JSON definition so that it will wait for this component's "load-level" call.

## Dependencies
- [[tiled-loader]] - Feeds information into `tiled-loader` to load a combined map.

## Messages

### Listens for:
- **scene-loaded** - On receiving this message, `level-builder` uses its JSON definition to create a combined map.
  - @param message (object) - Optional. Data passed into this scene from the last scene.

### Local Broadcasts:
- **load-level** - Once the combined level is ready, this message is triggered so `tiled-loader` will handle it.
  - @param message.persistentData (obj) - Data received from the initiating "scene-loaded" call is passed on here.
  - @param message.level (obj) - This is a JSON structure representing the combined map.

## JSON Definition
    {
      "type": "level-builder"
      
      "levelPieces": {
      // Optional. This is a list of key/value pairs listing the pieces the level template (below) will use to compose a larger map. If not specified, labels map directly to level names.
        
        "start"  : "start-map",
        "end" 	 : "end-map",
        // Labels include map sections by their map names
        
        "forest" : ["forest-1", "forest-2", "forest-3"]
        // If one section should be chosen from many sections, maps can be listed in an array.
      },

      "levelTemplate": [ ["start", "forest"], ["forest", "end"] ]
      // Required. This is a 2d array, laying out the map structure using the labels above to compose the larger map.

      "useUniques": true
      // Optional. If set, no single map is used twice in the creation of the combined map.
    }
*/
(function(){
	var mergeData = function(levelData, levelMergeAxisLength, segmentData, segmentMergeAxisLength, nonMergeAxisLength, mergeAxis){
		var x = 0;
		var y = 0;
		var combined = levelData.slice();
		
		if (mergeAxis == 'horizontal')
		{
			for (y = nonMergeAxisLength - 1; y >= 0; y--) 
			{
				for ( x = y * segmentMergeAxisLength, z = 0; x < (y + 1) * segmentMergeAxisLength; x++, z++)
				{
					combined.splice(((y + 1) * levelMergeAxisLength) + z, 0, segmentData[x]);
				}
			}
			return combined;
		} else if (mergeAxis == 'vertical') {
			return levelData.concat(segmentData);
		}
	},
	mergeObjects  = function(obj1s, obj2s, mergeAxisLength, mergeAxis){
		var i 	 = 0;
		var list = obj1s.slice();
		var obj  = null;
		
		for (; i < obj2s.length; i++){
			obj = {};
			for (j in obj2s[i]){
				obj[j] = obj2s[i][j];
			}
			if (mergeAxis == 'horizontal') {
				obj.x += mergeAxisLength;
			} else if (mergeAxis == 'vertical') {
				obj.y += mergeAxisLength;
			}
			list.push(obj);
		}
		return list;
	},
	mergeSegment  = function(level, segment, mergeAxis){
		var i = 0;
		var j = 0;

		if (!level.tilewidth && !level.tileheight) {
			//set level tile size data if it's not already set.
			level.tilewidth  = segment.tilewidth;
			level.tileheight = segment.tileheight;
		} else if (level.tilewidth != segment.tilewidth || level.tileheight != segment.tileheight) {
			console.warn('Tiled-Loader: Your map has segments with different tile sizes. All tile sizes must match. Segment: ' + segment);
		}
		
		if (mergeAxis == 'horizontal') {
			if (level.height == 0)
			{
				level.height = segment.height;
			} else if (level.height != segment.height) {
				console.warn('Tiled-Loader: You are trying to merge segments with different heights. All segments need to have the same height. Level: ' + level + ' Segment: ' + segment);
			}
		} else if (mergeAxis == 'vertical') {
			if (level.width == 0)
			{
				level.width = segment.width;
			} else if (level.width != segment.width) {
				console.warn('Tiled-Loader: You are trying to merge segments with different widths. All segments need to have the same width. Level: ' + level + ' Segment: ' + segment);
			}
		}
		
		for (; i < segment.layers.length; i++){
			if (!level.layers[i]){
				//if the level doesn't have a layer yet, we're creating it and then copying it from the segment.
				level.layers[i] = {};
				for (j in segment.layers[i]){
					level.layers[i][j] = segment.layers[i][j];
				}
			} else {
				if (level.layers[i].type == segment.layers[i].type)
				{
					//if the level does have a layer, we're appending the new data to it.
					if(level.layers[i].data && segment.layers[i].data) {
						if (mergeAxis == 'horizontal') {
							level.layers[i].data = mergeData(level.layers[i].data, level.width, segment.layers[i].data, segment.width, level.height, mergeAxis);
							level.layers[i].width += segment.width;
						} else if (mergeAxis == 'vertical') {
							level.layers[i].data = mergeData(level.layers[i].data, level.height, segment.layers[i].data, segment.height, level.width, mergeAxis);
							level.layers[i].height += segment.height;
						}
					} else if (level.layers[i].objects && segment.layers[i].objects) {
						if (mergeAxis == 'horizontal') {
							level.layers[i].objects = mergeObjects(level.layers[i].objects, segment.layers[i].objects, level.width * level.tilewidth, mergeAxis);
						} else if (mergeAxis == 'vertical') {
							level.layers[i].objects = mergeObjects(level.layers[i].objects, segment.layers[i].objects, level.height * level.tileheight, mergeAxis);
						}
					}
				} else {
					console.warn('Tiled-Loader: The layers in your level segments do not match. Level: ' + level + ' Segment: ' + segment);
				}
				
			}
		}
		
		if (mergeAxis == 'horizontal') {
			level.width += segment.width;	
		} else if (mergeAxis == 'vertical') {
			level.height += segment.height;	
		}
		
		//Go through all the STUFF in segment and copy it to the level if it's not already there.
		for(i in segment){
			if(!level[i]){
				level[i] = segment[i];
			}
		}
	},
	mergeLevels = function(levelSegments){
		var i  = 0;
		var j  = 0;
		var levelDefinitions = platformer.game.settings.levels;
		var row =   {
						height: 0,
						width:  0,
						layers: []
					};
		var level = {
						height: 0,
						width:  0,
						layers: []
					};
		var segmentsWide = levelSegments[i].length;
		
		for (; i < levelSegments.length; i++)
		{
			if (segmentsWide != levelSegments[i].length) {
				console.warn('Tiled-Loader: Your map is not square. Maps must have an equal number of segments in every row.');
			}
			row = 	{
						height: 0,
						width:  0,
						layers: []
					};
			for (j = 0; j < levelSegments[i].length; j++)
			{
				//Merge horizontally
				mergeSegment(row, levelDefinitions[levelSegments[i][j]], 'horizontal');
			}
			//Then merge vertically
			mergeSegment(level, row, 'vertical');
		}
		return level;
	};

	return platformer.createComponentClass({
		id: 'level-builder',
		constructor: function(definition){
			this.levelTemplate = this.owner.levelTemplate || definition.levelTemplate;
			this.useUniques = this.owner.useUniques || definition.useUniques || true;
			this.levelPieces = this.owner.levelPieces || definition.levelPieces;
			this.levelMessage = {level: null, persistentData: null};
		},

		events: {// These are messages that this component listens for
			"scene-loaded": function(persistentData) {
				var templateRow = null,
				piecesToCopy = null;
				
				this.levelMessage.persistentData = persistentData;

				this.levelTemplate = persistentData.levelTemplate || this.levelTemplate;
				this.useUniques = persistentData.useUniques || this.useUniques;
				piecesToCopy = persistentData.levelPieces || this.levelPieces;
				this.levelPieces = {};
				if (piecesToCopy) {
					for (var x in piecesToCopy) {
						if (typeof piecesToCopy[x] == "string") {
							this.levelPieces[x] = piecesToCopy[x];
						} else if (piecesToCopy[x].length) {
							this.levelPieces[x] = [];
							for (var y = 0; y < piecesToCopy[x].length; y++) {
								this.levelPieces[x].push(piecesToCopy[x][y]); 
							}
						} else {
							console.warn('Level Builder: Level pieces of incorrect type: ' + piecesToCopy[x]);
						}
					}
				}

				if (this.levelTemplate) {
					if(typeof this.levelTemplate == "string") {
						this.levelMessage.level = [this.getLevelPiece(this.levelTemplate)];
					} else if (this.levelTemplate.length) {
						this.levelMessage.level = [];
						for (var x = 0; x < this.levelTemplate.length; x++){
							templateRow = this.levelTemplate[x];
							if (typeof templateRow == "string") {
								this.levelMessage.level[x] = this.getLevelPiece(templateRow);
							} else if (templateRow.length) {
								this.levelMessage.level[x] = [];
								for (var y = 0; y < templateRow.length; y++){
									this.levelMessage.level[x][y] = this.getLevelPiece(templateRow[y]);
								}
							} else {
								console.warn('Level Builder: Template row is neither a string or array. What is it?');
							}
						}
					} else {
						console.warn('Level Builder: Template is neither a string or array. What is it?');
					}
				} else {
					console.warn('Level Builder: There is no level template.');
				}
				
				this.levelMessage.level = mergeLevels(this.levelMessage.level);
				
				this.owner.triggerEvent('load-level', this.levelMessage);
			}
		},
		
		methods: {// These are methods that are called by this component.
			getLevelPiece: function (type) {
				var pieces = this.levelPieces[type] || type;
				var temp = null;
				var random = 0;
				if(pieces){
					if(typeof pieces == "string"){
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
							return (this.levelPieces[type].splice(random, 1))[0];
						} else {
							return pieces[random];
						}
					} else {
						console.warn('Level Builder: There are no MORE level pieces of type: ' + type);
					}
					
				} else {
					console.warn('Level Builder: There are no level pieces of type: ' + type);
				}
				
				return null;
			},
			destroy: function () {
				this.levelMessage.level = null;
				this.levelMessage.persistentData = null;
				this.levelMessage = null;
			}
		}
	});
})();
