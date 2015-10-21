/**
 * This component will listen for a particular collision message and, depending on a given entity.state attribute, retrigger the collision as another collision message.
 * 
 * @namespace platypus.components
 * @class CollisionFilter
 * @uses platypus.Component
 */
/*global platypus */
(function () {
    "use strict";

    var collidePos = function (entity, state, event) {
            return function (collInfo) {
                if (entity.state[state]) {
                    entity.trigger(event, collInfo);
                }
            };
        },
        collideNeg = function (entity, state, event) {
            return function (collInfo) {
                if (!entity.state[state]) {
                    entity.trigger(event, collInfo);
                }
            };
        };
    
    return platypus.createComponentClass({
        id: 'CollisionFilter',
        
        properties: {
            /**
             * One or more collision events for which to listen. For example, if the state property is set to "allergic":
             * 
                   {
                       "hitting-flowers": "sneeze",
                       // Listen for "hitting-flowers", and if the entity is "allergic", trigger a "sneeze" event.
                    
                       "in-the-weeds": "cough"
                       // Another collision event that triggers "cough" if the entity is "allergic".
                   }
             * 
             * @property collisions
             * @type Object
             * @default {}
             */
            collisions: {},
            
            /**
             * The entity state that should cause the following list of collisions to trigger events. If this state is not true, no events are triggered. To trigger events on the inverse of a state, place "!" before the state such as "!allergic".
             * 
             * @property state
             * @type String
             * @default ""
             */
            state: ""
        },
        
        constructor: function (definition) {
            var event      = "",
                collisions = this.collisions,
                state      = this.state;
            
            if (collisions) {
                /**
                 * Events defined by the `collisions` property trigger whenever collisions happen while in the defined state.
                 * 
                 * @event *
                 * @param collisionData {CollisionData} Information regarding the collision that occurred.
                 */
                if (state[0] === '!') {
                    state = state.substring(1);
                    for (event in collisions) {
                        if (collisions.hasOwnProperty(event)) {
                            this.addEventListener(event, collideNeg(this.owner, state, collisions[event]));
                        }
                    }
                } else {
                    for (event in collisions) {
                        if (collisions.hasOwnProperty(event)) {
                            this.addEventListener(event, collidePos(this.owner, state, collisions[event]));
                        }
                    }
                }
            }
        }
    });
}());
