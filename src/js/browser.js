(function(){
	var uagent   = navigator.userAgent.toLowerCase(),
	    
	    myAudio  = document.createElement('audio'),
	    doc      = document.documentElement,
	    manifest = doc.getAttribute("manifest"),
	    newManifest = '',
	    
	    supports = {
			canvas:      false, // determined below
			touch:       TouchEvent in window,

			// specific browsers as determined above
			iPod:      (uagent.search('ipod')    > -1),
			iPhone:    (uagent.search('iphone')  > -1),
			iPad:      (uagent.search('ipad')    > -1),
			safari:    (uagent.search('safari')  > -1),
			ie:        (uagent.search('msie')    > -1),
		    firefox:   (uagent.search('firefox') > -1),
			android:   (uagent.search('android') > -1),
			silk:      (uagent.search('silk')    > -1),
			iOS:       false, //determined below
			mobile:    false, //determined below
			desktop:   false, //determined below
			
			// audio support as determined below
			ogg:         true,
			m4a:         true,
			mp3:         true
		},
	    aspects = platformer.settings.aspects,
	    supportsAspects = {},
	    i = 0,
	    j = 0,
	    divider = '',
	    foundSupportedAspect = false;
	
	supports.iOS     = supports.iPod || supports.iPhone  || supports.iPad;
	supports.mobile  = supports.iOS  || supports.android || supports.silk;
	supports.desktop = !supports.mobile;
	
	// Determine audio support
	if ((myAudio.canPlayType) && !(!!myAudio.canPlayType && "" != myAudio.canPlayType('audio/ogg; codecs="vorbis"'))){
	    supports.ogg = false;
	    if(supports.ie || !(!!myAudio.canPlayType && "" != myAudio.canPlayType('audio/mp4'))){
	    	supports.m4a = false; //make IE use mp3's since it doesn't like the version of m4a made for mobiles
	    }
	}

	// Does the browser support canvas?
	var canvas = document.createElement('canvas');
	try	{
		supports.canvas = !!(canvas.getContext('2d')); // S60
	} catch(e) {
		supports.canvas = !!(canvas.getContext); // IE
	}
	delete canvas;

	//Turn off manifest for firefox and iOS since they show awkward pop-ups about storage - DDD
	if(supports.firefox || supports.iOS){
		doc.removeAttribute("manifest");
	}

	
	/* 
	 * Handle app cache here so we do not download assets a browser cannot use.
	 */

	//Determine relevant aspects:
	if(aspects){
		for (i in aspects){
		    foundSupportedAspect = false;
			for(j in aspects[i]){
				if(!foundSupportedAspect && supports[aspects[i][j]]){
					supportsAspects[aspects[i][j]] = supports[aspects[i][j]];
				    newManifest += divider + aspects[i][j];
				    divider = '-';
					foundSupportedAspect = true;
				}
			}
		    if(!foundSupportedAspect){
		    	console.warn('Your browser does not seem to support any of these options: ' + aspects[i].join(', '));
		    }
		}
		//replace settings aspects build array with actual support of aspects
		platformer.settings.aspects = supportsAspects;
	} else {
		platformer.settings.aspects = [];
	}
	if(manifest){
		doc.setAttribute("manifest", newManifest + '.manifest');
	}

})();
