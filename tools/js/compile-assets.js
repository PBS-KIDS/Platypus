/*
 * Compress and move assets to builds folder
 */

(function(){
   var alert  = function(val){print(val);},
   checkPush  = function(list, item){
	   var itIsThere = false;
	   for (var index in list){
		   if(list[index] === item) itIsThere = true;
	   }
	   if(!itIsThere) list.push(item);
	   return !itIsThere;
   },
   checkPushSrc = function(list, item){
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
   copyFiles  = function(assets, destination, buildId){
	    var assetIndex = 0,
	    asset          = null,
	    source         = '',
	    fileName       = '';
	    
	    if (!fileSystem.FolderExists(destination)) fileSystem.CreateFolder(destination);
	    fileSystem.DeleteFile(destination + '*.*');
	    for (assetIndex in assets){
		    asset = assets[assetIndex];
		    if(asset.src !== ''){
		    	fileName = hypPath(asset.src);
		    	source = asset.src;
		    	
		    	// sourceFiles is an alternate location for a named file, useful for build-specific files.
		    	if(asset.sourceFiles && asset.sourceFiles[buildId]){
		    		source = asset.sourceFiles[buildId];
		    	}

		    	print('....Copying "' + source + '" to "' + destination + fileName + '".');
				fileSystem.CopyFile(source, destination + fileName);
		    }
	    }
    },
   isImage    = function(path){
	   var check = path.substring(path.length - 4).toLowerCase();
	   return (check === '.jpg') || (check === 'jpeg') || (check === '.png') || (check === '.gif') || (check === '.ico');
   },
   isAudio    = function(path){
	   var check = path.substring(path.length - 4).toLowerCase();
	   return (check === '.ogg') || (check === '.mp3') || (check === '.m4a') || (check === '.wav') || (check === '.mp4');
   },
   isFont    = function(path){
	   var check = path.substring(path.length - 4).toLowerCase();
	   return (check === '.ttf') || (check === '.otf') || (check === 'woff');
   },
	addAllTypes = function(assets, asset){
		var i  = 0,
		j      = '',
		newSrc = asset.src.split('.'),
		ext    = newSrc[newSrc.length - 1],
		newAsset = null;

		if(manifest[ext]){
			for(i = 0; i < manifest[ext].length; i++){
				newAsset = {};
				for (j in asset){
					newAsset[j] = asset[j];
				}

				newSrc[newSrc.length - 1] = manifest[ext][i];
				newAsset.src = newSrc.join('.');
				checkPushSrc(assets, newAsset);
			}
		} else {
			checkPushSrc(assets, asset);
		}
	},
   game       = config,
   workingDir = game.toolsConfig["source-folder"] || '../game/',
   buildDir   = game.toolsConfig["destination-folder"] || '../builds/',
   builds     = game.builds,
   buildIndex = 0,
   buildPath  = '',
   assets     = [],
   images     = [],
   audio      = [],
   fonts      = [],
   source     = game.source,
   section    = undefined,
   sectionId  = '',
   asset      = undefined,
   assetId    = 0,
   aspects    = game.manifest,
   manifest   = null;
   
	if(aspects){
		manifest = {};
		for (var i in aspects){
			var listAspects = [];
			for (j in aspects[i]){
				checkPush(listAspects, aspects[i][j]);
				manifest[aspects[i][j]] = listAspects;
			}
		}
	}

	print('Compiling list of assets.');
    for(sectionId in source){
    	section = source[sectionId];
	    for (assetId in section){
	    	asset = section[assetId];
		    try {
			    if(asset.src){
			    	if((typeof asset.src) == 'string'){
			    		if(asset.src.substring(0,4).toLowerCase() !== 'http'){
			    			if(manifest){
				    			addAllTypes(assets, asset);
			    			} else {
			    				checkPushSrc(assets, asset);
			    			}
			    		}
			    	}
			    }
		    } catch(e) {
			    alert('Error in processing "' + sectionId + ' ' + assetId + '": ' + e.description);
		    }
	    }
    }
   
    print('Separating asset types.');
    for (var asset in assets){
	    if(isImage(assets[asset].src)){
	 	    images.push(assets[asset]);
	    } else if(isAudio(assets[asset].src)){
		    audio.push(assets[asset]);
	    } else if(isFont(assets[asset].src)){
		    fonts.push(assets[asset]);
	    }
    }
   
    print('Copying assets to build folders.');
    if (!fileSystem.FolderExists(buildDir)) fileSystem.CreateFolder(buildDir);
    for (buildIndex in builds){
        print('..Copying assets to build "' + builds[buildIndex].id + '".');
        
        buildPath = buildDir + builds[buildIndex].id + '/';
	    if (!fileSystem.FolderExists(buildPath)) fileSystem.CreateFolder(buildPath);
	    
	    if(builds[buildIndex].index === false){
	        buildPath += builds[buildIndex].id + '/';
		    if (!fileSystem.FolderExists(buildPath)) fileSystem.CreateFolder(buildPath);
	    }
	    
    	copyFiles(images, buildPath + 'i/', builds[buildIndex].id);
    	copyFiles(audio,  buildPath + 'a/', builds[buildIndex].id);
    	copyFiles(fonts,  buildPath + 'f/', builds[buildIndex].id);
	}
    
    print('Completed asset compilation.');
})();