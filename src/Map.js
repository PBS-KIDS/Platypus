/**
 * This class defines a generic data object. It behaves similarly to (and extends) Map but maintains a list of keys as an Array. It includes recycle methods to encourage reuse.
 * 
 * @namespace platypus
 * @class Map
 * @constructor
 * @return {Map} Returns the new Map object.
 * @since 0.8.0
 */
/*global platypus */
/*jslint plusplus:true */
platypus.Map = (function () {
    "use strict";
    
    var mapSet = function (keys, key, value) {
            if (this.get(key) !== value) {
                if (!this.has(key)) {
                    keys.push(key);
                }
                this.set(key, value);
            }
            return value;
        },
        mapDelete = function (keys, key) {
            var i = keys.indexOf(key);
            
            if (i >= 0) {
                keys.greenSplice(i);
                return this.delete(key);
            }
        },
        mapClear = function (keys) {
            var i = keys.length;
            
            while (i--) {
                this.delete(keys[i]);
            }
            keys.length = 0;
        },
        mapMethods = {
            get: {
                value: null
            },
            has: {
                value: null
            },
            keys: {
                value: null
            },
            set: {
                value: null
            },
            delete: {
                value: null
            },
            clear: {
                value: null
            }
        },
        Map = function (first) {
            var i = arguments.length,
                key = '',
                keys = null,
                map = null,
                mm = null;
            
            if (!this.map) {
                mm = mapMethods;
                map = this.map = new window.Map;
                
                /**
                 * Tracks keys on this object to make iteration faster.
                 * 
                 * @property keys
                 * @type Array
                 * @default []
                 */
                keys = mm.keys.value = Array.setUp();
                mm.get.value = map.get.bind(map);
                mm.has.value = map.has.bind(map);
                mm.set.value = mapSet.bind(map, keys);
                mm.delete.value = mapDelete.bind(map, keys);
                mm.clear.value = mapClear.bind(map, keys);
                Object.defineProperties(this, mm);
            }
            
            if (first) {
                keys = first.keys;

                if (typeof first === 'string') {
                    if (i % 2) {
                        i -= 1;
                        this.set(arguments[i], null);
                    }
                    while (i) {
                        i -= 2;
                        this.set(arguments[i], arguments[i + 1]);
                    }
                } else if (keys) {
                    i = keys.length;
                    while (i--) {
                        this.set(keys[i], first[keys[i]]);
                    }
                } else {
                    for (key in first) {
                        if (first.hasOwnProperty(key)) {
                            this.set(key, first[key]);
                        }
                    }
                }
            }
        };
    
    /**
     * Returns Map from cache or creates a new one if none are available.
     * 
     * @method Map.setUp
     * @return {platypus.Map} The instantiated Map.
     */
    /**
     * Returns Map back to the cache. Prefer the Map's recycle method since it recycles property objects as well.
     * 
     * @method Map.recycle
     * @param {platypus.Map} The Map to be recycled.
     */
    /**
     * Relinquishes Map properties and recycles it.
     * 
     * @method recycle
     */
    platypus.setUpRecycle(Map, 'Map', function () {
        this.clear();
        Map.recycle(this);
    });
    
    return Map;
}());