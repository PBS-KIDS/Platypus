/**
 * This component takes a list of tween definitions and plays them as needed. This component requires CreateJS Tween.
 *
 * NOTE: This component handles ticking that's synchronized with the game's tick, NOT it's logic tick. As such, reading tweened values during the logic tick will show a changed value on the first logic tick, but all subsequent logic ticks comprising the game's full tick will show no change at all.
 *
 * @namespace platypus.components
 * @class Tween
 * @uses platypus.Component
 */
/* global platypus */
import {arrayCache, greenSlice} from '../utils/array.js';
import Tween from '@tweenjs/tween.js';

export default (function () {
    var empty = {},
        createEvent = function (dictionary, key, defaults, entity) {
            var event = getProperty(dictionary, key, defaults);

            if (event) {
                if (typeof event === 'string') {
                    return createTrigger(entity, event);
                } else {
                    return event;
                }
            } else {
                return null;
            }
        },
        createTrigger = function (entity, event, message, debug) {
            return function () {
                entity.trigger(event, message, debug);
            };
        },
        tween = function (definition, values) {
            var i  = 0,
                owner = this.owner,
                simpleDef = Array.isArray(definition),
                tweens = simpleDef ? definition : definition.tween,
                tweenDef = null,
                arr = null,
                arr2 = null,
                tween = new Tween(owner, mergeProperties(simpleDef ? empty : definition, this, owner));

            if (Array.isArray(values)) {
                tweens = values;
            } else if (!Array.isArray(tweens)) {
                platypus.debug.warn('Tween: no array was supplied for this tween.');
                return;
            }

            for (i = 0; i < tweens.length; i++) {
                tweenDef = tweens[i];
                if (typeof tweenDef === 'string') {
                    tween.call(createTrigger(owner, tweenDef));
                } else if (Array.isArray(tweenDef)) {
                    if (tweenDef[0] === 'call' && typeof tweenDef[1] === 'string') {
                        tween.call(createTrigger(owner, tweenDef[1]));
                    } else {
                        arr = greenSlice(tweenDef);
                        if (arr.shift() === 'to' && arr[2] && createjs.Ease[arr[2]]) {
                            if (arr.length > 3) {
                                arr2 = greenSlice(arr);
                                arr2.shift();
                                arr2.shift();
                                arr[2] = createjs.Ease[arr2.shift()].apply(null, arr2);
                                arrayCache.recycle(arr2);
                            } else {
                                arr[2] = createjs.Ease[arr[2]];
                            }
                        }
                        tween[tweenDef[0]].apply(tween, arr);
                        arrayCache.recycle(arr);
                    }
                } else if (tweenDef.method === 'call' && typeof tweenDef.params === 'string') {
                    tween.call(createTrigger(owner, tweenDef.params));
                } else {
                    tween[tweenDef.method].apply(tween, tweenDef.params);
                }
            }
        },
        getProperty = function (dictionary, key, defaults) {
            if (dictionary[key] !== 'undefined') {
                return dictionary[key];
            } else {
                return defaults[key];
            }
        },
        mergeProperties = function (overrides, defaults, entity) {
            return {
                useTicks: getProperty(overrides, 'useTicks', defaults),
                ignoreGlobalPause: getProperty(overrides, 'ignoreGlobalPause', defaults),
                loop: getProperty(overrides, 'loop', defaults),
                reversed: getProperty(overrides, 'reversed', defaults),
                bounce: getProperty(overrides, 'bounce', defaults),
                timeScale: getProperty(overrides, 'timeScale', defaults),
                pluginData: getProperty(overrides, 'pluginData', defaults),
                paused: getProperty(overrides, 'paused', defaults),
                position: getProperty(overrides, 'position', defaults),
                onChange: createEvent(overrides, 'onChange', defaults, entity),
                onComplete: createEvent(overrides, 'onComplete', defaults, entity),
                override: getProperty(overrides, 'override', defaults)
            };
        };
    
    if (!Tween) {
        return platypus.createComponentClass({
            id: 'Tween',
            initialize: function () {
                platypus.debug.warn('CreateJS Tween must be included in the project to use the Tween component.');
            }
        });
    }

    Tween._inited = true; // Prevents Tween from using its own ticker.
    
    return platypus.createComponentClass({
        id: 'Tween',

        properties: {
            /**
             * Required. A key/value list of events and an array or object representing the tween they should trigger.
             *
             *      {
             *          "begin-flying": [ // When "begin-flying" is triggered on this entity, the following tween begins. Tween definitions adhere to a similar structure outlined by the TweenJS documentation. Each milestone on the tween is an item in this array.
             *              ["to", { // If the definition is an array, the first parameter is the type of milestone, in this case "to", with all following parameters passed directly to the equivalent Tween function.
             *                  "scaleY": 1,
             *                  "y": 400
             *              }, 500],
             *              ["call", "fly"], // "call" milestones can take a function or a string. If it's a string, the string will be triggered as an event on the entity. In this case, the component will trigger "fly".
             *          ],
             *
             *          "stop-flying": { // Alternatively, an object can be used to include properties. It must include a `tween` property with an array of tween values like above. It may include any properties that the Tween component accepts and overrides the component's properties.
             *              "tween": [["to", {"y": 0}, 250]],
             *              "loop": 2 // This overrides this component's `loop` property value.
             *          }
             *      }
             *
             * @property events
             * @type Object
             * @default null
             */
            events: null,

            /**
             * Sets `useTicks` on the tween as defined here: https://www.createjs.com/docs/tweenjs/classes/Tween.html
             *
             * @property useTicks
             * @type Boolean
             * @default false
             */
            useTicks: false,
            
            /**
             * Sets `ignoreGlobalPause` on the tween as defined here: https://www.createjs.com/docs/tweenjs/classes/Tween.html
             *
             * @property ignoreGlobalPause
             * @type Boolean
             * @default false
             */
            ignoreGlobalPause: false,
            
            /**
             * Sets `loop` on the tween as defined here: https://www.createjs.com/docs/tweenjs/classes/Tween.html
             *
             * @property loop
             * @type Number|Boolean
             * @default 0
             */
            loop: 0,
            
            /**
             * Sets `reversed` on the tween as defined here: https://www.createjs.com/docs/tweenjs/classes/Tween.html
             *
             * @property reversed
             * @type Boolean
             * @default false
             */
            reversed: false,
            
            /**
             * Sets `bounce` on the tween as defined here: https://www.createjs.com/docs/tweenjs/classes/Tween.html
             *
             * @property bounce
             * @type Boolean
             * @default false
             */
            bounce: false,
            
            /**
             * Sets `timeScale` on the tween as defined here: https://www.createjs.com/docs/tweenjs/classes/Tween.html
             *
             * @property timeScale
             * @type Number
             * @default 1
             */
            timeScale: 1,

            /**
             * Sets `pluginData` on the tween as defined here: https://www.createjs.com/docs/tweenjs/classes/Tween.html
             *
             * @property pluginData
             * @type Object
             * @default null
             */
            pluginData: null,
            
            /**
             * Sets `paused` on the tween as defined here: https://www.createjs.com/docs/tweenjs/classes/Tween.html
             *
             * @property paused
             * @type Boolean
             * @default false
             */
            paused: false,

            /**
             * Sets `position` on the tween as defined here: https://www.createjs.com/docs/tweenjs/classes/Tween.html
             *
             * @property position
             * @type Number
             * @default false
             */
            position: 0,
            
            /**
             * Sets `onChange` on the tween as defined here: https://www.createjs.com/docs/tweenjs/classes/Tween.html. If a string is specified, it is triggered as an event on the entity.
             *
             * @property onChange
             * @type Function|String
             * @default ''
             */
            onChange: '',
            
            /**
             * Sets `onComplete` on the tween as defined here: https://www.createjs.com/docs/tweenjs/classes/Tween.html. If a string is specified, it is triggered as an event on the entity.
             *
             * @property onComplete
             * @type Function|String
             * @default ''
             */
            onComplete: '',
            
            /**
             * Sets `override` on the tween as defined here: https://www.createjs.com/docs/tweenjs/classes/Tween.html
             *
             * @property override
             * @type Boolean
             * @default false
             */
            override: false
        },
        
        initialize: function () {
            var event = '',
                events = this.events;
            
            if (events) {
                for (event in events) {
                    if (events.hasOwnProperty(event)) {
                        this.addEventListener(event, tween.bind(this, events[event]));
                    }
                }
            }
        }
    });
}());
