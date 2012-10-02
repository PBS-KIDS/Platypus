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
 * Compile JavaScript files into a single file and move server-side files to builds folder
 */

(function(){
   var namespace = 'gws',
   alert      = function(val){shell.Popup(val);},
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
   getJSON    = function(path){return eval('(' + getText(path) + ')');}, //Using "eval" to allow comments in JSON definition files
   setText    = function(path, text){
	   var file = fileSystem.CreateTextFile(path, true);
	   file.Write(text);
	   file.Close();
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
	   return path.replace(/\.\.\//g, '').replace(/\//g, '-').replace(/src-/, '').replace(/images-/, '').replace(/audio-/, '').replace(/fonts-/, '');
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
    buildGame = function(build, config, html, manifest, timestamp){
	    var jsFile = 'combined',
	    cssFile    = 'combined',
	    result     = {
    	    scripts: '',
    	    styles: '',
    	    extStyles: '',
    	    extScripts: ''
	    },
	    game       = eval('(' + config + ')'),
	    source     = game.source,
	    aspects    = {"default": []},
	    section    = undefined,
	    sectionId  = '',
	    asset      = undefined,
	    assetId    = 0,
	    srcId      = '',
	    i          = 0,
	    j          = 0;

	    delete game.builds;

	    if(build.aspects){ // Prepare multiple manifest files
	    	for (i in build.aspects) for (j in build.aspects[i]){
		    	aspects[build.aspects[i][j]] = ['\n# ' + build.aspects[i][j] + ':\n'];
	    	}
	    }
	    
	    //Fix up relative paths on Game Assets
	    //Combine JavaScript and CSS Assets
	    for(sectionId in source){
	    	if((sectionId === 'components') || (sectionId === 'classes')){
	    		result.scripts += namespace + '.' + sectionId + ' = {};\n';
	    	}
	    	aspects["default"].push('\n# ' + sectionId + ':\n');
	    	section = source[sectionId];
	    	if(sectionId === 'assets') {
	    		game[sectionId] = [];
	    	} else {
	    		game[sectionId] = {};
	    	}
		    for (assetId in section){
		    	asset = section[assetId];
			    try {
				    if(asset.src){
				    	if((typeof asset.src) == 'string'){
				    		asset.src = handleAsset(asset.id, asset.src, aspects["default"], result);
				    	} else {
				    		for(srcId in asset.src){
				    			asset.src[srcId] = handleAsset(asset.id, asset.src[srcId], aspects[srcId], result);
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
			    	game[sectionId].push(asset);
		    	} else {
		    		game[sectionId][asset.id] = asset;
		    	}
		    }
	    }
	    delete game.source;

	    result.scripts  = namespace + ' = this.' + namespace + ' || {};\n' + namespace + '.settings = ' + JSON.stringify(game) + ';\n' + result.scripts;
	 
	    manifest = manifest.replace('CACHE:', 'CACHE:\n' + aspects["default"].join('\n'));
	    manifest = manifest.replace('# Version', '# Version ' + timestamp);
	    
	    if (!fileSystem.FolderExists(buildDir)) fileSystem.CreateFolder(buildDir);
	    if (!fileSystem.FolderExists(buildDir + build.id + '/')) fileSystem.CreateFolder(buildDir + build.id + '/');
	    if (!fileSystem.FolderExists(buildDir + build.id + '/j/')) fileSystem.CreateFolder(buildDir + build.id + '/j/');
	    if (!fileSystem.FolderExists(buildDir + build.id + '/s/')) fileSystem.CreateFolder(buildDir + build.id + '/s/');

	    // handle server files
	    try{
	        fileSystem.DeleteFile(buildDir + build.id + '/*.*');
	    } catch(e) {}
		fileSystem.CopyFile(workingDir + 'server/*.*', buildDir + build.id + '/');

		// create JS file
	    setText('combined.js', result.scripts);   
	    if(build.jsCompression){
	    	shell.Run("java -jar yui/yui.jar combined.js -o combined.js",   7, true);
	    	jsFile = 'compressed';
	    }
	    try {fileSystem.DeleteFile(buildDir + build.id + '/j/' + jsFile + '*.js');} catch(e) {}
	    fileSystem.MoveFile("combined.js", buildDir + build.id + '/j/' + jsFile + timestamp + '.js');

	    // create CSS file
	    setText('combined.css', result.styles);   
	    if(build.cssCompression){
	    	shell.Run("java -jar yui/yui.jar combined.css -o combined.css", 7, true);
	    	cssFile = 'compressed';
	    }
	    try {fileSystem.DeleteFile(buildDir + build.id + '/s/' + cssFile + '*.css');} catch(e) {}
	    fileSystem.MoveFile("combined.css", buildDir + build.id + '/s/' + cssFile + timestamp + '.css');

	    // setup manifest from template
	    if(build.manifest){
	    	html     = html.replace('<html>', '<html manifest="cache.manifest">');
	    	manifest = manifest.replace('CACHE:', 'CACHE:\nj\/' + jsFile + timestamp + '.js\ns\/' + cssFile + timestamp + '.css\n');

		    if(build.aspects){ // Prepare multiple manifest files
		    	var aspectVariations = build.aspects[0], tempArray = [];
		    	
		    	for (var i = 1; i < build.aspects.length; i++){
		    		options = build.aspects[i];
	    			tempArray = [];
		    		for (j in options){
		    			for (k in aspectVariations){
		    				tempArray.push(aspectVariations[k] + '-' + options[j]);
		    			}
		    		}
		    		aspectVariations = tempArray;
		    	}
		    	
		    	for (i in aspectVariations){
			    	var tempMan = manifest;
			    	var arr2 = aspectVariations[i].split('-');
			    	for (j in arr2){
			    		tempMan = tempMan.replace('CACHE:', 'CACHE:\n' + aspects[arr2[j]].join('\n'));
			    	}
				    setText(aspectVariations[i] + '.manifest', tempMan);
				    try {fileSystem.DeleteFile(buildDir + build.id + '/' + aspectVariations[i] + '.manifest');} catch(e) {}
				    fileSystem.MoveFile(aspectVariations[i] + '.manifest', buildDir + build.id + '/' + aspectVariations[i] + '.manifest');
		    	}
		    } else {
			    setText('cache.manifest', manifest);
			    try {fileSystem.DeleteFile(buildDir + build.id + '/cache.manifest');} catch(e) {}
			    fileSystem.MoveFile("cache.manifest", buildDir + build.id + '/cache.manifest');
		    }
	    }
	    
	    // setup index from template
	    html = html.replace(/js\/default\.js/,   'j/' + jsFile  + timestamp + '.js');
	    html = html.replace(/css\/default\.css/, 's/' + cssFile + timestamp + '.css');
    	html = html.replace('</head>', result.extStyles + '</head>');
    	html = html.replace('<!-- scripts -->', '<!-- scripts -->\n' + result.extScripts);
	    setText('index.html', html);
	    fileSystem.MoveFile("index.html", buildDir + build.id + '/index.html');
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
	   return (check === '.ttf') || (check === '.otf');
   },
   isCSS     = function(path){
	   var check = path.substring(path.length - 4).toLowerCase();
	   return (check === '.css');
   },
   isJS      = function(path){
	   var check = path.substring(path.length - 3).toLowerCase();
	   return (check === '.js');
   },
   handleAsset = function(id, src, assets, result){
		if(src.substring(0,4).toLowerCase() !== 'http'){
			if(isImage(src) || isAudio(src) || isFont(src)){
				return checkPush(assets, putInFolder(hypPath(src)));
			} else if(isCSS(src)) {
				result.styles  += '\n\/*--------------------------------------------------\n *   ' + id + ' - ' + src + '\n *\/\n';
				result.styles  += getText(src) + '\n';
		 	    return src;
			} else if(isJS(src)) {
				result.scripts += '\n\/*--------------------------------------------------\n *   ' + id + ' - ' + src + '\n *\/\n';
				result.scripts += getText(src) + '\n';
		 	    return src;
			}
		} else {
			if(isImage(src) || isAudio(src) || isFont(src)){
				return checkPush(assets, src);
			} else if(isCSS(src)) {
				result.extStyles += '  <link rel="stylesheet" href="' + checkPush(assets, src) + '" type="text\/css" \/>\n';
		 	    return src;
			} else if(isJS(src)) {
				result.extScripts += '  <script type="text\/javascript" src="' + checkPush(assets, src) + '"><\/script>\n';
		 	    return src;
			}
		}
   },
   timestamp  = ((new Date().getTime()) + '').substring(0, 9),
   gameConfig = getText('config.json');
   game       = eval('(' + gameConfig + ')');
   workingDir = '../src/',
   buildDir   = '../builds/',
   html       = getText(workingDir + 'template.html'),
   manifest   = getText(workingDir + 'template.manifest'),
   builds     = game.builds,
   buildIndex = 0;
   
    //Create builds
    for (buildIndex in builds){
    	buildGame(builds[buildIndex], gameConfig, html, manifest, timestamp);
	}
})();