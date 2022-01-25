/**
 * @memberof window
 */
/**
 * This class defines a limited polyfill for Map. If the browser supports Map, this class is not used.
 *
 * @class Map
 */
/* global window */
export default (function (Object) {
    var mapDefinition = null,
        Map = null,
        proto = null;
    
    if (!window.Map) {
        mapDefinition = {
            value: null
        };
        Map = function () {
            /**
             * This is an object containing a list of key/value pairs. This property should not be used directly.
             *
             * @property map
             * @type Object
             * @private
             * @default {}
             */
            mapDefinition.value = {};
            Object.defineProperty(this, 'map', mapDefinition);
        };
        proto = Map.prototype;

        Object.defineProperties(proto, {

            /**
             * Returns the value of the provided key.
             *
             * @method get
             * @param key {String} The key to lookup.
             * @return value {any} The value of the provded key.
             */
            get: {
                value: function (key) {
                    return this.map[key];
                }
            },

            /**
             * Determines whether the provided key is available in this Map.
             *
             * @method has
             * @param key {String} The key to lookup.
             * @return value {Boolean} Whether the key is listed in this Map.
             */
            has: {
                value: function (key) {
                    return this.map.hasOwnProperty(key);
                }
            },

            /**
             * Sets a value to a key in the Map.
             *
             * @method set
             * @param key {String} The key to associate with the provided value.
             * @param value {any} The value to be stored by the Map.
             * @chainable
             */
            set: {
                value: function (key, value) {
                    this.map[key] = value;
                    return this;
                }
            },
            
            /**
             * Deletes a key (and value) from the Map.
             *
             * @method delete
             * @param key {String} The key to delete from the Map.
             * @return value {any} The value of the key is returned.
             */
            delete: {
                value: function (key) {
                    var value = this.map[key];
                    
                    delete this.map[key];
                    return value;
                }
            }
        });
        
        window.Map = Map;
    }
}(Object));