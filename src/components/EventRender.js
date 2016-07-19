/**
 * This component is typically added to an entity automatically by a render component. It handles mapping entity events to playable animations.
 *
 * @class EventRender
 * @uses platypus.Component
 * @since 0.9.0
 */
/*global platypus */
(function () {
    'use strict';
    
    return platypus.createComponentClass({
        id: 'EventRender',

        properties: {
            /**
             * An object containg key-value pairs that define a mapping from triggered events to the animation that should play.
             *
             *     "animationMap":{
             *         "move": "walk-animation",
             *         "jump": "jumping-animation"
             *     }
             *
             * The above will create two event listeners on the entity, "move" and "jump", that will play their corresponding animations when the events are triggered.
             *
             * @property animationMap
             * @type Object
             * @default null
             */
            "animationMap": null
        },

        constructor: (function () {
            var trigger = function (animation) {
                /**
                 * On receiving an animation-mapped event, this component triggers this event to play an animation.
                 *
                 * @event 'play-animation'
                 * @param animation {String} Describes the animation to play.
                 */
                this.owner.triggerEvent('play-animation', animation);
            };

            return function () {
                var animation = '',
                    map = this.animationMap;

                for (animation in map) {
                    if (map.hasOwnProperty(animation)) {
                        this.addEventListener(animation, trigger.bind(this, map[animation]));
                    }
                }
            };
        } ())
    });
}());
