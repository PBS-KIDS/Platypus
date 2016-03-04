/**
 * @namespace window
 */
/**
 * This class defines a limited polyfill for Map.
 * 
 * @class Map
 * 
 */
if (!window.Map) {
    (function (Object) {
        var mapDefinition = {
                value: null
            },
            Map = function () {
                mapDefinition.value = {};
                Object.defineProperty(this, 'map', mapDefinition);
            },
            proto = Map.prototype;

        Object.defineProperties(proto, {
            get: {
                value: function (key) {
                    return this.map[key];
                }
            },
            has: {
                value: function (key) {
                    return this.map.hasOwnProperty(key);
                }
            },
            set: {
                value: function (key, value) {
                    this.map[key] = value;
                    return this;
                }
            },
            delete: {
                value: function (key) {
                    var value = this.map[key];
                    
                    delete this.map[key];
                    return value;
                }
            }
        });
    }(Object));
}