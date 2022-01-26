/* global platypus, window */
import {arrayCache, greenSlice} from './utils/array.js';
import config from 'config';

export default (function () {
    var debug = config.dev,
        perfTools = debug && window.performance && window.performance.mark && window.performance.measure && window.performance, // End with this to set perfTools to window.performance
        runBoth = function (f1, f2) {
            return function () {
                f1.apply(this, arguments);
                f2.apply(this, arguments);
            };
        };

    /**
     * The Messenger object facilitates communication between components and other game objects. Messenger is currently used by [Entity](platypus.Entity.html) and [EntityContainer](platypus.components.EntityContainer).
     *
     * @memberof platypus
     */
    class Messenger {
        /**
         */
        constructor () {
            this._listeners = {};
            this._destroyed = false;
            this.loopCheck = arrayCache.setUp();
        }

        /**
         * Add an event listener. The parameters for the listener functions depend on the event.
         *
         * @param name {String} The type of event.
         * @param callback {Function} The callback function when event is triggered.
         */
        on (name, callback) {
            var listener = this._listeners[name] = this._listeners[name] || [];

            if (this._destroyed) return;

            if (listener.indexOf(callback) === -1) {
                listener.push(callback);
            }
        }

        /**
         * Remove the event listener
         *
         * @param name {String} The type of event; if no name is specifed remove all listeners.
         * @param callback {Function} The listener function.
         */
        off (name, callback) {
            var listener = this._listeners[name],
                index = 0;

            if (this._destroyed || !listener) return;

            // remove all
            if (typeof name === 'undefined') {
                this._listeners = {};
            } else {
                // remove all listeners for that event
                if (typeof callback === 'undefined') {
                    listener.length = 0;
                } else {
                    //remove single listener
                    index = listener.indexOf(callback);
                    if (index !== -1) {
                        listener.splice(index, 1);
                    }
                }
            }
        }

        /**
         * Returns a string describing the Messenger as "[Messenger object]".
         *
         * @return String
         */
        toString () {
            return "[Messenger Object]";
        }

        /**
         * This method is used by both internal components and external entities to trigger messages. When triggered, Messenger checks through bound handlers to run as appropriate. This handles multiple event structures: "", [], and {}
         *
         * @param event {String|Array|Object} This is the message(s) to process. This can be a string, an object containing an "event" property (and optionally a "message" property, overriding the value below), or an array of the same.
         * @param value {*} This is a message object or other value to pass along to event handler.
         * @param debug {boolean} This flags whether to output message contents and subscriber information to the console during game development. A "value" object parameter (above) will also set this flag if value.debug is set to true.
         * @return {number} The number of handlers for the triggered message.
         */
        trigger (events, message, debug) {
            var args = null,
                i = 0,
                count = 0,
                msg = message,
                indexOf = 0,
                splitEvents = null;
            
            if (typeof events === 'string') {
                indexOf = events.indexOf(" ");
                if (indexOf === -1) {
                    return this.triggerEvent.apply(this, arguments);
                } else {
                    splitEvents = events.split(" ");
                    args = greenSlice(arguments);
                    for (i = 0; i < splitEvents.length; i++) {
                        args[0] = splitEvents[i];
                        count += this.triggerEvent.apply(this, args);
                    }
                    arrayCache.recycle(args);
                    return count;
                }
            } else if (Array.isArray(events)) {
                args = greenSlice(arguments);
                for (i = 0; i < events.length; i++) {
                    args[0] = events[i];
                    count += this.trigger.apply(this, args);
                }
                arrayCache.recycle(args);
                return count;
            } else if (events.event) {
                if (typeof events.message !== 'undefined') {
                    msg = events.message;
                }
                return this.triggerEvent(events.event, msg, events.debug || debug);
            } else {
                platypus.debug.warn('Event incorrectly formatted: must be string, array, or object containing an "event" property.', events);
                return 0;
            }
        }
        
        /**
         * This method is used by both internal components and external entities to trigger messages on this entity. When triggered, entity checks through bound handlers to run as appropriate. This method is identical to Spring Roll's [EventDispatcher.trigger](http://springroll.io/SpringRoll/docs/classes/springroll.EventDispatcher.html#method_trigger), but uses alternative Array methods to alleviate excessive GC.
         *
         * @param event {String} This is the message to process.
         * @param [value] {*} This is a message object or other value to pass along to event handler.
         * @param [value.debug] {boolean} This flags whether to output message contents and subscriber information to the console during game development.
         * @return {number} The number of handlers for the triggered message.
         */
        triggerEvent (type) {
            var count = 0,
                i = 0,
                listener = null,
                listeners = this._listeners,
                args = null;
            
            if (!this._destroyed && listeners.hasOwnProperty(type) && (listeners[type])) {
                // copy the listeners array; reusing `listeners` variable
                listeners = greenSlice(listeners[type]);

                if (arguments.length > 1) {
                    args = greenSlice(arguments);
                    args.shift();
                }

                count = i = listeners.length;
                while (i--) {
                    listener = listeners[i];
                    if (listener._eventDispatcherOnce) {
                        delete listener._eventDispatcherOnce;
                        this.off(type, listener);
                    }
                    listener.apply(this, args);
                }
                
                if (args) {
                    arrayCache.recycle(args);
                }
                arrayCache.recycle(listeners);
            }
            
            return count;
        }
        
        /**
         * This method returns all the messages that this entity is concerned about.
         *
         * @return {Array} An array of strings listing all the messages for which this Messenger has handlers.
         */
        getMessageIds () {
            return Object.keys(this._listeners);
        }
        
        /**
         * This method relinguishes Messenger properties
         *
         */
        destroy () {
            arrayCache.recycle(this.loopCheck);
            this.loopCheck = null;
            this._destroyed = true;
            this._listeners = null;
        }

        /**
         * This read-only property shows whether this Messenger is destroyed.
         *
         * @property destroyed
         * @type Boolean
         * @default false
         */
        get destroyed () {
            return this._destroyed;
        }

        /**
         * Adds Messenger functionality to a Class.
         *
         * @param {Class|Function} ClassObject The class to add Messenger behavior to.
         */
        static mixin (ClassObject) {
            var key = '',
                fromProto = Messenger.prototype,
                toProto = ClassObject.prototype,
                methods = Object.getOwnPropertyNames(fromProto),
                i = methods.length;

            while (i--) {
                key = methods[i];
                if (key !== 'constructor') {
                    if (toProto[key]) {
                        toProto[key] = runBoth(toProto[key], fromProto[key]);
                    } else {
                        toProto[key] = fromProto[key];
                    }
                }
            }
        }

        /**
         * Call this method in an Object's instantiation if `Messenger.mixin` has been called on its Class.
         *
         * @param {Object} object The object for which Messenger should be instantiated.
         */
        static initialize (object) {
            object._listeners = {};
            object._destroyed = false;
            object.loopCheck = arrayCache.setUp();
        }
    }

    // Add logging checks for development mode.
    if (debug) {
        Messenger.prototype._triggerEvent = Messenger.prototype.triggerEvent;
        Messenger.prototype.triggerEvent = function (event, value) {
            var i = 0,
                debugLimit = 5,
                debugLogging = value && value.debug,
                debugCount = 0,
                count = 0;
            
            // Debug logging.
            if (debugLogging || this.debug) {
                for (i = 0; i < this.loopCheck.length; i++) {
                    if (this.loopCheck[i] === event) {
                        debugCount += 1;
                        if (debugCount > debugLimit) {
                            throw "Endless loop detected for '" + event + "'.";
                        } else {
                            platypus.debug.warn("Event '" + event + "' is nested inside another '" + event + "' event.");
                        }
                    }
                }

                this.loopCheck.push(event);
                if (perfTools) {
                    perfTools.mark("a");
                }
                count = this._triggerEvent.apply(this, arguments);
                if (perfTools) {
                    perfTools.mark("b");
                    perfTools.measure(this.type + ":" + event, 'a', 'b');
                }
                this.loopCheck.length = this.loopCheck.length - 1;
                if (debugLogging) {
                    if (count) {
                        platypus.debug.olive('Entity "' + this.type + '": Event "' + event + '" has ' + count + ' subscriber' + ((count > 1) ? 's' : '') + '.', value);
                    } else {
                        platypus.debug.warn('Entity "' + this.type + '": Event "' + event + '" has no subscribers.', value);
                    }
                }
                return count;
            } else {
                return this._triggerEvent.apply(this, arguments);
            }
        };
    }
    
    return Messenger;
}());
