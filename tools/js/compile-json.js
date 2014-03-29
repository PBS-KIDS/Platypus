/*
 * Load Dependencies
 */
var include = function(path){
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

/*
 * Compile JSON files into a single configuration file
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
   getJSON    = function(path){
	   try{
		   return eval('(' + getText(path) + ')'); //Using "eval" to allow comments in JSON definition files
	   } catch(e) {
		   alert('Error in "' + path + '": ' + e.description);
		   return {};
	   }
   },
   setText    = function(path, text){
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
   dependencyList = [],
   checkDependencies = function(asset){
	   var i   = 0,
	   j       = 0,
	   text    = '',
	   matches = null,
	   found   = false,
	   subDir  = '',
	   file    = '';
	   
	   if(typeof asset === 'string'){ //JS File
		   subDir = getSubDir(asset);
		   text = getText(asset);
		   matches = text.match(/[Rr]equires:\s*\[[\w"'.\\\/,]*\]/g);
		   if(matches && matches.length){
			   try {
				   arr = JSON.parse(matches[0].match(/\[[\w"'.\\\/,]*\]/g)[0]);
			   } catch(e) {
				   alert("Error in '" + asset + "': Dependency list is malformed.");
				   return;
			   }
			   for(i = 0; i < arr.length; i++){
				   found = false;
				   for(j = 0; j < dependencyList.length; j++){
					   if(arr[i] === dependency[i]){
						   found = true;
						   break;
					   }
				   }
				   if(!found){
					   file = fixUpPath(subDir + arr[i]);
					   dependencyList.push(file);
					   checkDependencies(file);
				   }
			   }
		   }
	   } else if (asset){ //should be a JSON object
		   
	   }
   },
   handleList = function(section, sectionId, workingDir){
	    var subDir     = '',
	    asset      = undefined,
	    assetId    = 0,
	    retainId   = '',
	    srcId      = '';

	    for (assetId in section){
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
			    }
			    game.source[sectionId][assetId] = asset;
		    } catch(e) {
			    alert('Error in processing "' + sectionId + ' ' + assetId + '": ' + e.description);
		    }
	    }
   },
   compConfig = getJSON('tools-config.json'),
   workingDir = compConfig["source-folder"] || '../game/',
   gameConfig = getText(workingDir + 'config.json'),
   game       = eval('(' + gameConfig + ')'), //Using "eval" to allow comments in JSON config file
   source     = game.source,
   sectionId  = '';
    
    print('Composing full config.json from ' + workingDir + 'config.json.');
    
    for(sectionId in source){
    	print('..Handling "' + sectionId + '" section.');
    	handleList(source[sectionId], sectionId, workingDir);
    }
	print('..Handling Dependencies.');
	handleList(dependencyList, "includes", workingDir);
   
    game.toolsConfig = compConfig || {}; //save compile information for compilation tools that use this configuration.

    //insert entities and scenes into compiled config file
    setJSON('config.json', game);
    print('Completed full config.json.');
})();
