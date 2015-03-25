/**
 * SCRIPTS PLUGIN
 * 
 * This is the heart of the compiler: This plugin grabs all the JavaScript and JSON files and puts them into
 * a single file for a faster download. It also does the same with disparate CSS files. If loaded in a
 * browser, this plugin will load all the scripts as individual script tags, rather than compile them.
 * 
 * It looks for the following settings in the game configuration:
 * 
 * config.builds - key/value pairs
 *     This plugin iterates through all listed builds to create custom instances of all compiled scripts.
 *     
 *     .namespace (string)
 *         This sets the namespace for all compiled scripts.
 * 
 * config.source - key/value pairs
 *     This section lists all the sources for the game. This plugin cycles through this list and compiles
 *     all script files into a single file per build and updates other asset path names to their new build
 *     locations.
 *     
 */

(function(){
	var workingDir = '',
	buildDir       = '',
    hypPath        = null,
	putInFolder    = null,
	handleAsset    = null;
	
	if(isJIT){
	    hypPath = putInFolder = function(path){return path;};
	    handleAsset = function(asset){
	 	    var src = asset.src;
	    	
			if(isImage(src) || isAudio(src) || isFont(src)){
				return src;
			} else if(isCSS(src)) {
				domElement = document.createElement('link');
				domElement.setAttribute('rel', 'stylesheet');
				domElement.setAttribute('type', 'text/css');
				domElement.setAttribute('href', src);
				document.getElementsByTagName('head')[0].appendChild(domElement);
		 	    return src;
			} else if(isJS(src)) {
				loadJS.push(src);
		 	    return src;
			}
	    };
	} else {
		workingDir = config.toolsConfig["source-folder"] || '../game/',
		buildDir   = config.toolsConfig["destination-folder"] || '../builds/',
	    hypPath    = function(path){
		    return path.replace(workingDir, '').replace(/\.\.\//g, '').replace(/\//g, '-').replace(/images-/, '').replace(/audio-/, '').replace(/fonts-/, '');
	    };
	    putInFolder = function(path){
		    if(isImage(path)){
			    return 'i/' + path;
		    } else if(isAudio(path)){
			    return 'a/' + path;
		    } else if(isFont(path)){
			    return 'f/' + path;
		    }
		    return path;
	    };
	    handleAsset = function(asset, absolutePath, result, removeSubFolder){
		    var id = asset.id,
		    src    = asset.src,
		    path   = '';
			   
			if(src.substring(0,4).toLowerCase() !== 'http'){
				if(isImage(src) || isAudio(src) || isFont(src)){
					if(asset.sourceFiles){
						delete asset.sourceFiles; //so this doesn't get compiled into the game
					}
					
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
	   };
	}
	
    var setText = function(path, text, list){
	    list.push({
	    	name: path,
	    	content: text
	    });
	    return text;
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
	    game       = JSON.parse(JSON.stringify(config)), // Make a copy of the game
	    source     = game.source,
	    paths      = build.paths || {},
	    path       = '',
	    buildPath  = '',
	    indexPath  = '',
	    section    = undefined,
	    sectionId  = '',
	    asset      = undefined,
	    assetId    = 0,
	    i          = 0,
	    j          = 0,
	    divider    = '',
	    remSF      = ((build.index === false)?build.id + '/':false),
	    version    = 'v' + config.version.replace(/\./g, '-');
	    
	    delete game.builds;
	    delete game.toolsConfig;
	    delete game.source;
	    delete game.languages;

	    //Fix up paths on Game Assets; Combine JavaScript and CSS Assets
	    for(sectionId in source){
		    print('...Handling "' + sectionId + '" section.');
	    	section = source[sectionId];
	    	if((sectionId === 'components') || (sectionId === 'classes')){
	    		if(isJIT){
		    		platformer[sectionId] = {};
	    		} else {
		    		result.scripts += 'platformer.' + sectionId + ' = {};\n';
	    		}
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
			    } catch(e) {
				    alert('Error in processing asset: "' + sectionId + ' ' + assetId + '": ' + e.description);
			    }

	    		game[sectionId][asset.id] = asset;
		    }
	    }
	    
	    game.debug = build.debug || false;
	    
	    if(isJIT){
	    	platformer.settings = game;
	    	return ;
	    }

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
	    setText(buildPath + 'j/' + version + '.js', result.scripts, build.files);

	    // store CSS file
	    setText(buildPath + 's/' + version + '.css', result.styles, build.files);

	    path = paths["default"] || '';
	    
		if(build.index === false){
    		path += build.id + '/';
    	}
		
	    // setup index from template
		build.htmlTemplate = build.htmlTemplate.replace(/default\.js/,   path + 'j/' + version + '.js');
		build.htmlTemplate = build.htmlTemplate.replace('</head>', ' <link rel="stylesheet" href="' + path + 's/' + version + '.css" type="text/css" />' + '\n' + ' </head>');
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
   builds     = config.builds,
   buildIndex = 0;

    //Create builds
    print('Preparing to compile scripts.');
    for (buildIndex in builds){
    	print('..Compiling scripts for build "' + builds[buildIndex].id + '".');
    	buildGame(builds[buildIndex], config);
	}
    print('Completed script compilation. Hurrah!');
    
    if(isJIT){
        console.warn('!!! This is a test build. Use the compile scripts in the /tools folder to make sure assets are correctly referenced for inclusion and to create builds for deploying.');
        console.log('\n ------- End Compilation Log / Begin Game Logs ------- \n');
    }
})();