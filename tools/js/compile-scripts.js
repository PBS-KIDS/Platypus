(function(){
   var namespace = 'gws',
   shell      = new ActiveXObject("wscript.shell"),
   fileSystem = new ActiveXObject("Scripting.FileSystemObject"),
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
   include    = function(path){eval(getText(path));},
   getJSON    = function(path){return eval('(' + getText(path) + ')');}, //Using "eval" to allow comments in JSON definition files
   setText    = function(path, text){
	   var file = fileSystem.CreateTextFile(path, true);
	   file.Write(text);
	   file.Close();
	   return text;
   },
   checkPush  = function(list, item){
	   var itIsThere = false;
	   for (var index in list){
		   if(list[index] === item) itIsThere = true;
	   }
	   if(!itIsThere) list.push(item);
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
    buildGame = function(build, scripts, styles, html, manifest, timestamp){
	    var jsFile = 'combined',
	    cssFile    = 'combined';

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
	    setText('combined.js', scripts);   
	    if(build.jsCompression){
	    	shell.Run("java -jar yui/yui.jar combined.js -o combined.js",   7, true);
	    	jsFile = 'compressed';
	    }
	    try {fileSystem.DeleteFile(buildDir + build.id + '/j/' + jsFile + '*.js');} catch(e) {}
	    fileSystem.MoveFile("combined.js", buildDir + build.id + '/j/' + jsFile + timestamp + '.js');

	    // create CSS file
	    setText('combined.css', styles);   
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
		    setText('cache.manifest', manifest);
		    fileSystem.MoveFile("cache.manifest", buildDir + build.id + '/cache.manifest');
	    }
	    
	    // setup index from template
	    html = html.replace(/js\/default\.js/,   'j/' + jsFile  + timestamp + '.js');
	    html = html.replace(/css\/default\.css/, 's/' + cssFile + timestamp + '.css');
    	html = html.replace('<!-- scripts -->', '<!-- scripts -->\n' + extScripts);
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
   timestamp  = ((new Date().getTime()) + '').substring(0, 9),
   game       = getJSON('config.json');
   scripts    = '',
   styles     = '',
   extScripts = '',
   workingDir = '../src/',
   buildDir   = '../builds/',
   subDir     = '',
   html       = getText(workingDir + 'template.html'),
   manifest   = getText(workingDir + 'template.manifest'),
   scenes     = game.scenes,
   levels     = game.levels,
   entities   = game.entities,
   components = game.components,
   includes   = game.includes,
   builds     = game.builds,
   buildIndex = 0,
   obj        = undefined,
   assets     = [];
   
    delete game.builds;
    delete game.components;
    delete game.includes;
   
    // Including json2.js to support JSON if it doesn't exist. - DDD
    include('js/json2.js');
   
    //Fix up relative paths on Game Assets
    if(scenes){
	    for (var scene in scenes){
		    obj = scenes[scene];
		    if(obj.assets) for (var asset in obj.assets){
			    if(obj.assets[asset].src) obj.assets[asset].src = checkPush(assets, putInFolder(hypPath(obj.assets[asset].src)));
		    }
	    }
    }
    if(levels){
	    for (var level in levels){
		    obj = levels[level];
		    if(obj.tilesets) for (var asset in obj.tilesets){
			    if(obj.tilesets[asset].image) obj.tilesets[asset].image = checkPush(assets, putInFolder(hypPath(obj.tilesets[asset].image)));
		    }
	    }
    }
    if(entities){
	    for (var entity in entities){
		    obj = entities[entity];
		    if(obj.assets) for (var asset in obj.assets){
		 	    if(obj.assets[asset].src) obj.assets[asset].src = checkPush(assets, putInFolder(hypPath(obj.assets[asset].src)));
		    }
	    }
    }
    if (game.assets) for (var asset in game.assets){
 	    if(game.assets[asset].src) game.assets[asset].src = checkPush(assets, putInFolder(hypPath(game.assets[asset].src)));
    }

    //Combine JavaScript and CSS Assets
    scripts += namespace + ' = this.' + namespace + ' || {};\n';
   
    if (components){
	    scripts += '\n\n\/*==================================================\n' + namespace.toUpperCase() + ' COMPONENTS:\n*\/\n' + namespace + '.components = [];\n';
	    for (var asset in components){
		    if(components[asset] && components[asset].src){
			    scripts += '\n\/*--------------------------------------------------\n' + components[asset].id + ' - ' + components[asset].src + '\n*\/\n';
			    scripts += getText(components[asset].src) + '\n';
	 	    }
	    }
    }
    
    if (includes){
	    scripts += '\n\n\/*==================================================\n' + namespace.toUpperCase() + ' CLASSES\n*\/\n' + namespace + '.classes = {};\n';
	    for (var asset in includes){
		    if(includes[asset].src && (includes[asset].src.substring(0,4).toLowerCase() !== 'http')){
			    if(isJS(includes[asset].src)){
				    scripts += '\n\/*--------------------------------------------------\n' + includes[asset].id + ' - ' + includes[asset].src + '\n*\/\n';
				    scripts += getText(includes[asset].src) + '\n';
			    } else if(isCSS(includes[asset].src)){
			 	    styles += '\n\/*--------------------------------------------------\n' + includes[asset].id + ' - ' + includes[asset].src + '\n*\/\n';
			 	    styles += getText(includes[asset].src) + '\n';
			    }
		    } else if(includes[asset].src) {
		 	    extScripts += '  <script type="text\/javascript" src="' + checkPush(assets, includes[asset].src) + '"><\/script>\n';
		    }
	    }
    }
   
    scripts += namespace + '.settings = ' + JSON.stringify(game) + ';\n';
 
    manifest = manifest.replace('CACHE:', 'CACHE:\n' + assets.join('\n'));
    manifest = manifest.replace('# Version', '# Version ' + timestamp);
   
    //Create builds
    for (buildIndex in builds){
    	buildGame(builds[buildIndex], scripts, styles, html, manifest, timestamp);
	}
})();