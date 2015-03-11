/**
  * Compresses images according to config properties
  */

(function(){
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
		    	print('....Compressing "' + asset.src + '".');
             	if(shell.isBash){
             		shell.Run("pngquant/pngquant --ext -q" + comp + ".png " + comp + " " + asset.src, 7, true);
             	} else {
             		shell.Run("pngquant\\pngquant.exe -ext -q" + comp + ".png " + comp + " " + asset.src, 7, true);
             	}
                fileSystem.MoveFile(asset.src.substring(0, asset.src.length - 4) + '-q' + comp + '.png', workingDir + 'images/compressed/q' + comp + '-' + fileName);
    	    	print('....Compressed to "q' + comp + '-' + fileName + '".');
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