import {arrayCache, greenSplice} from '../utils/array.js';
import AABB from '../AABB.js';
import createComponentClass from '../factory.js';

export default (function () {
    var addAll = function (all, active) {
            var j = all.length;
            
            active.length = 0;
            while (j--) {
                active.push(all[j]);
            }
        },
        withinBounds = function (child, camera) {
            return child.alwaysOn || (child.aabb && camera.collides(child.getAABB())) || (typeof child.x === 'undefined') || camera.containsPoint(child.x, child.y);
        },
        checkCamera = function (all, active, camera) {
            var j = all.length,
                child = null;
            
            active.length = 0;
            while (j--) {
                child = all[j];
                if (withinBounds(child, camera)) {
                    active.push(child);
                }
            }
        },
        hasLogic = function (item/*, index, arr*/) {
            return (item === 'handle-logic' || item === 'handle-post-collision-logic' || item === 'prepare-logic' || item === 'state-changed' || item === 'handle-movement');
        };

    return createComponentClass(/** @lends platypus.components.HandlerLogic.prototype */{
        id: "HandlerLogic",
        properties: {
            /**
             * Whether logic should always run on all entities or only run on entities within the visible camera area (plus the buffer amount specified by the `buffer` property).
             *
             * @property alwaysOn
             * @type Boolean
             * @default false
             */
            alwaysOn: false
        },
        publicProperties: {
            /**
             * The buffer area around the camera in which entity logic is active. This property is available on the Entity as `entity.buffer`.
             *
             * @property buffer
             * @type number
             * @default camera width / 10
             */
            buffer: -1,
            
            /**
             * The length in milliseconds of a single logic step. If the framerate drops too low, logic is run for each step of this many milliseconds. This property is available on the Entity as `entity.stepLength`.
             *
             * @property stepLength
             * @type number
             * @default 5
             */
            stepLength: 5,
            
            /**
             * The maximum number of steps to take for a given tick, to prevent lag overflow.
             *
             * @property maxStepsPerTick
             * @type number
             * @default 100
             */
            maxStepsPerTick: 100,
            
            /**
             * A multiplier that alters the speed at which the game is running. This is achieved by scaling the delta time in each tick.
             * Defaults to 1. Values < 1 will slow down the logic, > 1 will speed it up.
             *
             * @property timeMultiplier
             * @type number
             * @default 1
             */
            timeMultiplier: 1
        },

        /**
         * A component that handles updating logic components. Each tick it calls all the entities that accept 'handle-logic' messages. This component is usually used on an "action-layer".
         *
         * @memberof platypus.components
         * @uses platypus.Component
         * @constructs
         * @param {*} definition 
         * @listens platypus.Entity#camera-update
         * @listens platypus.Entity#child-entity-added
         * @listens platypus.Entity#child-entity-removed
         * @listens platypus.Entity#child-entity-updated
         * @listens platypus.Entity#pause-logic
         * @listens platypus.Entity#tick
         * @listens platypus.Entity#unpause-logic
         * @fires platypus.Entity#handle-ai
         * @fires platypus.Entity#handle-logic
         * @fires platypus.Entity#logic-paused
         * @fires platypus.Entity#logic-unpaused
         * @fires platypus.Entity#prepare-logic
         * @fires platypus.Entity#handle-movement
         * @fires platypus.Entity#check-collision-group
         * @fires platypus.Entity#handle-post-collision-logic
         * @fires platypus.Entity#state-changed
         */
        initialize: function () {
            this.entities = arrayCache.setUp();
            this.activeEntities = arrayCache.setUp();
            this.removals = arrayCache.setUp();
            
            this.inLogicLoop = false;

            if (this.alwaysOn) {
                this.updateList = addAll;
                this.camera = null;
            } else {
                this.updateList = checkCamera;
                this.camera = AABB.setUp();
            }
            
            this.paused = 0;
            this.leftoverTime = 0;
            this.message = {
                delta: this.stepLength,
                tick: null,
                camera: this.camera,
                entities: this.activeEntities
            };
        },
        
        events: {
            "child-entity-updated": function (entity) {
                var j = this.entities.indexOf(entity),
                    logical = entity.getMessageIds().some(hasLogic);

                if (logical && (j < 0)) {
                    this.entities.push(entity);
                    
                    // Add to the active entities list so that the collision loop is aware of and can handle the addition.
                    if (this.inLogicLoop && (!this.camera || withinBounds(entity, this.camera))) {
                        this.activeEntities.push(entity);
                    }
                } else if (!logical && (j >= 0)) {
                    greenSplice(this.entities, j);
                    if (this.inLogicLoop) {
                        this.removals.push(entity);
                    }
                }
            },

            "child-entity-added": function (entity) {
                if (entity.getMessageIds().some(hasLogic)) {
                    this.entities.push(entity);
                    
                    // Add to the active entities list so that the collision loop is aware of and can handle the addition.
                    if (this.inLogicLoop && (!this.camera || withinBounds(entity, this.camera))) {
                        this.activeEntities.push(entity);
                    }
                }
            },

            "child-entity-removed": function (entity) {
                var j = this.entities.indexOf(entity);
                
                if (j >= 0) {
                    greenSplice(this.entities, j);
                    if (this.inLogicLoop) {
                        this.removals.push(entity);
                    }
                }
            },
            
            "pause-logic": function (resp) {
                if (resp && resp.time) {
                    this.paused = resp.time;
                } else {
                    this.paused = -1;
                }
                if (this.owner.triggerEventOnChildren) {
                    /**
                     * Notifies children entities that logic has been paused.
                     *
                     * @event platypus.Entity#logic-paused
                     */
                    this.owner.triggerEventOnChildren('logic-paused');
                }
            },
            
            "unpause-logic": function () {
                this.paused = 0;
                if (this.owner.triggerEventOnChildren) {
                    /**
                     * Notifies children entities that logic has been unpaused.
                     *
                     * @event platypus.Entity#logic-unpaused
                     */
                    this.owner.triggerEventOnChildren('logic-unpaused');
                }
            },
            
            "camera-update": function (camera) {
                var buffer = this.buffer,
                    cam = this.camera,
                    vp = null;
                
                if (cam) {
                    if (buffer === -1) {
                        buffer = camera.viewport.width / 10; // sets a default buffer based on the size of the world units if the buffer was not explicitly set.
                    }
                    
                    vp = camera.viewport;
                    cam.setBounds(vp.left - buffer, vp.top - buffer, vp.right + buffer, vp.bottom + buffer);
                }
            },
            
            "tick": function (resp) {
                var i = 0,
                    j = 0,
                    cycles = 0,
                    entity = null,
                    msg = this.message,
                    actives = this.activeEntities,
                    removals = this.removals,
                    stepLength = this.stepLength * this.timeMultiplier;
                
                this.leftoverTime += (resp.delta * this.timeMultiplier);
                cycles = Math.floor(this.leftoverTime / stepLength) || 1;
        
                // This makes the frames smoother, but adds variance into the calculations
        //        msg.delta = this.leftoverTime / cycles;
        //        this.leftoverTime = 0;
                
                // This makes the frames more exact, but varying step numbers between ticks can cause movement to be jerky
        //        msg.delta = Math.min(this.leftoverTime, this.stepLength);
        //        this.leftoverTime = Math.max(this.leftoverTime - (cycles * this.stepLength), 0);
        
                // This makes the frames exact, but varying step numbers between ticks can cause movement to be jerky
                msg.gameDelta = this.stepLength;
                msg.delta = stepLength;
                this.leftoverTime = Math.max(this.leftoverTime - (cycles * stepLength), 0);
        
                msg.tick = resp;
                
                this.updateList(this.entities, actives, this.camera);
                
                //Prevents game lockdown when processing takes longer than time alotted.
                cycles = Math.min(cycles, this.maxStepsPerTick);
                
                while (cycles--) {
                    
                    if (this.paused > 0) {
                        this.paused -= stepLength;
                        if (this.paused < 0) {
                            this.paused = 0;
                        }
                    }
                    
                    if (!this.paused) {
                        this.inLogicLoop = true;
                        
                        /**
                         * This event is triggered on the top-level layer to signify a "handle-logic" event is about to be triggered on children, and is then subsequently triggered on all of the layer's child entities. This is unique from the layer's "tick" event in that it occurs the same number of times as the "handle-logic" event and will not occur if HandlerLogic is paused.
                         *
                         * @event platypus.Entity#handle-logic
                         * @param tick.delta {Number} The time that has passed since the last tick as manipulated by the timeMultiplier.
                         * @param tick.gameDelta {Number} The time that has passed since the last tick. Unmanipulated by timeMultiplier. Use for components that need to run on actual time.
                         * @param tick.camera {null|platypus.AABB} The range of the logic camera area. This is typically larger than the visible camera. This value is `null` if `alwaysOn` is set to `true` on this component.
                         * @param tick.entities {Array} This is a list of all the logically active entities.
                         * @param tick.tick {Object} Tick object from "tick" event.
                         */
                        this.owner.triggerEvent('handle-logic', msg);
                    
                        if (this.owner.triggerEventOnChildren) {
                            /**
                             * AI components listen in order to perform their logic on each tick.
                             *
                             * @event platypus.Entity#handle-ai
                             * @param tick.delta {Number} The time that has passed since the last tick as manipulated by the timeMultiplier.
                             * @param tick.gameDelta {Number} The time that has passed since the last tick. Unmanipulated by timeMultiplier. Use for components that need to run on actual time.
                             * @param tick.camera {null|platypus.AABB} The range of the logic camera area. This is typically larger than the visible camera. This value is `null` if `alwaysOn` is set to `true` on this component.
                             * @param tick.entities {Array} This is a list of all the logically active entities.
                             * @param tick.tick {Object} Tick object from "tick" event.
                             */
                            this.owner.triggerEventOnChildren('handle-ai', msg);
                        }

                        i = actives.length;
                        while (i--) {
                            entity = actives[i];
                            
                            /**
                             * This event is triggered on children entities to run anything that should occur before "handle-logic". For example, removing or adding components should happen here and not in "handle-logic".
                             *
                             * @event platypus.Entity#prepare-logic
                             * @param tick {Object}
                             * @param tick.delta {Number} The time that has passed since the last tick.
                             * @param tick.camera {null|platypus.AABB} The range of the logic camera area. This is typically larger than the visible camera. This value is `null` if `alwaysOn` is set to `true` on this component.
                             * @param tick.entities {Array} This is a list of all the logically active entities.
                             */
                            entity.triggerEvent('prepare-logic', msg);

                            entity.triggerEvent('handle-logic', msg);

                            /**
                             * This event is triggered on children entities to move. This happens immediately after logic so entity logic can determine movement.
                             *
                             * @event platypus.Entity#handle-movement
                             * @param tick {Object}
                             * @param tick.delta {Number} The time that has passed since the last tick.
                             * @param tick.camera {null|platypus.AABB} The range of the logic camera area. This is typically larger than the visible camera. This value is `null` if `alwaysOn` is set to `true` on this component.
                             * @param tick.entities {Array} This is a list of all the logically active entities.
                             */
                            entity.triggerEvent('handle-movement', msg);
                        }
                        this.inLogicLoop = false;
                        
                        // This handles removing active entities from the list before collision checking, state-changing, etc.
                        if (removals.length) {
                            i = removals.length;
                            while (i--) {
                                j = actives.indexOf(removals[i]);
                                if (j >= 0) {
                                    greenSplice(actives, j);
                                }
                            }
                            removals.length = 0;
                        }
                        
                        i = actives.length;
                        /**
                         * This event is triggered on the entity (layer) to test collisions once logic has been completed.
                         *
                         * @event platypus.Entity#check-collision-group
                         * @param tick {Object}
                         * @param tick.delta {Number} The time that has passed since the last tick.
                         * @param tick.camera {null|platypus.AABB} The range of the logic camera area. This is typically larger than the visible camera. This value is `null` if `alwaysOn` is set to `true` on this component.
                         * @param tick.entities {Array} This is a list of all the logically active entities.
                         */
                        if (this.owner.triggerEvent('check-collision-group', msg)) { // If a collision group is attached, make sure collision is processed on each logic tick.
                            /**
                             * This event is triggered on entities to run logic that may depend upon collision responses.
                             *
                             * @event platypus.Entity#handle-post-collision-logic
                             * @param tick {Object}
                             * @param tick.delta {Number} The time that has passed since the last tick.
                             * @param tick.camera {null|platypus.AABB} The range of the logic camera area. This is typically larger than the visible camera. This value is `null` if `alwaysOn` is set to `true` on this component.
                             * @param tick.entities {Array} This is a list of all the logically active entities.
                             */
                                
                            /**
                             * Triggered on entities when the entity's state has been changed.
                             *
                             * @event platypus.Entity#state-changed
                             * @param state {Object} A list of key/value pairs representing the owner's state (this value equals `entity.state`).
                             */
                            while (i--) {
                                entity = actives[i];
                                entity.triggerEvent('handle-post-collision-logic', msg);
                                if (entity.lastState.update(entity.state)) {
                                    entity.triggerEvent('state-changed', entity.state);
                                }
                            }
                        } else {
                            while (i--) {
                                entity = actives[i];
                                if (entity.lastState.update(entity.state)) {
                                    entity.triggerEvent('state-changed', entity.state);
                                }
                            }
                        }
                    }
                }
            }
        },
        
        methods: {
            destroy: function () {
                arrayCache.recycle(this.entities);
                this.entities = null;
                arrayCache.recycle(this.activeEntities);
                this.activeEntities = null;
                arrayCache.recycle(this.removals);
                this.removals = null;
            }
        }
    });
}());
