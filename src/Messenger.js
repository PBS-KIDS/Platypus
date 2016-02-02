/**
 * The Messenger object facilitates communication between components and other game objects. Messenger is currently used by [Entity](platypus.Entity.html) and [EntityContainer](platypus.components.EntityContainer).
 * 
 * @namespace platypus
 * @class Messenger
 * @extends springroll.EventDispatcher
 */
/*global console, platypus */
/*jslint plusplus:true */
platypus.Messenger = (function () {
    "use strict";

    var EventDispatcher = include('springroll.EventDispatcher'),
        Messenger = function () {
            EventDispatcher.call(this);
            
            this.loopCheck = Array.setUp();
        },
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
     * This method identical to Spring Roll's [EventDispatcher.trigger](http://springroll.io/SpringRoll/docs/classes/springroll.EventDispatcher.html#method_trigger), but uses alternative Array methods to alleviate excessive GC.
     * 
     * @method greenTrigger
     * @since 0.7.1
     */
    proto.greenTrigger = function(type) {
        var listeners = null,
            args = null;
        
		if (this._destroyed) {
            return;
        }

		if (this._listeners.hasOwnProperty(type) && (this._listeners[type] !== undefined)) {
			// copy the listeners array
			listeners = this._listeners[type].greenSlice();

			if (arguments.length > 1) {
				args = Array.prototype.greenSlice.call(arguments);
                args.greenSplice(0);
			}

			for (var i = listeners.length - 1; i >= 0; --i) {
				var listener = listeners[i];
				if (listener._eventDispatcherOnce)
				{
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
    proto.trigger = function (events, message, debug) {
        var i = 0,
            count = 0;
        
        if (typeof events === 'string') {
            return this.triggerEvent(events, message, debug);
        } else if (Array.isArray(events)) {
            for (i = 0; i < events.length; i++) {
                count += this.trigger(events[i], message, debug);
            }
            return count;
        } else if (events.event) {
            return this.triggerEvent(events.event, events.message || message, events.debug || debug);
        } else {
            console.warn('Event incorrectly formatted: must be string, array, or object containing an "event" property.', events);
            return 0;
        }
    };
    
    /**
     *  This method is used by both internal components and external entities to trigger messages on this entity. When triggered, entity checks through bound handlers to run as appropriate.
     * 
     * @method triggerEvent
     * @param event {String} This is the message to process.
     * @param value {*} This is a message object or other value to pass along to event handler.
     * @param debug {boolean} This flags whether to output message contents and subscriber information to the console during game development. A "value" object parameter (above) will also set this flag if value.debug is set to true.
     * @return {number} The number of handlers for the triggered message.
     */
    proto.triggerEvent = function (event, value, debug) {
        var i = 0,
            debugLogging = debug || (value && value.debug),
            debugCount = 0,
            count = 0;
        
        if (this.destroyed) {
            return 0;
        }
        
        count = (this._listeners[event] && this._listeners[event].length) || 0;
        
        // Debug logging.
        if (debugLogging || this.debug) {
            if (debugLogging) {
                if (count) {
                    console.log('Entity "' + this.type + '": Event "' + event + '" has ' + count + ' subscriber' + ((count > 1) ? 's' : '') + '.', value);
                } else {
                    console.warn('Entity "' + this.type + '": Event "' + event + '" has no subscribers.', value);
                    return 0;
                }
            }
            
            for (i = 0; i < this.loopCheck.length; i++) {
                if (this.loopCheck[i] === event) {
                    debugCount += 1;
                    if (debugCount > 5) {
                        throw "Endless loop detected for '" + event + "'.";
                    } else {
                        console.warn("Event '" + event + "' is nested inside another '" + event + "' event.");
                    }
                }
            }

            this.loopCheck.push(event);
            if (window.performance) {
                window.performance.mark("a");
            }
            this.greenTrigger(event, value, debug);
            if (window.performance) {
                window.performance.mark("b");
                window.performance.measure(this.type + ":" + event, 'a', 'b');
            }
            this.loopCheck.length = this.loopCheck.length - 1;
        } else if (count) {
            this.greenTrigger(event, value, debug);
        }
        
        return count;
    };
    
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
    }
    
    return Messenger;
}());
