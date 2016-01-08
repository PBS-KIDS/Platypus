/**
 * This component listens for messages and, according to its preset settings, will remove and add components to the entity. This is useful if certain events should modify the behavior of the entity in some way: for example, acquiring a pogo-stick might add a jumping component so the hero can jump.
 * 
 * @namespace platypus.components
 * @class ComponentSwitcher
 * @uses platypus.Component 
 */
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    var addSwitch = function (event) {
            this.switches.push(event);
        };
    
    return platypus.createComponentClass({
        id: 'ComponentSwitcher',
        
        properties: {
            /**
             * This is the list of messages to listen for (as the keys) with the settings as two arrays of components to add and components to remove.
             * 
                {
                    "found-pogostick":{
                      "add":[
                      // This is a list of components to add when "found-pogostick" is triggered on the entity. If it's adding a single component, "add" can be a reference to the component definition itself rather than an array of one object.
                        {"type": "Mover"},
                        {"type": "HeadGear"}
                      ]
                      
                      "remove": ["CarSeat"]
                      // This is a string list of component ids to remove when "found-pogostick" is triggered on the entity. It will ignore listed components that are not connected to the entity.
                    },
                    
                    // Multiple events can cause unique components to be added or removed
                    "walking-indoors":{
                      "remove": ["HeadGear"]
                    },
                    
                    "contemplate":{
                      "add": {"type": "AIPacer"}
                    }
                  }
                }
             * 
             * @property componentMap
             * @type Object
             * @default null
             */
            componentMap: null
        },
        
        constructor: function (definition) {
            var event = '';
            
            this.switches = []; // The list of switches to make.
            
            if (this.componentMap) {
                for (event in this.componentMap) {
                    if (this.componentMap.hasOwnProperty(event)) {
                        /**
                         * Message(s) listed by `componentMap` will add or remove components.
                         * 
                         * @method '*'
                         */
                        this.addEventListener(event, addSwitch.bind(this, event));
                    }
                }
            }
        },
        
        events: {
            /**
             * This component handles component-switching on this call so that it doesn't interfere with the "handle-logic" loop.
             * 
             * @method 'prepare-logic'
             */
            "prepare-logic": function () {
                var i = 0;
                
                if (this.switches.length) {
                    for (i = 0; i < this.switches.length; i++) {
                        this.switchComponents(this.componentMap[this.switches[i]]);
                    }
                    this.switches.length = 0;
                }
            }
        },
        
        methods: {
            switchComponents: function (definition) {
                var i = 0,
                    j = 0,
                    owner = this.owner,
                    components = owner.components,
                    remove = definition.remove,
                    add = definition.add;
                    
                if (remove) {
                    if (!Array.isArray(remove)) {
                        for (i = components.length - 1; i > -1; i--) {
                            if (components[i].type === remove) {
                                owner.removeComponent(components[i]);
                            }
                        }
                    } else {
                        for (i = 0; i < remove.length; i++) {
                            for (j = components.length - 1; j > -1; j--) {
                                if (components[j].type === remove[i]) {
                                    owner.removeComponent(components[j]);
                                }
                            }
                        }
                    }
                }

                if (add) {
                    if (!Array.isArray(add)) {
                        owner.addComponent(new platypus.components[add.type](owner, add));
                    } else {
                        for (i = 0; i < add.length; i++) {
                            owner.addComponent(new platypus.components[add[i].type](owner, add[i]));
                        }
                    }
                }
                
                if (owner.parent) {
                    /**
                    * This message is triggered on the parent when the entity's components change.
                    * 
                    * @event 'child-entity-updated'
                    * @param entity {platypus.Entity} This is the entity itself.
                    */
                    owner.parent.triggerEvent('child-entity-updated', owner);
                }
                /**
                * This message is triggered on the entity itself when its components change.
                * 
                * @event 'add-remove-component-complete'
                */
                owner.triggerEvent('add-remove-component-complete');
            }
        },
        
        getAssetList: (function () {
            var union = function (a, b) {
                    var i = 0,
                        j = 0,
                        aL = a.length,
                        bL = b.length,
                        found = false;
                        
                    for (i = 0; i < bL; i++) {
                        found = false;
                        for (j = 0; j < aL; j++) {
                            if (b[i] === a[j]) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            a.push(b[i]);
                        }
                    }
                };
            
            return function (def, props, defaultProps) {
                var map = def.componentMap || props.componentMap || defaultProps.componentMap,
                    event = '',
                    i = 0,
                    component = null,
                    assets = [];
                
                for (event in map) {
                    if (map.hasOwnProperty(event)) {
                        for (i = 0; i < map[event].add.length; i++) {
                            component = platypus.components[map[event].add[i].type];
                            if (component) {
                                union(assets, component.getAssetList(map[event].add[i], props, defaultProps));
                            }
                        }
                    }
                }
                
                return assets;
            };
        }())
    });
}());
