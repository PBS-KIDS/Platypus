/**
 * @namespace window
 */
import config from 'config';
import recycle from 'recycle';

export const arrayCache = recycle.add(Array, 'Array', null, null, false, config.dev);

/**
 * Merges items from one array into the other, making sure to not duplicate identical entries.
 *
 * @method union
 * @param arrayTo {Array} The array into which items will be inserted.
 * @param arrayFrom {Array} The array containing items to be merged.
 * @return Array
 */
export function union (arrayTo, arrayFrom) {
    var i = 0,
        bL = arrayFrom.length;
        
    for (i = 0; i < bL; i++) {
        if (arrayTo.indexOf(arrayFrom[i]) === -1) {
            arrayTo.push(arrayFrom[i]);
        }
    }
    
    return arrayTo;
}

/**
 * Slices, but uses a recycled array. Note that this slice does not accept parameters and makes a shallow copy of the original array.
 *
 * @method greenSlice
 * @param array {Array} The array to copy.
 * @return Array
 */
export function greenSlice (array) {
    var arr = arrayCache.setUp(),
        i = 0,
        length = array.length;
        
    for (i = 0; i < length; i++) {
        arr[i] = array[i];
    }
    
    return arr;
}

/**
 * Splices, but only removes a single item and returns the item itself, not an array.
 *
 * @method greenSplice
 * @param array {Array} The array from which an item is to be extracted.
 * @param index {Number} The index of the item to extract.
 * @return {any}
 */
export function greenSplice (array, index) {
    var i = 0,
        item = array[index],
        length = array.length;
        
    if ((index < 0) || (index >= length)) {
        return null;
    }
    
    for (i = index + 1; i < length; i++) {
        array[i - 1] = array[i];
    }
    
    if (length) {
        array.length -= 1;
    }
    
    return item;
}