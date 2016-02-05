/**
 * @namespace window
 */
(function (String, Object) {
	/**
	 * Add methods to String
	 * @class String
	 */
    
    var prototype = String.prototype;

    /**
     * Splits, but uses a recycled array.
     * 
     * @method greenSplit
     * @return Array
     */
	if (!prototype.greenSplit) {
		Object.defineProperty(prototype, 'greenSplit', {
			enumerable: false,
			writable: false,
			value: function (splitter) {
                var str = this,
                    d = 0,
                    i = 0,
                    arr = Array.setUp();
                
                if (splitter) {
                    i = str.indexOf(splitter);
                    d = splitter.length;

                    while (i >= 0) {
                        arr.push(str.substr(0, i));
                        str = str.substr(i + d);
                        i = str.indexOf(splitter);
                    }
                    
                    arr.push(str);
                } else {
                    i = this.length;
                    d = i - 1;

                    while (i--) {
                        arr.push(this[d - i]);
                    }
                }
                
                return arr;
            }
		});
	}
}(String, Object));