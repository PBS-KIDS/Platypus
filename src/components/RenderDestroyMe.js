/**
 * This component will destroy the entity once an animation has finished. This is useful for explosions or similar animations where the entity is no longer needed once the animation completes.
 * 
 * @namespace platypus.components
 * @class RenderDestroyMe
 * @uses platypus.Component
 */
/*global platypus */
/*jslint plusplus:true */
(function () {
    'use strict';

    return platypus.createComponentClass({
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

        constructor: function (definition) {
            if (this.animationId) {
                this.animationIds = Array.setUp(definition.animationId);
            } else if (this.animationIds) {
                this.animationIds = this.animationIds.greenSlice();
            }
        },

        events: {// These are messages that this component listens for
            /**
             * On receiving this message, the component matches the animation id with its animation id setting and destroys the entity if they match.
             * 
             * @method 'animation-ended'
             * @param animation {String} Animation id for the animation that just finished.
             */
            "animation-ended": function (animation) {
                if (!this.animationIds || (this.animationIds.indexOf(animation) >= 0)) {
                    this.owner.parent.removeEntity(this.owner);
                }
            }
        },
        
        methods: {
            destroy: function () {
                if (this.animationIds) {
                    this.animationIds.recycle();
                    delete this.animationIds;
                }
            }
        }
    });
}());
