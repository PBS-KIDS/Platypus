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
                    j = 0,
                    aL = this.length,
                    bL = array.length,
                    found = false;
                    
                for (i = 0; i < bL; i++) {
                    found = false;
                    for (j = 0; j < aL; j++) {
                        if (array[i] === this[j]) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        this.push(array[i]);
                    }
                }
                
                return this;
            }
		});
	}

}(Array, Object));