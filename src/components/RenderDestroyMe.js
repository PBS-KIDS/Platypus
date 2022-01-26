import {arrayCache, greenSlice} from '../utils/array.js';
import createComponentClass from '../factory.js';

export default createComponentClass(/** @lends platypus.components.RenderDestroyMe.prototype */{
    id: 'RenderDestroyMe',
    
    properties: {
        /**
         * This or animationIds required. This is a String identifying the animation that should destroy this entity on its completion.
         *
         * @property animationId
         * @type String
         * @default ''
         */
        animationId: '',
        
        /**
         * This or animationId required. This is an array of Strings identifying the animations that should destroy this entity on their completion.
         *
         * @property animationIds
         * @type Array
         * @default null
         */
        animationIds: null
    },

    /**
     * This component will destroy the entity once an animation has finished. This is useful for explosions or similar animations where the entity is no longer needed once the animation completes.
     *
     * @memberof platypus.components
     * @uses platypus.Component
     * @constructs
     * @listens platypus.Entity#animation-ended
     */
    initialize: function (definition) {
        if (this.animationId) {
            this.animationIds = arrayCache.setUp(definition.animationId);
        } else if (this.animationIds) {
            this.animationIds = greenSlice(this.animationIds);
        }
    },

    events: {// These are messages that this component listens for
        "animation-ended": function (animation) {
            if (!this.animationIds || (this.animationIds.indexOf(animation) >= 0)) {
                this.owner.parent.removeEntity(this.owner);
            }
        }
    },
    
    methods: {
        destroy: function () {
            if (this.animationIds) {
                arrayCache.recycle(this.animationIds);
                this.animationIds = null;
            }
        }
    }
});
