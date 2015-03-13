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
    setText    = function(path, text){
	    var file = fileSystem.CreateTextFile(path, true);
	    file.Write(text);
	    file.Close();
	    return text;
    },
    compressGame = function(build){
	    var i = 0,
	    files = build.files,
	    file  = null,
	    css   = build.compression || build.cssCompression,
	    js    = build.compression || build.jsCompression;

	    if(css || js){
	    	print('.Compressing scripts for build "' + build.id + '".');
		    for(i = 0; i < files.length; i++){
		    	file = files[i];
		    	if(file){
		    		if(isJS(file.name) && js){
				    	print('..Compressing "' + file.name + '".');
			    	    setText('combine.js', file.content);   
		    	    	shell.Run("java -jar yui/yui.jar combine.js -o compress.js",   7, true);
			    	    file.content = getText("compress.js");
		    		} else if (isCSS(file.name) && css){
				    	print('..Compressing "' + file.name + '".');
			    	    setText('combine.css', file.content);
		    	    	shell.Run("java -jar yui/yui.jar combine.css -o compress.css", 7, true);
			    	    file.content = getText("compress.css");
		    		}
		    	}
		    }
	    } else {
	    	print('.Skipping compression for build "' + build.id + '".');
	    }
   },
   isCSS     = function(path){
	   var check = path.substring(path.length - 4).toLowerCase();
	   return (check === '.css');
   },
   isJS      = function(path){
	   var check = path.substring(path.length - 3).toLowerCase();
	   return (check === '.js');
   },
   builds     = config.builds,
   buildIndex = 0;

    //Create builds
    print('Preparing to compress scripts.');
    for (buildIndex in builds){
    	compressGame(builds[buildIndex]);
	}

    // Clean up
    try {fileSystem.DeleteFile('combine.js');} catch(e) {}
    try {fileSystem.DeleteFile('compress.js');} catch(e) {}
    try {fileSystem.DeleteFile('combine.css');} catch(e) {}
    try {fileSystem.DeleteFile('compress.css');} catch(e) {}
    
    print('Completed script compression.');
})();