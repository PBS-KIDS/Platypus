import createComponentClass from '../factory.js';

export default (function () {
    return createComponentClass(/** @lends platypus.components.LogicPortable.prototype */{
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

        /**
         * This component allows this entity to be carried by other entities with which it collides. Entities that should carry this entity need to have a [[Logic-Carrier]] component attached.
         *
         * @memberof platypus.components
         * @uses platypus.Component
         * @constructs
         * @listens platypus.Entity#force-release
         * @listens platypus.Entity#handle-logic
         * @listens platypus.Entity#hit-solid
         * @fires platypus.Entity#carry-me
         * @fires platypus.Entity#release-me
         */
        initialize: function () {
            this.carrier = this.lastCarrier = null;
            this.message = {
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

                        /**
                         * This message is triggered on a potential carrying peer, notifying the peer that this entity is portable.
                         *
                         * @event platypus.Entity#carry-me
                         * @param {platypus.Entity} message.entity This entity, requesting to be carried.
                         */
                        this.carrier.triggerEvent('carry-me', msg);
                    }
                    
                    this.carrierConnected = false;
                } else if (this.carrier) {

                    /**
                     * This message is triggered on the current carrier, notifying them to release this entity.
                     *
                     * @event platypus.Entity#release-me
                     * @param {platypus.Entity} message.entity This entity, requesting to be released.
                     */
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

            /**
             * On receiving this message, this component immediately triggers 'release-me' on its owner's carrier.
             *
             * @event platypus.Entity#force-release
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
