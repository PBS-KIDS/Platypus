/**
 * LANGUAGE PLUGIN
 * 
 * This plugin uses a language table to create unique language builds for localization. It's a template
 * system that replaces {{language-keys}} in the code with appropriate localized text. It also handles
 * mod_rewrite's to pull the correct index.html if you choose to have multiple languages in a single
 * build. Alternatively, you can specify to produce multiple single-language builds.
 * 
 * It looks for the following settings in the game configuration:
 * 
 * config.languages
 *     .reference (string or 2D array)
 *         This can be a path name to a CSV file listing language information or an array with the
 *         following form. (This is the same layout used by a spreadsheet CSV source.)
 *         [
 *             ['language-code', 'en-US', 'en-GB'],
 *             ['flat-dessert', 'cookie', 'biscuit']
 *         ]
 *         The first row lists language codes to support and the first column lists keys. Using this
 *         format, all instances of {{flat-dessert}} found in the source code will be replaced with
 *         `cookie` in the `en-US` build and `biscuit` in the `en-GB` build. The first language listed
 *         is treated as the default language if a client browser language is not supported.
 *     .syntax (Array)
 *         This is a two-element array listing the parse characters to enclose language keys. It defaults
 *         to ['{{', '}}'] where language keys in code take the form of {{language-key}}.
 *         
 * config.builds[]
 *     .languageBuilds (boolean)
 *         If `true`, individual builds are made for each language. If `false` or not set, the given
 *         build will include all the languages, and have an .htaccess file included to load the correct
 *         version according to the client's accept-language header.
 *     .languages (Array)
 *         If set, this list of languages is compiled for the given build. If not set, the entire list as
 *         set by config.languages is used.
 *         
 */

(function(){
	if(isJIT){
		print('This plugin does not support in-browser compilation.');
		return;
	}

    var handleLanguageBuilds = function(build, languages, dictionary, config, syntax, builds){
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
    	hta    = null,
    	hta2   = '';

    	print('..Processing source files.');
    	for (i = build.files.length - 1; i >= 0; i--){
    		if(isHTACCESS(build.files[i].name)){
        		hta = build.files.splice(i,1)[0];
        		files.push(hta);
    	    	if(hta.content.indexOf('RewriteEngine on') < 0){
    	    		hta.content += '\nRewriteEngine on\n';
    	    	}
	    		hta.content += '\nRewriteCond %{REQUEST_FILENAME} !-f';
	    		hta.content += '\nRewriteRule ^$|^\\/$ index.html [NC]\n';
    		}
    	}
    	
    	for (i = languages.length - 1; i >= 0 ; i--){
    		if(languages[i]){
    			if(dictionary[languages[i]]){
    				print('..Creating "' + languages[i] + '" branch.');
    				createLanguageBranch(build.files, dictionary[languages[i]], config, syntax, files, languages[i]);

    				// .htaccess rules
    				if(hta){
   			    		hta.content += '\nRewriteCond %{HTTP:Accept-Language} ^' + languages[i] + ' ';
			    		hta.content += '\nRewriteCond %{REQUEST_FILENAME} !-f';
			    		hta.content += '\nRewriteRule ^index\\.html$ ' + languages[i] + '-index.html [L,NC]\n';

			    		// more liberal check if primary language isn't handled above.
			    		if(i > 0){ //exclude initial language since it's default
    			    		hta2 += '\nRewriteCond %{HTTP:Accept-Language} (' + languages[i] + ') ';
    					}
			    		hta2 += '\nRewriteCond %{REQUEST_FILENAME} !-f';
			    		hta2 += '\nRewriteRule ^index\\.html$ ' + languages[i] + '-index.html [L,NC]\n';
    				}
    			} else {
    				print('..No dictionary found for "' + languages[i] + '" (build "' + build.id + '").');
    			}
    		}
    	}
    	
    	if(hta){
    		hta.content += hta2;
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
   		return s.replace(/\\/g, '\\\\').replace(/\"/g, '\\"').replace(/\'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t').replace(/\b/g, '').replace(/\f/g, '\\f');
   	},
    translateFile = function(file, dictionary, syntax, js){
    	var key = '';
    	
    	if(js){
        	for (key in dictionary){
            	updateUK(key, file, syntax);
        		file = file.replace(new RegExp(escRegExp(syntax[0] + key + syntax[1]), 'g'), format(dictionary[key]));
        	}
    	} else {
        	for (key in dictionary){
            	updateUK(key, file, syntax);
        		file = file.replace(new RegExp(escRegExp(syntax[0] + key + syntax[1]), 'g'), dictionary[key]);
        	}
    	}
    	
    	return file;
    },
    updateUK = function(key, str, syntax){
    	for (var i = 0; i < unusedKeys.length; i++){
    		if(unusedKeys[i] === key){
    			if(str.indexOf(syntax[0] + key + syntax[1]) >= 0){
    				unusedKeys.splice(i,1);
    				break;
    			}
    		}
    	}
    },
    unusedKeys = [],
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
    
    source = langConfig.reference;
    
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
    
    for (var j = 0; j < source.length; j++){
    	if(source[j][0]){
        	unusedKeys.push(source[j][0]);
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
    if(unusedKeys.length){
        print('.The following keys are not used: ' + unusedKeys.toString());
    }
    print('Adding language builds.');
    for (buildIndex = 0; buildIndex < languageBuilds.length; buildIndex++){
        print('.Adding build "' + builds[buildIndex].id + '".');
    	builds.push(languageBuilds[buildIndex]);
    }
    
})();