import {arrayCache} from './array.js';

/**
 * Splits a string, but populates an array from the array cache instead of creating a new one.
 *
 * @method greenSplit
 * @param str {String} String to split.
 * @param [splitter] {String} String demarking where to split. If not provided, each character in the split string becomes an array item.
 * @return Array
 */
export function greenSplit (str, splitter) {
    var str = str.toString(),
        d = 0,
        i = 0,
        arr = arrayCache.setUp();
    
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
        i = str.length;
        d = i - 1;

        while (i--) {
            arr.push(str[d - i]);
        }
    }
    
    return arr;
}