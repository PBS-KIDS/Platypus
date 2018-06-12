/**
# COMPONENT **Tween**
Tween takes a list of tween definitions and plays them as needed.

## Dependencies
- [[TweenJS]] - This component requires the CreateJS TweenJS module.

## Messages

### Listens for:
- **[Messages specified in definition]** - Listens for messages and on receiving them, begins playing the corresponding tween.

### Local Broadcasts:
- **[Messages specified in definition]** - Broadcasts messages from a given tween definition.

## JSON Definition
    {
      "type": "Tween",

      "events": {
      // Required. A key/value list of events and an array representing the tween they should trigger.

            "begin-flying": [
            // When "begin-flying" is triggered on this entity, the following tween begins. Tween definitions adhere to a similar structure outlined by the TweenJS documentation. Each milestone on the tween is an item in this array.

                ["to", {
                    "scaleY": 1,
                    "y": 400
                }, 500],
                // If the definition is an array, the first parameter is the type of milestone, in this case "to", with all following parameters passed directly to the equivalent Tween function.
                
                ["call", "fly"],
                // "call" milestones can take a function or a string. If it's a string, the string will be triggered as an event on the entity. In this case, the component will trigger "fly".
            ]
        }
    }
*/
/* global createjs, platypus */
(function () {
    'use strict';

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
        createTween = function (definition, componentProperties) {
            return function (values) {
                var i  = 0,
                    simpleDef = Array.isArray(definition),
                    tweens = simpleDef ? definition : definition.tween,
                    tweenDef = null,
                    arr = null,
                    arr2 = null,
                    tween = createjs.Tween.get(this.owner, mergeProperties(simpleDef ? empty : definition, componentProperties, this.owner));

                if (Array.isArray(values)) {
                    tweens = values;
                } else if (!Array.isArray(tweens)) {
                    platypus.debug.warn('Tween: no array was supplied for this tween.');
                    return;
                }

                for (i = 0; i < tweens.length; i++) {
                    tweenDef = tweens[i];
                    if (typeof tweenDef === 'string') {
                        tween.call(createTrigger(this.owner, tweenDef));
                    } else if (Array.isArray(tweenDef)) {
                        if (tweenDef[0] === 'call' && typeof tweenDef[1] === 'string') {
                            tween.call(createTrigger(this.owner, tweenDef[1]));
                        } else {
                            arr = tweenDef.greenSlice();
                            if (arr.greenSplice(0) === 'to' && arr[2] && createjs.Ease[arr[2]]) {
                                if (arr.length > 3) {
                                    arr2 = arr.greenSlice();
                                    arr2.greenSplice(0);
                                    arr2.greenSplice(0);
                                    arr[2] = createjs.Ease[arr2.greenSplice(0)].apply(null, arr2);
                                    arr2.recycle();
                                } else {
                                    arr[2] = createjs.Ease[arr[2]];
                                }
                            }
                            tween[tweenDef[0]].apply(tween, arr);
                            arr.recycle();
                        }
                    } else if (tweenDef.method === 'call' && typeof tweenDef.params === 'string') {
                        tween.call(createTrigger(this.owner, tweenDef.params));
                    } else {
                        tween[tweenDef.method].apply(tween, tweenDef.params);
                    }
                }
            };
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
             *              "tween": ["to", {"y": 0}, 250],
             *              "loop": 2 // This overrides this component's `loop` property value.
             *          }
             *      }
             */

            /**
             * 
             */
            useTicks: false,
            
            /**
             * 
             */
            ignoreGlobalPause: false,
            
            /**
             * 
             */
            loop: 0,
            
            /**
             * 
             */
            reversed: false,
            
            /**
             * 
             */
            bounce: false,
            
            /**
             * 
             */
            timeScale: 1,

            /**
             * 
             */
            pluginData: null,
            
            /**
             * 
             */
            paused: false,

            /**
             * 
             */
            position: 0,
            
            /**
             * 
             */
            onChange: '',
            
            onComplete: '',
            
            override: false
        },
        
        initialize: function (definition) {
            var event = '';
            
            if (definition.events) {
                for (event in definition.events) {
                    if (definition.events.hasOwnProperty(event)) {
                        this.addEventListener(event, createTween(definition.events[event], this));
                    }
                }
            }
        }
    });
}());
