import config from 'config';
import recycle from 'recycle';

export const arrayCache = recycle.add(Array, 'Array', null, null, false, config.dev);

/**
 * Merges items from one array into the other, making sure to not duplicate identical entries.
 *
 * @method union
 * @param arrayTo {Array} The array into which items will be inserted.
 * @param ...arrayFrom {Array} The array(s) containing items to be merged.
 * @return Array
 */
export function union (arrayTo, ...arrayFrom) {

    for (let i = 0; i < arrayFrom.length; i++) {
        const incoming = arrayFrom[i];

        if (incoming && incoming.length) {
            for (let j = 0; j < incoming.length; j++) {
                if (arrayTo.indexOf(incoming[j]) === -1) {
                    arrayTo.push(incoming[j]);
                }
            }
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
    const
        arr = arrayCache.setUp(),
        len = array.length;
        
    for (let i = 0; i < len; i++) {
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
    const
        item = array[index],
        len = array.length;
        
    if ((index < 0) || (index >= len)) {
        return null;
    }
    
    for (let i = index + 1; i < len; i++) {
        array[i - 1] = array[i];
    }
    
    if (len) {
        array.length -= 1;
    }
    
    return item;
}