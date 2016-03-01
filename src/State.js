/**
 * This class defines a state object to use for entity states with helper methods. It includes recycle methods to encourage reuse.
 * 
 * @namespace platypus
 * @class State
 * @constructor
 * @return {platypus.State} Returns the new State object.
 * @extends platypus.Data
 * @since 0.7.5
 */
/*global platypus */
platypus.State = (function () {
    "use strict";
    
    var Data = include('platypus.Data'),
        State = function () {
            var l = arguments.length;
            
            if (l) {
                if ((l === 1) && (typeof arguments[0] === 'string')) {
                    this.setState(arguments[0]);
                } else {
                    Data.apply(this, arguments);
                }
            }
        },
        proto = extend(State, Data);
        
        Object.defineProperty(proto, 'constructor', {
            value: proto.constructor
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
     * @method setState
     * @param states {String} A comma-delimited list of true/false state values.
     * @chainable
     * @since 0.7.5
     */
    Object.defineProperty(proto, 'setState', {
        value: function (states) {
            var arr = states.greenSplit(','),
                i = arr.length,
                str = '';
            
            while (i--) {
                str = arr[i];
                if (str) {
                    if (str.substr(0, 1) === '!') {
                        this[str.substr(1)] = false;
                    } else {
                        this[str] = true;
                    }
                }
            }
            
            arr.recycle();
            
            return this;
        }
    });
    
    /**
     * Checks whether the provided state matches this state and updates this state to match.
     * 
     * @method update
     * @param state {platypus.State} The state that this state should match.
     * @return {Boolean} Whether this state already matches the provided state.
     * @since 0.7.5
     */
    Object.defineProperty(proto, 'update', {
        value: function (newState) {
            var state   = null,
                changed = false;
            
            for (state in newState) {
                if (newState[state] !== this[state]) {
                    this[state] = newState[state];
                    changed = true;
                }
            }
            
            return changed;
        }
    });
    
    /**
     * Checks whether the provided state matches all equivalent keys on this state.
     * 
     * @method includes
     * @param state {platypus.State} The state that this state should match.
     * @return {Boolean} Whether this state matches the provided state.
     * @since 0.7.5
     */
    Object.defineProperty(proto, 'includes', {
        value: function (otherState) {
            var state   = null;
            
            for (state in otherState) {
                if (otherState.hasOwnProperty(state) && (this[state] !== otherState[state])) {
                    return false;
                }
            }
            
            return true;
        }
    });
    
    /**
     * Returns State from cache or creates a new one if none are available.
     * 
     * @method State.setUp
     * @return {platypus.State} The instantiated State.
     * @since 0.7.5
     */
    /**
     * Returns State back to the cache. Prefer the State's recycle method since it recycles property objects as well.
     * 
     * @method State.recycle
     * @param {platypus.State} The State to be recycled.
     * @since 0.7.5
     */
    /**
     * Relinquishes State properties and recycles it.
     * 
     * @method recycle
     * @since 0.7.5
     */
    platypus.setUpRecycle(State, 'State', function () {
        var key = '';
        
        for (key in this) {
            if (this.hasOwnProperty(key)) {
                delete this[key];
            }
        }
        State.recycle(this);
    });
    
    return State;
}());