/**
//TODO: This should probably be merged with `LogicShield` since it performs a subset of the `LogicShield` behaviors. - DDD
*/
/*global platypus */
(function () {
    "use strict";

    return platypus.createComponentClass({
        id: 'LogicAttachedEntity',
        constructor: function (definition) {
            var randomizedXRange = this.owner.randomizedXRange || definition.randomizedXRange || 0,
                randomizedYRange = this.owner.randomizedYRange || definition.randomizedYRange || 0;

            this.entityType = this.owner.entityType || definition.entityType;
            this.entityProperties = this.owner.entityProperties || definition.entityProperties || {x: 0, y: 0, z: 0};
            this.offsetX = this.owner.offsetX || definition.offsetX || 0;
            this.offsetY = this.owner.offsetY || definition.offsetY || 0;
            
            this.offsetX += Math.floor(Math.random() * (randomizedXRange + 1));
            this.offsetY += Math.floor(Math.random() * (randomizedYRange + 1));
            
            this.attachedEntity = null;
        },

        events: {// These are messages that this component listens for
            "adopted": function (resp) {
                this.entityProperties.x = this.owner.x + this.offsetX;
                this.entityProperties.y = this.owner.y + this.offsetY;
                this.entityProperties.z = this.owner.z + 1;
                this.entityProperties.orientation = this.owner.orientation;
                this.attachedEntity = this.owner.parent.addEntity(new platypus.Entity(platypus.game.settings.entities[this.entityType], {
                    properties: this.entityProperties
                }));
                this.owner.triggerEvent('entity-created', this.attachedEntity);
            },
            "handle-logic": function (resp) {
                if (this.attachedEntity && !this.attachedEntity.components.length) {
                    this.attachedEntity = null;
                } else if (this.attachedEntity) {
                    this.attachedEntity.x = this.owner.x + this.offsetX;
                    this.attachedEntity.y = this.owner.y + this.offsetY;
                    this.attachedEntity.orientation = this.owner.orientation;
                }
            }
        },
        
        methods: {// These are methods that are called by this component.
            destroy: function () {
                this.entityProperties = null;
                if (this.attachedEntity && this.attachedEntity.parent) {
                    this.attachedEntity.parent.removeEntity(this.attachedEntity);
                }
                this.attachedEntity = null;
            }
            
        },
        
        publicMethods: {// These are methods that are available on the entity.
            
        }
    });
}());
