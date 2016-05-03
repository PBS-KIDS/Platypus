/**
 * This component allows an entity to communicate directly with one or more entities via the message model, by passing local messages directly to entities in the same family as new triggered events. This component is placed on a single entity and all entities created by this entity become part of its "family".
 *
 * @namespace platypus.components
 * @class RelayFamily
 * @uses platypus.Component
 */
/*global platypus */
(function () {
    'use strict';

    return platypus.createComponentClass({
        id: 'RelayFamily',
        
        properties: {
            /**
             * This is an object of key/value pairs. The keys are events this component is listening for locally, the value is the event that will be broadcast to its linked entities. The value can also be an array of events to be fired on linked entities.
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

        constructor: function () {
            var event = '';
            
            if (this.events) {
                for (event in this.events) {
                    if (this.events.hasOwnProperty(event)) {
                        this.addEventListener(event, this.broadcast.bind(this, null, this.events[event]));
                    }
                }
            }
    
            this.owner.familyLinks = Array.setUp(this.owner);
        },
        
        events: {
            /**
             * Called when linking a new member to the family, this event accepts a list of family members from the new member and uses it to link all the family members together.
             *
             * @method 'link-family'
             * @param links {Array|Entities} An array of entities.
             */
            "link-family": function (links) {
                var i = 0,
                    oldList = this.owner.familyLinks,
                    newList = Array.setUp().union(links).union(oldList);

                for (i = 0; i < newList.length; i++) {
                    newList[i].familyLinks = newList;
                }
                this.broadcast(links,   'family-members-added', oldList);
                this.broadcast(oldList, 'family-members-added', links);
                oldList.recycle();
            },
            
            /**
             * Called when this entity spawns a new entity, this event links the newly created entity to this entity.
             *
             * @method 'entity-created'
             * @param entity {platypus.Entity} The entity to link.
             */
            "entity-created": function (entity) {
                if (!entity.triggerEvent('link-family', this.owner.familyLinks)) {
                    entity.addComponent(new platypus.components.RelayFamily(entity, {}));
                    entity.triggerEvent('link-family', this.owner.familyLinks);
                }
            }
        },
        
        methods: {
            broadcast: function (links) {
                var entities = links || this.owner.familyLinks,
                    i = 0,
                    args = Array.prototype.greenSlice.call(arguments);

                args.greenSplice(0);

                for (i = 0; i < entities.length; i++) {
                    entities[i].trigger.apply(entities[i], args);
                }
                
                args.recycle();
            },
            
            destroy: function () {
                var familyLinks = this.owner.familyLinks,
                    i = familyLinks.indexOf(this.owner);
                
                if (i >= 0) {
                    familyLinks.greenSplice(i);
                }
                this.broadcast(familyLinks, 'family-member-removed', this.owner);
                this.events = null;
            }
        }
    });
}());
