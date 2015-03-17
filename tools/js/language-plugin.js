/*
 * Create .manifest files for assets
 */

(function(){
    var csvToArray = function( strData, strDelimiter ){
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
    getText = function(path){
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
    handleLanguageBuilds = function(build, languages, dictionary, config, syntax, builds){
    	var i = 0;
    	
    	for (i = 0; i < languages.length; i++){
    		if(languages[i]){
    			if(dictionary[languages[i]]){
    				print('..Creating "' + languages[i] + '" build.');
    				builds.push(createLanguageBuild(build, dictionary[languages[i]], config, syntax, languages[i]));
    			} else {
    				print('..No dictionary found for "' + languages[i] + '" (build "' + build.id + '").');
    			}
    		}
    	}
    },
    createLanguageBuild = function(build, dictionary, config, syntax, langId){
    	var i    = 0,
    	newBuild = JSON.parse(JSON.stringify(build));
    	
    	translate(newBuild.files, dictionary, syntax);
    	
    	newBuild.id += '-' + langId;
    	newBuild.languages = [langId];

    	for (i = 0; i < newBuild.files.length; i++){
    		newBuild.files[i].name = newBuild.files[i].name.replace(build.id, newBuild.id);
    	}
    	
    	return newBuild;
    },
    isHTACCESS = function(path){
 	   var check = path.substring(path.length - 8).toLowerCase();
 	   return (check === 'htaccess');
    },
    isJSorJSON = function(path){
 	   return (path.substring(path.length - 3).toLowerCase() === '.js') || (path.substring(path.length - 5).toLowerCase() === '.json');
    },
    handleLanguageBranches = function(build, languages, dictionary, config, syntax){
    	var i  = 0,
    	files  = [],
    	hta    = null;

    	print('..Processing source files.');
    	for (i = build.files.length - 1; i >= 0; i--){
    		if(isHTACCESS(build.files[i].name)){
        		hta = build.files.splice(i,1)[0];
        		files.push(hta);
    	    	if(hta.content.indexOf('RewriteEngine on') < 0){
    	    		hta.content += '\nRewriteEngine on\n';
    	    	}
	    		hta.content += '\nRewriteCond %{REQUEST_FILENAME} !-f';
	    		hta.content += '\nRewriteRule ^$|^\\/$ index.html [L,NC]\n';
    		}
    	}
    	
    	for (i = languages.length - 1; i >= 0 ; i--){
    		if(languages[i]){
    			if(dictionary[languages[i]]){
    				print('..Creating "' + languages[i] + '" branch.');
    				createLanguageBranch(build.files, dictionary[languages[i]], config, syntax, files, languages[i]);

    				// .htaccess rules
    				if(hta){
    					if(i > 0){ //exclude initial language since it's default
    			    		hta.content += '\nRewriteCond %{HTTP:Accept-Language} (' + languages[i] + ') [NC]';
    					}
			    		hta.content += '\nRewriteCond %{REQUEST_FILENAME} !-f';
			    		hta.content += '\nRewriteRule ^index\\.html$ ' + languages[i] + '-index.html [L,NC]\n';
    				}
    			} else {
    				print('..No dictionary found for "' + languages[i] + '" (build "' + build.id + '").');
    			}
    		}
    	}

    	build.languages = build.languages || languages;
    	
    	build.files = files;
    },
    createLanguageBranch = function(source, dictionary, config, syntax, files, langId){
    	var i    = 0,
    	fileList = JSON.parse(JSON.stringify(source)),
    	arr      = null,
	    version  = 'v' + config.version.replace(/\./g, '-');
    	
    	for (i = 0; i < fileList.length; i++){
    		arr = fileList[i].name.split('/');
    		arr[arr.length - 1] = langId + '-' + arr[arr.length - 1];
    		fileList[i].name = arr.join('/');
    		files.push(fileList[i]);
    	}
    	
    	translate(fileList, dictionary, syntax, version, langId + '-' + version);
    },
    translate  = function(list, dictionary, syntax, v, newV){
    	var i = 0;
    	
    	for(i = 0; i < list.length; i++){
        	print('...Translating "' + list[i].name + '".');
        	list[i].content = translateFile(list[i].content, dictionary, syntax, isJSorJSON(list[i].name));
        	
        	//Update language version file references. This is unnecessary for complete language builds where file names remain unchanged.
        	if(v){
            	list[i].content = list[i].content.replace(new RegExp(v, 'g'), newV);
        	}
    	}
    },
    escRegExp = function(str){
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
   	},
   	format = function(s){
   		return s.replace(/\\/g, '\\\\').replace(/\"/g, '\\"').replace(/\'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t').replace(/\b/g, '\\b').replace(/\f/g, '\\f');
   	},
    translateFile = function(file, dictionary, syntax, js){
    	var key = '';
    	
    	if(js){
        	for (key in dictionary){
        		file = file.replace(new RegExp(escRegExp(syntax[0] + key + syntax[1]), 'g'), format(dictionary[key]));
        	}
    	} else {
        	for (key in dictionary){
        		file = file.replace(new RegExp(escRegExp(syntax[0] + key + syntax[1]), 'g'), dictionary[key]);
        	}
    	}
    	
    	return file;
    },
    workingDir = config.toolsConfig["source-folder"] || '../game/',
    languages = [],
    dictionary = {},
    langConfig = config.languages,
    source = null,
    builds     = config.builds,
    buildIndex = 0,
    languageBuilds = [];
    
    if(!langConfig || !langConfig.reference){
    	print('There are no language settings.');
    	print('.To support multiple languages, add languages to config.json.');
    	return;
    }
    
    print('Loading language reference.');
    delete config.languages;
    
    if(!langConfig.syntax){
    	langConfig.syntax = ['{{', '}}'];
    }
    
    try {
        source = getText(workingDir + langConfig.reference);
        source = csvToArray(source);
    } catch(e) {
    	print('Error converting csv to array: ' + e.description);
    	return;
    }
    
    print('Preparing language reference.');
    languages = source[0].slice(1); // removing first item since it's the header for variable names
    for (var i = 0; i < languages.length; i++){
    	if(languages[i]){
    	    print('.Creating "' + languages[i] + '" dictionary.');
    		dictionary[languages[i]] = {};
    	    for (var j = 0; j < source.length; j++){
    	    	if(source[j][0]){
    	        	dictionary[languages[i]][source[j][0]] = source[j][i + 1];
    	    	}
    	    }
    	}
    }
    
//    config.dictionary = dictionary;
    
    print('Creating language builds.');
    for (buildIndex = builds.length - 1; buildIndex >= 0; buildIndex--){
    	if(builds[buildIndex].languageBuilds){
        	print('.Creating language builds for build "' + builds[buildIndex].id + '".');
        	handleLanguageBuilds(builds[buildIndex], builds[buildIndex].languages || languages, dictionary, config, langConfig.syntax, languageBuilds);
            print('.Completed language builds for build "' + builds[buildIndex].id + '".');
        	builds.splice(buildIndex, 1);
    	} else {
        	print('.Creating language branches for build "' + builds[buildIndex].id + '".');
        	handleLanguageBranches(builds[buildIndex], builds[buildIndex].languages || languages, dictionary, config, langConfig.syntax);
            print('.Completed language branches for build "' + builds[buildIndex].id + '".');
    	}
	}
    print('Adding language builds.');
    for (buildIndex = 0; buildIndex < languageBuilds.length; buildIndex++){
        print('.Adding build "' + builds[buildIndex].id + '".');
    	builds.push(languageBuilds[buildIndex]);
    }
    
})();