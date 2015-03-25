/**
 * WRITE PLUGIN
 * 
 * This final plugin handles writing the various scripts, style sheets, and manifest files to the build
 * locations. It works in tandem with the assets plugin to create complete builds.
 * 
 */

(function(){
	if(isJIT){
		print('This plugin does not support in-browser compilation.');
		return;
	}

    var setText = function(path, text){
	    var file = fileSystem.CreateTextFile(path, true);
	    file.Write(text);
	    file.Close();
	    return text;
    },
    clearFolder = function(path){
	    if (fileSystem.FolderExists(path)) {
		    try {fileSystem.DeleteFile(path + '*.*');} catch(e) {}
	    } else {
	    	fileSystem.CreateFolder(path);
	    }
    },
    buildGame = function(build, workingDir, buildDir){
	    var buildPath = '',
	    indexPath  = '',
	    i          = 0;

	    buildPath = indexPath = buildDir + build.id + '/';
	    clearFolder(buildPath);

	    if(build.index === false){
	        buildPath += build.id + '/';
		    clearFolder(buildPath);
	    }

	    clearFolder(buildPath + 'j/');
	    clearFolder(buildPath + 's/');

	    if (fileSystem.FolderExists(workingDir + 'server/')){ // if there are files that should be copied to root as-is in a /server/ folder, do so.
	    	print('..Copying "server/" files to "' + indexPath + '".');
			fileSystem.CopyFile(workingDir + 'server/*.*', indexPath, true);
	    }

	    for(i = 0; i < build.files.length; i++){
	    	print('..Writing "' + build.files[i].name + '".');
		    setText(build.files[i].name, build.files[i].content);
	    }
   },
   workingDir = config.toolsConfig["source-folder"] || '../game/',
   buildDir   = config.toolsConfig["destination-folder"] || '../builds/',
   builds     = config.builds,
   buildIndex = 0;

    //Create builds
    print('Preparing to write files.');
    if (!fileSystem.FolderExists(buildDir)) fileSystem.CreateFolder(buildDir);
    for (buildIndex in builds){
    	print('.Writing files for build "' + builds[buildIndex].id + '".');
    	buildGame(builds[buildIndex], workingDir, buildDir);
	}
    print('Completed writing files. Hurrah!');
})();