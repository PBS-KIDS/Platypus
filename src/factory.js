/**
 * The component factory takes in component definitions and creates component classes that can be used to create components by entities.  It adds properties and methods that are common to all components so that component definitions can focus on unique properties and methods.
 *
 * To create an extended component class, use the following syntax:
 *
 *      platypus.createComponentClass(componentDefinition, prototype);
 *
 *  * `componentDefinition` is list of key/value pairs that describe the component's behavior.
 *  * `prototype` is an optional prototype that this component extends.
 * See ComponentExample.js for an example componentDefinition that can be sent into this component class factory.
 *
 */
/* global extend, include, platypus */
(function () {
    'use strict';
    
    var Component = include('platypus.Component'),
        debug = include('springroll.Debug', false),
        key = '',
        priority = 0,
        doNothing = function () {},
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
        },
        runBoth = function (f1, f2) {
            return function () {
                f1.apply(this, arguments);
                f2.apply(this, arguments);
            };
        };
        
    platypus.components = {};
    
    platypus.createComponentClass = function (componentDefinition, Prototype) {
        var component = function (owner, definition, callback) {
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

                if (!this.initialize(definition, callback) && callback) { // whether the callback will be used; if not, we run immediately.
                    callback();
                }
            },
            func  = null,
            proto = component.prototype;
        
        if (Prototype) { //absorb template prototype if it exists.
            proto = extend(component, Prototype);
            for (key in Component.prototype) {
                if (proto[key]) {
                    proto[key] = runBoth(proto[key], Component.prototype[key]);
                } else {
                    proto[key] = Component.prototype[key];
                }
            }
        } else {
            proto = extend(component, Component);
        }
        
        // Have to copy rather than replace so definition is not corrupted
        proto.initialize = componentDefinition.initialize || (componentDefinition.hasOwnProperty('constructor') ? componentDefinition.constructor /* deprecated function name */: doNothing);

        // This can be overridden by a "toJSON" method in the component definition. This is by design.
        proto.toJSON = (function () {
            var validating = false,
                valid = function (value, depthArray) {
                    var depth = null,
                        root = false,
                        key = '',
                        invalid = false,
                        i = 0,
                        type = typeof value;
                    
                    if (!validating) { // prevents endless validation during recursion.
                        validating = true;
                        root = true;
                    }

                    if (type === 'function') {
                        invalid = true;
                    } else if ((type === 'object') && (value !== null)) {
                        if (value.toJSON) { // We know it's valid but we run this for the depth check to make sure that there is no recursion.
                            depth = depthArray ? depthArray.greenSlice() : Array.setUp();
                            depth.push(value);
                            if (!valid(value.toJSON(), depth)) {
                                invalid = true;
                            }
                        } else if (Array.isArray(value)) {
                            i = value.length;
                            while (i--) {
                                if (depthArray && depthArray.indexOf(value[i]) >= 0) {
                                    invalid = true;
                                    break;
                                }
                                depth = depthArray ? depthArray.greenSlice() : Array.setUp();
                                depth.push(value[i]);
                                if (!valid(value[i], depth)) {
                                    invalid = true;
                                    break;
                                }
                            }
                        } else {
                            for (key in value) {
                                if (value.hasOwnProperty(key)) {
                                    if (depthArray && depthArray.indexOf(value[key]) >= 0) {
                                        invalid = true;
                                        break;
                                    }
                                    depth = depthArray ? depthArray.greenSlice() : Array.setUp();
                                    depth.push(value[key]);
                                    if (!valid(value[key], depth)) {
                                        invalid = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    if (depthArray) {
                        depthArray.recycle();
                    }

                    if (root) {
                        validating = false;
                    }

                    return !invalid;
                };

            // We only perform validation in debug mode since it may impact performance.
            if (include('springroll.Debug', false)) {
                return function (propertiesDefinition) {
                    var properties = componentDefinition.properties,
                        publicProperties = componentDefinition.publicProperties,
                        component = {
                            type: this.type
                        },
                        key = '';
                    
                    for (key in properties) {
                        if (properties.hasOwnProperty(key) && (properties[key] !== this[key])) {
                            if (!validating && !valid(this[key])) {
                                platypus.debug.warn('Component "' + this.type + '" includes a non-JSON property value for "' + key + '" (type "' + (typeof this[key]) + '"). You may want to create a custom `toJSON` method for this component.', this[key]);
                            }
                            component[key] = this[key];
                        }
                    }

                    for (key in publicProperties) {
                        if (publicProperties.hasOwnProperty(key) && (publicProperties[key] !== this.owner[key])) {
                            if (!validating && !valid(this.owner[key])) {
                                platypus.debug.warn('Component "' + this.type + '" includes a non-JSON public property value for "' + key + '" (type "' + (typeof this.owner[key]) + '"). You may want to create a custom `toJSON` method for this component.', this.owner[key]);
                            }
                            propertiesDefinition[key] = this.owner[key];
                        }
                    }

                    return component;
                };
            } else {
                return function (propertiesDefinition) {
                    var properties = componentDefinition.properties,
                        publicProperties = componentDefinition.publicProperties,
                        component = {
                            type: this.type
                        },
                        key = '';
                    
                    for (key in properties) {
                        if (properties.hasOwnProperty(key) && (properties[key] !== this[key])) {
                            component[key] = this[key];
                        }
                    }

                    for (key in publicProperties) {
                        if (publicProperties.hasOwnProperty(key) && (publicProperties[key] !== this.owner[key])) {
                            propertiesDefinition[key] = this.owner[key];
                        }
                    }

                    return component;
                };
            }
        }());

        // Throw deprecation warning if needed (deprecated as of v0.10.1)
        if (componentDefinition.hasOwnProperty('constructor')) {
            platypus.debug.warn(componentDefinition.id + ': "constructor" has been deprecated in favor of "initialize" for a component\'s initializing function definition.');
        }

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

        return component;
    };
}());
