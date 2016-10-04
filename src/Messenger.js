/**
 * The Messenger object facilitates communication between components and other game objects. Messenger is currently used by [Entity](platypus.Entity.html) and [EntityContainer](platypus.components.EntityContainer).
 *
 * @namespace platypus
 * @class Messenger
 * @extends springroll.EventDispatcher
 */
/* global extend, include, platypus, springroll, window */
platypus.Messenger = (function () {
    'use strict';

    var EventDispatcher = include('springroll.EventDispatcher'),
        Messenger = function () {
            EventDispatcher.call(this);
            
            this.loopCheck = Array.setUp();
        },
        debug = !!springroll.Debug,
        perfTools = debug && window.performance && window.performance.mark && window.performance.measure && window.performance, // End with this to set perfTools to window.performance
        proto = extend(Messenger, EventDispatcher);
    
    /**
     * Returns a string describing the Messenger as "[Messenger object]".
     *
     * @method toString
     * @return String
     */
    proto.toString = function () {
        return "[Messenger Object]";
    };

    /**
     * This method is used by both internal components and external entities to trigger messages. When triggered, Messenger checks through bound handlers to run as appropriate. This handles multiple event structures: "", [], and {}
     *
     * @method trigger
     * @param event {String|Array|Object} This is the message(s) to process. This can be a string, an object containing an "event" property (and optionally a "message" property, overriding the value below), or an array of the same.
     * @param value {*} This is a message object or other value to pass along to event handler.
     * @param debug {boolean} This flags whether to output message contents and subscriber information to the console during game development. A "value" object parameter (above) will also set this flag if value.debug is set to true.
     * @return {number} The number of handlers for the triggered message.
     */
    proto._trigger = proto.trigger;
    proto.trigger = function (events, message, debug) {
        var args = null,
            i = 0,
            count = 0,
            msg = message;
        
        if (typeof events === 'string') {
            return this.triggerEvent.apply(this, arguments);
        } else if (Array.isArray(events)) {
            args = Array.prototype.greenSlice.call(arguments);
            for (i = 0; i < events.length; i++) {
                args[0] = events[i];
                count += this.trigger.apply(this, args);
            }
            args.recycle();
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
    };
    
    /**
     * This method is used by both internal components and external entities to trigger messages on this entity. When triggered, entity checks through bound handlers to run as appropriate. This method is identical to Spring Roll's [EventDispatcher.trigger](http://springroll.io/SpringRoll/docs/classes/springroll.EventDispatcher.html#method_trigger), but uses alternative Array methods to alleviate excessive GC.
     *
     * @method triggerEvent
     * @param event {String} This is the message to process.
     * @param [value] {*} This is a message object or other value to pass along to event handler.
     * @param [value.debug] {boolean} This flags whether to output message contents and subscriber information to the console during game development.
     * @return {number} The number of handlers for the triggered message.
     */
    proto.triggerEvent = function (type) {
        var count = 0,
            i = 0,
            listener = null,
            listeners = this._listeners,
            args = null;
        
        if (!this._destroyed && listeners.hasOwnProperty(type) && (listeners[type])) {
            // copy the listeners array; reusing `listeners` variable
            listeners = listeners[type].greenSlice();

            if (arguments.length > 1) {
                args = Array.prototype.greenSlice.call(arguments);
                args.greenSplice(0);
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
                args.recycle();
            }
            listeners.recycle();
        }
        
        return count;
    };
    if (debug) {
        proto._triggerEvent = proto.triggerEvent;
        proto.triggerEvent = function (event, value) {
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
    
    /**
     * This method returns all the messages that this entity is concerned about.
     *
     * @method getMessageIds
     * @return {Array} An array of strings listing all the messages for which this Messenger has handlers.
     */
    proto.getMessageIds = function () {
        return Object.keys(this._listeners);
    };
    
    /**
     * This method relinguishes Messenger properties
     *
     * @method destroy
     * @since 0.7.1
     */
    proto.eventDispatcherDestroy = proto.destroy;
    proto.destroy = function () {
        this.loopCheck.recycle();
        this.eventDispatcherDestroy();
    };
    
    return Messenger;
}());
