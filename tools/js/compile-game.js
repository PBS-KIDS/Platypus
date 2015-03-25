/**
 * Compile Game
 * 
 * This script creates a game configuration object (`config` in the code below) from `game/config.json`
 * and fills in data from all files referenced in config.json.
 * 
 * The following plugins are used by default. To change this list, include a "plugins" key in the
 * global game settings that is an array of plugin file paths. This list order is important, since some
 * plugins must run prior to other plugins to set up data for following plugins. For example, the
 * language plugin can create multiple builds, so it must occur before the assets plugins copies assets
 * to build locations.
 * 
 * Default Plugins
 * 1. pngquant - This plugin uses the pngquant compression utility to compress PNGs. You can set how many colors each image should have, and this plugin rolls through the list of assets, smashing PNGs into significantly smaller files.
 * 2. manifest - This plugin tallies all the assets and creates an application cache for your game. It even handles editing an Apache .htaccess file with mod_rewrite rules so that it can cache the correct audio assets for different browsers!
 * 3. scripts - This plugin grabs all the JavaScript and JSON files and puts them into a single file for a faster download. It also does the same with disparate CSS files.
 * 4. language - This plugin uses a language table to create unique language builds for localization. It's a template system that replaces {{language-keys}} in the code with appropriate localized text. It also handles mod_rewrite's to pull the correct index.html if you choose to have multiple languages in a single build. (Alternatively, you can specify to produce multiple single-language builds.)
 * 5. assets - This plugin copies assets from the source files into the build locations.
 * 6. compression - This plugin uses the YUI compressor to compress the JavaScript and CSS files.
 * 7. write - This final plugin handles writing the various scripts, style sheets, and manifest files to the build locations.
 * 
 * The following global variables are useful for custom plugins:
 * 1. config - This is the game configuration. It can be modified by plugins to update game information.
 * 2. isJIT - This boolean value is `true` if the compiler is running inside a browser.
 * 3. fileSystem - Provides several file-handling functions for modifying game resources.
 * 
 */

// Global variables
var config = null,
include = null,
isJIT = false;

if (typeof window === 'undefined') { // Outside the browser, use Rhino or ActiveX for file manipulation.
    include = function(path){
		var file = undefined,
		line     = '',
		text     = '';
		if (typeof ActiveXObject != 'undefined'){
			file = new ActiveXObject("Scripting.FileSystemObject").OpenTextFile(path);
			text = file.ReadAll();
			file.Close();
		} else {
	    	file = new java.io.BufferedReader(new java.io.FileReader(path));
	    	while ((line = file.readLine()) != null) {
			  text += new String(line) + '\n';
			}
	    	file.close();
		}
		eval(text);
	};
	include('js/file-io.js');  // Including support for either ActiveX or Rhino file and shell support.
	include('js/json2.js');    // Including json2.js to support JSON if it doesn't exist.

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
    };
} else { // Inside of the browser, set appropriate flags to prevent file manipulation.
	isJIT = true;
	
	window.platformer = {};
	window.include = function(path){loadJS.push(path);};
	window.print   = function(txt){console.log(txt);};
	window.alert   = function(txt){console.error(txt);};
	window.getText = function(path){
		var xhr = new XMLHttpRequest();
		
		xhr.open('GET', path, false);
		xhr.send();
		if(xhr.status === 200){
			return xhr.responseText;
		} else {
			   alert('Error opening "' + path + '": ' + xhr.description);
		}
    };
}

/*
 * Compile JSON files into a single configuration file
 */

