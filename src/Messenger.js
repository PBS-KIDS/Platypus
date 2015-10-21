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

    var messenger = function () {
            this.messages    = {};
            this.loopCheck   = [];
            this.unbindLater = [];
        },
        proto = messenger.prototype;
    
    /**
     * Returns a string describing the messenger as "[messenger object]".
     * 
     * @method toString
     * @return String
     */
    proto.toString = function () {
        return "[messenger Object]";
    };
    
    /**
     * Used by components to bind handler functions to triggered events.
     * 
     * @method bind
     * @param event {String} This is the message being listened for.
     * @param func {Function} This is the function that will be run when the message is triggered.
     * @param scope {Object} This is the scope with which the function should be run.
     */
    proto.bind = function (event, callback, scope) {
        if (!this.messages[event]) {
            this.messages[event] = [];
        }
        this.messages[event].push({callback: callback, scope: scope});
    };
    
    /**
     * Used to safely unbind handler functions when in the middle of events occurring by delaying removal until the end of the game tick.
     * 
     * @method unbind
     * @param event {String} This is the message the component is currently listening to.
     * @param callback {Function} This is the function that was attached to the message.
     * @param scope {Function} This is the scope of the function that was attached to the message.
     */
    proto.unbind = function (event, callback, scope) {
        var found = false, j = 0;
        
        if (this.loopCheck.length) {
            for (j = 0; j < this.loopCheck.length; j++) {
                if (this.loopCheck[j] === event) {
                    found = true;
                    break;
                }
            }
        }
            
        if (found) { //We're currently busy triggering messages like this, so we shouldn't remove message handlers until we're finished.
            this.unbindLater.push({event: event, callback: callback, scope: scope});
        } else {
            this.safelyUnbind(event, callback, scope);
        }
    };
    
    /**
     * Unbinds functions once everything is safe.
     * 
     * @method safelyUnbind
     * @param event {String} This is the message the component is currently listening to.
     * @param callback {Function} This is the function that was attached to the message.
     * @param scope {Function} This is the scope of the function that was attached to the message.
     */
    proto.safelyUnbind = function (event, callback, scope) {
        var i = 0;
        
        if (!this.messages[event]) {
            this.messages[event] = [];
        }
        for (i = 0; i < this.messages[event].length; i++) {
            if ((this.messages[event][i].callback === callback) && (this.messages[event][i].scope === scope)) {
                this.messages[event].splice(i, 1);
                break;
            }
        }
    };
    
    /**
     * This method is used by both internal components and external entities to trigger messages. When triggered, messenger checks through bound handlers to run as appropriate. This handles multiple event structures: "", [], and {}
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
            j = 0,
            debugCount = 0,
            msgs = null,
            l = 0;
        
        // Debug logging.
        if (this.debug || debug || (value && value.debug)) {
            if (this.messages[event] && this.messages[event].length) {
                console.log('Entity "' + this.type + '": Event "' + event + '" has ' + this.messages[event].length + ' subscriber' + ((this.messages[event].length > 1) ? 's' : '') + '.', value);
            } else {
                console.warn('Entity "' + this.type + '": Event "' + event + '" has no subscribers.', value);
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
            i = 0;
        }

        this.loopCheck.push(event);
        if (this.messages[event] && this.messages[event].length) {
            msgs = this.messages[event].slice(); // Create a copy in case any of the messages triggered cause a change in the list of messages.
            l    = msgs.length;
            for (i = 0; i < l; i++) {
                msgs[i].callback.call(msgs[i].scope || this, value, debug);
            }
        }
        this.loopCheck.length = this.loopCheck.length - 1;
        
        if (!this.loopCheck.length && this.unbindLater.length) {
            for (j = 0; j < this.unbindLater.length; j++) {
                this.safelyUnbind(this.unbindLater[j].event, this.unbindLater[j].callback, this.unbindLater[j].scope);
            }
            this.unbindLater.length = 0;
        }
        
        return i;
    };
    
    /**
     * This method returns all the messages that this entity is concerned about.
     * 
     * @method getMessageIds
     * @return {Array} An array of strings listing all the messages for which this messenger has handlers.
     */
    proto.getMessageIds = function () {
        return Object.keys(this.messages);
    };
    
    /**
     * This method returns the entire list of event handlers for a given event.
     * 
     * @method copyEventHandlers
     * @param event {String} The name of the event.
     * @return {Array} The list of handlers for the event.
     */
    proto.copyEventHandlers = function (event) {
        return this.messages[event] || null;
    };
    
    return messenger;
}());
