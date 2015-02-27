/**
 *   If template.html is viewed, this script will load config.js and all of its referenced files to
 *   allow for testing a game without running one of the compiling scripts in tools/. This script is
 *   for testing, not deployment, as a just-in-time compiled game loads slower than a compiled build.
 *   
 *    NOTE: Due to XHR, template.html must be loaded from a web server (localhost is fine). Also,
 *    assets such as images may load fine when directly loading template.html if not referenced in
 *    config.json, but all assets must be listed in config.json to be included in the compiled build. 
 */

//Compile JSON (without file saving) from tools/js/compile-json.js
(function(){
    var alert  = function(val){console.error(val);},
    print      = function(txt){console.log(txt);},
    engineComponent = (function(){
    	// This is a list of all the components in the engine. This list must be updated as new components are added. Also update "tools/js/compile-json.js".
    	var components = ["asset-loader"
    	                  , "audio"
    	                  , "audio-mixer"
    	                  , "audio-mobile"
    	                  , "broadcast-events"
    	                  , "camera"
    	                  , "camera-follow-me"
    	                  , "change-scene"
    	                  , "collision-basic"
    	                  , "collision-box2d"
    	                  , "collision-filter"
    	                  , "collision-group"
    	                  , "collision-tiles"
    	                  , "component-switcher"
    	                  , "counter"
    	                  , "dom-element"
    	                  , "enable-ios-audio"
    	                  , "entity-container"
    	                  , "entity-controller"
    	                  , "entity-linker"
    	                  , "format-message"
    	                  , "fullscreen"
    	                  , "handler-ai"
    	                  , "handler-box2d"
    	                  , "handler-collision"
    	                  , "handler-controller"
    	                  , "handler-logic"
    	                  , "handler-render-createjs"
    	                  , "handler-render-dom"
    	                  , "level-builder"
    	                  , "logic-angular-movement"
    	                  , "logic-attached-entity"
    	                  , "logic-button"
    	                  , "logic-carrier"
    	                  , "logic-delay-message"
    	                  , "logic-destroy-me"
    	                  , "logic-directional-movement"
    	                  , "logic-drag-and-droppable"
    	                  , "logic-fps-counter"
    	                  , "logic-gravity"
    	                  , "logic-impact-launch"
    	                  , "logic-jump"
    	                  , "logic-pacing-platform"
    	                  , "logic-portable"
    	                  , "logic-portal"
    	                  , "logic-pushable"
    	                  , "logic-rebounder"
    	                  , "logic-region-spawner"
    	                  , "logic-rotational-movement"
    	                  , "logic-shield"
    	                  , "logic-spawner"
    	                  , "logic-state-machine"
    	                  , "logic-switch"
    	                  , "logic-teleportee"
    	                  , "logic-teleporter"
    	                  , "logic-timer"
    	                  , "logic-wind-up-racer"
    	                  , "node-map"
    	                  , "node-resident"
    	                  , "random-events"
    	                  , "relay-family"
    	                  , "relay-game"
    	                  , "relay-linker"
    	                  , "relay-parent"
    	                  , "relay-self"
    	                  , "render-debug"
    	                  , "render-destroy-me"
    	                  , "render-animation" //deprecated - points to "render-sprite"
    	                  , "render-image"     //deprecated - points to "render-sprite"
    	                  , "render-sprite"
    	                  , "render-tiles"
    	                  , "tiled-loader"
    	                  , "tween"
    	                  , "voice-over"
    	                  , "xhr"
    	                  , "ai-chaser"
    	                  , "ai-pacer"];
    	return function(id){
    		var i = 0;
    		
    		for (; i < components.length; i++){
    			if(components[i] === id){
        			return true;    			
    			}
    		}
    		return false;
        };
    })(),
    getText    = function(path){
		var xhr = new XMLHttpRequest();
		
		xhr.open('GET', path, false);
		xhr.send();
		if(xhr.status === 200){
			return xhr.responseText;
		} else {
			   alert('Error opening "' + path + '": ' + xhr.description);
		}
    },
    getJSON    = function(path){
	    try{
		    return eval('(' + getText(path) + ')'); //Using "eval" to allow comments in JSON definition files
	    } catch(e) {
		    alert('Error in "' + path + '": ' + e.description);
		    return {};
	    }
    },
    getSubDir  = function (path){
	    var arr = undefined, subDir = '';
	    if(path.indexOf('/') > -1){
		    arr = path.split('/');
		    for (var i = 0; i < arr.length - 1; i++){
			    subDir += arr[i] + '/'; 
		    }
	    }
	    return subDir;
    },
    fixUpPath  = function(path) {
	    var arr = undefined, preArr = [], postArr = [];
	    if(path.indexOf('/') > -1){
		    arr = path.split('/');
		    postArr = arr.slice();
		    postArr.splice(0,1);
		    for (var i = 1; i < arr.length; i++){
			    postArr.splice(0,1);
			    if((arr[i] === '..') && (arr[i - 1] !== '..')){
				    return fixUpPath(preArr.join('/') + '/' + postArr.join('/'));
			    } else {
				    preArr.push(arr[i - 1]);
			    }
		    }
		    return arr.join('/');
	    }
	    return path;
    },
    isJSON     = function(path){
	    var check = path.substring(path.length - 4).toLowerCase();
	    return (check === 'json');
    },
    isJS       = function(path){
 	   var check = path.substring(path.length - 3).toLowerCase();
 	   return (check === '.js');
    },
    checkComponent = function(component){
   	   var j   = 0,
 	   found   = false,
 	   file    = null;
    	
	   if(component){
		   for(j = 0; j < componentList.length; j++){
			   if((component === componentList[j]) || (component === componentList[j].id)){
				   found = true;
				   break;
			   }
		   }
		   if(!found){
			   if(engineComponent(component)){
				   file = {
				       id: component,
				       src: engineLocation + 'components/' + component + '.js'
				   };
				   componentList.push(file);
				   checkDependencies(file);
			   } else {
				   file = {
				       id: component,
				       src: 'components/' + component + '.js'
				   };
				   componentList.push(file);
				   checkDependencies(file);
			   }
		   }
	   }
    },
    checkComponents = function(components){
  	   for(var i = 0; i < components.length; i++){
  		   
		   checkComponent(components[i].type);
		   
		   if(components[i].entities){ // check these entities for components
			   for(var j = 0; j < components[i].entities.length; j++){
				   if(components[i].entities[j].components){
					   checkComponents(components[i].entities[j].components);
				   }
			   }
		   }
	   }
    },
    checkDependencies = function(asset){
 	   var i   = 0,
 	   j       = 0,
 	   text    = '',
 	   matches = null,
 	   found   = false,
 	   subDir  = '',
 	   file    = '',
 	   arr     = null;
 	   
 	   if(typeof asset === 'string'){ //JS File
 		   if(asset.substring(0,4).toLowerCase() !== 'http'){
 	 		   subDir = getSubDir(asset);
 	 		   text = getText(asset);
 	 		   matches = text.match(/[Rr]equires:\s*\[[\w"'.\\\/, \-_:]*\]/g);
 	 		   if(matches && matches.length){
 	 			   try {
 	 				   arr = JSON.parse(matches[0].match(/\[[\w"'.\\\/, \-_:]*\]/g)[0]);
 	 			   } catch(e) {
 	 				   alert("Error in '" + asset + "': Dependency list is malformed.");
 	 				   return;
 	 			   }
 	 	 		   if(isJS(arr[i])){ // Is this a JavaScript path name?
 	 	 			   for(i = 0; i < arr.length; i++){
 	 	 				   found = false;
 	 	 				   if(arr[i].substring(0,4).toLowerCase() === 'http'){
 	 	 					   file = arr[i];
 	 	 				   } else {
 	 	 	 				   file = fixUpPath(subDir + arr[i]);
 	 	 				   }
 	 	 				   for(j = 0; j < dependencyList.length; j++){
 	 	 					   if((file === dependencyList[j]) || (file === dependencyList[j].src)){
 	 	 						   found = true;
 	 	 						   break;
 	 	 					   }
 	 	 				   }
 	 	 				   if(!found){
 	 	 					   dependencyList.push(file);
 	 	 					   checkDependencies(file);
 	 	 				   }
 	 	 			   }
 	 	 		   } else { // assume it's a component id since it's not a JavaScript path name.
 	 	 			   checkComponent(arr[i]);
 	 	 		   }
 	 		   }
 		   }
 	   } else if (asset){ //should be a JSON object
 		   if(asset.components){
 			   checkComponents(asset.components);
 		   } else if(asset.layers){
 			   for (var i = 0; i < asset.layers.length; i++){
 				   if(asset.layers[i].components){
 		 			   checkComponents(asset.layers[i].components);
 				   }
 			   }
 		   }
 	   }
    },
    handleList = function(section, sectionId, workingDir){
	    var subDir     = '',
	    asset      = undefined,
	    assetId    = 0,
	    retainId   = '',
	    srcId      = '';
    	
	    for (; assetId < section.length; assetId++){
	    	asset = section[assetId];
		    try {
		    	if(typeof asset === 'string'){
		    		if(asset.substring(0,4).toLowerCase() !== 'http'){
			    		if(isJSON(asset)){
			    			print('....Filling in data for "' + asset + '"');
			    			retainId = asset;
						    subDir = workingDir + getSubDir(asset);
						    asset  = getJSON(workingDir + asset);
		    				checkDependencies(asset);
						    if(asset.tilesets){
		 				    	for (var ts in asset.tilesets){
								    if(asset.tilesets[ts].image) asset.tilesets[ts].image = fixUpPath(subDir + asset.tilesets[ts].image);
							    }
		 				    }
		 				    asset.id = asset.id || retainId;
			    		} else {
		    			    asset = {src: fixUpPath(workingDir + asset), id: asset};
			    			if(isJS(asset.src)){
			    				checkDependencies(asset.src);
			    			}
			    		}
		    		} else {
		    			asset = {src: asset, id: asset};
		    		}
		    	} else if(asset.src){
			    	if(typeof asset.src === 'string'){
			    		if(asset.src.substring(0,4).toLowerCase() !== 'http'){
				    		if(isJSON(asset.src)){
				    			print('....Filling in data for "' + asset.id + '" from "' + asset.src + '"');
				    			retainId = asset.id;
							    subDir = workingDir + getSubDir(asset.src);
							    asset  = getJSON(workingDir + asset.src);
			    				checkDependencies(asset);
							    if(asset.tilesets){
			 				    	for (var ts in asset.tilesets){
									    if(asset.tilesets[ts].image) asset.tilesets[ts].image = fixUpPath(subDir + asset.tilesets[ts].image);
								    }
			 				    }
			 				    asset.id = asset.id || retainId;
				    		} else {
			    			    asset.src = fixUpPath(workingDir + asset.src);
				    			if(isJS(asset.src)){
				    				checkDependencies(asset.src);
				    			}
				    		}
			    		}
			    	} else {
			    		for(srcId in asset.src){
					    	if((typeof asset.src[srcId]) == 'string'){
					    		if(asset.src[srcId].substring(0,4).toLowerCase() !== 'http'){
				    			    asset.src[srcId] = fixUpPath(workingDir + asset.src[srcId]);
					    		}
					    	} else {
					    		if(asset.src[srcId].src.substring(0,4).toLowerCase() !== 'http'){
				    			    asset.src[srcId].src = fixUpPath(workingDir + asset.src[srcId].src);
					    		}
					    	}
			    		}
			    	}
		    		
			    	// Pull in json-based CreateJS spritesheets
			    	if(asset.data && asset.data.spritesheet && (typeof asset.data.spritesheet === 'string') && isJSON(asset.data.spritesheet)){
		    			print('.....Filling in spritesheet data for "' + asset.id + '"');
					    asset.data.spritesheet = getJSON(workingDir + asset.data.spritesheet);
					    asset.data.spritesheet.images = [asset.id];
		    		}
			    }
			    game.source[sectionId][assetId] = asset;
		    } catch(e) {
			    alert('Error in processing "' + sectionId + ' ' + assetId + '": ' + e.description);
		    }
	    }
    },
    workingDir = '',
    gameConfig = getText(workingDir + 'config.json'),
    game       = eval('(' + gameConfig + ')'), //Using "eval" to allow comments in JSON config file
    source     = game.source,
    dependencyList = source['includes']  = source['includes'] || ['../engine/main.js'],
    componentList = source['components'] = source['components'] || [],
    sectionId  = '',
    engineLocation = '../engine/';
    
    // Update engine location if necessary
    for(var i = 0; i < dependencyList.length; i++){
    	if(dependencyList[i].indexOf('engine/main.js') > -1){
    		engineLocation = dependencyList[i].replace('main.js', '');
    		break;
    	}
    }
    
    print('Composing full config.json from /game/config.json.');
    
    for(sectionId in source){
    	if((sectionId !== 'includes') && (sectionId !== 'components')){
        	print('..Handling "' + sectionId + '" section.');
        	handleList(source[sectionId], sectionId, workingDir);
    	}
    }
	print('..Handling Components.'); // need to process after entities
	handleList(componentList, "components", workingDir);
	print('..Handling Dependencies.'); // needs to process after components
	handleList(dependencyList, "includes", workingDir);
   
    //insert entities and scenes into compiled config file
    window.config = game;
    print('Completed full config.json.');
})();



//Link up to files (without file saving) from tools/js/compile-scripts.js
(function(){
    var alert  = function(val){console.error(val);},
    print      = function(txt){console.log(txt);},
    loadJS = [],
    getText    = function(path){
		var xhr = new XMLHttpRequest();
		
		xhr.open('GET', path, false);
		xhr.send();
		if(xhr.status === 200){
			return xhr.responseText;
		} else {
			alert('Error opening "' + path + '": ' + xhr.description);
		}
    },
    getJSON    = function(path){return eval('(' + getText(path) + ')');}, //Using "eval" to allow comments in JSON definition files
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
	    return path;
    },
    putInFolder= function(path){
	    return path;
    },
    buildGame = function(build, game){
	    var platformer = {}, 
	    result     = {
    	    scripts: '',
    	    styles: '',
    	    extStyles: '',
    	    extScripts: ''
	    },
	    source     = game.source,
	    path       = '',
	    supports   = game['manifest'] || false,
	    section    = undefined,
	    sectionId  = '',
	    asset      = undefined,
	    assetId    = 0,
	    srcId      = '',
	    i          = 0,
	    j          = 0;

	    delete game.builds;
	    delete game['manifest'];

	    if(supports){ // Prepare multiple manifest files
		    game.manifest = supports;
	    }
	    
	    //Fix up paths on Game Assets; Combine JavaScript and CSS Assets
	    for(sectionId in source){
		    print('....Handling "' + sectionId + '" section.');
	    	section = source[sectionId];
	    	if((sectionId === 'components') || (sectionId === 'classes')){
	    		platformer[sectionId] = {};
	    	}
    		game[sectionId] = {};
		    for (assetId in section){
		    	asset = section[assetId];
			    print('.....Adding "' + asset.id + '".');
			    try {
				    if(asset.src){
				    	if((typeof asset.src) == 'string'){
				    		asset.src = handleAsset(asset.id, asset.src, path, result);
				    	} else {
				    		for(srcId in asset.src){
						    	if((typeof asset.src[srcId]) == 'string'){
					    			asset.src[srcId] = handleAsset(asset.id, asset.src[srcId], path, result);
						    	} else {
					    			asset.src[srcId].src = handleAsset(asset.id, asset.src[srcId].src, path, result);
						    	}
				    		}
				    	}
				    }
				    srcId = '';
			    } catch(e) {
				    alert('Error in processing ' + (srcId || 'default') + ' asset: "' + sectionId + ' ' + assetId + '": ' + e.description);
			    }
		    	if(sectionId === 'assets'){
		    		if((typeof asset.data) === 'string'){
		    			asset.data = getJSON(workingDir + asset.data);
		    		}
		    	}
	    		game[sectionId][asset.id] = asset;
		    }
	    }
	    delete game.source;
	    
	    game.debug = true;

	    window.platformer = platformer;
	    window.platformer.settings = game;
	    
	    var loadJSs = function(){
	    	if(loadJS.length){
				var domElement = document.createElement('script');
				domElement.onload = loadJSs;
				domElement.setAttribute('type', 'text/javascript');
				domElement.setAttribute('src', loadJS.splice(0,1)[0]);
				document.getElementsByTagName('body')[0].appendChild(domElement);
	    	}
	    };
	    loadJSs();
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
    handleAsset = function(id, src, absolutePath, result){
	   
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
    },
    game       = window.config;
    workingDir = '',
    buildDir   = '',
    builds     = game.builds,
    buildIndex = 0;
   
    //Create builds
    print('Preparing to compile scripts.');
    //for (buildIndex in builds){
    	print('..Compiling scripts for build "' + builds[buildIndex].id + '".');
    	buildGame(builds[buildIndex], game);
	//}
    print('Completed script compilation. Hurrah!');
    
    console.warn('!!! This is a test build. Use the compile scripts in the /tools folder to make sure assets are correctly referenced for inclusion and to create builds for deploying.');
    console.log(' ------- End Compilation Log / Begin Game Logs ------- ');
})();
