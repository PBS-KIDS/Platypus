/**
 * @module platypus
 * @namespace platypus
 */
/* global springroll, navigator, window */
this.platypus = this.platypus || {};

(function (platypus) {
    'use strict';

    var doNothing = function () {},
        uagent    = navigator.userAgent.toLowerCase(),
        isEdge    = (uagent.search('edge')    > -1),
        isIPod    = (uagent.search('ipod')    > -1),
        isIPhone  = (uagent.search('iphone')  > -1),
        isIPad    = (uagent.search('ipad')    > -1 || navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
        isAndroid = (uagent.search('android') > -1),
        isSilk    = (uagent.search('silk')    > -1),
        isIOS     = isIPod || isIPhone  || isIPad,
        isMobile  = isIOS  || isAndroid || isSilk;

    /**
     * This is an object of boolean key/value pairs describing the current browser's properties.
     * @property supports
     * @type Object
     **/
    platypus.supports = {
        touch: (window.ontouchstart !== 'undefined'),
        edge: isEdge,
        iPod: isIPod,
        iPhone: isIPhone,
        iPad: isIPad,
        safari: (uagent.search('safari')  > -1) && !isEdge,
        ie: (uagent.search('msie')    > -1) || (uagent.search('trident') > -1),
        firefox: (uagent.search('firefox') > -1),
        android: isAndroid,
        chrome: (uagent.search('chrome')  > -1) && !isEdge,
        silk: isSilk,
        iOS: isIOS,
        mobile: isMobile,
        desktop: !isMobile
    };
    
    /**
     * This method defines platypus.debug and uses springroll.Debug if available. If springroll.Debug is not loaded, platypus.debug provides inactive stubs for console methods.
     *
     * @property debug
     * @type Object
     */
    platypus.debug = springroll.Debug || {
        error: doNothing,
        log: doNothing,
        olive: doNothing, // Platypus favors olive output to distinguish its output from other console logs.
        warn: doNothing
    };

    /**
     * The version string for this release.
     * @property version
     * @type String
     * @static
     **/
    platypus.version = /*=version*/""; // injected by build process

    /**
     * The build date for this release in UTC format.
     * @property buildDate
     * @type String
     * @static
     **/
    platypus.buildDate = /*=date*/""; // injected by build process

}(this.platypus));
