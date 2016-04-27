/**
 * Creates an entity and connects it with the owner entity. This is useful for entities that have a one-to-one relationship with a given entity and must move as if connected to the host entity.
 *
 * @namespace platypus.components
 * @class LogicAttachment
 * @uses platypus.Component
 */
/* global include, platypus */
(function () {
    'use strict';

    var Entity = include('platypus.Entity'),
        linkId = 0;

    return platypus.createComponentClass({

        id: 'LogicAttachment',

        properties: {
            /**
             * An owner state, set to true when the attachment is attached. Meant to be read by other components or used in rendering.
             *
             * @property attachState
             * @type String
             * @default 'attached'
             */
            attachState: 'attached',
            /**
             * The type of the entity to be attached.
             *
             * @property attachment
             * @type String
             * @default ''
             */
            attachment: '',

            /**
             * The offset of the attached entity in x from the attachee.
             *
             * @property offsetX
             * @type Number
             * @default 0
             */
            offsetX: 0,
            /**
             * The offset of the attached entity in y from the attachee.
             *
             * @property offsetY
             * @type Number
             * @default 0
             */
            offsetY: 0,
            /**
             * The offset of the attached entity in z from the attachee.
             *
             * @property offsetZ
             * @type Number
             * @default 0
             */
            offsetZ: 0.01
        },

        publicProperties: {

        },

        constructor: function () {
            this.state = this.owner.state;

            if (!this.owner.linkId) {
                this.owner.linkId = 'attachment-link-' + linkId;
                linkId += 1;
            }

            this.state.set(this.attachState, false);
            this.attachmentPosition = {
                x: 0,
                y: 0,
                z: 0,
                dx: 0,
                dy: 0,
                linkId: this.owner.linkId
            };
            this.attachmentProperties = {
                type: this.attachment,
                properties: this.attachmentPosition
            };

            this.attachment = null;
            this.isAttached = false;
        },

        events: {// These are messages that this component listens for

            /**
             * On receiving this message, updates the attached entity's position.
             *
             * @method 'handle-logic'
             */
            "handle-logic": function () {
                var offset = 0,
                    state  = this.state;

                if (this.isAttached) {
                    if (!this.attachment) {
                        this.attachmentPosition.x = this.owner.x;
                        this.attachmentPosition.y = this.owner.y;
                        this.attachmentPosition.z = this.owner.z;
                        this.attachment = this.owner.parent.addEntity(this.attachmentProperties);
                    }
                    
                    if (this.attachment.destroyed) {
                        this.owner.parent.removeEntity(this.attachment);
                        this.attachment = null;
                        this.isAttached = false;
                    } else {
                        this.attachment.x = this.owner.x;
                        offset = this.offsetX;
                        if (state.get('left')) { //TODO: Base this on object orientation. - DDD 3/2/2016
                            offset *= -1;
                            this.attachment.rotation = 180;
                        } else if (state.get('right')) {
                            this.attachment.rotation = 0;
                        }
                        this.attachment.x += offset;

                        this.attachment.y = this.owner.y;
                        offset = this.offsetY;
                        if (state.get('top')) {
                            offset *= -1;
                            this.attachment.rotation = 90;
                        } else if (state.get('bottom')) {
                            this.attachment.rotation = -90;
                        }
                        this.attachment.y += offset;

                        this.attachment.z = this.owner.z;
                        this.attachment.z += this.offsetZ;
                    }
                } else if (this.attachment) {
                    this.owner.parent.removeEntity(this.attachment);
                    this.attachment = null;
                }
                
                state.set(this.attachState, this.isAttached);
            },

            /**
             * Creates and attaches the entity. The input value makes it possible to attach the entity on user input.
             *
             * @method 'attach'
             * @param input {Object} An input object.
             * @param input.pressed {Boolean} If set to true, the entity is created and attached.
             */
            "attach": function (input) {
                this.isAttached = !input || (input.pressed !== false);
            },
            /**
             * Detaches and removes the entity.
             *
             * @method 'detach'
             */
            "detach": function () {
                this.isAttached = false;
            }
        },

        methods: {
            destroy: function () {
                this.state.set(this.attachState, false);
                if (this.attachment) {
                    this.owner.parent.removeEntity(this.attachment);
                    this.attachment = null;
                }
                this.isAttached = false;
                this.state = null;
            }
        },
        
        getAssetList: function (def, props, defaultProps) {
            var attachment = def.attachment || props.attachment || defaultProps.attachment;
            
            if (attachment) {
                return Entity.getAssetList({
                    type: attachment
                });
            }
            
            return Array.setUp();
        }
    });
}());
