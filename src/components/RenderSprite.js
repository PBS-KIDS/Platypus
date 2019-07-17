/**
 * This component is attached to entities that will appear in the game world. It renders a static or animated image. It listens for messages triggered on the entity or changes in the logical state of the entity to play a corresponding animation.
 *
 * @namespace platypus.components
 * @class RenderSprite
 * @uses platypus.Component
 */
/* global platypus */
import Data from '../Data.js';
import EventRender from './EventRender.js';
import PIXIAnimation from '../PIXIAnimation.js';
import RenderContainer from './RenderContainer.js';
import StateRender from './StateRender.js';

export default (function () {
    return platypus.createComponentClass({
        
        id: 'RenderSprite',
        
        properties: {
           /**
             * spriteSheet can either be a String or an object. If a string, the spritesheet data will be loaded from the file with a matching name in the spritesheet folder. Otherwise the definition is in full here. That spritesheet data defines an EaselJS sprite sheet to use for rendering. See https://createjs.com/docs/easeljs/classes/SpriteSheet.html for the full specification.
             *
             *  "spriteSheet": 'hero-image'
             *
             *  -OR-
             *
             *  "spriteSheet": {
             *
             *      "images": ["example0", "example1"], //Can also define 'image' and give the
             *      "frames": {
             *          "width":  100,
             *          "height": 100,
             *          "regY":   100,
             *          "regX":   50
             *      },
             *      "animations":{
             *          "default-animation":[2],
             *          "walking": {"frames": [0, 1, 2], "speed": 4},
             *          "swing": {"frames": [3, 4, 5], "speed": 4}
             *      }
             *  }
             *
             *  -OR- an Array of the above (since 0.8.4)
             *
             * @property spriteSheet
             * @type String|Array|Object
             * @default null
             */
            spriteSheet: null,

            /**
             * Optional. An object containg key-value pairs that define a mapping from triggered events or entity states to the animation that should play. The list is processed from top to bottom, so the most important actions should be listed first (for example, a jumping animation might take precedence over an idle animation). If not specified, an 1-to-1 animation map is created from the list of animations in the sprite sheet definition using the animation names as the keys.
             *
             *     "animationMap":{
             *         "standing": "default-animation"  // On receiving a "standing" event, or when this.owner.state.standing === true, the "default" animation will begin playing.
             *         "ground,moving": "walking",  // Comma separated values have a special meaning when evaluating "state-changed" messages. The above example will cause the "walking" animation to play ONLY if the entity's state includes both "moving" and "ground" equal to true.
             *         "ground,striking": "swing!", // Putting an exclamation after an animation name causes this animation to complete before going to the next animation. This is useful for animations that would look poorly if interrupted.
             *         "default": "default-animation" // Optional. "default" is a special property that matches all states. If none of the above states are valid for the entity, it will use the default animation listed here.
             *     }
             *
             * This data is used to create EventRender or StateRender components on the entity if the `eventBased` or `stateBased` properties are set to `true`.
             *
             * @property animationMap
             * @type Object
             * @default null
             */
            animationMap: null,

            /**
             * Optional. A mask definition that determines where the image should clip. A string can also be used to create more complex shapes via the PIXI graphics API like: "mask": "r(10,20,40,40).dc(30,10,12)". Defaults to no mask or, if simply set to true, a rectangle using the entity's dimensions.
             *
             *  "mask": {
             *      "x": 10,
             *      "y": 10,
             *      "width": 40,
             *      "height": 40
             *  },
             *
             *  -OR-
             *
             *  "mask": "r(10,20,40,40).dc(30,10,12)"
             *
             * @property mask
             * @type Object
             * @default null
             */
            mask: null,

            /**
             * Defines whether the entity will respond to touch and click events. Setting this value will create an Interactive component on this entity with these properties. For example:
             *
             *  "interactive": {
             *      "hover": false,
             *      "hitArea": {
             *          "x": 10,
             *          "y": 10,
             *          "width": 40,
             *          "height": 40
             *      }
             *  }
             *
             * @property interactive
             * @type Boolean|Object
             * @default false
             * @since 0.9.0
             */
            interactive: false,

            /**
             * The offset of the x-axis position of the sprite from the entity's x-axis position.
             *
             * @property offsetX
             * @type Number
             * @default 0
             * @since 0.11.0
             */
            offsetX: 0,

            /**
             * The offset of the y-axis position of the sprite from the entity's y-axis position.
             *
             * @property offsetY
             * @type Number
             * @default 0
             * @since 0.11.0
             */
            offsetY: 0,

            /**
             * The z-index relative to other render components on the entity.
             *
             * @property offsetZ
             * @type Number
             * @default 0
             */
            offsetZ: 0,

            /**
             * Whether to restart a playing animation on event.
             *
             * @property restart
             * @type Boolean
             * @default true
             * @since 0.9.2
             */
            restart: true,

            /**
             * Optional. Whether this object can be rotated. It's rotational angle is set by setting the this.owner.rotation value on the entity.
             *
             * @property rotate
             * @type Boolean
             * @default false
             */
            rotate: false,

            /**
             * Whether this object can be mirrored over X. To mirror it over X set the this.owner.rotation value to be > 90  and < 270.
             *
             * @property mirror
             * @type Boolean
             * @default false
             */
            mirror: false,

            /**
             * Optional. Whether this object can be flipped over Y. To flip it over Y set the this.owner.rotation to be > 180.
             *
             * @property flip
             * @type Boolean
             * @default false
             */
            flip: false,

            /**
             * Optional. Whether this object is visible or not. To change the visible value dynamically set this.owner.state.visible to true or false.
             *
             * @property visible
             * @type Boolean
             * @default false
             */
            visible: true,

            /**
             * Optional. Specifies whether this component should create an EventRender component to listen to events matching the animationMap to animate. Set this to true if the component should animate for on events. Default is `false`.
             *
             * @property eventBased
             * @type Boolean
             * @default false
             */
            eventBased: false,

            /**
             * Optional. Specifies whether this component should create a StateRender component to handle changes in the entity's state that match the animationMap to animate. Set this to true if the component should animate based on `this.owner.state`. Default is `true`.
             *
             * @property stateBased
             * @type Boolean
             * @default true
             */
            stateBased: true,

            /**
             * Optional. Whether this sprite should be cached into an entity with a `RenderTiles` component (like "render-layer"). The `RenderTiles` component must have its "entityCache" property set to `true`. Warning! This is a one-direction setting and will remove this component from the entity once the current frame has been cached.
             *
             * @property cache
             * @type Boolean
             * @default false
             */
            cache: false,

            /**
             * Optional. When using state-based animations, forces animations to complete before starting a new animation. Defaults to false.
             *
             * @property forcePlayThrough
             * @type Boolean
             * @default false
             */
            forcePlayThrough: false,

            /**
             * Optional. Ignores the opacity of the owner. Used when multiple RenderSprite components are on the same entity.
             *
             * @property ignoreOpacity
             * @type Boolean
             * @default false
             */
            ignoreOpacity: false,

            /**
             * The scaling factor for this component.
             *
             * @property scale
             * @type Number|Array|Object
             * @default 1
             */
            scale: 1,

            /**
             * Optional. The X scaling factor for the image. Defaults to 1.
             *
             * @property scaleX
             * @type Number
             * @default 1
             */
            scaleX: 1,

            /**
             * Optional. The Y scaling factor for the entity. Defaults to 1.
             *
             * @property scaleY
             * @type Number
             * @default 1
             */
            scaleY: 1,

            /**
             * The skew factor for this component.
             *
             * @property skew
             * @type Number|Array|Object
             * @default 0
             */
            skew: 0,

            /**
             * Optional. The X skew factor of the entity. Defaults to 0.
             *
             * @property skewX
             * @type Number
             * @default 0
             */
            skewX: 0,

            /**
             * Optional. The Y skew factor for the entity. Defaults to 0.
             *
             * @property skewY
             * @type Number
             * @default 0
             */
            skewY: 0,

            /**
             * Optional. The rotation of the sprite in degrees. All sprites on the same entity are rotated the same amount unless they ignore the rotation value by setting 'rotate' to false.
             *
             * @property rotation
             * @type Number
             * @default 1
             */
            rotation: 0
        },

        initialize: (function () {
            var createAnimationMap = function (animationMap, ss) {
                    var map  = null,
                        anim = '';

                    if (animationMap) {
                        return animationMap;
                    } else if (Array.isArray(ss.frames) && (ss.frames.length === 1)) {
                        // This is a single frame animation, so no mapping is necessary
                        return null;
                    } else {
                        // Create 1-to-1 animation map since none was defined
                        map = {};
                        for (anim in ss.animations) {
                            if (ss.animations.hasOwnProperty(anim)) {
                                map[anim] = anim;
                            }
                        }
                        return map;
                    }
                },
                animationEnded = function (animation) {
                    /**
                     * This event fires each time an animation completes.
                     *
                     * @event 'animation-ended'
                     * @param animation {String} The id of the animation that ended.
                     */
                    this.owner.triggerEvent('animation-ended', animation);
                };
            
            return function () {
                var animation = '',
                    definition = null,
                    ss = PIXIAnimation.formatSpriteSheet(this.spriteSheet),
                    map  = null;

                if (ss === PIXIAnimation.EmptySpriteSheet) {
                    platypus.debug.warn('Entity "' + this.owner.type + '": RenderSprite sprite sheet not defined.');
                }
                
                map = createAnimationMap(this.animationMap, ss);
                this.stateBased = map && this.stateBased;
                this.eventBased = map && this.eventBased;
                if (map) {
                    animation = map.default || '';

                    if (this.eventBased) {
                        definition = Data.setUp(
                            'animationMap', map,
                            'restart', this.restart,
                            'component', this
                        );
                        this.owner.addComponent(new EventRender(this.owner, definition));
                        definition.recycle();
                    }

                    if (this.stateBased) {
                        definition = Data.setUp(
                            'animationMap', map,
                            'forcePlayThrough', this.forcePlayThrough,
                            'component', this
                        );
                        this.owner.addComponent(new StateRender(this.owner, definition));
                        definition.recycle();
                    }
                }
                
                /*
                 * PIXIAnimation created here:
                 */
                this.sprite = new PIXIAnimation(ss, animation);
                this.sprite.on('complete', animationEnded.bind(this));
                this.sprite.x = this.offsetX;
                this.sprite.y = this.offsetY;
                this.sprite.z = this.offsetZ;

                if (!this.owner.container) {
                    definition = Data.setUp(
                        'interactive', this.interactive,
                        'mask', this.mask,
                        'rotate', this.rotate,
                        'mirror', this.mirror,
                        'flip', this.flip,
                        'visible', this.visible,
                        'cache', this.cache,
                        'ignoreOpacity', this.ignoreOpacity,
                        'scaleX', this.scaleX,
                        'scaleY', this.scaleY,
                        'skewX', this.skewX,
                        'skewY', this.skewY,
                        'rotation', this.rotation
                    );
                    this.owner.addComponent(new RenderContainer(this.owner, definition, this.addToContainer.bind(this)));
                    definition.recycle();
                } else {
                    this.addToContainer();
                }

                ss.recycleSpriteSheet();
            };
        }()),
        
        events: {
            /**
             * The render update message updates the sprite. If a sprite doesn't have a container, it's removed.
             *
             * @method 'handle-render'
             * @param renderData {Object} Data from the render handler
             * @param renderData.container {PIXI.Container} The parent container.
             */
            "handle-render": function (renderData) {
                if (this.sprite) {
                    /**
                     * This event is triggered each tick to check for animation updates.
                     *
                     * @event 'update-animation'
                     * @param playing {Boolean} Whether the animation is in a playing or paused state.
                     */
                    this.owner.triggerEvent('update-animation', true);

                    this.sprite.update(renderData.delta);
                }
            },
            
            /**
             * Stops the sprite's animation.
             *
             * @method 'stop-animation'
             * @param [animation] {String} The animation to show and pause. If not specified, this method simply pauses the current animation.
             * @since 0.9.0
             */
            "stop-animation": function (animation) {
                this.stopAnimation(animation);
            },
            
            /**
             * Starts the sprite's animation.
             *
             * @method 'play-animation'
             * @param [animation] {String} The animation to play. If not specified, this method simply unpauses the current animation.
             * @since 0.9.0
             */
            "play-animation": function (animation, restart) {
                this.playAnimation(animation, restart);
            }
        },
        
        methods: {
            addToContainer: function () {
                var container = this.owner.container;

                container.addChild(this.sprite);
                container.reorder = true;
            },
            
            playAnimation: function (animation, restart) {
                var sprite = this.sprite;

                if (animation && sprite.has(animation)) {
                    sprite.gotoAndPlay(animation, restart);
                } else {
                    sprite.play();
                }
            },

            stopAnimation: function (animation) {
                var sprite = this.sprite;

                if (animation && sprite.has(animation)) {
                    sprite.gotoAndStop(animation);
                } else {
                    sprite.stop();
                }
            },

            destroy: function () {
                this.owner.container.removeChild(this.sprite);
                this.sprite.destroy();
                this.sprite = null;
            }
        },
        
        getAssetList: (function () {
            var
                getImages = function (ss, spriteSheets) {
                    if (ss) {
                        if (typeof ss === 'string') {
                            return getImages(spriteSheets[ss], spriteSheets);
                        } else if (ss.images) {
                            return ss.images.greenSlice();
                        }
                    }

                    return Array.setUp();
                };
            
            return function (component, props, defaultProps) {
                var arr = null,
                    i = 0,
                    images = null,
                    spriteSheets = platypus.game.settings.spriteSheets,
                    ss = component.spriteSheet || props.spriteSheet || defaultProps.spriteSheet;
                
                if (Array.isArray(ss)) {
                    i = ss.length;
                    images = Array.setUp();
                    while (i--) {
                        arr = getImages(ss[i], spriteSheets);
                        images.union(arr);
                        arr.recycle();
                    }
                    return images;
                } else {
                    return getImages(ss, spriteSheets);
                }
            };
        }())
    });
}());
