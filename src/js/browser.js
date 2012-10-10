(function(){
	var uagent   = navigator.userAgent.toLowerCase(),
	    
	    myAudio  = document.createElement('audio'),
	    
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
	    k = 0,
	    foundAspect = false,
	    listAspects = '';
	
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

		//replace settings aspects build array with actual support of aspects
		platformer.settings.aspects = supportsAspects;
	platformer.settings.aspects = {};
	for (i in aspects){
		foundAspect = false;
		listAspects = '';
		for (j in aspects[i]){
			listAspects += ' ' + j;
			for (k in aspects[i][j]){
				if (uagent.search(aspects[i][j][k]) > -1){
					platformer.settings.aspects[j] = true;
					foundAspect = true;
					break;
				}
			}
			if(foundAspect) break;
		}
		if(!foundAspect){
			console.warn('This browser doesn\'t support any of the following: ' + listAspects);
		}
	}

})();
