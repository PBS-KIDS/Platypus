/**
 * This class defines a generic data object to use for messaging. It includes recycle methods to encourage reuse.
 * 
 * @namespace platypus
 * @class Data
 * @constructor
 * @return {Data} Returns the new Data object.
 */
/*global platypus */
platypus.Data = (function () {
    "use strict";
    
    var Data = function () {
            var i = arguments.length;
            
            if (i) {
                if (i % 2) {
                    this[i] = null;
                    i -= 1;
                } 
                while (i) {
                    this[arguments[i - 2]] = arguments[i - 1];
                    i -= 2;
                }
            }
        },
        proto = Data.prototype;
    
    /**
     * Returns Data from cache or creates a new one if none are available.
     * 
     * @method Data.setUp
     * @return {platypus.Data} The instantiated Data.
     * @since 0.7.1
     */
    /**
     * Returns Data back to the cache. Prefer the Data's recycle method since it recycles property objects as well.
     * 
     * @method Data.recycle
     * @param {platypus.Data} The Data to be recycled.
     * @since 0.7.1
     */
    platypus.setUpRecycle(Data, 'Data');
    
    /**
     * Relinquishes Data properties and recycles it.
     * 
     * @method recycle
     * @since 0.7.1
     */
    proto.recycle = function () {
        var key = '';
        
        for (key in this) {
            if (this.hasOwnProperty(key)) {
                delete this[key];
            }
        }
        Data.recycle(this);
    };
    
    return Data;
}());