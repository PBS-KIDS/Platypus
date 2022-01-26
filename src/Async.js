/*global clearTimeout, setTimeout */
import config from 'config';
import recycle from 'recycle';

export default (function () {
    var callback = function (finalCB) {
            this.increment -= 1;
            if (!this.increment) {
                this.resolve = finalCB;
                this.timeout = setTimeout(finalCB, 0); //ensure async to keep code flow consistent.
            }
        },
        final = function (callback) {
            this.resolve = null;
            callback();
            this.recycle();
        },
        /**
         * This class defines an asynchronous set up wherein multiple calls can be made and a final function will be run once the calls are completed. Something like `Promise.all` but better for avoiding garbage collection.
         *
         * @memberof platypus
         * @class Async
         * @param functions {Array} An array of functions where each function accepts a `callback` parameter and runs `callback()` on completion to notify the completion of the call.
         * @param callback {Function} The function to run once the list of functions has finished.
         * @return {platypus.Async} Returns the new Async object.
         */
        Async = function (arr, finalCallback) {
            const finalCB = final.bind(this, finalCallback),
                length = arr.length;

            if (!length) {
                this.resolve = finalCB;
                this.timeout = setTimeout(finalCB, 0); //ensure async to keep code flow consistent.
            } else {
                const cb = callback.bind(this, finalCB);
                let i = 0;

                this.increment = length;
                this.resolve = null;

                for (i = 0; i < length; i++) {
                    arr[i](cb);
                }
            }
        };

    /**
     * Attempts to resolve the async call immediately if possible.
     *
     * @method platypus.Async#attemptResolution
     * @return {Boolean} Returns `true` if async is done, `false` if not.
     */
    Async.prototype.attemptResolution = function () {
        if (this.resolve) {
            clearTimeout(this.timeout);
            this.resolve();
            return true;
        } else {
            return false;
        }
    };
    
    /**
     * Returns an Async from cache or creates a new one if none are available.
     *
     * @method platypus.Async.setUp
     * @return {platypus.Async} The instantiated Async.
     */
    /**
     * Returns an Async back to the cache.
     *
     * @method platypus.Async.recycle
     * @param async {platypus.Async} The Async to be recycled.
     */
    /**
     * Relinquishes properties of the Async and recycles it.
     *
     * @method platypus.Async#recycle
     */
    recycle.add(Async, 'Async', Async, function () {
        this.increment = 0;
        this.resolve = null;
        this.timeout = 0;
    }, true, config.dev);

    return Async;
}());