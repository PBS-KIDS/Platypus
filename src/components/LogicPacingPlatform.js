/**
## JSON Definition:
    {
      "type": "LogicDirectionalMovement",
      
      "angle": 3.14,
      // Optional. Defines the angle of movement in radians. Defaults to 0 (horizontal, starts moving right).
      
      "distance": 440,
      // Optional. Declares distance in world units that the entity should move back and forth across. Defaults to 128.
      
      "period": 6000,
      // Optional. Sets the time in milliseconds that the entity should take to make a complete movement cycle. Defaults to 4 seconds (4000).
      
      "startPos": 0
      // Optional. Position in the cycle that the movement should begin. Defaults in the middle at 0; PI/2 and -PI/2 will put you at the extremes.
    }
*/
import createComponentClass from '../factory.js';

export default (function () {
    return createComponentClass(/** @lends platypus.components.LogicPacingPlatform.prototype */{
        
        id: 'LogicPacingPlatform',
        
        /**
         * This component changes the (x, y) position of an object according to its speed and heading and alternates back and forth. This is useful for in-place moving platforms.
         *
         * @memberof platypus.components
         * @uses platypus.Component
         * @constructs
         * @param {*} definition 
         * @listens platypus.Entity#handle-logic
         */
        initialize: function (definition) {
            this.ang      = this.owner.angle      || definition.angle     || 0; //PI/2 makes it go down first
            this.dist     = this.owner.distance || definition.distance || 128; //Distance in pixels
            this.dX       = this.dist * Math.cos(this.ang);
            this.dY       = this.dist * Math.sin(this.ang);
            this.period   = this.owner.period    || definition.period     || 4000;
            this.time     = 0;
            this.startPos = this.owner.startPos || definition.startPos || 0; //PI/2 and -PI/2 will put you at the extremes
            this.offset   = 0;
            this.originX  = this.owner.x;
            this.originY  = this.owner.y;
        },

        events: {
            "handle-logic": function (update) {
                var period = this.period,
                    delta = update.delta;
                
                this.time += delta;
                if (this.time > period) {
                    this.time = this.time % period;
                }
                this.offset = (this.time / period) * (2 * Math.PI);
                
                this.owner.x = this.originX + Math.sin(this.offset + this.startPos) * this.dX;
                this.owner.y = this.originY + Math.sin(this.offset + this.startPos) * this.dY;
            }
        }
    });
}());
