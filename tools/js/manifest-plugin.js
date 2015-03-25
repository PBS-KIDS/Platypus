/**
 * MANIFEST PLUGIN
 * 
 * This plugin tallies all the assets and creates an application cache for your game. It also handles editing
 * an Apache .htaccess file with mod_rewrite rules so that it can cache the correct audio assets for different
 * browsers.
 * 
 * It looks for the following settings in the game configuration:
 * 
 * config.builds[]
 *     .manifest (boolean) - Default is `false`.
 *         Sets whether a given build should have an application cache manifest.
 *     .manifestTemplate (string)
 *         Sets a template for the manifest. If not supplied, this plugin creates one.
 *     .htaccessTemplate (string)
 *         Sets a template for the .htaccess file. If not supplied, this plugin creates one.
 *     .htmlTemplate (string)
 *         Sets a template for the index.html. Defaults to `game/template.html`.
 *         
 * config.manifest
 *     This key/value list determines which file types should be stored for a given client, using the client's
 *     user-agent. It looks something like this:
 *     
 *     "manifest": {
 *			"audio": { // Keys are user agent checks that should load the provided resource type
 *			    "firefox": "ogg",
 *			    "opera":   "ogg",
 *			    "chrome":  "ogg",
 *			    "android": "m4a",
 *			    "silk":    "m4a",
 *			    "ipod":    "m4a",
 *			    "ipad":    "m4a",
 *			    "iphone":  "m4a",  // Order determines first valid version, so Safari on iPad will use "m4a" rather than "mp3" below
 *			    "msie":    "mp3",
 *			    "safari":  "mp3",
 *			    "trident": "mp3"
 *			}
 *		}
 *     
 */

