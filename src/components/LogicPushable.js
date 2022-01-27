/**
## JSON Definition
    {
      "type": "LogicPushable",
       "xPush" : .01,
      //Optional - The distance per millisecond this object can be pushed in x. Defaults to .01.
      "yPush" : .01,
      //Optional - The distance per millisecond this object can be pushed in y. Defaults to .01.
      "push" : .01
      //Optional - The distance per millisecond this object can be pushed in x and y. Overwritten by the more specific values xPush and yPush. Defaults to .01.
    }
*/
import {arrayCache} from '../utils/array.js';
import createComponentClass from '../factory.js';

export default (function () {
    var setMagnitude = function (direction, magnitude) {
        return (direction / Math.abs(direction)) * magnitude;
    };
    
    return createComponentClass(/** @lends platypus.components.LogicPushable.prototype */{
        id: 'LogicPushable',

        /**
         * A component that enables an entity to be pushed.
         *
         * @memberof platypus.components
         * @uses platypus.Component
         * @constructs
         * @param {*} definition 
         * @listens platypus.Entity#handle-logic
         * @listens platypus.Entity#hit-solid
         */
        initialize: function (definition) {
            this.yPush = definition.push || definition.yPush || 0;
            this.xPush = definition.push || definition.xPush || 0.1;
            if (definition.roll) {
                this.radius = definition.radius || this.owner.radius || ((this.owner.width || this.owner.height || 2) / 2);
                this.owner.orientation = this.owner.orientation || 0;
            } else {
                this.radius = 0;
            }
            this.currentPushX = 0;
            this.currentPushY = 0;
            this.lastX = this.owner.x;
            this.lastY = this.owner.y;
            this.pushers = arrayCache.setUp();
        },

        events: {
            "handle-logic": function (resp) {
                var i = 0,
                    delta = resp.delta;
                
                if (this.currentPushY) {
                    this.owner.y += setMagnitude(this.currentPushY, this.yPush * delta);
                    this.currentPushY = 0;
                }
                if (this.currentPushX) {
                    this.owner.x += setMagnitude(this.currentPushX, this.xPush * delta);
                    this.currentPushX = 0;
                }
                if ((this.lastX !== this.owner.x) || (this.lastY !== this.owner.y)) {
                    if (this.radius) {
                        this.owner.orientation += (this.owner.x + this.owner.y - this.lastX - this.lastY) / this.radius;
                    }
                    this.lastX = this.owner.x;
                    this.lastY = this.owner.y;
                }
                for (i = 0; i < this.pushers.length; i++) {
                    this.pushers[i].triggerEvent('pushed', this.owner);
                }
                this.pushers.length = 0;
            },
            "push-entity": function (collisionInfo) {
                var x = (collisionInfo.x || 0),
                    y = (collisionInfo.y || 0);
                
                this.currentPushX -= x;
                this.currentPushY -= y;
                if ((this.yPush && y) || (this.xPush && x)) {
                    this.pushers.push(collisionInfo.entity);
                }
            },
            "hit-solid": function (collisionInfo) {
                if (((collisionInfo.y > 0) && (this.vY > 0)) || ((collisionInfo.y < 0) && (this.vY < 0))) {
                    this.vY = 0;
                } else if (((collisionInfo.x < 0) && (this.vX < 0)) || ((collisionInfo.x > 0) && (this.vX > 0))) {
                    this.vX = 0;
                }
                return true;
            }
        },
        
        methods: {
            destroy: function () {
                arrayCache.recycle(this.pushers);
            }
        }
    });
}());
