/*
 * Compile JavaScript files into a single file and move server-side files to builds folder
 */

(function(){
   var manifests  = null,
   alert  = function(val){print(val);},
   getText    = function(path){
	    var file = undefined,
	    text     = '';
	    try {
		    file = fileSystem.OpenTextFile(path);
		    try {
			    text = file.ReadAll();
		    } catch(e){
			    alert('Error reading from "' + path + '": ' + e.description);
		    }
		    file.Close();
	    } catch (e) {
		    alert('Error opening "' + path + '": ' + e.description);
	    }
	    return text;
    },
    setText    = function(path, text){
	    var file = fileSystem.CreateTextFile(path, true);
	    file.Write(text);
	    file.Close();
	    return text;
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
    addAllTypes = function(id, src, path, result, remSF){
		var i    = 0,
		newSrc   = src.split('.'),
		ext      = newSrc[newSrc.length - 1],
		initial  = false,
		newAsset = false;

		if(manifests[ext]){
			for(i = 0; i < manifests[ext].length; i++){
				newSrc[newSrc.length - 1] = manifests[ext][i];
				newAsset = handleAsset(id, newSrc.join('.'), path, result, remSF);
				if(ext === manifests[ext][i]){
					initial = newAsset;
				}
			}
			return initial || newAsset;
		} else {
			return handleAsset(id, src, path, result, remSF);
		}
	},
    buildGame = function(build, game){
	    var namespace = build.namespace || 'platypus',
	    nsArray    = namespace.split('.'),
	    nsName     = '',
	    scripts    = '',
	    result     = {
    	    scripts: '',
    	    styles: '',
    	    extStyles: '',
    	    extScripts: ''
	    },
	    source     = game.source,
	    paths      = build.paths || {},
	    path       = '',
	    buildPath  = '',
	    indexPath  = '',
	    section    = undefined,
	    sectionId  = '',
	    asset      = undefined,
	    assetId    = 0,
	    srcId      = '',
	    i          = 0,
	    j          = 0,
	    divider    = '',
	    remSF      = ((build.index === false)?build.id + '/':false),
	    version    = game.version;

	    delete game.builds;
	    delete game.toolsConfig;

	    //Fix up paths on Game Assets; Combine JavaScript and CSS Assets
	    for(sectionId in source){
		    print('....Handling "' + sectionId + '" section.');
	    	section = source[sectionId];
	    	if((sectionId === 'components') || (sectionId === 'classes')){
	    		result.scripts += 'platformer.' + sectionId + ' = {};\n';
	    	}
    		game[sectionId] = {};
	    	if(sectionId === 'assets') {
//	    		game[sectionId] = [];
	    		path = paths["assets"] || paths["default"] || '';
	    	} else {
//	    		game[sectionId] = {};
	    		path = paths["default"] || '';
	    	}
	    	if(build.index === false){
	    		path += build.id + '/';
	    	}
		    for (assetId in section){
		    	asset = section[assetId];
			    print('.....Adding "' + asset.id + '".');
			    try {
				    if(asset.src){
				    	if((typeof asset.src) == 'string'){
			    			if(manifests){
			    				asset.src = addAllTypes(asset.id, asset.src, path, result, remSF);
			    			} else {
					    		asset.src = handleAsset(asset.id, asset.src, path, result, remSF);
			    			}
				    	}
				    }
				    srcId = '';
			    } catch(e) {
				    alert('Error in processing ' + (srcId || 'default') + ' asset: "' + sectionId + ' ' + assetId + '": ' + e.description);
			    }

	    		game[sectionId][asset.id] = asset;
		    }
	    }
	    delete game.source;
	    
	    game.debug = build.debug || false;

	    for(i = 0; i < nsArray.length - 1; i++){
	    	nsName = '';
	    	divider = '';
	    	for(j = 0; j <= i; j++){
	    		nsName += divider + nsArray[j];
	    		divider = '.';
	    	}
	    	scripts += '  ' + nsName + ' = this.' + nsName + ' || {};\n';
	    }
	    scripts += '  ' + namespace + ' = platformer;\n\n';
	    result.scripts = '(function(){\n  var platformer = {};\n\n' + scripts + 'platformer.settings = ' + JSON.stringify(game) + ';\n' + result.scripts + '})();';
	 
	    if (!fileSystem.FolderExists(buildDir)) fileSystem.CreateFolder(buildDir);
	    buildPath = indexPath = buildDir + build.id + '/';
	    if (!fileSystem.FolderExists(buildPath)) fileSystem.CreateFolder(buildPath);

	    if(build.index === false){
	        buildPath += build.id + '/';
		    if (!fileSystem.FolderExists(buildPath)) fileSystem.CreateFolder(buildPath);
	    }

	    if (!fileSystem.FolderExists(buildPath + 'j/')) fileSystem.CreateFolder(buildPath + 'j/');
	    if (!fileSystem.FolderExists(buildPath + 's/')) fileSystem.CreateFolder(buildPath + 's/');

	    // handle server files
//	    try{
	//        fileSystem.DeleteFile(buildPath + '*.*');
	  //  } catch(e) {}
	    if (fileSystem.FolderExists(workingDir + 'server/')){ // if there are files that should be copied to root as-is in a /server/ folder, do so.
			fileSystem.CopyFile(workingDir + 'server/*.*', indexPath, true);
	    }

		// create JS file
	    setText('combined.js', result.scripts);   
	    if(build.jsCompression){
	    	shell.Run("java -jar yui/yui.jar combined.js -o combined.js",   7, true);
	    }
	    try {fileSystem.DeleteFile(buildPath + 'j/game-' + '*.js');} catch(e) {}
	    fileSystem.MoveFile("combined.js", buildPath + 'j/game-' + version + '.js');

	    // create CSS file
	    setText('combined.css', result.styles);   
	    if(build.cssCompression){
	    	shell.Run("java -jar yui/yui.jar combined.css -o combined.css", 7, true);
	    }
	    try {fileSystem.DeleteFile(buildPath + 's/game-' + '*.css');} catch(e) {}
	    fileSystem.MoveFile("combined.css", buildPath + 's/game-' + version + '.css');

	    path = paths["default"] || '';
	    
		if(build.index === false){
    		path += build.id + '/';
    	}
		
	    // setup index from template
		build.htmlTemplate = build.htmlTemplate.replace(/default\.js/,   path + 'j/game-' + version + '.js');
		build.htmlTemplate = build.htmlTemplate.replace('</head>', ' <link rel="stylesheet" href="' + path + 's/game-' + version + '.css" type="text/css" />' + '\n' + ' </head>');
		build.htmlTemplate = build.htmlTemplate.replace('</head>', result.extStyles + '</head>');
		build.htmlTemplate = build.htmlTemplate.replace('<!-- scripts -->', '<!-- scripts -->\n' + result.extScripts);
	    setText('index.html', build.htmlTemplate);
	    
	    if(build.index === false){
	    	try {fileSystem.DeleteFile(indexPath + build.id + '.html');} catch(e) {}
		    fileSystem.MoveFile("index.html", indexPath + build.id + '.html');
	    } else {
	    	try {fileSystem.DeleteFile(buildDir + build.id + '/index.html');} catch(e) {}
		    fileSystem.MoveFile("index.html", buildDir + build.id + '/index.html');
	    }
	    
	    if(paths["allow-origin"]){
	    	build.htaccessTemplate += '\n\nHeader set Access-Control-Allow-Origin "' + paths["allow-origin"] + '"';
	    }
	    
	    setText('.htaccess', build.htaccessTemplate);
	    try {fileSystem.DeleteFile(buildPath + '.htaccess');} catch(e) {}
	    fileSystem.MoveFile('.htaccess', buildPath + '.htaccess');
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
   assetConversions = {}, //This is used to identify assets in CSS files and rename them in the compiled CSS. NOTE: Assets must be loaded prior to CSS compilation for this to work.
   renameStyleAssets = function(cssText){
	   for (var src in assetConversions){
		   cssText = cssText.replace(new RegExp(src.substring(workingDir.length).replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),"g"), assetConversions[src]);
	   }
	   return cssText;
   },
   handleAsset = function(id, src, absolutePath, result, removeSubFolder){
	    var path = '';
		   
		if(src.substring(0,4).toLowerCase() !== 'http'){
			if(isImage(src) || isAudio(src) || isFont(src)){
				path = absolutePath + putInFolder(hypPath(src));
				if(removeSubFolder){
					assetConversions[src] = path.replace(removeSubFolder, '');
					return path;
				} else {
					assetConversions[src] = path;
					return path;
				}
			} else if(isCSS(src)) {
				result.styles  += '\n\/*--------------------------------------------------\n *   ' + id + ' - ' + src + '\n *\/\n';
				result.styles  += renameStyleAssets(getText(src)) + '\n';
		 	    return src;
			} else if(isJS(src)) {
				result.scripts += '\n\/*--------------------------------------------------\n *   ' + id + ' - ' + src + '\n *\/\n';
				result.scripts += getText(src) + '\n';
		 	    return src;
			}
		} else {
			if(isImage(src) || isAudio(src) || isFont(src)){
				return src;
			} else if(isCSS(src)) {
				result.extStyles += '  <link rel="stylesheet" href="' + src + '" type="text\/css" \/>\n';
		 	    return src;
			} else if(isJS(src)) {
				result.extScripts += '  <script type="text\/javascript" src="' + src + '"><\/script>\n';
		 	    return src;
			}
		}
   },
   game       = config;
   workingDir = game.toolsConfig["source-folder"] || '../game/',
   buildDir   = game.toolsConfig["destination-folder"] || '../builds/',
   builds     = game.builds,
   buildIndex = 0;

    //Create builds
    print('Preparing to compile scripts.');
    for (buildIndex in builds){
    	print('..Compiling scripts for build "' + builds[buildIndex].id + '".');
    	buildGame(builds[buildIndex], game);
	}
    print('Completed script compilation. Hurrah!');
})();