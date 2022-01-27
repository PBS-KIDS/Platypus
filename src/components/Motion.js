import Vector from '../Vector.js';
import createComponentClass from '../factory.js';

const
    isTrue = function () {
        return true;
    },
    getState = function (state, stateName) {
        return state.get(stateName);
    },
    instantUpdate = function (getInstantState, getActiveVelocityState, instantSuccess) {
        var state  = getInstantState(),
            vState = getActiveVelocityState();
        
        if (this.activeVelocity) {
            if (this.enact && !vState) { // Turn off ready if the state doesn't allow it.
                this.ready = false;
            }

            if (this.ready && this.enact && state) {
                this.ready = false; // to insure a single instance until things are reset
                this.velocity.setVector(this.instant);
                if (instantSuccess) {
                    this.owner.triggerEvent(instantSuccess);
                }
            } else if (!this.ready && !(this.enact && state)) {
                this.ready = true;
                this.decay();
            } else if (vState) {
                return null;
            }
            return this.velocity;
        } else {
            return null;
        }
    },
    gradualUpdate = function (getActiveVelocityState, delta) {
        if (this.activeVelocity && getActiveVelocityState()) {
            if (this.activeAcceleration) {
                this.move(delta);
            }

            return this.velocity;
        } else {
            return null;
        }
    },
    createController = function (component, definition) {
        var state = component.owner.state,
            getActiveVelocityState = (definition.controlState ? getState.bind(null, state, definition.controlState) : isTrue),
            getInstantState =        (definition.instantState ? getState.bind(null, state, definition.instantState) : isTrue);

        if (component.instant || definition.instantState) {
            component.instant = true;
            component.update = instantUpdate.bind(component, getInstantState, getActiveVelocityState, definition.instantSuccess);
        } else {
            component.update = gradualUpdate.bind(component, getActiveVelocityState);
        }
    };

