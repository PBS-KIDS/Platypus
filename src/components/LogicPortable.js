/**
 * This component allows this entity to be carried by other entities with which it collides. Entities that should carry this entity need to have a [[Logic-Carrier]] component attached.
 *
 * @memberof platypus.components
 * @class LogicPortable
 * @uses platypus.Component
 */
import createComponentClass from '../factory.js';

export default (function () {
    return createComponentClass({
        id: 'LogicPortable',
        properties: {
            /**
             * This is an object specifying the directions that this portable entity can be carried on. Default is {down:true}, but "up", "down", "left", and/or "right" can be specified as object properties set to `true`.
             *
             * @property portableDirections
             * @type Object
             * @default {"down": true}
             */
            portableDirections: {
                down: true //default is false, 'true' means as soon as carrier is connected downward
            }
        },
        initialize: function () {
            this.carrier = this.lastCarrier = null;
            this.message = {
                entity: this.owner
            };
        },
        events: {
            /**
             * On receiving this message, this component triggers 'carry-me' or 'release-me' if its connection to a carrying entity has changed.
             *
             * @method 'handle-logic'
             */
            "handle-logic": function () {
                var msg = this.message;
                
                if (this.carrierConnected) {
                    if (this.carrier !== this.lastCarrier) {
                        if (this.lastCarrier) {
                            this.lastCarrier.triggerEvent('release-me', msg);
                        }

                        /**
                         * This message is triggered on a potential carrying peer, notifying the peer that this entity is portable.
                         *
                         * @event 'carry-me'
                         * @param message.entity {platypus.Entity} This entity, requesting to be carried.
                         */
                        this.carrier.triggerEvent('carry-me', msg);
                    }
                    
                    this.carrierConnected = false;
                } else if (this.carrier) {

                    /**
                     * This message is triggered on the current carrier, notifying them to release this entity.
                     *
                     * @event 'release-me'
                     * @param message.entity {platypus.Entity} This entity, requesting to be released.
                     */
                    this.carrier.triggerEvent('release-me', msg);
                    this.carrier = null;
                }
                this.lastCarrier = this.carrier;
            },

            /**
             * On receiving this message, this component determines whether it is hitting its carrier or another entity. If it is hitting a new carrier, it will broadcast 'carry-me' on the next game step.
             *
             * @method 'hit-solid'
             * @param collisionInfo.entity {platypus.Entity} The entity with which the collision occurred.
             * @param collisionInfo.x {Number} -1, 0, or 1 indicating on which side of this entity the collision occurred: left, neither, or right respectively.
             * @param collisionInfo.y {Number} -1, 0, or 1 indicating on which side of this entity the collision occurred: top, neither, or bottom respectively.
             */
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

            /**
             * On receiving this message, this component immediately triggers 'release-me' on its owner's carrier.
             *
             * @method 'force-release'
             */
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
