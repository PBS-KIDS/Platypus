(function(){
   var shell  = new ActiveXObject("wscript.shell"),
   alert      = function(val){shell.Popup(val);},
   fileSystem = new ActiveXObject("Scripting.FileSystemObject"),
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
	   var arr = undefined, subDir = '', preArr = [], postArr = [];
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
	   }
	   return arr.join('/');
   },
   workingDir = '../src/data/',
   subDir     = '',
   gameConfig = getText(workingDir + 'config.json'),
   game       = eval('(' + gameConfig + ')'), //Using "eval" to allow comments in JSON config file
   scenes     = game.scenes,
   levels     = game.levels,
   entities   = game.entities,
   obj        = undefined;
   
    // Including json2.js to support JSON if it doesn't exist. - DDD
    include('js/json2.js');
   
    if(scenes){
 	   game.scenes = {};
 	   for (var scene in scenes){
 		   try {
 			   if(scenes[scene].src){
 				   obj = getJSON(workingDir + scenes[scene].src);
 				   subDir = workingDir + getSubDir(scenes[scene].src);
 				   if(obj.assets) for (var asset in obj.assets){
 					   if(obj.assets[asset].src) obj.assets[asset].src = fixUpPath(subDir + obj.assets[asset].src);
 				   }
 				   game.scenes[scenes[scene].id] = obj;
 			   } else {
 				   game.scenes[scenes[scene].id] = scenes[scene];
 			   }
 		   } catch(e) {
 			   alert('Error in processing scene "' + scene + '": ' + e.description);
 		   }
 	   }
    }

    if(levels){
 	   game.levels = {};
 	   for (var level in levels){
 		   try {
 			   if(levels[level].src){
 				   obj = getJSON(workingDir + levels[level].src);
 				   subDir = workingDir + getSubDir(levels[level].src);
 				   if(obj.tilesets) for (var asset in obj.tilesets){
 					   if(obj.tilesets[asset].image) obj.tilesets[asset].image = fixUpPath(subDir + obj.tilesets[asset].image);
 				   }
 				   game.levels[levels[level].id] = obj;
 			   } else {
 				   game.levels[levels[level].id] = levels[level];
 			   }
 		   } catch(e) {
 			   alert('Error in processing level "' + level + '": ' + e.description);
 		   }
 	   }
    }

   if(entities){
	   game.entities = {};
	   for (var entity in entities){
		   try {
			   if(entities[entity].src){
				   obj = getJSON(workingDir + entities[entity].src);
				   subDir = workingDir + getSubDir(entities[entity].src);
				   if(obj.assets) for (var asset in obj.assets){
					   if(obj.assets[asset].src) obj.assets[asset].src = fixUpPath(subDir + obj.assets[asset].src);
				   }
				   game.entities[entities[entity].id] = obj;
			   } else {
				   game.entities[entities[entity].id] = entities[entity];
			   }
		   } catch(e) {
			   alert('Error in processing entity "' + entity + '": ' + e.description);
		   }
	   }
   }
   
   //Fix up relative paths on Game Assets
   if (game.assets) for (var asset in game.assets){
	   if(game.assets[asset].src) game.assets[asset].src = fixUpPath(workingDir + game.assets[asset].src);
   }

   //Fix up relative paths on Code Assets
   if (game.components) for (var asset in game.components){
	   if(game.components[asset].src) game.components[asset].src = fixUpPath(workingDir + game.components[asset].src);
   }
   if (game.includes) for (var asset in game.includes){
	   if(game.includes[asset].src && (game.includes[asset].src.substring(0,4).toLowerCase() !== 'http')) game.includes[asset].src = fixUpPath(workingDir + game.includes[asset].src);
   }
   
   //insert entities and scenes into compiled config file
   setJSON('config.json', game);
})();
