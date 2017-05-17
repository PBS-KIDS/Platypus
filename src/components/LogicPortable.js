/**
# COMPONENT **LogicPortable**
This component allows this entity to be carried by other entities with which it collides. Entities that should carry this entity need to have a [[Logic-Carrier]] component attached.

## Dependencies:
- [[HandlerLogic]] (on parent entity) - This component listens for 'handle-logic' messages to determine whether it should be carried or released each game step.
- [[LogicCarrier]] (on peer entity) - This component triggers 'carry-me' and 'release-me' message, listened for by [[Logic-Carrier]] to handle carrying this entity.

## Messages

### Listens for:
- **handle-logic** - On receiving this message, this component triggers 'carry-me' or 'release-me' if its connection to a carrying entity has changed.
- **hit-solid** - On receiving this message, this component determines whether it is hitting its carrier or another entity. If it is hitting a new carrier, it will broadcast 'carry-me' on the next game step.
  - @param message.entity ([[Entity]]) - The entity with which the collision occurred.
  - @param message.x (number) - -1, 0, or 1 indicating on which side of this entity the collision occurred: left, neither, or right respectively.
  - @param message.y (number) - -1, 0, or 1 indicating on which side of this entity the collision occurred: top, neither, or bottom respectively.

### Peer Broadcasts
- **carry-me** - This message is triggered on a potential carrying peer, notifying the peer that this entity is portable.
  - @param message.entity ([[Entity]]) - This entity, requesting to be carried.
- **release-me** - This message is triggered on the current carrier, notifying them to release this entity.
  - @param message.entity ([[Entity]]) - This entity, requesting to be released.

## JSON Definition:
    {
      "type": "LogicPortable",

      "portableDirections": {down: true}
      // This is an object specifying the directions that this portable entity can be carried on. Default is {down:true}, but "up", "down", "left", and/or "right" can be specified as object properties set to `true`.
    }
*/
/* global platypus */
(function () {
    'use strict';
    
    var
        defaultOrientation = {
            down: true //default is false, 'true' means as soon as carrier is connected downward
        };

    return platypus.createComponentClass({
        id: 'LogicPortable',
        initialize: function (definition) {
            this.portableDirections = definition.portableDirections || defaultOrientation;
    
            this.carrier      = this.lastCarrier = null;
            this.message      = {
                entity: this.owner
            };
        },
        events: {
            "handle-logic": function () {
                var msg = this.message;
                
                if (this.carrierConnected) {
                    if (this.carrier !== this.lastCarrier) {
                        if (this.lastCarrier) {
                            this.lastCarrier.triggerEvent('release-me', msg);
                        }
                        this.carrier.triggerEvent('carry-me', msg);
                    }
                    
                    this.carrierConnected = false;
                } else if (this.carrier) {
                    this.carrier.triggerEvent('release-me', msg);
                    this.carrier = null;
                }
                this.lastCarrier = this.carrier;
            },
            "hit-solid": function (collisionInfo) {
                if (collisionInfo.y > 0) {
                    this.updateCarrier(collisionInfo.entity, 'down');
                } else if (collisionInfo.y < 0) {
                    this.updateCarrier(collisionInfo.entity, 'up');
                } else if (collisionInfo.x < 0) {
                    this.updateCarrier(collisionInfo.entity, 'left');
                } else if (collisionInfo.x > 0) {
                    this.updateCarrier(collisionInfo.entity, 'right');
                }
            },
            "force-release": function () {
                if (this.carrier) {
                    this.carrier.triggerEvent('release-me', this.message);
                }
                this.carrier = null;
                this.lastCarrier = this.carrier;
                this.carrierConnected = false;
            }
        },
        methods: {
            updateCarrier: function (entity, direction) {
                if (this.portableDirections[direction]) {
                    if (entity) {
                        if (entity !== this.carrier) {
                            this.carrier = entity;
                        }
                        this.carrierConnected = true;
                    }
                }
            }
        }
    });
}());
