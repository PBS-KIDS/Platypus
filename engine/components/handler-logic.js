/* global platformer */
/**
 * A component that handles updating logic components. Each tick it calls all the entities that accept 'handle-logic' messages. This component is usually used on an "action-layer".
 * 
 * @class "handler-logic" Component
 * @uses Component
 **/

(function () {
    "use strict";

    var updateState = function (entity) {
        var state = null,
        changed   = false;
        
        for (state in entity.state) {
            if (entity.state[state] !== entity.lastState[state]) {
                entity.lastState[state] = entity.state[state];
                changed = true;
            }
        }
        
        return changed;
    };

    return platformer.createComponentClass({
        id: "handler-logic",
        publicProperties: {
            /**
             * The buffer area around the camera in which entity logic is active. This property is available on the Entity as `entity.buffer`.
             * 
             * @property buffer
             * @type number
             * @default camera width / 10
             */
            "buffer": -1,

            /**
             * The length in milliseconds of a single logic step. If the framerate drops too low, logic is run for each step of this many milliseconds. This property is available on the Entity as `entity.stepLength`.
             * 
             * @property stepLength
             * @type number
             * @default 5
             */
            "stepLength": 5,
            
            /**
             * The maximum number of steps to take for a given tick, to prevent lag overflow.
             * 
             * @property maxStepsPerTick
             * @type number
             * @default 100
             */
             maxStepsPerTick: 100
        },
        constructor: function (definition) {
            this.entities = [];
            this.activeEntities = this.entities;
            
            this.paused = 0;
            this.leftoverTime = 0;
            this.camera = {
                left: 0,
                top: 0,
                width: 0,
                height: 0,
                buffer:     this.buffer,
                active: false
            };
            this.message = {
                delta: this.stepLength,
                tick: null,
                camera: this.camera,
                movers: this.activeEntities
            };
            this.timeElapsed = {
                name: 'Logic',
                time: 0
            };
        },
        
        events:{
            /**
             * Called when a new entity has been added and should be considered for addition to the handler. If the entity has a 'handle-logic' message id it's added to the list of entities.
             * 
             * @method 'child-entity-added'
             * @param entity {Entity} The entity that is being considered for addition to the handler.
             */
            "child-entity-added": function (entity) {
                var messageIds = entity.getMessageIds(); 
                
                for (var x = 0; x < messageIds.length; x++)
                {
                    if (messageIds[x] == 'handle-logic' || messageIds[x] == 'handle-post-collision-logic') {
                        this.entities.push(entity);
                        this.updateNeeded = this.camera.active;
                        break;
                    }
                }
            },

            /**
             * Called when an entity should be removed from the list of logically updated entities.
             * 
             * @method 'child-entity-removed'
             * @param entity {Entity} The entity to be removed from the handler.
             */
            "child-entity-removed": function (entity) {
                for (var j = this.entities.length - 1; j > -1; j--) {
                    if (this.entities[j] === entity) {
                        this.entities.splice(j, 1);
                        break;
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
             * @param camera.viewportLeft {number} The left side of the camera viewport in world units.
             * @param camera.viewportTop {number} The top side of the camera viewport in world units.
             * @param camera.viewportWidth {number} The width of the camera viewport in world units.
             * @param camera.viewportHeight {number} The height of the camera viewport in world units.
             */
            "camera-update": function (camera) {
                this.camera.left = camera.viewportLeft;
                this.camera.top = camera.viewportTop;
                this.camera.width = camera.viewportWidth;
                this.camera.height = camera.viewportHeight;
                
                if (this.camera.buffer == -1) {
                    this.camera.buffer = this.camera.width / 10; // sets a default buffer based on the size of the world units if the buffer was not explicitly set.
                }
                
                this.camera.active = true;
                
                this.updateNeeded = true;
            },
            
            /**
             * Sends a 'handle-logic' message to all the entities the component is handling. If an entity does not handle the message, it's removed it from the entity list.
             * 
             * @method 'tick'
             * @param tick {Object} Tick information that is passed on to children entities via "handle-logic" events.
             * @param tick.delta {number} The time passed since the last tick.
             */
            "tick": function (resp) {
                var cycles = 0,
                child   = undefined,
                time    = new Date().getTime();
                
                this.leftoverTime += resp.delta;
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
        
                if (this.paused > 0) {
                    this.paused -= resp.delta;
                    if (this.paused < 0) {
                        this.paused = 0;
                    }
                }
                
                if (!this.paused) {
                    if (!this.message.tick) {
                        this.message.tick = resp;
                    }
                    
                    //if (this.updateNeeded) {//causes blocks to fall through dirt - not sure the connection here, so leaving out this optimization for now. - DDD
                        if (this.activeEntities === this.entities) {
                            this.message.movers = this.activeEntities = [];
                        }
                        
                        this.activeEntities.length = 0;
                        for (var j = this.entities.length - 1; j > -1; j--) {
                            child = this.entities[j];
                            if (child.alwaysOn || (typeof child.x === 'undefined') || ((child.x >= this.camera.left - this.camera.buffer) && (child.x <= this.camera.left + this.camera.width + this.camera.buffer) && (child.y >= this.camera.top - this.camera.buffer) && (child.y <= this.camera.top + this.camera.height + this.camera.buffer))) {
                                this.activeEntities.push(child);
                            }
                        }
                    //}
                    
                    //Prevents game lockdown when processing takes longer than time alotted.
                    cycles = Math.min(cycles, this.maxStepsPerTick);
                    
                    for(var i = 0; i < cycles; i++) {
                        
                        /**
                         * This event is triggered on children entities to run their logic.
                         * 
                         * @event 'handle-logic'
                         * @param tick {Object}
                         * @param tick.delta {Number} The time that has passed since the last tick.
                         */
                        for (var j = this.activeEntities.length - 1; j > -1; j--) {
                            child = this.activeEntities[j];
                            if (child.triggerEvent('handle-logic', this.message)) {
                                child.checkCollision = true;
                            }
                        }
                        
                        this.timeElapsed.name = 'Logic';
                        this.timeElapsed.time = new Date().getTime() - time;
                        platformer.game.currentScene.trigger('time-elapsed', this.timeElapsed);
                        time += this.timeElapsed.time;
                        
                        /**
                         * This event is triggered on the entity (layer) to test collisions once logic has been completed.
                         * 
                         * @event 'check-collision-group'
                         * @param tick {Object}
                         * @param tick.delta {Number} The time that has passed since the last tick.
                         */
                        if (this.owner.triggerEvent('check-collision-group', this.message)) { // If a collision group is attached, make sure collision is processed on each logic tick.
                            this.timeElapsed.name = 'Collision';
                            this.timeElapsed.time = new Date().getTime() - time;
                            platformer.game.currentScene.trigger('time-elapsed', this.timeElapsed);
                            time += this.timeElapsed.time;

                            /**
                             * This event is triggered on entities to run logic that may depend upon collision responses.
                             * 
                             * @event 'handle-post-collision-logic'
                             * @param tick {Object}
                             * @param tick.delta {Number} The time that has passed since the last tick.
                             */
                             
                            /**
                             * Triggered on entities when their logical state has been changed.
                             * 
                             * @event 'logical-state'
                             * @param state {Object} A list of key/value pairs representing the owner's state (this value equals `entity.state`).
                             */
                            for (var j = this.activeEntities.length - 1; j > -1; j--) {
                                child = this.activeEntities[j];
                                child.triggerEvent('handle-post-collision-logic', this.message);
                                if (updateState(child)) {
                                    child.triggerEvent('logical-state', child.state);
                                }
                            }

                            this.timeElapsed.name = 'Collision Logic';
                            this.timeElapsed.time = new Date().getTime() - time;
                            platformer.game.currentScene.trigger('time-elapsed', this.timeElapsed);
                            time += this.timeElapsed.time;
                        } else {
                            for (var j = this.activeEntities.length - 1; j > -1; j--) {
                                child = this.activeEntities[j];
                                if (updateState(child)) {
                                    child.triggerEvent('logical-state', child.state);
                                }
                            }
                        }
                        
                        
                    }
                }
                
                this.timeElapsed.time = new Date().getTime() - time;
                platformer.game.currentScene.trigger('time-elapsed', this.timeElapsed);
            }
        }
    });
}());