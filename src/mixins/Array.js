/**
 * @namespace window
 */
(function (Array, Object) {
	/**
	 * Add methods to Array
	 * @class Array
	 */
    
    var cache = [],
        recycleProps = {
            recycleIndex: {
                enumerable: false,
                value: 1,
                writable: true
            },
            recycled: {
                enumerable: false,
                value: true,
                writable: true
            }
        },
        prototype = Array.prototype;

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
    
    /**
     * Create a new instance or reuse an old instance if available.
     * 
     * @method Array.setUp
     * @return Array
     */
    Array.setUp = function () {
        var i = 0,
            arr = null;
        
        if (cache.length) {
            arr = cache.pop();
        } else {
            arr = [];
        }
        
        arr.recycled = false;
        
        for (i = 0; i < arguments.length; i++) {
            arr.push(arguments[i]);
        }

        return arr;
    };
        
    /**
     * Save instance for reuse.
     * 
     * @method Array.recycle
     * @param instance {Array} The instance to recycle.
     * @param [depth] {Number} The dimensions of the array.
     */
    Array.recycle = function (instance, depth) {
        var i = 0;
        
        if (depth && depth > 1) {
            for (i = 0; i < instance.length; i++) {
                Array.recycle(instance[i], depth - 1);
            }
        }
        
        if (instance.recycleIndex) {
            instance.recycleIndex += 1;
            instance.recycled = true;
        } else {
            Object.defineProperties(instance, recycleProps);
        }
        instance.length = 0;
        cache.push(instance);
    };

    /**
     * Save instance for reuse.
     * 
     * @method recycle
     * @param [depth] {Number} The dimensions of the array.
     */
	if (!prototype.recycle) {
		Object.defineProperty(prototype, 'recycle', {
			enumerable: false,
			writable: false,
			value: function (depth) {
                Array.recycle(this, depth);
            }
		});
	}
    
    window.getArrayCache = function () {return cache};
}(Array, Object));