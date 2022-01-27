import createComponentClass from '../factory.js';

export default (function () {
    return createComponentClass(/** @lends platypus.components.LogicWindUpRacer.prototype */{
        
        id: 'LogicWindUpRacer',
        
        properties: {
            /**
             * Velocity at which the entity should travel while racing.
             *
             * @property speed
             * @type Number
             * @default 0.3
             */
            speed: 0.3,
            
            /**
             * Time in milliseconds that entity will race before coming to a stop.
             *
             * @property raceTime
             * @type Number
             * @default 5000
             */
            raceTime: 5000,
            
            /**
             * Time in milliseconds that entity needs to receive wind-up calls before racing can begin.
             *
             * @property windTime
             * @type Number
             * @default 500
             */
            windTime: 500
        },
        
        /**
         * Replicates logic for a wind-up toy: listens for a wind-up message over a series of ticks to charge, and then begins racing once the charge is complete.
         *
         * @memberof platypus.components
         * @uses platypus.Component
         * @constructs
         * @listens platypus.Entity#handle-logic
         * @listens platypus.Entity#hit-solid
         * @listens platypus.Entity#stop-racing
         * @listens platypus.Entity#wind-up
         * @fires platypus.Entity#racing
         * @fires platypus.Entity#stopped-racing
         * @fires platypus.Entity#winding
         * @fires platypus.Entity#stopped-winding
         * @fires platypus.Entity#blocked
         */
        initialize: function () {
            var thisState = this.owner.state;
            
            this.windProgress = 0;
            
            this.winding = false;
            this.racing = false;
            this.blocked = false;
            this.right = false;
            this.left = false;
            
            this.state = thisState;
            thisState.set('windingUp', false);
            thisState.set('racing', false);
            thisState.set('blocked', false);
        },

        events: {
            "handle-logic": function (resp) {
                var thisState = this.state;
                
                if (this.racing) {

                    /**
                     * This event is triggered when winding is finished and the entity begins racing.
                     *
                     * @event platypus.Entity#racing
                     */
                    if (!this.blocked && this.right && thisState.get('right')) {
                        this.owner.x += this.speed * resp.delta;
                        this.owner.triggerEvent('racing');
                    } else if (!this.blocked && this.left && thisState.get('left')) {
                        this.owner.x -= this.speed * resp.delta;
                        this.owner.triggerEvent('racing');
                    } else {
                        this.racing = false;

                        /**
                         * This event is triggered when the entity stops racing.
                         *
                         * @event platypus.Entity#stopped-racing
                         */
                        this.owner.triggerEvent('stopped-racing');
                    }
                } else if (this.winding) {
                    if ((this.right && thisState.get('right')) || (this.left && thisState.get('left'))) {
                        this.windProgress += resp.delta;
                    }

                    /**
                     * This event is triggered as the entity winds up.
                     *
                     * @event platypus.Entity#winding
                     * @param fraction {Number} The amount of progress that has been made from 0 to 1.
                     */
                    this.owner.triggerEvent('winding', this.windProgress / this.windTime);
                } else if (this.windProgress) {
                    if (this.windProgress >= this.windTime) {
                        this.racing = true;
                    }
                    this.windProgress = 0;

                    /**
                     * This event is triggered when the entity stops winding.
                     *
                     * @event platypus.Entity#stopped-winding
                     */
                    this.owner.triggerEvent('stopped-winding');
                }
                
                thisState.set('windingUp', this.winding);
                thisState.set('racing', this.racing);
                thisState.set('blocked', this.blocked);
                this.blocked = false;
            },
            
            /**
             * Causes the entity to stop racing.
             *
             * @event platypus.Entity#stop-racing
             */
            "stop-racing": function () {
                this.racing = false;
                this.owner.triggerEvent('stopped-racing');
            },
            
            /**
             * Causes the entity to wind up for a race.
             *
             * @event platypus.Entity#wind-up
             * @param message.pressed {Boolean} If `message` is included, the component checks the value of `pressed`: `false` causes winding to stop.
             */
            "wind-up": function (value) {
                this.winding = !value || (value.pressed !== false);
                this.right = this.state.get('right');
                this.left  = this.state.get('left');
            },
            
            "hit-solid": function (collision) {
                if (collision.x) {
                    if (this.racing && ((this.right && (collision.x > 0)) || (this.left && (collision.x < 0)))) {
                        this.blocked = true;
                        
                        /**
                         * This message is triggered if the entity collides while racing.
                         *
                         * @event platypus.Entity#blocked
                         * @param collision {platypus.CollisionData} Collision information from the entity or tile that blocked movement.
                         */
                        this.owner.triggerEvent('blocked', collision);
                    }
                }
            }
        },
    
        methods: {
            destroy: function () {
                this.state.set('windingUp', false);
                this.state.set('racing', false);
                this.state.set('blocked', false);
                this.state = null;
            }
        }
    });
}());
