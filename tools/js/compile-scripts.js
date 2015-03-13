/*
 * Compile JavaScript files into a single file and move server-side files to builds folder
 */

(function(){
   var alert  = function(val){print(val);},
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
    setText    = function(path, text, list){
	    list.push({
	    	name: path,
	    	content: text
	    });
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
    buildGame = function(build, config){
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
	    game       = JSON.parse(JSON.stringify(config)),
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
	    version    = config.version; // Make a copy of the game
	    
	    delete game.builds;
	    delete game.toolsConfig;
	    delete game.source;

	    //Fix up paths on Game Assets; Combine JavaScript and CSS Assets
	    for(sectionId in source){
		    print('...Handling "' + sectionId + '" section.');
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
			    print('....Adding "' + asset.id + '".');
			    try {
				    if(asset.src){
				    	if((typeof asset.src) == 'string'){
				    		asset.src = handleAsset(asset, path, result, remSF);
				    	}
				    }
				    srcId = '';
			    } catch(e) {
				    alert('Error in processing ' + (srcId || 'default') + ' asset: "' + sectionId + ' ' + assetId + '": ' + e.description);
			    }

	    		game[sectionId][asset.id] = asset;
		    }
	    }
	    
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
	 
	    buildPath = indexPath = buildDir + build.id + '/';
	    if(build.index === false){
	        buildPath += build.id + '/';
	    }

	    if(!build.files){
	    	build.files = [];
	    }
	    
		// store JS file
	    setText(buildPath + 'j/game-' + version + '.js', result.scripts, build.files);

	    // store CSS file
	    setText(buildPath + 's/game-' + version + '.css', result.styles, build.files);

	    path = paths["default"] || '';
	    
		if(build.index === false){
    		path += build.id + '/';
    	}
		
	    // setup index from template
		build.htmlTemplate = build.htmlTemplate.replace(/default\.js/,   path + 'j/game-' + version + '.js');
		build.htmlTemplate = build.htmlTemplate.replace('</head>', ' <link rel="stylesheet" href="' + path + 's/game-' + version + '.css" type="text/css" />' + '\n' + ' </head>');
		build.htmlTemplate = build.htmlTemplate.replace('</head>', result.extStyles + '</head>');
		build.htmlTemplate = build.htmlTemplate.replace('<!-- scripts -->', '<!-- scripts -->\n' + result.extScripts);
	    
	    if(build.index === false){
		    setText(indexPath + build.id + '.html', build.htmlTemplate, build.files);
	    } else {
		    setText(buildDir + build.id + '/index.html', build.htmlTemplate, build.files);
	    }
	    
	    if(paths["allow-origin"]){
	    	build.htaccessTemplate += '\n\nHeader set Access-Control-Allow-Origin "' + paths["allow-origin"] + '"';
	    }
	    
	    setText(buildPath + '.htaccess', build.htaccessTemplate, build.files);
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
   handleAsset = function(asset, absolutePath, result, removeSubFolder){
	    var id = asset.id,
	    src    = asset.src,
	    path   = '';
		   
		if(src.substring(0,4).toLowerCase() !== 'http'){
			if(isImage(src) || isAudio(src) || isFont(src)){
				if(!asset.sourceFiles){
					asset.sourceFiles = {};
				}
				asset.sourceFiles['default'] = asset.src;
				
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
   workingDir = config.toolsConfig["source-folder"] || '../game/',
   buildDir   = config.toolsConfig["destination-folder"] || '../builds/',
   builds     = config.builds,
   buildIndex = 0;

    //Create builds
    print('Preparing to compile scripts.');
    for (buildIndex in builds){
    	print('..Compiling scripts for build "' + builds[buildIndex].id + '".');
    	buildGame(builds[buildIndex], config);
	}
    print('Completed script compilation. Hurrah!');
})();