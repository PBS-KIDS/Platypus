/**
 * The component factory takes in component definitions and creates component classes that can be used to create components by entities.  It adds properties and methods that are common to all components so that component definitions can focus on unique properties and methods.
 * 
 * To create an extended component class, use the following syntax:
 * 
 *      platypus.createComponentClass(componentDefinition, prototype);
 * 
 *  * `componentDefinition` is list of key/value pairs that describe the component's behavior.
 *  * `prototype` is an optional prototype that this component extends.
 * See [component-template.js]("component-template"%20Component.html) for an example componentDefinition that can be sent into this component class factory.
 * 
 */
/*global console, platypus */
/*jslint nomen:true, plusplus:true */
(function () {
    "use strict";
    
    var Component = include('platypus.Component'),
        key = '',
        priority = 0,
        setupProperty = function (property, component, owner) {
            Object.defineProperty(component, property, {
                get: function () {
                    return owner[property];
                },
                set: function (value) {
                    owner[property] = value;
                },
                enumerable: true
            });
        };
        
    platypus.components = {};
    
    platypus.createComponentClass = function (componentDefinition, Prototype) {
        var component = function (owner, definition) {
                var prop  = '',
                    func  = '',
                    name  = '',
                    alias = '';
                    
                Component.call(this, componentDefinition.id, owner);

                // if prototype provided, set up its properties here.
                if (Prototype) {
                    Prototype.call(this);
                }

                // Set up properties, prioritizing component settings, entity settings, and finally defaults.
                if (componentDefinition.properties) {
                    for (prop in componentDefinition.properties) {
                        if (componentDefinition.properties.hasOwnProperty(prop)) {
                            if (typeof definition[prop] !== 'undefined') {
                                this[prop] = definition[prop];
                            } else if (typeof this.owner[prop] !== 'undefined') {
                                this[prop] = this.owner[prop];
                            } else {
                                this[prop] = componentDefinition.properties[prop];
                            }
                        }
                    }
                }

                // These component properties are equivalent with `entity.property`
                if (componentDefinition.publicProperties) {
                    for (prop in componentDefinition.publicProperties) {
                        if (componentDefinition.publicProperties.hasOwnProperty(prop)) {
                            setupProperty(prop, this, owner);
                            if (typeof definition[prop] !== 'undefined') {
                                this[prop] = definition[prop];
                            } else if (typeof this.owner[prop] !== 'undefined') {
                                this[prop] = this.owner[prop];
                            } else {
                                this[prop] = componentDefinition.publicProperties[prop];
                            }
                        }
                    }
                }

                if (componentDefinition.events) {
                    priority -= 1; // So event priority remains in order of component addition.
                    for (func in componentDefinition.events) {
                        if (componentDefinition.events.hasOwnProperty(func)) {
                            this.addEventListener(func, componentDefinition.events[func], priority);
                            if (definition.aliases) {
                                for (alias in definition.aliases) {
                                    if (definition.aliases.hasOwnProperty(alias) && (definition.aliases[alias] === func)) {
                                        this.addEventListener(alias, componentDefinition.events[func], priority);
                                    }
                                }
                            }
                        }
                    }
                }

                if (componentDefinition.publicMethods) {
                    for (func in componentDefinition.publicMethods) {
                        if (componentDefinition.publicMethods.hasOwnProperty(func)) {
                            name = func;
                            if (definition.aliases) {
                                for (alias in definition.aliases) {
                                    if (definition.aliases.hasOwnProperty(alias) && (definition.aliases[alias] === func)) {
                                        name = alias;
                                    }
                                }
                            }
                            this.addMethod(name, componentDefinition.publicMethods[func]);
                        }
                    }
                }

                if (this.constructor) {
                    this.constructor(definition);
                }
            },
            func  = null,
            proto = component.prototype;
        
        if (Prototype) { //absorb template prototype if it exists.
            proto = extend(component, Prototype);
            for (key in Component.prototype) {
                proto[key] = Component.prototype[key];
            }
        } else {
            proto = extend(component, Component);
        }
        
        // Have to copy rather than replace so definition is not corrupted
        proto.constructor = componentDefinition.constructor;

        if (componentDefinition.methods) {
            for (func in componentDefinition.methods) {
                if (componentDefinition.methods.hasOwnProperty(func)) {
                    if (func === 'destroy') {
                        proto._destroy = componentDefinition.methods[func];
                    } else {
                        proto[func] = componentDefinition.methods[func];
                    }
                }
            }
        }
        if (componentDefinition.publicMethods) {
            for (func in componentDefinition.publicMethods) {
                if (componentDefinition.publicMethods.hasOwnProperty(func)) {
                    proto[func] = componentDefinition.publicMethods[func];
                }
            }
        }

        component.getAssetList     = componentDefinition.getAssetList     || Component.getAssetList;
        component.getLateAssetList = componentDefinition.getLateAssetList || Component.getLateAssetList;

        platypus.components[componentDefinition.id] = component;
    };
}());
