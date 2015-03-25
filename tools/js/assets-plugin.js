/**
 * ASSETS PLUGIN
 * 
 * This plugin copies assets from the source files into the various build locations.
 * 
 * It looks for the following settings in the game configuration:
 * 
 * config.builds (Array)
 *     This list sets the locations for the assets to be copied to.
 * 
 * config.sources (key/value pairs)
 *     This lists the files to be copied.
 *     
 *     [].sourceFiles (key/value pairs)
 *         If an asset has this property, each key matches a given build's id, the key's value is a path
 *         pointing to an alternative asset that should be loaded for the given build.
 *         
 * config.manifest (key/value pairs)
 *     This section lists alternative files to be loaded to support multiple browsers. Check the manifest
 *     plugin for syntax and other documentation.
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
		    	if(asset.sourceFiles){
		    		if(asset.sourceFiles[buildId]){
		    			source = asset.sourceFiles[buildId];
		    		} else if (asset.sourceFiles['default']){
		    			source = asset.sourceFiles['default'];
		    		}
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
		newAsset = null,
		arr    = null;

		if(manifest[ext]){
			for(i = 0; i < manifest[ext].length; i++){
				newAsset = {};
				for (j in asset){
					newAsset[j] = asset[j];
				}

				newSrc[newSrc.length - 1] = manifest[ext][i];
				newAsset.src = newSrc.join('.');
				if(asset.sourceFiles){
					newAsset.sourceFiles = {};
					for(j in asset.sourceFiles){
						arr = asset.sourceFiles[j].split('.');
						arr[arr.length - 1] = manifest[ext][i];
						asset.sourceFiles[j] = arr.join('.');
					}
				}
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