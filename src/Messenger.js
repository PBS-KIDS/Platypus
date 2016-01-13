/**
 * The Messenger object facilitates communication between components and other game objects. Messenger is currently used by [Entity](platypus.Entity.html) and [EntityContainer](platypus.components.EntityContainer).
 * 
 * @namespace platypus
 * @class Messenger
 */
/*global console, platypus */
/*jslint plusplus:true */
platypus.Messenger = (function () {
    "use strict";

    var EventDispatcher = include('springroll.EventDispatcher'),
        Messenger = function () {
            EventDispatcher.call(this);
            
            this.loopCheck   = [];
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
     * Used by components to bind handler functions to triggered events.
     * 
     * @method bind
     * @param event {String} This is the message being listened for.
     * @param func {Function} This is the function that will be run when the message is triggered.
     * @param scope {Object} This is the scope with which the function should be run.
     * @deprecated since 0.7.0 - Use "on".
     */
    proto.bind = proto.on;
    
    /**
     * Used to safely unbind handler functions when in the middle of events occurring by delaying removal until the end of the game tick.
     * 
     * @method unbind
     * @param event {String} This is the message the component is currently listening to.
     * @param callback {Function} This is the function that was attached to the message.
     * @param scope {Function} This is the scope of the function that was attached to the message.
     * @deprecated since 0.7.0 - Use "off"
     */
    proto.unbind = proto.off;

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
            debugLogging = this.debug || debug || (value && value.debug),
            debugCount = 0,
            count = 0;
        
        if (this.destroyed) {
            return 0;
        }
        
        count = (this._listeners[event] && this._listeners[event].length) || 0;
        
        // Debug logging.
        if (debugLogging) {
            if (count) {
                console.log('Entity "' + this.type + '": Event "' + event + '" has ' + count + ' subscriber' + ((count > 1) ? 's' : '') + '.', value);
            } else {
                console.warn('Entity "' + this.type + '": Event "' + event + '" has no subscribers.', value);
                return 0;
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
            this._trigger(event, value, debug);
            this.loopCheck.length = this.loopCheck.length - 1;
        } else if (count) {
            this._trigger(event, value, debug);
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
    
    return Messenger;
}());