(function(){
    var engineComponent = (function(){
    	// This is a list of all the components in the engine. This list must be updated as new components are added. Also update "game/default.js".
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
    csvToArray = function( strData, strDelimiter ){
	    // ref: http://stackoverflow.com/a/1293163/2343
	    // This will parse a delimited string into an array of
	    // arrays. The default delimiter is the comma, but this
	    // can be overridden in the second argument.

        strDelimiter = (strDelimiter || ",");
        var objPattern = new RegExp((
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ), "gi");
        var arrData = [[]];
        var arrMatches = null;
        while (arrMatches = objPattern.exec( strData )){
            var strMatchedDelimiter = arrMatches[ 1 ];
            if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter){
                arrData.push( [] );
            }
            var strMatchedValue;
            if (arrMatches[ 2 ]){
                strMatchedValue = arrMatches[ 2 ].replace(new RegExp( "\"\"", "g" ), "\"");
            } else {
                strMatchedValue = arrMatches[ 3 ];
            }
            arrData[ arrData.length - 1 ].push( strMatchedValue );
        }
        return( arrData );
    },
    getJSON = function(path){
	    try{
		    return eval('(' + getText(path) + ')'); //Using "eval" to allow comments in JSON definition files
	    } catch(e) {
		    alert('Error in "' + path + '": ' + e.description);
		    return {};
	    }
    };
   setText    = function(path, text){
	   if(isJIT){
		   return text;
	   }
	   
	   var file = fileSystem.CreateTextFile(path, true);
	   file.Write(text);
	   file.Close();
	   return text;
   },
   setJSON    = function(path, obj){return setText(path, JSON.stringify(obj));},
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
				       src: '../engine/components/' + component + '.js'
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

			    	// Pull in json-based asset data stored separately
			    	if(asset.data && (typeof asset.data === 'string') && isJSON(asset.data)){
		    			print('.....Filling in data for "' + asset.id + '"');
					    asset.data = getJSON(workingDir + asset.data);
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
    incrementGameVersion = function(buildDir){
	    var v = null,
	    arr   = null;
	    
	    try {
		    v = getJSON(buildDir + 'version.json');
	    } catch(e) {
		    v = {};
	    }
	    
	    if(!v.version){
	    	v.version = "0.0.1";
	    } else {
		    arr = v.version.split('.');
	    	arr[0] = parseInt(arr[0] || 0);
	    	arr[1] = parseInt(arr[1] || 0);
	    	arr[2] = parseInt(arr[2] || 0);
	    	
	    	arr[2] += 1;
	    	if(arr[2] === 10){
	    		arr[2] = 0;
		    	arr[1] += 1;
		    	if(arr[1] === 10){
		    		arr[1] = 0;
			    	arr[0] += 1;
		    	}
	    	}
	    	v.version = arr.join('.');
	    }
	    
	    v.timestamp = new Date().toString();
	    v.increment = v.increment || 0;
	    v.increment += 1;
	    
	    setJSON(buildDir + 'version.json', v);
	    return v;
    },
    compConfig = isJIT?{}:getJSON('tools-config.json'),
    workingDir = isJIT?'':(compConfig["source-folder"] || '../game/'),
    buildDir   = isJIT?'':(compConfig["destination-folder"] || '../builds/'),
    gameConfig = getText(workingDir + 'config.json'),
    game       = eval('(' + gameConfig + ')'), //Using "eval" to allow comments in JSON config file
    source     = game.source,
    dependencyList = source['includes']  = source['includes'] || ['../engine/main.js'],
    componentList = source['components'] = source['components'] || [],
    sectionId  = '',
    builds     = game.builds,
    buildIndex = 0,
    build      = null,
    version    = null;
    
    if(isJIT){
        game.version    = 'debug';
    } else {
    	version = incrementGameVersion(buildDir);
        game.version    = version.version;
        game.timestamp  = version.timestamp;
        game.buildIndex = version.increment;
    }

    print('--- BUILD VERSION ' + game.version + ' ---');
    print('Composing game from ' + workingDir + 'config.json.');
    
    for(sectionId in source){
    	if((sectionId !== 'includes') && (sectionId !== 'components')){
        	print('..Handling "' + sectionId + '" section.');
        	if(typeof source[sectionId] === 'string'){
        		source[sectionId] = getJSON(workingDir + source[sectionId]);
        	}
        	
        	handleList(source[sectionId], sectionId, workingDir);
    	}
    }
	print('..Handling Components.'); // need to process after entities
	handleList(componentList, "components", workingDir);
	print('..Handling Dependencies.');
	handleList(dependencyList, "includes", workingDir);
   
    game.toolsConfig = compConfig || {}; //save compile information for compilation tools that use this configuration.

    if(game.languages){
        print('..Loading language reference.');
        
        try {
        	game.languages.reference = getText(workingDir + game.languages.reference);
        	game.languages.reference = csvToArray(game.languages.reference);
            game.languages.reference;
        } catch(e) {
        	print('Error loading language reference: ' + e.description);
        }
    }
    
    if(isJIT){
        // Create single build for testing.
    	for (buildIndex in builds){
        	if(builds[buildIndex].id === 'debug'){
        		build = builds[buildIndex];
        		break;
        	}
    	}
        build = build || {id: 'debug', debug: true, index: true};
        game.builds = [build];
    } else {
        for (buildIndex in builds){
        	build = builds[buildIndex];

        	print('..Copying templates for build "' + build.id + '".');
        	build.htmlTemplate     = getText(workingDir + (build.htmlTemplate     || 'template.html'));
        	build.htaccessTemplate = getText(workingDir + (build.htaccessTemplate || '.htaccess'));
        	build.manifestTemplate = getText(workingDir + (build.manifestTemplate || 'template.manifest'));
    	}
    }
    
    var plugins = game.global.plugins || ["js/pngquant-plugin.js", "js/manifest-plugin.js", "js/scripts-plugin.js", "js/language-plugin.js", "js/assets-plugin.js", "js/compression-plugin.js", "js/write-plugin.js"];
    
	config = game;
	
	if(isJIT){
		for(var k = 0; k < plugins.length; k++){
	    	include('../tools/' + plugins[k]);
	    }
	} else {
		for(var k = 0; k < plugins.length; k++){
	    	print(' ');
	    	print('--- BEGIN PLUGIN "' + plugins[k] + '" ---');
	    	include(plugins[k]);
	    	print('--- END PLUGIN "' + plugins[k] + '" ---');
	    	print(' ');
	    }
	}
    
    print('Completed full config.json.');
})();
