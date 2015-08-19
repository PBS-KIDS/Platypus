/**
 * This is used to discover what browser is being used and the capabilities of the browser. In addition to browser type, we determine whether it is mobile or desktop, whether it supports multi or single-touch, what type of audio it can play, and whether it supports canvas or not. All of this information is added to `platypus.supports`.
 * 
 */
 
/*global console, createjs, platypus */
(function () {
    "use strict";
    
    var uagent   = navigator.userAgent.toLowerCase(),
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
            desktop:     false  //determined below
        };
    
    supports.iPhone4 = supports.iPhone && (window.screen.height === (960 / 2));
    supports.iPad2   = supports.iPad && (!window.devicePixelRatio || (window.devicePixelRatio === 1));
    supports.iOS     = supports.iPod || supports.iPhone  || supports.iPad;
    supports.mobile  = supports.iOS  || supports.android || supports.silk;
    supports.desktop = !supports.mobile;
    
    platypus.supports = supports;
}());
