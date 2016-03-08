/**
 * This class defines a generic iterable data object. It behaves similarly to Map but maintains a list of keys as an Array. It includes recycle methods to encourage reuse.
 * 
 * @namespace platypus
 * @class DataMap
 * @constructor
 * @return dataMap {platypus.DataMap} Returns the new DataMap object.
 * @uses Map
 * @since 0.8.0
 */
/*global platypus */
/*jslint plusplus:true */
platypus.DataMap = (function () {
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
            var i = keys.indexOf(key),
                value = this.get(key);
            
            if (i >= 0) {
                keys.greenSplice(i);
                this.delete(key);
            }
            
            return value;
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
        DataMap = function (first) {
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
                
                /**
                 * Returns the value of the provided key.
                 * 
                 * @method get
                 * @param key {String} The key to lookup.
                 * @return value {any} The value of the provded key.
                 */
                mm.get.value = map.get.bind(map);
                
                /**
                 * Determines whether the provided key is available on this DataMap.
                 * 
                 * @method has
                 * @param key {String} The key to lookup.
                 * @return value {Boolean} Whether the key is listed in this DataMap.
                 */
                mm.has.value = map.has.bind(map);
                
                /**
                 * Sets a value to a key in the DataMap.
                 * 
                 * @method set
                 * @param key {String} The key to associate with the provided value.
                 * @param value {any} The value to be stored by the DataMap.
                 * @return value {any} The value passed in is returned for chaining.
                 */
                mm.set.value = mapSet.bind(map, keys);
                
                /**
                 * Deletes a key (and value) from the DataMap.
                 * 
                 * @method delete
                 * @param key {String} The key to delete from the DataMap.
                 * @return value {any} The value of the key is returned.
                 */
                mm.delete.value = mapDelete.bind(map, keys);
                
                /**
                 * Clears out of keys (and values) from the DataMap.
                 * 
                 * @method clear
                 */
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
                        this.set(keys[i], first.get(keys[i]));
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
     * Returns DataMap from cache or creates a new one if none are available.
     * 
     * @method DataMap.setUp
     * @return dataMap {platypus.DataMap} The instantiated DataMap.
     */
    /**
     * Returns DataMap back to the cache. Prefer the DataMap's recycle method since it recycles property objects as well.
     * 
     * @method DataMap.recycle
     * @param dataMap {platypus.DataMap} The DataMap to be recycled.
     */
    /**
     * Relinquishes DataMap properties and recycles it.
     * 
     * @method recycle
     */
    platypus.setUpRecycle(DataMap, 'DataMap', function () {
        this.clear();
        DataMap.recycle(this);
    });
    
    return DataMap;
}());