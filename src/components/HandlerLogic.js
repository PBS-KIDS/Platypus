/**
 * A component that handles updating logic components. Each tick it calls all the entities that accept 'handle-logic' messages. This component is usually used on an "action-layer".
 *
 * @namespace platypus.components
 * @class HandlerLogic
 * @uses platypus.Component
 **/
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

    return createComponentClass({
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
             * Whether logic should occur at an alternate speed. This is useful for simulations where the game should speed up or slow down.
             *
             * @property timeMultiplier
             * @type number
             * @default 1
             */
            timeMultiplier: 1
        },
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
            /**
             * Called when an entity has been updated and should be considered for adding to or removing from the handler.
             *
             * @method 'child-entity-updated'
             * @param entity {platypus.Entity} The entity that is being considered.
             */
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

            /**
             * Called when a new entity has been added and should be considered for addition to the handler. If the entity has a 'handle-logic' message id it's added to the list of entities.
             *
             * @method 'child-entity-added'
             * @param entity {platypus.Entity} The entity that is being considered for addition to the handler.
             */
            "child-entity-added": function (entity) {
                if (entity.getMessageIds().some(hasLogic)) {
                    this.entities.push(entity);
                    
                    // Add to the active entities list so that the collision loop is aware of and can handle the addition.
                    if (this.inLogicLoop && (!this.camera || withinBounds(entity, this.camera))) {
                        this.activeEntities.push(entity);
                    }
                }
            },

            /**
             * Called when an entity should be removed from the list of logically updated entities.
             *
             * @method 'child-entity-removed'
             * @param entity {platypus.Entity} The entity to be removed from the handler.
             */
            "child-entity-removed": function (entity) {
                var j = this.entities.indexOf(entity);
                
                if (j >= 0) {
                    greenSplice(this.entities, j);
                    if (this.inLogicLoop) {
                        this.removals.push(entity);
                    }
                }
            },
            
            /**
             * When this event is triggered, `handle-logic` messages cease to be triggered on each tick.
             *
             * @method 'pause-logic'
             * @param [options] {Object}
             * @param [options.time] {number} If set, this will pause the logic for this number of milliseconds. If not set, logic is paused until an `unpause-logic` message is triggered.
             */
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
                     * @event 'logic-paused'
                     */
                    this.owner.triggerEventOnChildren('logic-paused');
                }
            },
            
            /**
             * When this event is triggered, `handle-logic` messages begin firing each tick.
             *
             * @method 'unpause-logic'
             */
            "unpause-logic": function () {
                this.paused = 0;
                if (this.owner.triggerEventOnChildren) {
                    /**
                     * Notifies children entities that logic has been unpaused.
                     *
                     * @event 'logic-unpaused'
                     */
                    this.owner.triggerEventOnChildren('logic-unpaused');
                }
            },
            
            /**
             * Changes the active logic area when the camera location changes.
             *
             * @method 'camera-update'
             * @param camera {Object}
             * @param camera.viewport {platypus.AABB} The AABB describing the camera viewport in world units.
             */
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
            
            /**
             * Sends a 'handle-logic' message to all the entities the component is handling. If an entity does not handle the message, it's removed it from the entity list.
             *
             * @method 'tick'
             * @param tick {Object} Tick information that is passed on to children entities via "handle-logic" events.
             * @param tick.delta {number} The time passed since the last tick.
             */
            "tick": function (resp) {
                var i = 0,
                    j = 0,
                    cycles = 0,
                    entity = null,
                    msg = this.message,
                    actives = this.activeEntities,
                    removals = this.removals,
                    stepLength = this.stepLength;
                
                this.leftoverTime += (resp.delta * this.timeMultiplier);
                cycles = Math.floor(this.leftoverTime / stepLength) || 1;
        
                // This makes the frames smoother, but adds variance into the calculations
        //        msg.delta = this.leftoverTime / cycles;
        //        this.leftoverTime = 0;
                
                // This makes the frames more exact, but varying step numbers between ticks can cause movement to be jerky
        //        msg.delta = Math.min(this.leftoverTime, this.stepLength);
        //        this.leftoverTime = Math.max(this.leftoverTime - (cycles * this.stepLength), 0);
        
                // This makes the frames exact, but varying step numbers between ticks can cause movement to be jerky
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
                         * This event is triggered on the top-level layer to signify a "handle-logic" event is about to be triggered on children. This is unique from the layer's "tick" event in that it occurs the same number of times as the "handle-logic" event and will not occur if HandlerLogic is paused.
                         *
                         * @event 'handle-logic'
                         * @param tick.delta {Number} The time that has passed since the last tick.
                         * @param tick.camera {null|platypus.AABB} The range of the logic camera area. This is typically larger than the visible camera. This value is `null` if `alwaysOn` is set to `true` on this component.
                         * @param tick.entities {Array} This is a list of all the logically active entities.
                         * @param tick.tick {Object} Tick object from "tick" event.
                         */
                        this.owner.triggerEvent('handle-logic', msg);
                    
                        if (this.owner.triggerEventOnChildren) {
                            this.owner.triggerEventOnChildren('handle-ai', msg);
                        }

                        i = actives.length;
                        while (i--) {
                            entity = actives[i];
                            
                            /**
                             * This event is triggered on children entities to run anything that should occur before "handle-logic". For example, removing or adding components should happen here and not in "handle-logic".
                             *
                             * @event 'prepare-logic'
                             * @param tick {Object}
                             * @param tick.delta {Number} The time that has passed since the last tick.
                             * @param tick.camera {null|platypus.AABB} The range of the logic camera area. This is typically larger than the visible camera. This value is `null` if `alwaysOn` is set to `true` on this component.
                             * @param tick.entities {Array} This is a list of all the logically active entities.
                             */
                            entity.triggerEvent('prepare-logic', msg);

                            /**
                             * This event is triggered on children entities to run their logic.
                             *
                             * @event 'handle-logic'
                             * @param tick {Object}
                             * @param tick.delta {Number} The time that has passed since the last tick.
                             * @param tick.camera {null|platypus.AABB} The range of the logic camera area. This is typically larger than the visible camera. This value is `null` if `alwaysOn` is set to `true` on this component.
                             * @param tick.entities {Array} This is a list of all the logically active entities.
                             */
                            entity.triggerEvent('handle-logic', msg);

                            /**
                             * This event is triggered on children entities to move. This happens immediately after logic so entity logic can determine movement.
                             *
                             * @event 'handle-movement'
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
                         * @event 'check-collision-group'
                         * @param tick {Object}
                         * @param tick.delta {Number} The time that has passed since the last tick.
                         * @param tick.camera {null|platypus.AABB} The range of the logic camera area. This is typically larger than the visible camera. This value is `null` if `alwaysOn` is set to `true` on this component.
                         * @param tick.entities {Array} This is a list of all the logically active entities.
                         */
                        if (this.owner.triggerEvent('check-collision-group', msg)) { // If a collision group is attached, make sure collision is processed on each logic tick.
                            /**
                             * This event is triggered on entities to run logic that may depend upon collision responses.
                             *
                             * @event 'handle-post-collision-logic'
                             * @param tick {Object}
                             * @param tick.delta {Number} The time that has passed since the last tick.
                             * @param tick.camera {null|platypus.AABB} The range of the logic camera area. This is typically larger than the visible camera. This value is `null` if `alwaysOn` is set to `true` on this component.
                             * @param tick.entities {Array} This is a list of all the logically active entities.
                             */
                                
                            /**
                             * Triggered on entities when the entity's state has been changed.
                             *
                             * @event 'state-changed'
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
