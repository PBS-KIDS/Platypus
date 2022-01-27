import Entity from '../Entity.js';
import {arrayCache} from '../utils/array.js';
import createComponentClass from '../factory.js';

export default (function () {
    var
        trigger = function () {
            var attachment = this.attachment;
            
            if (attachment) {
                attachment.trigger.apply(attachment, arguments);
            }
        };

    return createComponentClass(/** @lends platypus.components.LogicAttachment.prototype */{

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
             * This is an object of key/value pairs. The keys are events this component is listening for locally, the value is the new event to be broadcast on the attached entity. The value can also be an array of events to be fired.
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
            events: null,

            /**
             * Whether the attachment starts out attached.
             *
             * @property startAttached
             * @type Boolean
             * @default false
             */
            startAttached: false,

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

        /**
         * Creates an entity and connects it with the owner entity. This is useful for entities that have a one-to-one relationship with a given entity and must move as if connected to the host entity.
         *
         * @memberof platypus.components
         * @uses platypus.Component
         * @constructs
         * @listens platypus.Entity#attach
         * @listens platypus.Entity#change-attachment-offset
         * @listens platypus.Entity#detach
         * @listens platypus.Entity#handle-logic
         */
        initialize: function () {
            var event = '',
                events = this.events;
            
            this.state = this.owner.state;

            this.state.set(this.attachState, this.startAttached);
            this.attachmentPosition = {
                x: 0,
                y: 0,
                z: 0,
                dx: 0,
                dy: 0
            };
            this.attachmentProperties = {
                type: this.attachment,
                properties: this.attachmentPosition
            };

            this.attachment = null;
            this.isAttached = this.startAttached;

            // Messages that this component listens for and then triggers on the attached entity.
            if (events) {
                for (event in events) {
                    if (events.hasOwnProperty(event)) {
                        this.addEventListener(event, trigger.bind(this, events[event]));
                    }
                }
            }
        },

        events: {
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
             * @event platypus.Entity#attach
             * @param input {Object} An input object.
             * @param input.pressed {Boolean} If set to true, the entity is created and attached.
             */
            "attach": function (input) {
                this.isAttached = !input || (input.pressed !== false);
            },

            /**
             * Detaches and removes the entity.
             *
             * @event platypus.Entity#detach
             */
            "detach": function () {
                this.isAttached = false;
            },

            /**
             * Changes the x, y, and z offset of the attachment.
             *
             * @event platypus.Entity#change-attachment-offset
             * @param offset {Object} An object containing the offset values.
             * @param input.x {Number} The new X offset.
             * @param input.y {Number} The new Y offset.
             * @param input.y {Number} The new Z offset.
             */
            "change-attachment-offset": function (offset) {
                if (typeof offset.x !== 'undefined') {
                    this.offsetX = offset.x;
                } else if (typeof offset.y !== 'undefined') {
                    this.offsetY = offset.y;
                } else if (typeof offset.z !== 'undefined') {
                    this.offsetZ = offset.z;
                }
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
            
            return arrayCache.setUp();
        }
    });
}());
