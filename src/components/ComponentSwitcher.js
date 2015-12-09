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

    var addRemoveComponents = function (definition, owner) {
        return function () {
            //Perform this swap outside of the entity's message loop to prevent endless loop errors due to messages not being able to be unbound.
            //TODO: should probably create a "safe" tick message to handle this sort of entity restructuring operation within the game loop.
            setTimeout(function () {
                var i = 0, j = 0;
                
                if (definition.remove) {
                    if (typeof definition.remove === 'string') {
                        for (i = owner.components.length - 1; i > -1; i--) {
                            if (owner.components[i].type === definition.remove) {
                                owner.removeComponent(owner.components[i]);
                            }
                        }
                    } else {
                        for (i = 0; i < definition.remove.length; i++) {
                            for (j = owner.components.length - 1; j > -1; j--) {
                                if (owner.components[j].type === definition.remove[i]) {
                                    owner.removeComponent(owner.components[j]);
                                }
                            }
                        }
                    }
                }

                if (definition.add) {
                    if (!Array.isArray(definition.add)) {
                        owner.addComponent(new platypus.components[definition.add.type](owner, definition.add));
                    } else {
                        for (i = 0; i < definition.add.length; i++) {
                            owner.addComponent(new platypus.components[definition.add[i].type](owner, definition.add[i]));
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
                owner.triggerEvent('add-remove-component-complete');
            }, 1);
        };
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
            
            if (this.componentMap) {
                for (event in this.componentMap) {
                    if (this.componentMap.hasOwnProperty(event)) {
                        /**
                         * Message(s) listed by `componentMap` will add or remove components.
                         * 
                         * @event *
                         */
                        this.addEventListener(event, addRemoveComponents(this.componentMap[event], this.owner));
                    }
                }
            }
        }
    });
}());
