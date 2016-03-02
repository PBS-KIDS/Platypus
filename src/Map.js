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
    
    var keysDefinition = {
            value: null
        },
        Map = function (first) {
            var i = arguments.length,
                key = '',
                keys = null;
            
            if (!this.keys) {
                /**
                 * Tracks keys on this object to make iteration faster.
                 * 
                 * @property keys
                 * @type Array
                 * @default []
                 */
                keysDefinition.value = Array.setUp();
                Object.defineProperty(this, 'keys', keysDefinition);
                Map.call(this);
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
        },
        proto = extend(Map, window.Map);
    
    proto.mapSet = proto.set;
    proto.mapDelete = proto.delete;

    Object.defineProperties(proto, {
        set: {
            value: function (key, value) {
                if (this.get(key) !== value) {
                    if (!this.has(key)) {
                        this.keys.push(key);
                    }
                    this.mapSet(key, value);
                }
                return value;
            }
        },
        delete: {
            value: function (key) {
                var i = this.keys.indexOf(key);
                
                if (i >= 0) {
                    this.keys.greenSplice(i);
                    return this.mapDelete(key);
                }
            }
        },
        clear: {
            value: function () {
                var keys = this.keys,
                    i = keys.length;
                
                while (i--) {
                    this.mapDelete(keys[i]);
                }
                keys.length = 0;
            }
        }
    });
        
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