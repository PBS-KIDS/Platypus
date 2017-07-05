/**
 * A component that handles updating the render components on entities that are rendering via PIXI. Calls 'handle-render on children entities every tick. Also initializes handlers for mouse events on the layer level.
 *
 * @namespace platypus.components
 * @class HandlerRender
 * @uses platypus.Component
 */
/*global include, platypus */
(function () {
    'use strict';
    
    var Container = include('PIXI.Container'),
        Data = include('platypus.Data'),
        Interactive = include('platypus.components.Interactive');

    return platypus.createComponentClass({

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
             * @since 0.9.1
             */
            interactive: false
        },

        publicProperties: {

            /**
             * This is the container holding all children's disply objects for this layer. It's an available proeprty on the layer entity.
             *
             * @property worldContainer
             * @type PIXI.Container
             * @default null
             * @since 0.11.0
             */
            worldContainer: null
        },

        initialize: function () {
            var definition = null;

            this.worldContainer = this.worldContainer || new Container();

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
                'container', this.worldContainer
            );
        },

        events: {
            /**
             * Once the entity is loaded, this component triggers "render-world" to notify other components about the entities' display container.
             *
             * @method 'load'
             */
            "load": function () {
                /**
                 * Once the entity is loaded, this component triggers "render-world" to notify other components about the entities' display container.
                 *
                 * @event 'render-world'
                 * @param data {Object}
                 * @param data.world {PIXI.Container} Contains entities to be rendered.
                 */
                this.owner.triggerEvent('render-world', {
                    world: this.worldContainer
                });

                /**
                 * This event is triggered once HandlerRender is ready to handle interactivity.
                 *
                 * @event 'input-on'
                 */
                this.owner.triggerEvent('input-on');
            },

            /**
             * Called when a new entity has been added to the parent and should be considered for addition to the handler. Entities are sent a reference the Container that we're rendering to, so they can add their display objects to it and the delta from the lastest tick.
             *
             * @method 'child-entity-added'
             * @param entity {platypus.Entity} The entity added to the parent.
             */
            "child-entity-added": function (entity) {
                /**
                 * Triggered on an entity added to the parent.
                 *
                 * @event 'handle-render-load'
                 * @param data {Object}
                 * @param data.delta {Number} The delta time for this tick.
                 * @param data.container {PIXI.Container} The display Container the entities display objects should be added to.
                 */
                entity.triggerEvent('handle-render-load', this.renderMessage);
            },

            /**
             * Pauses the children of this render Container. If a pause time is not provided. It remains paused until 'unpause-render' is called.
             *
             * @method 'pause-render'
             * @param [data] {Object}
             * @param data.time {Number} How long to pause.
             */
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
                     * @event 'render-paused'
                     * @since 0.8.4
                     */
                    this.owner.triggerEventOnChildren('render-paused');
                }
            },

            /**
             * Unpauses the children of this render Container.
             *
             * @method 'unpause-render'
             */
            "unpause-render": function () {
                this.paused = 0;
                if (this.owner.triggerEventOnChildren) {
                    /**
                     * Notifies children entities that rendering updates have been unpaused.
                     *
                     * @event 'render-unpaused'
                     * @since 0.8.4
                     */
                    this.owner.triggerEventOnChildren('render-unpaused');
                }
            },

            /**
             * Sends a 'handle-render' message to all the children in the Container. The children in the Container are also paused/unpaused if needed and sorted according to their z value.
             *
             * @method 'tick'
             * @param tick {Object} An object containing tick data.
             */
            "tick": (function () {
                var sort = function (a, b) {
                    return a.z - b.z;
                };

                return function (tick) {
                    var message = this.renderMessage,
                        worldContainer = this.worldContainer;

                    message.delta = tick.delta;

                    if (this.paused > 0) {
                        this.paused -= tick.delta;
                        if (this.paused <= 0) {
                            this.paused = 0;
                        }
                    }

                    if (!this.paused && this.owner.triggerEventOnChildren) {
                        /**
                         * Triggered every tick on the children entities.
                         *
                         * @event 'handle-render'
                         * @param data {Object}
                         * @param data.delta {Number} The delta time for this tick.
                         * @param data.container {PIXI.Container} The display Container the entities display objects should be added to.
                         */
                        this.owner.triggerEventOnChildren('handle-render', message);
                    }

                    if (worldContainer && worldContainer.reorder) {
                        worldContainer.reorder = false;
                        worldContainer.children.sort(sort);
                    }
                };
            }())
        },
        methods: {
            destroy: function () {
                this.worldContainer = null;
                this.renderMessage.recycle();
            }
        }
    });
}());
