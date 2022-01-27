/* global platypus */
import {Container} from 'pixi.js';
import Data from '../Data.js';
import Interactive from './Interactive.js';
import createComponentClass from '../factory.js';

export default (function () {
    return createComponentClass(/** @lends platypus.components.HandlerRender.prototype */{

        id: "HandlerRender",

        properties: {
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
             */
            interactive: false
        },

        publicProperties: {
            /**
             * This is the container holding all children's disply objects for this layer. It's an available property on the layer entity.
             *
             * @property worldContainer
             * @type PIXI.Container
             * @default null
             */
            worldContainer: null,
            /**
             * A multiplier that alters the speed at which the game is running. This is achieved by scaling the delta time in each tick.
             * Defaults to 1. Values < 1 will slow down the rendering, > 1 will speed it up.
             *
             * @property timeMultiplier
             * @type number
             * @default 1
             */
             timeMultiplier: 1
        },

        /**
         * A component that handles updating the render components on entities that are rendering via PIXI. Calls 'handle-render on children entities every tick. Also initializes handlers for mouse events on the layer level.
         *
         * @memberof platypus.components
         * @uses platypus.Component
         * @constructs
         * @listens platypus.Entity#child-entity-added
         * @listens platypus.Entity#load
         * @listens platypus.Entity#pause-render
         * @listens platypus.Entity#render-update
         * @listens platypus.Entity#set-parent-render-container
         * @listens platypus.Entity#tick
         * @listens platypus.Entity#unpause-render
         * @fires platypus.Entity#handle-render-load
         * @fires platypus.Entity#handle-render
         * @fires platypus.Entity#input-on
         * @fires platypus.Entity#render-paused
         * @fires platypus.Entity#render-unpaused
         * @fires platypus.Entity#render-world
         */
        initialize: function () {
            let definition = null;
            
            this.worldContainer = this.worldContainer || new Container();
            this.worldContainer.sortableChildren = true;
            this.worldContainer.name = '';

            if (this.interactive) {
                definition = Data.setUp(
                    'container', this.worldContainer,
                    'hitArea', this.interactive.hitArea,
                    'hover', this.interactive.hover,
                    'relativeToSelf', true
                );
                this.owner.addComponent(new Interactive(this.owner, definition));
                definition.recycle();
            }

            this.renderMessage = Data.setUp(
                'delta', 0,
                'container', this.worldContainer,
                'tick', null
            );
        },

        events: {
            "load": function () {
                /**
                 * Once the entity is loaded, this component triggers "render-world" to notify other components about the entities' display container.
                 *
                 * @event platypus.Entity#render-world
                 * @param data {Object}
                 * @param data.world {PIXI.Container} Contains entities to be rendered.
                 */
                this.owner.triggerEvent('render-world', {
                    world: this.worldContainer
                });

                /**
                 * This event is triggered once HandlerRender is ready to handle interactivity.
                 *
                 * @event platypus.Entity#input-on
                 */
                this.owner.triggerEvent('input-on');
            },

            "child-entity-added": function (entity) {
                if (entity.container) {
                    this.setParentRenderContainer(entity, entity.renderParent);
                }
                
                /**
                 * Triggered on an entity added to the parent.
                 *
                 * @event platypus.Entity#handle-render-load
                 * @param data {Object}
                 * @param data.delta {Number} The delta time for this tick.
                 * @param data.container {PIXI.Container} The display Container the entities display objects should be added to.
                 */
                entity.triggerEvent('handle-render-load', this.renderMessage);
            },

            "pause-render": function (timeData) {
                if (timeData && timeData.time) {
                    this.paused = timeData.time;
                } else {
                    this.paused = -1;
                }
                if (this.owner.triggerEventOnChildren) {
                    /**
                     * Notifies children entities that rendering updates have been paused.
                     *
                     * @event platypus.Entity#render-paused
                     */
                    this.owner.triggerEventOnChildren('render-paused');
                }
            },

            "unpause-render": function () {
                this.paused = 0;
                if (this.owner.triggerEventOnChildren) {
                    /**
                     * Notifies children entities that rendering updates have been unpaused.
                     *
                     * @event platypus.Entity#render-unpaused
                     */
                    this.owner.triggerEventOnChildren('render-unpaused');
                }
            },

            "tick": function (tick) {
                if (this.paused > 0) {
                    this.paused -= tick.delta;
                    if (this.paused <= 0) {
                        this.paused = 0;
                    }
                }

                if (!this.paused) {
                    this.renderUpdate(tick);
                }
            },

            "render-update": function (tick) {
                this.renderUpdate(tick);
            },

            "set-parent-render-container": function (entity, container) {
                this.setParentRenderContainer(entity, container);
            }
        },
        methods: {
            renderUpdate: function (tick) {
                const message = this.renderMessage;

                message.gameDelta = (tick && tick.delta) || 0;
                message.delta = message.gameDelta * this.timeMultiplier;   
                message.tick = tick;

                /**
                 * Triggered every tick on owner and its children entities.
                 *
                 * @event platypus.Entity#handle-render
                 * @param data {Object}
                 * @param data.delta {Number} The delta time for this tick as manipulated by the timeMultiplier.
                 * @param data.gameDelta {Number} The delta time for this tick. Unmanipulated by the timeMultiplier. Use for components that should always run according to actual time.
                 * @param data.container {PIXI.Container} The display Container the entities display objects should be added to.
                 * @param data.tick {Object} Tick object from "tick" event.
                 */
                this.owner.triggerEvent('handle-render', message);

                if (this.owner.triggerEventOnChildren) {
                    this.owner.triggerEventOnChildren('handle-render', message);
                }
            },

            setParentRenderContainer: function (entity, newContainer) {
                let container = null;

                entity.removeFromParentContainer();

                if (!newContainer) {
                    container = this.worldContainer;

                } else if (typeof newContainer === "string") {

                    const otherEntity = this.owner.getEntityById(newContainer);
                    if (otherEntity) {
                        container = otherEntity.container;
                    } else {
                        //Didn't find group.
                        platypus.debug.warn("Trying to add to non-existent entity, added to World container instead.");
                        container = this.worldContainer;
                    }
                } else if (newContainer instanceof Container) {
                    container = newContainer;
                } else {
                    container = newContainer.container;
                }

                entity.addToParentContainer(container);

            },
            destroy: function () {
                this.worldContainer = null;
                this.renderMessage.recycle();
                this.renderMessage = null;
            }
        }
    });
}());
