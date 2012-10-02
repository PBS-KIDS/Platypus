/*
 * gws.browserCheck() should be called once the document is loaded to determine what's supported.
 * Ideally run it once and store the checks so it's a simple variable request when you need to
 * know whether something is supported. Like so:
 * 
 *     gws.browser = gws.browserCheck();
 *     
 *     elsewhere:
 *     
 *     if(gws.browser.transitions) {
 *         Implement something that uses transitions
 *     } else {
 *         Alternative for browsers who don't
 *     }
 *     
 * - DDD
 */
(function(){
	var uagent   = navigator.userAgent.toLowerCase(),
        iPod     = (uagent.search('ipod')    > -1),
        iPhone   = (uagent.search('iphone')  > -1),
        iPad     = (uagent.search('ipad')    > -1),
        safari   = (uagent.search('safari')  > -1),
        ie       = (uagent.search('msie')    > -1),
        android  = (uagent.search('android') > -1),
        silk     = (uagent.search('silk')    > -1),
	    firefox  = (uagent.search('firefox') > -1),
	    
	    myAudio  = document.createElement('audio'),
	    doc      = document.documentElement,
	    manifest = doc.getAttribute("manifest"),
	    
	    supportsOgg = true,
	    supportsM4a = true,
	    
	    supportsTouch = TouchEvent in window;
	
	//Turn off manifest for firefox and iOS since they show awkward pop-ups about storage - DDD
//	if(firefox || iPad || iPod || iPhone){
//		document.documentElement.removeAttribute("manifest");
//	}

	//Determine relevant aspects:
	if ((myAudio.canPlayType) && !(!!myAudio.canPlayType && "" != myAudio.canPlayType('audio/ogg; codecs="vorbis"'))){
	    supportsOgg = false;
	    if(ie || !(!!myAudio.canPlayType && "" != myAudio.canPlayType('audio/mp4'))){
	    	supportsM4a = false; //make IE use mp3's since it doesn't like the version of m4a made for mobiles
	        if(manifest) doc.setAttribute("manifest", manifest.replace('ogg','mp3'));
	    } else {
	        if(manifest) doc.setAttribute("manifest", manifest.replace('ogg','m4a'));
	    }
	}
	
	/* 
	 * Handle app cache here so we don't download assets a browser can't use.
	 */
	if(manifest){
		
	}
	
	gws.browserCheck = function(){
		var checks = {
			canvas:      false,
			mobile:      false,
			webgl:       false,
			transitions: false,
			progress:    false,
			css3dTransforms:false,
			
			// specific browsers as determined above
			iPod:        iPod,
			iPhone:      iPhone,
			iPad:        iPad,
			iOS:         iPod || iPhone || iPad,
			safari:      safari,
			ie:          ie,
			android:     android,
			silk:        silk,
			
			// audio support as determined above
			ogg:         supportsOgg,
			m4a:         supportsM4a,
			
			touch:       supportsTouch
		};
		
		// Does the browser support canvas?
		var canvas = document.createElement('canvas');
		try
		{
			checks.canvas = !!(canvas.getContext('2d')); // S60
		} catch(e) {
			checks.canvas = !!(canvas.getContext); // IE
		}
		delete canvas;
		
		// Does the browser support webgl?
		checks.webgl = false;
		if (window.WebGLRenderingContext)
		{
			try{if (document.createElement('canvas').getContext("webgl")) checks.webgl = true;}catch(e){}
			try{if (document.createElement('canvas').getContext("experimental-webgl")) checks.webgl = true;}catch(e){}
		} 
		
		// Are transitions supported?
	    var div = document.createElement('div');
	    div.setAttribute('style', 'transition:top 1s ease;-webkit-transition:top 1s ease;-moz-transition:top 1s ease;-o-transition:top 1s ease;');
	    checks.transitions = !!((div.style.transition || div.style.webkitTransition || div.style.MozTransition || div.style.OTransition) && !(document.all)); // the last bit knocks out IE9 since it returns true for transitions support but doesn't actually support them.
	    delete div;
	    
	    if(window.Modernizr) checks.css3dTransforms = Modernizr.csstransforms3d;
	    
	    // Does it support the progress bar?
	    checks.progress = ('position' in document.createElement('progress'));
	    
	    checks.mobile = checks.android || checks.iOS || checks.silk;
	    
	    return checks;
	};
})();
