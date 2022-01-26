import DataMap from './DataMap.js';
import {arrayCache} from './utils/array.js';
import config from 'config';
import {greenSplit} from './utils/string.js';
import recycle from 'recycle';

export default (function () {
    /**
     * This class defines a state object to use for entity states with helper methods. It includes recycle methods to encourage reuse.
     *
     * @memberof platypus
     * @class StateMap
     * @extends platypus.DataMap
     * @return stateMap {platypus.StateMap} Returns the new StateMap object.
     */
    var StateMap = function (first) {
            var l = arguments.length;
            
            if (l) {
                if ((l === 1) && (typeof first === 'string')) {
                    DataMap.call(this);
                    this.updateFromString(first);
                } else {
                    DataMap.apply(this, arguments);
                }
            } else {
                DataMap.call(this);
            }
        },
        parent = DataMap.prototype,
        proto = StateMap.prototype = Object.create(parent);

    Object.defineProperty(StateMap.prototype, 'constructor', {
        configurable: true,
        writable: true,
        value: StateMap
    });
        
    /**
     * Sets the state using the provided string value which is a comma-delimited list such that `"blue,red,!green"` sets the following state values:
     *
     *      {
     *          red: true,
     *          blue: true,
     *          green: false
     *      }
     *
     * @method platypus.StateMap#updateFromString
     * @param states {String} A comma-delimited list of true/false state values.
     * @chainable
     */
    Object.defineProperty(proto, 'updateFromString', {
        value: function (states) {
            var arr = greenSplit(states, ','),
                i = arr.length,
                str = '';
            
            while (i--) {
                str = arr[i];
                if (str) {
                    if (str.substr(0, 1) === '!') {
                        this.set(str.substr(1), false);
                    } else {
                        this.set(str, true);
                    }
                }
            }
            
            arrayCache.recycle(arr);
            
            return this;
        }
    });
    
    /**
     * Checks whether the provided state matches this state and updates this state to match.
     *
     * @method platypus.StateMap#update
     * @param state {platypus.StateMap} The state that this state should match.
     * @return {Boolean} Whether this state already matches the provided state.
     */
    Object.defineProperty(proto, 'update', {
        value: function (newState) {
            var keys = newState.keys,
                i = keys.length,
                state   = '',
                changed = false,
                value = false;
            
            while (i--) {
                state = keys[i];
                value = newState.get(state);
                if (this.get(state) !== value) {
                    this.set(state, value);
                    changed = true;
                }
            }
            
            return changed;
        }
    });
    
    /**
     * Checks whether the provided state matches all equivalent keys on this state.
     *
     * @method platypus.StateMap#includes
     * @param state {platypus.StateMap} The state that this state should match.
     * @return {Boolean} Whether this state matches the provided state.
     */
    Object.defineProperty(proto, 'includes', {
        value: function (otherState) {
            var keys = otherState.keys,
                i = keys.length,
                state = '';
            
            while (i--) {
                state = keys[i];
                if (this.get(state) !== otherState.get(state)) {
                    return false;
                }
            }
            
            return true;
        }
    });
    
    /**
     * Checks whether the provided state matches any equivalent keys on this state.
     *
     * @method platypus.StateMap#intersects
     * @param state {platypus.StateMap} The state that this state should intersect.
     * @return {Boolean} Whether this state intersects the provided state.
     */
    Object.defineProperty(proto, 'intersects', {
        value: function (otherState) {
            var keys = otherState.keys,
                i = keys.length,
                state = '';
            
            while (i--) {
                state = keys[i];
                if (this.get(state) === otherState.get(state)) {
                    return true;
                }
            }
            
            return false;
        }
    });
    
    /**
     * Returns StateMap from cache or creates a new one if none are available.
     *
     * @method platypus.StateMap.setUp
     * @return {platypus.StateMap} The instantiated StateMap.
     */
    /**
     * Returns StateMap back to the cache. Prefer the StateMap's recycle method since it recycles property objects as well.
     *
     * @method platypus.StateMap.recycle
     * @param {platypus.StateMap} stateMap The StateMap to be recycled.
     */
    /**
     * Relinquishes StateMap properties and recycles it.
     *
     * @method platypus.StateMap#recycle
     */
    recycle.add(StateMap, 'StateMap', StateMap, function () {
        this.clear();
    }, true, config.dev);
    
    return StateMap;
}());