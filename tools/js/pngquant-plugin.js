/**
  * PNGQUANT PLUGIN
  * 
  * This plugin uses the pngquant compression utility to compress PNGs. You can set how many colors each
  * image should have, and this plugin rolls through the list of assets, smashing PNGs into significantly
  * smaller files.
  * 
  * It looks for the following settings in the game configuration:
  * 
  * config.builds[].pngCompression (number)
  *     Whether to compress PNGs for a given build: 0 means no compression will be used. A positive
  *     integer compresses to that number of colors per image.
  *     
  * config.source.assets[].compression (number)
  *     Use this to set compression for a particular PNG asset: 0 will use the default set above. Any
  *     other positive integer compresses to that number of colors for this particular image.
  * 
  */

(function(){
	if(isJIT){
		print('This plugin does not support in-browser compilation.');
		return;
	}

   var alert  = function(val){print(val);},
   checkPush  = function(list, item){
	   var itIsThere = false;
	   for (var index in list){
		   if(list[index].src === item.src) itIsThere = true;
	   }
	   if(!itIsThere) list.push(item);
	   return !itIsThere;
   },
   hypPath    = function(path){
	   return path.replace(workingDir, '').replace(/\.\.\//g, '').replace(/\//g, '-').replace(/images-/, '').replace(/audio-/, '').replace(/fonts-/, '');
   },
   compressFiles  = function(assets, compression, buildId){
	    var assetIndex = 0,
	    asset          = '',
	    comp           = 0,
	    fileName       = '';

	    for (assetIndex in assets){
		    asset = assets[assetIndex];
		    comp = assets[assetIndex].compression || compression;

		    fileName = hypPath(asset.src);

	    	if(!fileSystem.FileExists(workingDir + 'images/compressed/q' + comp + '-' + fileName)){
             	if(shell.isBash){
             		shell.Run("pngquant/pngquant --ext -q" + comp + ".png " + comp + " " + asset.src, 7, true);
             	} else {
             		shell.Run("pngquant\\pngquant.exe -ext -q" + comp + ".png " + comp + " " + asset.src, 7, true);
             	}
                fileSystem.MoveFile(asset.src.substring(0, asset.src.length - 4) + '-q' + comp + '.png', workingDir + 'images/compressed/q' + comp + '-' + fileName);
    	    	print('.Compressed "' + asset.src + '" to "q' + comp + '-' + fileName + '".');
            }
	    	
	    	if(!asset.sourceFiles){
	    		asset.sourceFiles = {};
	    	}
	    	asset.sourceFiles[buildId] = workingDir + 'images/compressed/q' + comp + '-' + fileName;
	    }
    },
    isQualifiedPNG    = function(path){
	    return ((path.substring(0,4).toLowerCase() !== 'http') && (path.substring(path.length - 4).toLowerCase() === '.png'));
    },
    game       = config,
    workingDir = game.toolsConfig["source-folder"] || '../game/',
    builds     = game.builds,
    buildIndex = 0,
    images     = [],
    source     = game.source,
    section    = null,
    sectionId  = '',
    asset      = null,
    assetId    = 0;
   
    print('Finding PNG images.');
    for(sectionId in source){
    	section = source[sectionId];
	    for (assetId in section){
	    	asset = section[assetId];
		    try {
		    	if(asset && asset.src && (typeof asset.src == 'string') && isQualifiedPNG(asset.src)){
    				checkPush(images, asset);
			    }
		    } catch(e) {
			    alert('Error in processing "' + sectionId + ' ' + assetId + '": ' + e.description);
		    }
	    }
    }
   
    print('Compressing PNG images.');
    for (buildIndex in builds){
	    if (builds[buildIndex].pngCompression){
	    	if(!fileSystem.FolderExists(workingDir + 'images/compressed/')){
		    	fileSystem.CreateFolder(workingDir + 'images/compressed/');
		    }
	    	compressFiles(images, builds[buildIndex].pngCompression, builds[buildIndex].id);
	    }
	}
    
    print('Completed PNG asset compression.');
})();