export default createComponentClass(/** @lends platypus.components.Motion.prototype */{
    
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
         * A vector, Array, or number specifying the acceleration of the motion. Numbers apply magnitude along the x-axis. Arrays map to [x, y, z] on the vector.
         *
         * @property acceleration
         * @type platypus.Vector|Array|number
         * @default Vector(0, 0, 0)
         */
        acceleration: 0,
        
        /**
         * Whether this motion should apply acceleration to the entity. Defaults to `true` unless an initial acceleration is left unset.
         *
         * @property activeAcceleration
         * @type boolean
         * @default true
         */
        activeAcceleration: true,
        
        /**
         * Whether this motion should apply acceleration to the entity.
         *
         * @property activeVelocity
         * @type boolean
         * @default true
         */
        activeVelocity: true,
        
        /**
         * This is the highest magnitude allowed for the motion vector.
         *
         * @property maxMagnitude
         * @type number
         * @default Infinity
         */
        maxMagnitude: Infinity,
        
        /**
         * When this state on the entity changes, this motion's active state is changed to match. If an "event" property is also set on this component, both the event and the state must be true for the motion to be active.
         *
         * @property controlState
         * @type String
         * @default ""
         */
        controlState: "",
        
        /**
         * If instant or instantState are set, the motion is only triggered for a single step and must be re-triggered to activate again. When the instantState on the entity becomes `true`, this motion's active state is changed to match. If an "instantState" property is also set on this component, both the event and the state must be true for the motion to be active.
         *
         * @property instant
         * @type Boolean
         * @default false
         */
        instant: false,
        
        /**
         * If instant or instantState are set, the motion is only triggered for a single step and must be re-triggered to activate again. When the instantState on the entity becomes `true`, this motion's active state is changed to match. If an "instant" property is also set on this component, both the event and the state must be true for the motion to be active. If "event" or "controlState" are also defined, they must also be `true` to trigger an instant motion on the entity.
         *
         * @property instantState
         * @type String
         * @default ""
         */
        instantState: "",
        
        /**
         * If instantState is set, this event is triggered when the intance of motion occurs on the entity.
         *
         * @property instantSuccess
         * @type String
         * @default ""
         */
        instantSuccess: "",
        
        /**
         * This determines if setting active to `false` (via the control event or state) should dampen velocity. This is a ratio applied to the vector magnitude between 0 and 1. This is useful for events like jumping where a longer keypress should jump farther than a shorter keypress.
         *
         * @property instantDecay
         * @type number
         * @default null
         */
        instantDecay: null,
        
        /**
         * A vector, Array, or number specifying the direction and magnitude of the motion. Numbers apply magnitude along the x-axis. Arrays map to [x, y, z] on the vector.
         *
         * @property velocity
         * @type platypus.Vector|Array|number
         * @default Vector(0, 0, 0)
         */
        velocity: 0,
        
        stopOnCollision: true,
        
        drag: -1,
        friction: -1
    },
    
    /**
     * This component works in tandem with the [Mover](platypus.components.Mover.html) component by adding a vector of motion to the entity. This component is typically created by `Mover` and doesn't need to be added separately.
     *
     * @memberof platypus.components
     * @uses platypus.Component
     * @constructs
     * @listens platypus.Entity#control-velocity
     * @listens platypus.Entity#stop-velocity
     * @listens platypus.Entity#start-velocity
     * @listens platypus.Entity#control-acceleration
     * @listens platypus.Entity#stop-acceleration
     * @listens platypus.Entity#start-acceleration
     * @listens platypus.Entity#instant-motion
     * @listens platypus.Entity#instant-begin
     * @listens platypus.Entity#instant-end
     * @listens platypus.Entity#set-motion
     * @fires platypus.Entity#orient-vector
     * @fires platypus.Entity#remove-vector
     */
    initialize: function (definition) {
        if (!this.acceleration) {
            this.activeAcceleration = false;
        }
        this.acceleration = Vector.setUp(this.acceleration);
        this.velocity     = Vector.setUp(this.velocity);

        this.triggered = false;
        this.ready = true;
        
        if (typeof this.instantDecay === "number") {
            this.capMagnitude = this.velocity.magnitude() * this.instantDecay;
        } else {
            this.capMagnitude = -1;
        }
        
        createController(this, definition);
        
        if (this.instant) {
            this.enact = false;
            this.instant = Vector.setUp(this.velocity);
            this.velocity.setXYZ(0, 0, 0);
        }

        if (this.orient) { // Orient vectors in case the entity is in a transformed position.
            this.owner.triggerEvent('orient-vector', this.velocity);
            this.owner.triggerEvent('orient-vector', this.acceleration);
        }
    },

    events: {
        /**
         * This event controls whether this velocity is active or inactive.
         *
         * @event platypus.Entity#control-velocity
         * @param control {Object|boolean} If `true`, this motion becomes active. If `false` or `{pressed: false}`, the motion becomes inactive.
         */
        "control-velocity": function (control) {
            this.activeVelocity = (control && (control.pressed !== false));
        },
        
        /**
         * This event sets the velocity to inactive.
         *
         * @event platypus.Entity#stop-velocity
         */
        "stop-velocity": function () {
            this.activeVelocity = false;
        },
        
        /**
         * This event sets the velocity to active.
         *
         * @event platypus.Entity#start-velocity
         */
        "start-velocity": function () {
            this.activeVelocity = true;
        },
        
        /**
         * This event controls whether the acceleration is active or inactive.
         *
         * @event platypus.Entity#control-acceleration
         * @param control {Object|boolean} If `true`, this motion becomes active. If `false` or `{pressed: false}`, the motion becomes inactive.
         */
        "control-acceleration": function (control) {
            this.activeAcceleration = (control && (control.pressed !== false));
        },
        
        /**
         * This event sets the acceleration to inactive.
         *
         * @event platypus.Entity#stop-acceleration
         */
        "stop-acceleration": function () {
            this.activeAcceleration = false;
        },
        
        /**
         * This event sets the acceleration to active.
         *
         * @event platypus.Entity#start-acceleration
         */
        "start-acceleration": function () {
            this.activeAcceleration = true;
        },
        
        /**
        * This event triggers an instant motion.
        *
        * @event platypus.Entity#instant-motion
        * @param control {Object|boolean} If `true`, this motion becomes active. If `false` or `{triggered: false}`, the motion becomes inactive.
        */
        "instant-motion": function (control) {
            this.enact = (control && (control.triggered !== false));
        },

        /**
        * This event triggers the beginning of an instant motion.
        *
        * @event platypus.Entity#instant-begin
        */
        "instant-begin": function () {
            this.enact = true;
        },

        /**
        * This event triggers the end of an instant motion.
        *
        * @event platypus.Entity#instant-end
        */
        "instant-end": function () {
            this.enact = false;
        },
        
        /**
        * This event modifies the properties of this Motion.
        *
        * @event platypus.Entity#set-motion
        * @param motion {Object} A list of key/value pairs corresponding to motion values.
        * @param [motion.maxMagnitude] {Number} A value describing the maximum velocity or acceleration the motion vector can exert on the Entity.
        */
        "set-motion": function (motion) {
            if (motion.acceleration) {
                this.acceleration.set(motion.acceleration);
            }
            if (motion.velocity) {
                this.velocity.set(motion.velocity);
                if (typeof this.instantDecay === "number") {
                    this.capMagnitude = this.velocity.magnitude() * this.instantDecay;
                } else {
                    this.capMagnitude = -1;
                }
            }
            if (typeof motion.maxMagnitude === "number") {
                this.maxMagnitude = motion.maxMagnitude;
            }
        }
    },

    methods: {
        move: function (delta) {
            var v = Vector.setUp(this.acceleration).multiply(delta);
            
            this.velocity.add(v);
            v.recycle();
            
            if (this.velocity.magnitude() > this.maxMagnitude) {
                this.velocity.normalize().multiply(this.maxMagnitude);
            }
            return this.velocity;
        },
        
        // This handles things like variable height jumping by adjusting the jump velocity to the pre-determined cap velocity for jump-button release.
        decay: function () {
            if ((this.capMagnitude >= 0) && (this.velocity.magnitude() > this.capMagnitude)) {
                this.velocity.normalize().multiply(this.capMagnitude);
            }
        },
        
        destroy: function () {
            if (this.orient) {
                /**
                 * On receiving this message, the maintained vector is immediately dropped from the list of maintained vectors.
                 *
                 * @event platypus.Entity#remove-vector
                 * @param vector {platypus.Vector} The vector to be removed.
                 */
                this.owner.triggerEvent('remove-vector', this.acceleration);
                this.owner.triggerEvent('remove-vector', this.velocity);
            }
            this.acceleration.recycle();
            this.velocity.recycle();
            if (this.instant) {
                this.instant.recycle();
            }
        }
    }
});
