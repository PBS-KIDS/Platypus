/**
 *   If template.html is viewed, this script will load config.js and all of its referenced files to
 *   allow for testing a game without running one of the compiling scripts in tools/. This script is
 *   for testing, not deployment, as a just-in-time compiled game loads slower than a compiled build.
 *   
 *    NOTE: Due to XHR, template.html must be loaded from a web server (localhost is fine). Also,
 *    assets such as images may load fine when directly loading template.html if not referenced in
 *    config.json, but all assets must be listed in config.json to be included in the compiled build. 
 */

(function(){
	window.loadJS = loadJS = ['../tools/js/compile-game.js'];
    window.loadJSs = function(){
    	if(loadJS.length){
			var domElement = document.createElement('script');
			domElement.onload = loadJSs;
			domElement.setAttribute('type', 'text/javascript');
			domElement.setAttribute('src', loadJS.splice(0,1)[0]);
			document.getElementsByTagName('body')[0].appendChild(domElement);
    	}
    };
    loadJSs();
})();
