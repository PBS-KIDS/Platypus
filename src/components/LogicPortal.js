/**
### Peer Broadcasts:
- **portal-waiting** - Informs another object that the portal is waiting on it to send the activate message.
  - @param entity - This is the portal entity. To be used so that the object can communicate with it directly.

## JSON Definition
    {
      "type": "name-of-component",
      "destination" : "level-2"
      //Required - The destination scene to which the portal will take us. In most cases this will come into the portal from Tiled where you'll set a property on the portal you place.
    }
*/
import DataMap from '../DataMap.js';
import createComponentClass from '../factory.js';

export default (function () {
    return createComponentClass(/** @lends platypus.components.LogicPortal.prototype */{
        id: 'LogicPortal',
        
        /**
         * A component which changes the scene when activated. When the portal receives an occupied message it sends the entity in that message notifying it. This message is meant to give the entity a chance to activate the portal in the manner it wants. The portal can also be activated by simply telling it to activate.
         *
         * @memberof platypus.components
         * @uses platypus.Component
         * @constructs
         * @param {*} definition 
         * @listens platypus.Entity#handle-logic
         */
        initialize: function (definition) {
            var i = 0,
                entrants = definition.entrants || definition.entrant || 'no one',
                state = this.owner.state;
             
            this.destination = this.owner.destination || definition.destination;
            this.used = false;
            this.ready = false;
            this.wasReady = false;

            this.entrants = DataMap.setUp();
            if (Array.isArray(entrants)) {
                for (i = 0; i < entrants.length; i++) {
                    this.entrants.set(entrants[i], false);
                }
            } else {
                this.entrants.set(entrants, false);
            }
            
            this.state = state;

            state.set('occupied', false);
            state.set('ready', true);
        },
        events: {
            "handle-logic": function () {
                var entrants = this.entrants,
                    keys = entrants.keys,
                    i = keys.length,
                    occupied = false,
                    ready = true,
                    state = this.state;
                
                if (!this.used && this.activated) {
                    this.owner.triggerEvent("port-" + this.destination);
                    this.used = true;
                } else if (this.ready && !this.wasReady) {
                    this.owner.triggerEvent('portal-waiting');
                    this.wasReady = true;
                } else if (this.wasReady && !this.ready) {
                    this.owner.triggerEvent('portal-not-waiting');
                    this.wasReady = false;
                }
                
                
                //Reset portal for next collision run.
                while (i--) {
                    if (entrants[keys[i]]) {
                        occupied = true;
                        entrants.set(keys[i], false);
                    } else {
                        ready = false;
                    }
                }
                state.set('occupied', occupied);
                state.set('ready', ready);
                this.ready = false;
            },
            "occupied-portal": function (collision) {
                var entrants = this.entrants,
                    keys = entrants.keys,
                    i = keys.length;
                
                entrants.set(collision.entity.type, true);
                
                while (i--) {
                    if (!entrants.get(keys[i])) {
                        return;
                    }
                }
                
                this.ready = true;
            },
            "activate-portal": function () {
                this.activated = true;
            }
        },
        methods: {
            destroy: function () {
                this.state = null;
                this.entrants.recycle();
                this.entrants = null;
            }
        }
    });
}());
