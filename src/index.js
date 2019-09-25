/**
 * @module platypus
 * @namespace platypus
 */
/* global global, navigator, require, window */

import DataMap from './DataMap.js';
import {Debugger} from 'springroll';
import Game from './Game.js';
import config from 'config';
import factory from './factory.js';

export * from './utils/array.js';
export * from './utils/string.js';
export {default as recycle} from 'recycle';
export {default as AABB} from './AABB.js';
export {default as ActionState} from './ActionState.js';
export {default as Async} from './Async.js';
export {default as CollisionData} from './CollisionData.js';
export {default as CollisionDataContainer} from './CollisionDataContainer.js';
export {default as CollisionShape} from './CollisionShape.js';
export {default as Component} from './Component.js';
export {default as Data} from './Data.js';
export {default as DataMap} from './DataMap.js';
export {default as Entity} from './Entity.js';
export {default as Game} from './Game.js';
export {default as Messenger} from './Messenger.js';
export {default as PIXIAnimation} from './PIXIAnimation.js';
export {default as Scene} from './Scene.js';
export {default as StateMap} from './StateMap.js';
export {default as Vector} from './Vector.js';

export default (function () {
    var platypus = global.platypus = {},
        debugWrapper = Debugger ? function (method, ...args) {
            Debugger.log(method, ...args);
        } : function (method, ...args) {
            window.console[method](...args);
        },
        log = config.dev ? debugWrapper : function () {},
        uagent    = navigator.userAgent.toLowerCase(),
        isEdge    = (uagent.search('edge')    > -1),
        isIPod    = (uagent.search('ipod')    > -1),
        isIPhone  = (uagent.search('iphone')  > -1),
        isIPad    = (uagent.search('ipad')    > -1),
        isAndroid = (uagent.search('android') > -1),
        isSilk    = (uagent.search('silk')    > -1),
        isIOS     = isIPod || isIPhone  || isIPad,
        isMobile  = isIOS  || isAndroid || isSilk,
        importAll = function (r) {
            r.keys().forEach((key) => {
                var arr = key.split('/'),
                    last = arr.length - 1;
                
                platypus.components[arr[last].substring(0, arr[last].length - 3)] = r(key).default;
            });
        };

    platypus.components = {};
    platypus.createComponentClass = factory;

    importAll(require.context(
        "./components/", // context folder
        true, // include subdirectories
        /.*\.js/ // RegExp
    ));

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
    platypus.debug = {
        general: log.bind(null, 'log'),
        log: log.bind(null, 'log'),
        warn: log.bind(null, 'warn'),
        debug: log.bind(null, 'debug'),
        error: log.bind(null, 'error'),
        olive: log.bind(null, 'log') // Backwards compatibility - need to deprecate.
    };

    platypus.assetCache = DataMap.setUp();

    /**
     * The version string for this release.
     * @property version
     * @type String
     * @static
     **/
    platypus.version = config.version;

    /**
     * The build date for this release in UTC format.
     * @property buildDate
     * @type String
     * @static
     **/
    platypus.buildDate = config.buildDate;

    platypus.Game = Game;

    return platypus;
}());