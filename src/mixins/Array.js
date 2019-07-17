/**
 * @namespace window
 */
import config from 'config';
import recycle from 'recycle';

export default (function (Array, Object) {
    /**
     * Add methods to Array
     * @class Array
     */
    var prototype = Array.prototype;

    /**
     * Merges a given array into the current array without duplicating items.
     *
     * @method union
     * @return {Array}
     * @chainable
     */
    if (!prototype.union) {
        Object.defineProperty(prototype, 'union', {
            value: function (array) {
                var i = 0,
                    bL = array.length;
                    
                for (i = 0; i < bL; i++) {
                    if (this.indexOf(array[i]) === -1) {
                        this.push(array[i]);
                    }
                }
                
                return this;
            }
        });
    }
    
    /**
     * Slices, but uses a recycled array. Note that this slice does not accept parameters and makes a shallow copy of the original array.
     *
     * @method greenSlice
     * @return Array
     */
    if (!prototype.greenSlice) {
        Object.defineProperty(prototype, 'greenSlice', {
            value: function () {
                var arr = Array.setUp(),
                    i = 0,
                    length = this.length;
                    
                for (i = 0; i < length; i++) {
                    arr[i] = this[i];
                }
                
                return arr;
            }
        });
    }
    
    /**
     * Splices, but only removes a single item and returns the item itself, not an array.
     *
     * @method greenSplice
     * @return Array
     */
    if (!prototype.greenSplice) {
        Object.defineProperty(prototype, 'greenSplice', {
            value: function (index) {
                var i = 0,
                    item = this[index],
                    length = this.length;
                    
                if ((index < 0) || (index >= length)) {
                    return null;
                }
                
                for (i = index + 1; i < length; i++) {
                    this[i - 1] = this[i];
                }
                
                if (length) {
                    this.length -= 1;
                }
                
                return item;
            }
        });
    }
    
    /**
     * Save instance for reuse.
     *
     * @method Array.recycle
     * @param instance {Array} The instance to recycle.
     * @since 0.7.1
     */
    /**
     * Save instance for reuse.
     *
     * @method recycle
     * @param [depth] {Number} The dimensions of the array.
     * @since 0.7.1
     */
    /**
     * Create a new instance or reuse an old instance if available.
     *
     * @method Array.setUp
     * @param [item] {Object|String|Number|Boolean} One or more arguments to prepopulate items in the array.
     * @return Array
     * @since 0.7.1
     */
    recycle.add(Array, config.dev, 'Array');

}(Array, Object));