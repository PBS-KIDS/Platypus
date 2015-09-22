/**
 * This component works in tandem with the [`Mover`]("Mover"%20Component.html) component by adding a vector of motion to the entity. This component is typically created by `Mover` and doesn't need to be added separately.
 * 
 * @namespace platypus.components
 * @class Motion
 * @uses Component
 */
/*global platypus */
(function () {
    "use strict";
    
    var tempVector = new platypus.Vector(),
        prepUpdate = function (func) {
            return function (velocity, position, delta, grounded) {
                if (this.accelerator) {
                    this.resultant = velocity;
                } else {
                    this.resultant = position;
                }
                this.update = func;
                this.update(velocity, position, delta, grounded);
            };
        },
        isTrue = function () {
            return true;
        },
        createController = function (self, definition) {
            var active = self.active,
                enact  = true,
                ready  = true,
                getActiveState = isTrue,
                getInstantState = isTrue,
                state = self.owner.state,
                controlState = definition.controlState,
                instantState = definition.instantState,
                instantSuccess = definition.instantSuccess;

            if (controlState) {
                getActiveState = function () {
                    return state[controlState];
                };
            }

            if (definition.event) {
                /**
                 * This event controls whether this motion is active or inactive.
                 * 
                 * @method '[defined by event property]'
                 * @param control {Object|boolean} If `true`, this motion becomes active. If `false` or `{pressed: false}`, the motion becomes inactive.
                 */
                self.addEventListener(definition.event, function (control) {
                    active = (control && (control.pressed !== false));
                });
            }

            if (definition.instantEvent || instantState || definition.instantBegin || definition.instantEnd) {
                if (instantState) {
                    getInstantState = function () {
                        return state[instantState];
                    };
                }

                if (definition.instantEvent || definition.instantBegin || definition.instantEnd) {
                    enact = false;
                    if (definition.instantEvent) {
                        /**
                        * This event triggers an instant motion.
                        *
                        * @method '[defined by instantEvent property]'
                        * @param control {Object|boolean} If `true`, this motion becomes active. If `false` or `{pressed: false}`, the motion becomes inactive.
                        */
                        self.addEventListener(definition.instantEvent, function (control) {
                            enact = (control && (control.pressed !== false));
                        });
                    }
                    if (definition.instantBegin) {
                        /**
                        * This event triggers the beginning of an instant motion.
                        *
                        * @method '[defined by instantBegin property]'
                        * @param control {Object|boolean} If `true`, this motion becomes active. If `false` or `{pressed: false}`, the motion becomes inactive.
                        */
                        self.addEventListener(definition.instantBegin, function () {
                            enact = true;
                        });
                    }
                    if (definition.instantEnd) {
                        /**
                        * This event triggers the end of an instant motion.
                        *
                        * @method '[defined by instantEnd property]'
                        * @param control {Object|boolean} If `true`, this motion becomes active. If `false` or `{pressed: false}`, the motion becomes inactive.
                        */
                        self.addEventListener(definition.instantEnd, function () {
                            enact = false;
                        });
                    }
                }

                self.update = prepUpdate(function (velocity, position, delta, grounded) {
                    var state = getInstantState();

                    this.active = active && getActiveState();

                    if (ready && enact && this.active && state) {
                        ready = false; // to insure a single instance until things are reset
                        this.move(1);
                        if (instantSuccess) {
                            this.owner.triggerEvent(instantSuccess);
                        }
                    } else if (!ready && !(enact && state)) {
                        ready = true;
                        this.decay();
                    }
                });
            } else {
                self.update = prepUpdate(function (velocity, position, delta, grounded) {
                    this.active = active && getActiveState();
                    if (this.active) {
                        this.move(delta);
                    }
                });
            }
        };
    
    return platypus.createComponentClass({
        
        id: 'Motion',

        properties: {
            /**
             * Whether this motion should automatically re-orient when the entity re-orients.
             * 
             * @property orient
             * @type boolean
             * @default true
             */
            orient: true,
            
            /**
             * Whether this motion accelerates the entity (versus a flat velocity addition).
             * 
             * @property accelerator
             * @type boolean
             * @default true
             */
            accelerator: false,
            
            /**
             * Whether this motion is current acting on the entity. This boolean value can be tied to a specific entity state and/or event using the `event` and `controlState` properties.
             * 
             * @property active
             * @type boolean
             * @default true
             */
            active: true,
            
            /**
             * This is the highest magnitude allowed for the motion vector.
             * 
             * @property maxMagnitude
             * @type number
             * @default Infinity
             */
            maxMagnitude: Infinity,
            
            /**
             * When this event is triggered on the entity, this motion can be turned on or off. Sending `true` or `{pressed: true}` makes the motion active. Sending `false` or `{pressed: false}` makes the motion inactive.
             * 
             * @property event
             * @type String
             * @default ""
             */
            event: "",
            
            /**
             * When this state on the entity changes, this motion's active state is changed to match. If an "event" property is also set on this component, both the event and the state must be true for the motion to be active.
             * 
             * @property controlState
             * @type String
             * @default ""
             */
            controlState: "",
            
            /**
             * If instantEvent or instantState are set, the motion is only triggered for a single step and must be re-triggered to activate again. Sending `true` or `{pressed: true}` makes the motion active.
             * 
             * @property instantEvent
             * @type String
             * @default ""
             */
            instantEvent: "",
            
            /**
             * If instantBeing is set, the motion is triggered for a single step and must be re-triggered to activate again. The motion cannot begin again until it is ended by instantEnd or instant Event.
             *
             * @property instantBegin
             * @type String
             * @default ""
             */
            instantBegin: "",

            /**
             * If instantEnd is set, when triggered it will reset the event so that it can triggered again.
             *
             * @property instantEnd
             * @type String
             * @default ""
             */
            instantEnd: "",

            /**
             * If instantEvent or instantState are set, the motion is only triggered for a single step and must be re-triggered to activate again. When the instantState on the entity becomes `true`, this motion's active state is changed to match. If an "instantEvent" property is also set on this component, both the event and the state must be true for the motion to be active. If "event" or "controlState" are also defined, they must also be `true` to trigger an instant motion on the entity.
             * 
             * @property instantState
             * @type String
             * @default ""
             */
            instantState: "",
            
            /**
             * If instantEvent or instantState are set, this event is triggered when the intance of motion occurs on the entity.
             * 
             * @property instantSuccess
             * @type String
             * @default ""
             */
            instantSuccess: "",
            
            /**
             * This determines if setting active to `false` (via the control event or state) should dampen velocity. This is a ratio applied to the vector magnitude between 0 and 1. This is useful for events like jumping where a longer keypress should jump farther than a shorter keypress. Here's an example for a variable-height jump motion:
             * 
             *      {
             *          vector: [0, -1.6, 0],
             *          accelerator: true,
             *          controlState: "grounded",
             *          instantEvent: "jump",
             *          instantDecay: 0.2
             *      }
             * 
             * @property instantDecay
             * @type number
             * @default null
             */
            instantDecay: null,
            
            /**
             * A vector, Array, or number specifying the direction and magnitude of the motion. Numbers apply magnitude along the x-axis. Arrays map to [x, y, z] on the vector.
             * 
             * @property vector
             * @type Vector|Array|number
             * @default Vector(0, 0, 0)
             */
            vector: 0
        },
        
        constructor: function (definition) {
            this.vector = new platypus.Vector(this.vector);
            this.triggered = false;
            
            if (!isNaN(this.instantDecay)) {
                this.capMagnitude = this.vector.magnitude() * this.instantDecay;
            } else {
                this.capMagnitude = -1;
            }
            
            createController(this, definition);
            
            if (this.orient) { // Orient vectors in case the entity is in a transformed position.
                this.owner.triggerEvent('orient-vector', this.vector);
            }
        },

        events: {
            "set-vector": function (newVector) {
                this.vector.set(newVector);
                if (!isNaN(this.instantDecay)) {
                    this.capMagnitude = this.vector.magnitude() * this.instantDecay;
                } else {
                    this.capMagnitude = -1;
                }
            }
        },

        methods: {
            move: function (delta) {
                if (this.vector.magnitude() > this.maxMagnitude) {
                    this.vector.normalize().multiply(this.maxMagnitude);
                }
                this.resultant.add(tempVector.set(this.vector).multiply(delta));
            },
            
            // This handles things like variable height jumping by adjusting the jump velocity to the pre-determined cap velocity for jump-button release.
            decay: function () {
                var s = null;
                
                if (this.capMagnitude >= 0) {
                    s = tempVector.set(this.resultant).scalarProjection(this.vector);
                    if (s > this.capMagnitude) {
                        this.resultant.subtractVector(tempVector.set(this.vector).normalize().scale(s - this.capMagnitude));
                    }
                }
            },
            
            destroy: function () {
                if (this.orient) {
                    this.owner.triggerEvent('remove-vector', this.vector);
                }
            }
        },
        
        publicMethods: {
        }
    });
}());
