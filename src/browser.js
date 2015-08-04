/**
# Function
Browser.js is one large function that is used to discover what browser is being used the capabilities of the browser. In addition to browser type, we determine whether it is mobile or desktop, whether it supports multi or single-touch, what type of audio it can play, and whether it supports canvas or not. 
All of this information is added to platypus.supports and used throughout the code, including when determining which layers to display (e.g. adding a button layer for mobile devices), and in audio so that we load and play the correct sound types.
* 
*/
/*global console, createjs, platypus */
(function () {
    "use strict";
    
    var uagent   = navigator.userAgent.toLowerCase(),
        
        myAudio  = document.createElement('audio'),
        supports = {
            touch:       (window.ontouchstart !== 'undefined'),

            // specific browsers as determined above
            iPod:        (uagent.search('ipod')    > -1),
            iPhone:      (uagent.search('iphone')  > -1),
            iPad:        (uagent.search('ipad')    > -1),
            safari:      (uagent.search('safari')  > -1),
            ie:          (uagent.search('msie')    > -1) || (uagent.search('trident') > -1),
            firefox:     (uagent.search('firefox') > -1),
            android:     (uagent.search('android') > -1),
            chrome:      (uagent.search('chrome')  > -1),
            silk:        (uagent.search('silk')    > -1),
            iPhone4:     false, //determined below
            iPad2:       false, //determined below
            iOS:         false, //determined below
            mobile:      false, //determined below
            desktop:     false, //determined below
            audioAPI:    false, //determined below
            
            // audio support as determined below
            ogg:         true,
            m4a:         true,
            mp3:         true
        };
    
    supports.iPhone4 = supports.iPhone && (window.screen.height === (960 / 2));
    supports.iPad2   = supports.iPad && (!window.devicePixelRatio || (window.devicePixelRatio === 1));
    supports.iOS     = supports.iPod || supports.iPhone  || supports.iPad;
    supports.mobile  = supports.iOS  || supports.android || supports.silk;
    supports.desktop = !supports.mobile;
    supports.audioAPI = !supports.iOS || (!supports.iPad2 && !supports.iPhone4);
    
    // Determine audio support
    if ((myAudio.canPlayType) && !(!!myAudio.canPlayType && "" !== myAudio.canPlayType('audio/ogg; codecs="vorbis"'))) {
        supports.ogg = false;
        if (supports.ie || !(!!myAudio.canPlayType && "" !== myAudio.canPlayType('audio/mp4'))) {
            supports.m4a = false; //make IE use mp3's since it doesn't like the version of m4a made for mobiles
        }
    }

    // Handle audio loading on distinct browsers.
    if (window.createjs && createjs.Sound) {

        // Allow iOS 5- to play HTML5 audio. (Otherwise there is no audio support for iOS 5-.)
        if (createjs.HTMLAudioPlugin) {
            createjs.HTMLAudioPlugin.enableIOS = true;
        }
        
        if (!supports.audioAPI) { // older versions of iOS Safari seem to crash when loading large audio files unless we go this route.
            createjs.Sound.registerPlugins([createjs.HTMLAudioPlugin]);
            //hijacking asset list: //TODO: add time to end of clips here.
            
        } else if (supports.ie) { // HTML5 audio in IE is not performing well, so we use Flash if it's available.
            createjs.FlashPlugin.swfPath = "./";
            createjs.Sound.registerPlugins([createjs.FlashPlugin, createjs.HTMLAudioPlugin]);
        } else {
            createjs.Sound.initializeDefaultPlugins();
        }
        
        supports.audioAPI = (createjs.Sound.activePlugin.toString() === "[WebAudioPlugin]");
    }
    
    platypus.supports = supports;

}());
