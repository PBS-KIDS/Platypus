/**
 * This is the extendable Component class. Typically specific component classes should be created using `platypus.createComponentClass()`. This method accepts component definitions and creates component classes that can be used to create components by entities.  It adds properties and methods that are common to all components so that component definitions can focus on unique properties and methods.
 *
 * To create an extended component class, use the following syntax:
 *
 *      platypus.createComponentClass(componentDefinition, prototype);
 *
 *  * `componentDefinition` is list of key/value pairs that describe the component's behavior.
 *  * `prototype` is an optional prototype that this component extends.
 * See [component-template.js]("component-template"%20Component.html) for an example componentDefinition that can be sent into this component class factory.
 *
 * @namespace platypus
 * @class Component
 * @static
 */
/*global include, platypus */
/*jslint plusplus:true */
platypus.Component = (function () {
    'use strict';
    
    var Data = include('platypus.Data'),
        getAssetList = function () {
            return Array.setUp();
        },
        Component = function (type, owner) {
            this.type = type;
            this.owner = owner;
            this.publicMethods = Data.setUp();
            this.listener = Data.setUp(
                "events", Array.setUp(),
                "messages", Array.setUp()
            );
        },
        proto = Component.prototype;
    
    /**
     * Returns a string describing the component.
     *
     * @method toString
     * @return {String} Returns the component type as a string of the form "[Component ComponentType]".
     **/
    proto.toString = function () {
        return "[Component " + this.type + "]";
    };

    /**
     * This method cleans up listeners and methods that this component added to the entity. It should never be called by the component itself. Call this.owner.removeComponent(this) instead.
     *
     * @method destroy
     * @private
     */
    proto.destroy = function () {
        var func = '';
        
        if (this.listener) {
            // Handle component's destroy method before removing messaging and methods.
            if (this._destroy) {
                this._destroy();
            }
            
            // Now remove event listeners and methods.
            for (func in this.publicMethods) {
                if (this.publicMethods.hasOwnProperty(func)) {
                    this.removeMethod(func);
                }
            }
            this.publicMethods.recycle();
            
            this.removeEventListeners();
            this.listener.events.recycle();
            this.listener.messages.recycle();
            this.listener.recycle();
            this.listener = null;
        }
    };
    
    /**
     * This method removes multiple event listeners from the entity.
     *
     * @method removeEventListeners
     * @param [listeners] {Array} The list of listeners to remove. If not supplied, all event listeners are removed.
     * @private
     */
    proto.removeEventListeners = function (listeners) {
        var i = 0,
            events   = null,
            messages = null;
        
        if (!listeners) {
            events   = this.listener.events;
            messages = this.listener.messages;
            for (i = 0; i < events.length; i++) {
                this.owner.off(events[i], messages[i]);
            }
            events.length = 0;
            messages.length = 0;
        } else {
            for (i = 0; i < listeners.length; i++) {
                this.removeEventListener(listeners[i]);
            }
        }
    };
    
    /**
     * This method adds an event listener to the entity.
     *
     * @method addEventListener
     * @param event {String} The event that this component should listen for.
     * @param callback {Function} The handler for the event.
     * @private
     */
    proto.addEventListener = function (event, callback, priority) {
        var handler = callback.bind(this);
        
        this.listener.events.push(event);
        this.listener.messages.push(handler);
        this.owner.on(event, handler, priority);
    };
    
    /**
     * This method adds a method to the entity.
     *
     * @method addMethod
     * @param name {String} The name of the method. For example, if name is "turnYellow", the method is accessible on the entity as `entity.turnYellow()`.
     * @param func {Function} The function describing the method.
     * @private
     */
    proto.addMethod = function (name, func) {
        if (this.owner[name]) {
            platypus.debug.warn(this.owner.type + ': Entity already has a method called "' + name + '". Method not added.');
        } else {
            this.owner[name] = function () {
                return func.apply(this, arguments);
            }.bind(this);
            this.publicMethods[name] = func;
        }
    };

    /**
     * This method removes an event listener from the entity.
     *
     * @method removeEventListener
     * @param event {String} The event for which to remove a listener.
     * @param callback {Function} The listener to remove. If not supplied, all event listeners for the provided event are removed.
     * @private
     */
    proto.removeEventListener = function (event, callback) {
        var i = 0,
            events   = this.listener.events,
            messages = this.listener.messages;
        
        for (i = events.length - 1; i >= 0; i--) {
            if ((events[i] === event) && (!callback || (messages[i] === callback))) {
                this.owner.off(event, messages[i]);
                this.listener.events.greenSplice(i);
                this.listener.messages.greenSplice(i);
            }
        }
    };
    
    /**
     * This method removes a method from the entity.
     *
     * @method removeMethod
     * @param name {String} The name of the method to be removed.
     * @private
     */
    proto.removeMethod = function (name) {
        if (!this.owner[name]) {
            platypus.debug.warn(this.owner.type + ': Entity does not have a method called "' + name + '".');
        } else {
            delete this.owner[name];
        }
        delete this.publicMethods[name];
    };

    /**
     * This method can be overwritten to provide the list of assets this component requires. This method is invoked when the list of game scenes is created to determine assets for each scene.
     *
     * @method getAssetList
     * @param definition {Object} The definition for the component.
     * @param properties {Object} The properties of the Entity.
     * @param defaultProperties {Object} The default properties of the Entity.
     * @return {Array} A list of the necessary assets to load.
     */
    Component.getAssetList = getAssetList;

    /**
     * This method can be overwritten to provide the list of assets this component requires. This method is invoked when the list of game scenes is created to determine assets for each scene.
     *
     * @method getLateAssetList
     * @param data {Object} Scene data that affects the list of assets.
     * @return {Array} A list of the necessary assets to load.
     */
    Component.getLateAssetList = getAssetList;
    
    return Component;
}());
