/**
## JSON Definition
    {
      "type": "LogicSpawner"
      // List all additional parameters and their possible values here.

      "spawneeClass": "wet-noodle",
      // Required: string identifying the type of entity to create.
      
      "state": "tossing",
      // Optional. The entity state that should be true while entities are being created. Defaults to "firing".
      
      "speed": 4,
      // Optional. The velocity with which the entity should start. Initial direction is determined by this entity's facing states ("top", "right", etc).
      
      "offsetX": 45,
      "offsetY": -20,
      // Optional. Location relative to the entity where the should be located once created. Defaults to (0, 0).
    }
*/
/* global platypus */
import Entity from '../Entity.js';
import {arrayCache} from '../utils/array.js';
import createComponentClass from '../factory.js';

export default (function () {
    return createComponentClass(/** @lends platypus.components.LogicSpawner.prototype */{
        
        id: 'LogicSpawner',
        
        /**
         * This component creates an entity and propels it away. This is useful for casting, firing, tossing, and related behaviors.
         *
         * @memberof platypus.components
         * @uses platypus.Component
         * @constructs
         * @param {*} definition 
         * @listens platypus.Entity#handle-logic
         */
        initialize: function (definition) {
            var className = this.owner.spawneeClass || definition.spawneeClass,
                prop = '',
                x = 0;

            this.state = this.owner.state;
            this.stateName = definition.state || 'spawning';
            this.originalZ = (platypus.game.settings.entities[className] && platypus.game.settings.entities[className].properties && platypus.game.settings.entities[className].properties.z) || 0;
            this.speed = definition.speed || this.owner.speed || 0;

            this.state.set(this.stateName, false);
            
            this.spawneeProperties = {
                x: 0,
                y: 0,
                z: 0,
                dx: 0,
                dy: 0,
                spawner: this.owner
            };
            
            if (definition.passOnProperties) {
                for (x = 0; x < definition.passOnProperties.length; x++) {
                    prop = definition.passOnProperties[x];
                    if (this.owner[prop]) {
                        this.spawneeProperties[prop] = this.owner[prop];
                    }
                }
            }
            
            
            this.propertiesContainer = {
                type: className,
                properties: this.spawneeProperties
            };
            
            this.offsetX = this.owner.offsetX || definition.offsetX || 0;
            this.offsetY = this.owner.offsetY || definition.offsetY || 0;
            
            this.firing = false;
        },

        events: {// These are messages that this component listens for
            "handle-logic": function () {
                var offset = 0,
                    state  = this.state;
                
                if (this.firing) {
                    this.spawneeProperties.x = this.owner.x;
                    this.spawneeProperties.y = this.owner.y;
                    this.spawneeProperties.z = this.owner.z + this.originalZ;
                    
                    offset = this.offsetX;
                    if (state.get('left')) {
                        offset *= -1;
                    }
                    this.spawneeProperties.x += offset;
                    
                    offset = this.offsetY;
                    if (state.get('top')) {
                        offset *= -1;
                    }
                    this.spawneeProperties.y += offset;
                    
                    if (this.speed) {
                        if (state.get('top')) {
                            this.spawneeProperties.dy = -this.speed;
                        } else if (state.get('bottom')) {
                            this.spawneeProperties.dy = this.speed;
                        } else {
                            delete this.spawneeProperties.dy;
                        }
                        if (state.get('left')) {
                            this.spawneeProperties.dx = -this.speed;
                        } else if (state.get('right')) {
                            this.spawneeProperties.dx = this.speed;
                        } else {
                            delete this.spawneeProperties.dx;
                        }
                    } else {
                        delete this.spawneeProperties.dx;
                        delete this.spawneeProperties.dy;
                    }
                    
                    this.parent.addEntity(this.propertiesContainer);
                }
                
                state.set(this.stateName, this.firing);

                this.firing = false;
            },
            "spawn": function (value) {
                this.firing = !value || (value.pressed !== false);
                
                this.parent = this.owner.parent; //proofing against this entity being destroyed prior to spawned entity. For example, when a destroyed entity spawns a drop.
            }
        },
        
        methods: {
            destroy: function () {
                this.state = null;
            }
        },
        
        getAssetList: function (def, props, defaultProps) {
            var spawn = def.spawneeClass || props.spawneeClass || defaultProps.spawneeClass;
            
            if (spawn) {
                return Entity.getAssetList({
                    type: spawn
                });
            }
            
            return arrayCache.setUp();
        }
    });
}());
