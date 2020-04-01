/**
 * This class defines an action state based on one or more inputs. This is used by [EntityController](platypus.components.EntityController.html) to produce event messages listing whether a particular action is "triggered", "pressed", and/or "released".
 *
 * @namespace platypus
 * @class ActionState
 * @constructor
 * @param event {String} The name of the event to trigger on the Entity.
 * @param states {Object} A list of key/value pairs describing what states should be `true` or `false` on the Entity for this action to be triggered.
 * @param trigger {Function} The function to be called if one or more inputs are active and the current state of the Entity is valid.
 * @return {ActionState} Returns the new ActionState object.
 */
import Data from './Data.js';
import StateMap from './StateMap.js';
import {arrayCache} from './utils/array.js';
import config from 'config';
import recycle from 'recycle';

export default  (function () {
    var ActionState = function (event, states, trigger) {
            /**
             * The name of the event to trigger on the Entity.
             *
             * @property event
             * @type String
             */
            this.event     = event;

            /**
             * The function to call if the ActionState is active.
             *
             * @property trigger
             * @type Function
             */
            this.trigger   = trigger;
            
            /**
             * Whether any of the ActionState's inputs are active.
             *
             * @property active
             * @type Boolean
             */
            this.active    = false;

            /**
             * Whether any of the ActionState's inputs were active last update.
             *
             * @property wasActive
             * @type Boolean
             */
            this.wasActive = false;

            /**
             * Whether the Entity's state is valid for this ActionState.
             *
             * @property valid
             * @type Boolean
             */
            this.valid     = true;

            /**
             * Whether the Entity's state was valid for this ActionState last update.
             *
             * @property wasValid
             * @type Boolean
             */
            this.wasValid  = true;

            /**
             * The state of the Entity that is valid for this ActionState.
             *
             * @property states
             * @type platypus.StateMap
             */
            this.states = StateMap.setUp(states);

            /**
             * The list of input toggles to track control input.
             *
             * @property inputs
             * @type Array
             */
            this.inputs = arrayCache.setUp();

            /**
             * The message that is passed to the Entity if the ActionState is active.
             *
             * @property stateSummary
             * @type platypus.Data
             */
            this.stateSummary = Data.setUp(
                "pressed",   false,
                "released",  false,
                "triggered", false
            );
        },
        orArray = function (element) {
            return element;
        },
        proto = ActionState.prototype;

    /**
     * Updates the state of the action by checking the state of the Entity and whether any inputs are active.
     *
     * @method update
     * @param state {Object} The Entity's `state` property to compare against the ActionState's valid state.
     * @return {Boolean} Whether the ActionState is triggered, pressed, or released.
     */
    proto.update = function (state) {
        var ss = this.stateSummary;
        
        this.valid     = state.includes(this.states);
        this.active    = this.inputs.some(orArray);
        
        ss.pressed     = this.valid && this.active;
        ss.released    = this.wasActive && ((!this.valid && this.wasValid) || (this.valid && !this.active));
        ss.triggered   = this.valid && this.active && !this.wasActive;
        
        this.wasValid  = this.valid;
        this.wasActive = this.active;
        
        return ss.pressed || ss.released || ss.triggered;
    };
    
    /**
     * Triggers events on the Entity related to the ActionState's state. This is necessarily separate from the `update` method since triggered events could affect entity state. The messages have the following form and are only triggered if one of the values is `true`:
     *
     *     {
     *         "triggered": true,
     *         "pressed": true,
     *         "released": false
     *     }
     *
     * Here is a mapping of the various event messages depending on the ActionState's state.
     *
     *     ActionState State:
     *          wasValid:  0 0 0 0  0 0 0 0  1 1 1 1  1 1 1 1
     *             valid:  0 0 0 0  1 1 1 1  0 0 0 0  1 1 1 1
     *         wasActive:  0 0 1 1  0 0 1 1  0 0 1 1  0 0 1 1
     *            active:  0 1 0 1  0 1 0 1  0 1 0 1  0 1 0 1
     *     Events:
     *         triggered:  0 0 0 0  0 1 0 0  0 0 0 0  0 1 0 0
     *           pressed:  0 0 0 0  0 1 0 1  0 0 0 0  0 1 0 1
     *          released:  0 0 0 0  0 0 1 0  0 0 1 1  0 0 1 0
     *
     * @method resolve
     */
    proto.resolve = function () {
        this.trigger(this.event, this.stateSummary);
    };
    
    /**
     * Returns an ActionState from cache or creates a new one if none are available.
     *
     * @method ActionState.setUp
     * @return {platypus.ActionState} The instantiated ActionState.
     */
    /**
     * Returns an ActionState back to the cache. Prefer the ActionState's recycle method since it recycles property objects as well.
     *
     * @method ActionState.recycle
     * @param {platypus.ActionState} The ActionState to be recycled.
     */
    /**
     * Relinquishes properties of the ActionState and recycles it.
     *
     * @method recycle
     */
    recycle.add(ActionState, 'ActionState', ActionState, function () {
        this.states.recycle();
        this.stateSummary.recycle();
        arrayCache.recycle(this.inputs);
    }, true, config.dev);

    return ActionState;
}());