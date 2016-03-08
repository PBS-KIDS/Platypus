/**
 * @namespace window
 */
/*global springroll */
(function (Array, Object) {
	/**
	 * Add methods to Array
	 * @class Array
	 */
    var cache = null,
        debug = !!springroll.Debug,
        prototype = Array.prototype,
        recycleProp = {
            value: false,
            writable: true
        };

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
                    return;
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
    
	if (!prototype.recycle) {
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
        cache = platypus.setUpRecycle(Array, 'Array', function (depth) {
            var i = 0;
            
            if (depth > 1) {
                i = this.length;
                depth -= 1;
                while (i--) {
                    this[i].recycle(depth);
                }
            }
            this.length = 0;
            Array.recycle(this);
        });
        
        /**
         * Create a new instance or reuse an old instance if available.
         * 
         * @method Array.setUp
         * @param [item] {Object|String|Number|Boolean} One or more arguments to prepopulate items in the array.
         * @return Array
         * @since 0.7.1
         */
        if (debug) {
            Array.setUp = function () {
                var i = 0,
                    arr = null;
                
                if (cache.length) {
                    arr = cache.pop();
                    arr.recycled = false;
                } else {
                    arr = [];
                    Object.defineProperty(arr, 'recycled', recycleProp);
                }
                
                for (i = 0; i < arguments.length; i++) {
                    arr.push(arguments[i]);
                }

                return arr;
            };
        } else {
            Array.setUp = function () {
                var i = 0,
                    arr = null;
                
                if (cache.length) {
                    arr = cache.pop();
                } else {
                    arr = [];
                }
                
                for (i = 0; i < arguments.length; i++) {
                    arr.push(arguments[i]);
                }

                return arr;
            };
        }
	}
}(Array, Object));