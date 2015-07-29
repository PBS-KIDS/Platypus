/**
# COMPONENT **DOMElement**
This component creates a DOM element associated with the entity. In addition to allowing for CSS styling, the element can also perform as a controller accepting click and touch inputs and triggering associated messages on the entity.

## Dependencies:
- [[HandlerRenderDOM]] (on entity's parent) - This component listens for a render "handle-render-load" message with a DOM element to setup and display the element.

## Messages

### Listens for:
- **handle-render-load** - This event provides the parent DOM element that this component will require for displaying its DOM element.
  - @param message.element (DOM element) - Required. Provides the render component with the necessary DOM element parent.
- **handle-render** - On each `handle-render` message, this component checks to see if there has been a change in the state of the entity. If so (and updateClassName is set to true in the JSON definition) it updates its className accordingly.
- **logical-state** - This component listens for logical state changes and updates its local record of states.
  - @param message (object) - Required. Lists various states of the entity as boolean values. For example: {jumping: false, walking: true}. This component retains its own list of states and updates them as `logical-state` messages are received, allowing multiple logical components to broadcast state messages.
- **update-content** - This message updates the innerHTML of the DOM element.
  - @param message (string) - The text that should replace the DOM element's innerHTML.
  - @param message.text (string) - Alternatively an object may be passed in with a text property that should replace the DOM element's innerHTML.
- **set-parent** - This message appends the element to the provided parent element.
  - @param parent (DOM Element) - Required. The DOM Element that this element should be appended to.
- **set-attribute** - This message updates an attribute of the DOM element.
  - @param message.attribute (string) - The attribute that is to be changed.
  - @param message.value (string) - The value the changed attribute should have.
  - @param message (object) - Alternatively, multiple attributes may be changed with a list of key/value pairs where keys match the attributes whose values will be changed.
- **set-style** - This message updates the style of the DOM element.
  - @param message.attribute (string) - The CSS property that is to be changed.
  - @param message.value (string) - The value the changed CSS property should have.
  - @param message (object) - Alternatively, multiple CSS properties may be changed with a list of key/value pairs where keys match the properties whose values will be changed.

### Local Broadcasts:
- **[Messages specified in definition]** - Element event handlers will trigger messages as defined in the JSON definition.
  - @param message (DOM Event object) - When messages are triggered on the entity, the associated message object is the DOM Event object that was provided to the originating DOM Event handler.

## JSON Definition
    {
      "type": "DOMElement",

      "element": "div",
      //Required. Sets what type of DOM element should be created.
      
      "innerHTML": "Hi!",
      //Optional. Sets the DOM element's inner text or HTML.
      
      "className": "top-band",
      //Optional. Any standard properties of the element can be set by listing property names and their values. "className" is one example, but other element properties can be specified in the same way.
      
      "updateClassName": true,
      //Optional. Specifies whether the className of the DOM element should be updated to reflect the entity's logical state. This setting will cause the className to equal its setting above followed by a space-delimited list of its `true` valued state names.
      
      "onmousedown": "turn-green",
      //Optional. If specified properties begin with "on", it is assumed that the property is an event handler and the listed value is broadcast as a message on the entity where the message object is the event handler's event object.

      "onmouseup": ["turn-red", "shout"]
      //Optional. In addition to the event syntax above, an Array of strings may be provided, causing multiple messages to be triggered in the order listed.
    }
*/
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    var createFunction = function (message, entity) {
        if (typeof message === 'string') {
            return function (e) {
                entity.trigger(message, e);
                e.preventDefault();
            };
        } else if (Array.isArray(message)) {
            return function (e) {
                var i = 0;
                
                for (i = 0; i < message.length; i++) {
                    entity.trigger(message[i], e);
                }
                e.preventDefault();
            };
        } else {
            return function (e) {
                entity.trigger(message.event, message.message);
                e.preventDefault();
            };
        }
    };
    
    return platypus.createComponentClass({
        id: 'DOMElement',
        constructor: function (definition) {
            var key         = '',
                style       = '',
                elementType = definition.element   || 'div';
            
            this.updateClassName = definition.updateClassName || false;
            this.className = '';
            this.states = {};
            this.stateChange = false;
            this.potentialParent = definition.parent;
            this.handleRenderLoadMessage = null;
            
            this.element = document.createElement(elementType);
            if (!this.owner.element) {
                this.owner.element = this.element;
            }
            this.element.ondragstart = function () {
                return false; //prevent element dragging by default
            };
            
            for (key in definition) {
                if (definition.hasOwnProperty(key)) {
                    if (key === 'style') {
                        for (style in definition.style) {
                            if (definition.style.hasOwnProperty(style)) {
                                this.element.style[style] = definition.style[style];
                            }
                        }
                    } else if (((key !== 'type') || (elementType === 'input')) && (key !== 'element') && (key !== 'parent') && (key !== 'updateClassName') && (key !== 'attributes') && (key !== 'messageMap')) {
                        if (key.indexOf('on') === 0) {
                            if (platypus.supports.mobile) {
                                if (key.indexOf('onmouse') === -1) {
                                    this.element[key] = createFunction(definition[key], this.owner);
                                }
                            } else {
                                this.element[key] = createFunction(definition[key], this.owner);
                            }
                        } else {
                            this.element[key] = definition[key];
                            if (key === 'className') {
                                this.className = definition[key];
                            }
                        }
                    }
                }
            }
            
            if (this.owner.className) {
                this.className = this.element.className = this.owner.className;
            }
            if (this.owner.innerHTML) {
                this.element.innerHTML = this.owner.innerHTML;
            }
        },
        events: {
            "handle-render-load": (function () {
                var getElementById = function (root, id) {
                    var i   = 0,
                        all = root.getElementsByTagName('*');

                    for (i = 0; i < all.length; i++) {
                        if (all[i].getAttribute('id') === id) {
                            return all[i];
                        }
                    }
                    
                    return document.getElementById(id);
                };
                
                return function (resp) {
                    var item    = '',
                        message = null;
                    
                    if (resp.element) {
                        if (!this.parentElement) {
                            if (this.potentialParent) {
                                this.parentElement = getElementById(resp.element, this.potentialParent);
                                this.parentElement.appendChild(this.element);
                            } else {
                                this.parentElement = resp.element;
                                this.parentElement.appendChild(this.element);
                            }
                        }
            
                        if (this.owner.triggerEventOnChildren) {
                            message = this.handleRenderLoadMessage = {};
                            for (item in resp) {
                                if (resp.hasOwnProperty(item)) {
                                    message[item] = resp[item];
                                }
                            }
                            message.element = this.element;
                            this.owner.triggerEventOnChildren('handle-render-load', message);
                        }
                    }
                };
            }()),
            
            "child-entity-added": function (entity) {
                if (this.handleRenderLoadMessage) {
                    entity.trigger("handle-render-load", this.handleRenderLoadMessage);
                }
            },
            
            "set-parent": function (element) {
                if (this.parentElement) {
                    this.parentElement.removeChild(this.element);
                }
                this.parentElement = element;
                this.parentElement.appendChild(this.element);
            },
            
            "handle-logic": function (resp) {
            },
            
            "handle-render": function (resp) {
                var state     = 0,
                    className = this.className;
                
                if (this.stateChange && this.updateClassName) {
                    for (state in this.states) {
                        if (this.states.hasOwnProperty(state) && this.states[state]) {
                            className += ' ' + state;
                        }
                    }
                    this.element.className = className;
                    this.stateChange = false;
                }
            },
            
            "set-attribute": function (resp) {
                var attribute = null;
                
                if (resp.attribute) { //Backwards compatibility for {attribute: 'attribute-name', value: 'new-value'} syntax
                    this.element.setAttribute(resp.attribute, resp.value);
                } else {
                    for (attribute in resp) {
                        if (resp.hasOwnProperty(attribute)) {
                            this.element.setAttribute(attribute, resp[attribute]);
                        }
                    }
                }
            },
            
            "set-style": function (resp) {
                var attribute = null;
                
                if (resp.attribute) { //Backwards compatibility for {attribute: 'attribute-name', value: 'new-value'} syntax
                    this.element.style[resp.attribute] = resp.value;
                } else {
                    for (attribute in resp) {
                        if (resp.hasOwnProperty(attribute)) {
                            this.element.style[attribute] = resp[attribute];
                        }
                    }
                }
            },
            
            "update-content": function (resp) {
                var text = resp;
                
                if (text && (typeof text.text === 'string')) {
                    text = text.text;
                }
                
                if ((typeof text === 'string') && (text !== this.element.innerHTML)) {
                    this.element.innerHTML = text;
                }
            },
        
            "logical-state": function (state) {
                var key = '';
                
                for (key in state) {
                    if (state.hasOwnProperty(key) && (this.states[key] !== state[key])) {
                        this.stateChange = true;
                        this.states[key] = state[key];
                    }
                }
            }
        },
        methods: {
            destroy: function () {
                if (this.parentElement) {
                    this.parentElement.removeChild(this.element);
                    this.parentElement = undefined;
                }
                if (this.owner.element === this.element) {
                    this.owner.element = undefined;
                }
                this.element = undefined;
            }
        }
    });
}());
