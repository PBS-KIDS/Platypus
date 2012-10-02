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

/*
 * Compress and move assets to builds folder
 */

(function(){
   var alert  = function(val){shell.Popup(val);},
   getText    = function(path){
	   var file = fileSystem.OpenTextFile(path),
	   text     = file.ReadAll();
	   file.Close();
	   return text;
   },
   getJSON    = function(path){return eval('(' + getText(path) + ')');}, //Using "eval" to allow comments in JSON definition files
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
	                 	if(shell.isBash){
	                 		shell.Run("pngquant/pngquant -ext -q" + compression + ".png " + compression + " " + asset, 7, true);
	                 	} else {
	                 		shell.Run("pngquant\\pngquant.exe -ext -q" + compression + ".png " + compression + " " + asset, 7, true);
	                 	}
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
   fonts      = [],
   source     = game.source,
   section    = undefined,
   sectionId  = '',
   asset      = undefined,
   assetId    = 0,
   srcId      = '';
   
    for(sectionId in source){
    	section = source[sectionId];
	    for (assetId in section){
	    	asset = section[assetId];
		    try {
			    if(asset.src){
			    	if((typeof asset.src) == 'string'){
			    		if(asset.src.substring(0,4).toLowerCase() !== 'http'){
			    			checkPush(assets, asset.src);
			    		}
			    	} else {
			    		for(srcId in asset.src){
				    		if(asset.src[srcId].substring(0,4).toLowerCase() !== 'http'){
				    			checkPush(assets, asset.src[srcId]);
				    		}
			    		}
			    	}
			    }
		    } catch(e) {
			    alert('Error in processing "' + sectionId + ' ' + assetId + '": ' + e.description);
		    }
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