(function(){
	if(isJIT){
		print('This plugin does not support in-browser compilation.');
		return;
	}

    var manifests  = null,
    alert  = function(val){print(val);},
    setText    = function(path, text, list){
	    list.push({
	    	name: path,
	    	content: text
	    });
	    return text;
    },
    checkPush  = function(list, item){
	    var itIsThere = false;
	    if(list){
		    for (var index in list){
			    if(list[index] === item) itIsThere = true;
		    }
		    if(!itIsThere) list.push(item);
	    }
	    return item;
    },
    hypPath    = function(path){
	    return path.replace(workingDir, '').replace(/\.\.\//g, '').replace(/\//g, '-').replace(/images-/, '').replace(/audio-/, '').replace(/fonts-/, '');
    },
    putInFolder= function(path){
	    if(isImage(path)){
		    return 'i/' + path;
	    } else if(isAudio(path)){
		    return 'a/' + path;
	    } else if(isFont(path)){
		    return 'f/' + path;
	    }
	    return path;
    },
    addAllTypes = function(src, aspects, path, remSF){
		var i    = 0,
		newSrc   = src.split('.'),
		ext      = newSrc[newSrc.length - 1];

		if(manifests[ext]){
			for(i = 0; i < manifests[ext].length; i++){
				newSrc[newSrc.length - 1] = manifests[ext][i];
				handleAsset(newSrc.join('.'), aspects[manifests[ext][i]], path, remSF);
			}
			return;
		} else {
			return handleAsset(src, aspects['default'], path, remSF);
		}
	},
    createManifest = function(build, game){
	    var source = game.source,
	    paths      = build.paths || {},
	    path       = '',
	    buildPath  = '',
	    maniPath   = 'cache.manifest',
	    section    = source['assets'],
	    asset      = undefined,
	    assetId    = 0,
	    i          = 0,
	    j          = 0,
	    remSF      = ((build.index === false)?build.id + '/':false),
	    tempMan    = '',
	    version    = 'v' + game.version.replace(/\./g, '-');

		path = paths["assets"] || paths["default"] || '';
   		if(build.index === false){
    		path += build.id + '/';
    	}
   		
	    for (assetId in section){
	    	asset = section[assetId];
		    try {
			    if(asset.src && (typeof asset.src == 'string') && (asset.cache !== false)){
				    print('...Adding "' + asset.id + '" to manifest.');
	    			if(manifests){
	    				addAllTypes(asset.src, aspects, path, remSF);
	    			} else {
			    		handleAsset(asset.src, aspects["default"], path, remSF);
	    			}
			    }
		    } catch(e) {
			    alert('Error in processing asset: "' + assetId + '": ' + e.description);
		    }
	    }

	    build.manifestTemplate = build.manifestTemplate.replace('CACHE:', 'CACHE:\n' + aspects["default"].join('\n'));
	    build.manifestTemplate = build.manifestTemplate.replace('CACHE MANIFEST', 'CACHE MANIFEST\n# Version ' + game.version);
	    
	    if (!fileSystem.FolderExists(buildDir)) fileSystem.CreateFolder(buildDir);
	    buildPath = buildDir + build.id + '/';
	    if (!fileSystem.FolderExists(buildPath)) fileSystem.CreateFolder(buildPath);

	    if(build.index === false){
	        buildPath += build.id + '/';
		    if (!fileSystem.FolderExists(buildPath)) fileSystem.CreateFolder(buildPath);
	    }

	    // setup manifest from template
		path = paths["default"] || '';
		if(build.index === false){
    		path += build.id + '/';
    	}

		print('...Handling multiple app cache manifests.');

	    if(build.index === false){
	    	maniPath = build.id + '/cache.manifest';
	    }
	    build.htaccessTemplate += 'AddType text\/cache-manifest .manifest\n';
	    build.htmlTemplate = build.htmlTemplate.replace('<html>', '<html manifest="' + maniPath + '">');
	    build.manifestTemplate = build.manifestTemplate.replace('CACHE:', 'CACHE:\n' + path + 'j\/' + version + '.js\n' + path + 's\/' + version + '.css\n');

	    build.files = build.files || [];
	    if(game.manifest){ // Prepare multiple manifest files
	    	var rewriteConds = [],
	    	languages = build.languages || null,
	    	str = '';
	    	
	    	if(!languages && game.languages && game.languages.reference){
	    		languages = game.languages.reference[0].slice(1);
	    	}
	    	
	    	if(build.htaccessTemplate.indexOf('RewriteEngine on') < 0){
		    	build.htaccessTemplate += '\nRewriteEngine on\n';
	    	}
	    	
	    	for (i in aspects){
	    		if(i !== 'default'){
	    			str = '';
	    			
	    			tempMan = build.manifestTemplate.replace('CACHE:', 'CACHE:\n' + aspects[i].join('\n'));
		    		str += '\nRewriteCond %{HTTP_USER_AGENT} "';
			    	rewriteConds.length = 0;
				    for(supId in game.manifest){
				    	for(uaId in game.manifest[supId]){
			    			if(game.manifest[supId][uaId] === i){
			    				rewriteConds.push(uaId);
				    		}
				    	}
				    }
				    str += rewriteConds.join('|');
				    str += '" [NC]\n';
				    
				    if(languages && (!build.languageBuilds)){
				    	// handle language redirection if needed
				    	for(j in languages){
				    		build.htaccessTemplate += str + 'RewriteCond %{HTTP:Accept-Language} (' + languages[j] + ') [NC]\n';
						    build.htaccessTemplate += 'RewriteRule ^cache\\.manifest$ ' + languages[j] + '-' + version + '-' + i + '.manifest [L]\n';
				    	}
				    } else {
					    build.htaccessTemplate += str + 'RewriteRule ^cache\\.manifest$ ' + version + '-' + i + '.manifest [L]\n';
				    }
				    print('....Creating "' + version + '-' + i + '.manifest".');
				    setText(buildPath + version + '-' + i + '.manifest', tempMan, build.files);
	    		}
	    	}
	    } else {
		    setText(buildPath + 'cache.manifest', build.manifestTemplate, build.files);
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
   isCSS     = function(path){
	   var check = path.substring(path.length - 4).toLowerCase();
	   return (check === '.css');
   },
   isJS      = function(path){
	   var check = path.substring(path.length - 3).toLowerCase();
	   return (check === '.js');
   },
   handleAsset = function(src, assets, absolutePath, removeSubFolder){
	    var path = '';
	   
		if((src.substring(0,4).toLowerCase() !== 'http') && (isImage(src) || isAudio(src) || isFont(src))){
			path = absolutePath + putInFolder(hypPath(src));
			if(removeSubFolder){
				return checkPush(assets, path.replace(removeSubFolder, ''));
			} else {
				return checkPush(assets, path);
			}
		} else if(isImage(src) || isAudio(src) || isFont(src) || isCSS(src) || isJS(src)){
			return checkPush(assets, src);
		}
   },
   game       = config;
   workingDir = game.toolsConfig["source-folder"] || '../game/',
   buildDir   = game.toolsConfig["destination-folder"] || '../builds/',
   builds     = game.builds,
   buildIndex = 0,
   aspects    = {"default": []},
   supports   = game.manifest || false,
   supId      = '',
   uaId       = '',
   i          = 0,
   j          = 0;

    //Create builds
    print('Preparing to create manifests.');
    
    if(supports){ // Prepare multiple manifest files
	    print('.Creating arrays to store cache.manifest file versions.');
	    for(supId in supports){
	    	for(uaId in supports[supId]){
    			if(!aspects[supports[supId][uaId]]){
	    			aspects[supports[supId][uaId]] = ['\n# ' + supId.toUpperCase() + ' - ' + supports[supId][uaId] + ':\n'];
	    		}
	    	}
	    }

	    manifests = {};
 		for (i in game.manifest){
 			var listAspects = [];
 			for (j in game.manifest[i]){
 				checkPush(listAspects, game.manifest[i][j]);
 				manifests[game.manifest[i][j]] = listAspects;
 			}
 		}
    }
    
    for (buildIndex in builds){
    	if(builds[buildIndex].manifest){
        	print('..Compiling manifest for build "' + builds[buildIndex].id + '".');
        	createManifest(builds[buildIndex], game);
    	} else {
        	print('..Manifest not requested for build "' + builds[buildIndex].id + '".');
    	}
	}
    print('Completed script compilation. Hurrah!');
})();