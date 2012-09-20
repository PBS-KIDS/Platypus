(function(){
   var shell  = new ActiveXObject("wscript.shell"),
   fileSystem = new ActiveXObject("Scripting.FileSystemObject"),
   alert      = function(val){shell.Popup(val);},
   getText    = function(path){
	   var file = fileSystem.OpenTextFile(path),
	   text     = file.ReadAll();
	   file.Close();
	   return text;
   },
   getJSON    = function(path){return eval('(' + getText(path) + ')');}, //Using "eval" to allow comments in JSON definition files
   setText    = function(path, text){
	   var file = fileSystem.CreateTextFile(path, true);
	   file.Write(text);
	   file.Close();
	   return text;
   },
   setJSON    = function(path, obj){return setText(path, JSON.stringify(obj));},
   checkPush  = function(list, item){
	   var itIsThere = false;
	   for (var index in list){
		   if(list[index] === item) itIsThere = true;
	   }
	   if(!itIsThere) list.push(item);
	   return !itIsThere;
   },
   hypPath    = function(path){
	   return path.replace(/\.\.\//g, '').replace(/\//g, '-').replace(/src-/, '').replace(/images-/, '').replace(/audio-/, '').replace(/fonts-/, '');
   },
   copyFiles  = function(assets, destination, compression){
	    var assetIndex = 0,
	    asset          = undefined,
	    fileName       = '';
	    if (!fileSystem.FolderExists(destination)) fileSystem.CreateFolder(destination);
	    fileSystem.DeleteFile(destination + '*.*');
	    for (assetIndex in assets){
		    asset = assets[assetIndex];
		    if(asset !== ''){
		    	fileName = hypPath(asset);
		        if(compression && (asset.substring(asset.length - 4).toLowerCase() === '.png')){
	                if(!fileSystem.FileExists('../src/images/compressed/q' + compression + '-' + fileName)){
	                 	shell.Run("pngquant\\pngquant.exe -ext -q" + compression + ".png " + compression + " " + asset, 7, true);
		                fileSystem.MoveFile(asset.substring(0, asset.length - 4) + '-q' + compression + '.png', '../src/images/compressed/q' + compression + '-' + fileName);
	                }
	                fileSystem.CopyFile('../src/images/compressed/q' + compression + '-' + fileName, destination + fileName);
		        } else {
					fileSystem.CopyFile(asset, destination + fileName); 
		        }
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
	   return (check === '.ttf') || (check === '.otf');
   },
   game       = getJSON('config.json'), // need to have run compile-json.js prior to this if assets have changed.
   buildDir   = '../builds/',
   builds     = game.builds,
   buildIndex = 0,
   assets     = [],
   images     = [],
   audio      = [],
   fonts      = [];
   
   // Game Assets
   if (game.assets) for (var asset in game.assets){
	   if(game.assets[asset].src) checkPush(assets, game.assets[asset].src);
   }
   
   //Entity Assets
   if(game.entities) for (var entity in game.entities){
	   if(game.entities[entity].assets) for (var asset in game.entities[entity].assets){
		   if(game.entities[entity].assets[asset].src) checkPush(assets, game.entities[entity].assets[asset].src);
	   }
   }

   //Scene Assets
   if(game.scenes) for (var scene in game.scenes){
	   if(game.scenes[scene].assets) for (var asset in game.scenes[scene].assets){
		   if(game.scenes[scene].assets[asset].src) checkPush(assets, game.scenes[scene].assets[asset].src);
	   }
   }
   if(game.levels) for (var level in game.levels){
	   if(game.levels[level].tilesets) for (var asset in game.levels[level].tilesets){
		   if(game.levels[level].tilesets[asset].image) checkPush(assets, game.levels[level].tilesets[asset].image);
	   }
   }
   
   for (var asset in assets){
	   if(isImage(assets[asset])){
		   images.push(assets[asset]);
	   } else if(isAudio(assets[asset])){
		   audio.push(assets[asset]);
	   } else if(isFont(assets[asset])){
		   fonts.push(assets[asset]);
	   }
   }
   
    //Create builds
    if (!fileSystem.FolderExists(buildDir)) fileSystem.CreateFolder(buildDir);
    for (buildIndex in builds){
	    if (!fileSystem.FolderExists(buildDir + game.builds[buildIndex].id + '/')) fileSystem.CreateFolder(buildDir + game.builds[buildIndex].id + '/');
	    if (game.builds[buildIndex].pngCompression && !fileSystem.FolderExists('../src/images/compressed/')) fileSystem.CreateFolder('../src/images/compressed/');
    	copyFiles(images, buildDir + game.builds[buildIndex].id + '/i/', game.builds[buildIndex].pngCompression);
    	copyFiles(audio,  buildDir + game.builds[buildIndex].id + '/a/');
    	copyFiles(fonts,  buildDir + game.builds[buildIndex].id + '/f/');
	}
   
})();