/**
 * A component that handles updating logic components. Each tick it calls all the entities that accept 'handle-logic' messages. This component is usually used on an "action-layer".
 * 
 * @namespace platypus.components
 * @class HandlerLogic
 * @uses platypus.Component
 **/
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    var addAll = function (all, active) {
            var j = 0;
            
            active.length = 0;
            for (j = all.length - 1; j > -1; j--) {
                active.push(all[j]);
            }
        },
        checkCamera = function (all, active, camera) {
            var j = 0,
                child = null;
            
            active.length = 0;
            for (j = all.length - 1; j > -1; j--) {
                child = all[j];
                if (child.alwaysOn  || (typeof child.x === 'undefined') || ((child.x >= camera.left - camera.buffer) && (child.x <= camera.left + camera.width + camera.buffer) && (child.y >= camera.top - camera.buffer) && (child.y <= camera.top + camera.height + camera.buffer))) {
                    active.push(child);
                }
            }
        },
        updateState = function (entity) {
        var state   = null,
            changed = false;
        
        for (state in entity.state) {
            if (entity.state[state] !== entity.lastState[state]) {
                entity.lastState[state] = entity.state[state];
                changed = true;
            }
        }
        
        return changed;
    };

    return platypus.createComponentClass({
        id: "HandlerLogic",
        properties: {
            /**
             * Whether logic should always run on all entities or only run on entities within the visible camera area (plus the buffer amount specified by the `buffer` property).
             * 
             * @property alwaysOn
             * @type Boolean
             * @default false
             * @since 0.7.1
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
             * @since 0.7.1
             */
            timeMultiplier: 1
        },
        constructor: function (definition) {
            this.entities = [];
            this.activeEntities = [];

            if (this.alwaysOn) {
                this.updateList = addAll;
                this.camera = null;
            } else {
                this.updateList = checkCamera;
                this.camera = {
                    left: 0,
                    top: 0,
                    width: 0,
                    height: 0,
                    buffer:     this.buffer,
                    active: false
                };
            }
            
            this.paused = 0;
            this.leftoverTime = 0;
            this.message = {
                delta: this.stepLength,
                tick: null,
                camera: this.camera,
                movers: this.activeEntities
            };
        },
        
        events: {
            /**
             * Called when a new entity has been added and should be considered for addition to the handler. If the entity has a 'handle-logic' message id it's added to the list of entities.
             * 
             * @method 'child-entity-added'
             * @param entity {platypus.Entity} The entity that is being considered for addition to the handler.
             */
            "child-entity-added": function (entity) {
                var x = 0,
                    messageIds = entity.getMessageIds();
                
                for (x = 0; x < messageIds.length; x++) {
                    if (messageIds[x] === 'handle-logic' || messageIds[x] === 'handle-post-collision-logic') {
                        this.entities.push(entity);
                        break;
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
                    this.entities.splice(j, 1);
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
            },
            
            /**
             * When this event is triggered, `handle-logic` messages begin firing each tick.
             * 
             * @method 'unpause-logic'
             */
            "unpause-logic": function () {
                this.paused = 0;
            },
            
            /**
             * Changes the active logic area when the camera location changes.
             * 
             * @method 'camera-update'
             * @param camera {Object}
             * @param camera.viewport {platypus.AABB} The AABB describing the camera viewport in world units.
             */
            "camera-update": function (camera) {
                if (this.camera) {
                    this.camera.left   = camera.viewport.left;
                    this.camera.top    = camera.viewport.top;
                    this.camera.width  = camera.viewport.width;
                    this.camera.height = camera.viewport.height;
                    
                    if (this.camera.buffer === -1) {
                        this.camera.buffer = this.camera.width / 10; // sets a default buffer based on the size of the world units if the buffer was not explicitly set.
                    }
                    
                    this.camera.active = true;
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
                    child  = null;
                
                this.leftoverTime += (resp.delta * this.timeMultiplier);
                cycles = Math.floor(this.leftoverTime / this.stepLength) || 1;
        
                // This makes the frames smoother, but adds variance into the calculations
        //        this.message.delta = this.leftoverTime / cycles;
        //        this.leftoverTime = 0;
                
                // This makes the frames more exact, but varying step numbers between ticks can cause movement to be jerky
        //        this.message.delta = Math.min(this.leftoverTime, this.stepLength);
        //        this.leftoverTime = Math.max(this.leftoverTime - (cycles * this.stepLength), 0);
        
                // This makes the frames exact, but varying step numbers between ticks can cause movement to be jerky
                this.message.delta = this.stepLength;
                this.leftoverTime = Math.max(this.leftoverTime - (cycles * this.stepLength), 0);
        
                this.message.tick = resp;
                
                this.updateList(this.entities, this.activeEntities, this.camera);
                
                //Prevents game lockdown when processing takes longer than time alotted.
                cycles = Math.min(cycles, this.maxStepsPerTick);
                
                for (i = 0; i < cycles; i++) {
                    
                    if (this.paused > 0) {
                        this.paused -= this.stepLength;
                        if (this.paused < 0) {
                            this.paused = 0;
                        }
                    }
                    
                    if (!this.paused) {
                    
                        if (this.owner.triggerEventOnChildren) {
                            this.owner.triggerEventOnChildren('handle-ai', this.message);
                        }

                        for (j = this.activeEntities.length - 1; j > -1; j--) {
                            /**
                            * This event is triggered on children entities to run anything that should occur before "handle-logic". For example, removing or adding components should happen here and not in "handle-logic".
                            * 
                            * @event 'prepare-logic'
                            * @param tick {Object}
                            * @param tick.delta {Number} The time that has passed since the last tick.
                            * @since 0.6.8
                            */
                            this.activeEntities[j].triggerEvent('prepare-logic', this.message);

                            /**
                            * This event is triggered on children entities to run their logic.
                            * 
                            * @event 'handle-logic'
                            * @param tick {Object}
                            * @param tick.delta {Number} The time that has passed since the last tick.
                            */
                            this.activeEntities[j].triggerEvent('handle-logic', this.message);

                            /**
                            * This event is triggered on children entities to move. This happens immediately after logic so entity logic can determine movement.
                            * 
                            * @event 'handle-movement'
                            * @param tick {Object}
                            * @param tick.delta {Number} The time that has passed since the last tick.
                            * @since 0.6.8
                            */
                            this.activeEntities[j].triggerEvent('handle-movement', this.message);
                        }
                        
                        /**
                            * This event is triggered on the entity (layer) to test collisions once logic has been completed.
                            * 
                            * @event 'check-collision-group'
                            * @param tick {Object}
                            * @param tick.delta {Number} The time that has passed since the last tick.
                            */
                        if (this.owner.triggerEvent('check-collision-group', this.message)) { // If a collision group is attached, make sure collision is processed on each logic tick.
                            /**
                                * This event is triggered on entities to run logic that may depend upon collision responses.
                                * 
                                * @event 'handle-post-collision-logic'
                                * @param tick {Object}
                                * @param tick.delta {Number} The time that has passed since the last tick.
                                */
                                
                            /**
                                * Triggered on entities when the entity's state has been changed.
                                * 
                                * @event 'state-changed'
                                * @param state {Object} A list of key/value pairs representing the owner's state (this value equals `entity.state`).
                                */
                            for (j = this.activeEntities.length - 1; j > -1; j--) {
                                child = this.activeEntities[j];
                                child.triggerEvent('handle-post-collision-logic', this.message);
                                if (updateState(child)) {
                                    child.triggerEvent('state-changed', child.state);
                                }
                            }
                        } else {
                            for (j = this.activeEntities.length - 1; j > -1; j--) {
                                child = this.activeEntities[j];
                                if (updateState(child)) {
                                    child.triggerEvent('state-changed', child.state);
                                }
                            }
                        }
                    }
                }
            }
        }
    });
}());
