/**
 * Allows an entity to communicate directly with one or more entities via the message model by passing local events directly to the linked entities as new triggered events.
 *
 * @namespace platypus.components
 * @class RelayLinker
 * @uses platypus.Component
 */
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    var broadcast = function (event) {
        return function (value, debug) {
            var i = 0;
            
            for (i = 0; i < this.links.length; i++) {
                this.links[i].trigger(event, value, debug);
            }
        };
    };

    return platypus.createComponentClass({
        id: 'RelayLinker',

        properties: {
            /**
             * The id that defines the 'channel' the linkers are talking on. This should be matched on the entity/entities you want to talk between.
             *
             * @property linkId
             * @type String
             * @default 'linked'
             */
            linkId: 'linked',
            /**
             * This is an object of key/value pairs. The keys are events this component is listening for locally, the value is the event to be broadcast to its linked entities. The value can also be an array of events to be fired on linked entities.
             *
             *      "events": {
             *          "sleeping": "good-night",
             *          "awake": ["alarm", "get-up"]
             *      }
             *
             * @property events
             * @type Object
             * @default null
             */
            events: null
        },

        publicProperties: {

        },

        constructor: function (definition) {
            var i = 0,
                self  = this,
                event = '';

            if (this.events) {
                for (event in this.events) {
                    if (this.events.hasOwnProperty(event)) {
                        this.addEventListener(event, broadcast(this.events[event]));
                    }
                }
            }
            
            if (!this.owner.linkId) {
                this.owner.linkId = this.linkId;
            }
            
            this.addEventListener('to-' + this.linkId + '-entities', broadcast('from-' + this.linkId + '-entities'));
            this.addEventListener('from-' + this.linkId + '-entities', function (resp) {
                self.owner.trigger(resp.message, resp.value, resp.debug);
            });
            
            this.links = [];
            
            if (this.owner.linkEntities) {
                for (i = 0; i < this.owner.linkEntities.length; i++) {
                    this.links.push(this.owner.linkEntities[i]);
                }
            }
            
            this.message = {
                message: '',
                value: null
            };
            this.linkMessage = {
                entity: this.owner,
                linkId: this.linkId,
                reciprocate: false
            };
            
            // In case linker is added after adoption
            if (this.owner.parent) {
                this.resolveAdoption();
            }
        },
        
        events: {

            /**
             * Called when the object is added to its parent, on receiving this message, the component tries to link itself with objects with the same link id.
             *
             * @method 'adopted'
             * @param owner {platypus.Entity} The owner of this component.
             */
            "adopted": function (owner) {
                this.resolveAdoption(owner);
            },
            
            /**
             * On receiving this message, this component checks the linkId of the requesting entity and adds it to its list of connections if it matches.
             *
             * @method 'link-entity'
             * @param toLink {platypus.Entity} The enquiring entity.
             */
            "link-entity": function (toLink) {
                var i = 0,
                    already = false;
                
                if ((toLink.linkId === this.linkId) && (toLink.entity !== this.owner)) {
                    // Make sure this link is not already in place
                    for (i = 0; i < this.links.length; i++) {
                        if (this.links[i] === toLink.entity) {
                            already = true;
                            break;
                        }
                    }
                    
                    if (!already) {
                        this.links.push(toLink.entity);
                        if (toLink.reciprocate) {
                            this.linkMessage.reciprocate = false;
                            toLink.entity.trigger('link-entity', this.linkMessage);
                        }
                    }
                }
            },
            
            /**
             * Removes the requesting entity from this component's list of linked entities and no farther messages will be transmitted.
             *
             * @method 'unlink-entity'
             * @param toUnlink {platypus.Entity} The enquiring entity.
             */
            "unlink-entity": function (toUnlink) {
                var i = 0;
                
                for (i = 0; i < this.links.length; i++) {
                    if (toUnlink.entity === this.links[i]) {
                        this.links.splice(i, 1);
                        break;
                    }
                }
            }
        },
        
        methods: {
            resolveAdoption: function (owner) {
                var grandparent = this.owner.parent;
                while (grandparent.parent) {
                    grandparent = grandparent.parent;
                }
                this.linkMessage.reciprocate = true;
                grandparent.triggerOnChildren('link-entity', this.linkMessage, true);
            },
            
            destroy: function () {
                var i = 0;
                
                for (i = 0; i < this.links.length; i++) {
                    this.links[i].trigger('unlink-entity', this.linkMessage);
                }
                this.links.length = 0;
                this.events = null;
            }
        }
    });
}());
