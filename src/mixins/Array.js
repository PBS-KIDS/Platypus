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
            enumerable: false,
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
			enumerable: false,
			writable: false,
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
			enumerable: false,
			writable: false,
			value: function () {
                var i = 0,
                    arr = Array.setUp();
                    
                for (i = 0; i < this.length; i++) {
                    arr.push(this[i]);
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
			enumerable: false,
			writable: false,
			value: function (index) {
                var i = 0,
                    item = this[index];
                    
                for (i = index + 1; i < this.length; i++) {
                    this[i - 1] = this[i];
                }
                
                if (this.length) {
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
        cache = platypus.setUpRecycle(Array, 'Array');
        
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

        /**
         * Save instance for reuse.
         * 
         * @method recycle
         * @param [depth] {Number} The dimensions of the array.
         * @since 0.7.1
         */
		Object.defineProperty(prototype, 'recycle', {
			enumerable: false,
			writable: false,
			value: function (depth) {
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
            }
		});
	}
}(Array, Object));