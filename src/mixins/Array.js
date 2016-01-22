/**
 * @namespace window
 */
(function (Array, Object) {
	/**
	 * Add methods to Array
	 * @class Array
	 */

	/**
	 * Merges a given array into the current array without duplicating items.
     * 
	 * @method union
     * @return {Array}
     * @chainable
	 */
	if (!Array.prototype.union) {
		Object.defineProperty(Array.prototype, 'union', {
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

}(Array, Object));