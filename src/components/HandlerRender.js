/**
 * A component that handles updating the render components on entities that are rendering via PIXI. Calls 'handle-render on children entities every tick. Also initializes handlers for mouse events on the layer level.
 *
 * @namespace platypus.components
 * @class HandlerRender
 * @uses platypus.Component
 */
/*global PIXI, platypus */
import Data from '../Data.js';
import Interactive from './Interactive.js';
import {arrayCache} from '../utils/array.js';

export default (function () {
    var Container = PIXI.Container;

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
            interactive: false,

            /**
             * Defines the names and z-indexes of the render groups. Can specify the x, y position of the container, the z-index, the scale, and angle of rotation (in degrees). Name is a required value.
             *
             *  "groups": [
             *      {
             *          "name": interface,
             *          "x": 0,
             *          "y": 0,
             *          "z": 1,
             *          "scale": [1, 1],
             *          "angle": 90
             *      },{
             *          "name": alert,
             *          "z": 2
             *      }
             *  ]
             *
             * @property groups
             * @type Array
             * @default null
             * @since 2.0.0
             */
            groups: null
        },

        publicProperties: {
            /**
             * This is the container holding all children's disply objects for this layer. It's an available property on the layer entity.
             *
             * @property worldContainer
             * @type PIXI.Container
             * @default null
             * @since 0.11.0
             */
            worldContainer: null,

            /**
             * This is a read-only list of the world container and subcontainers for entities that should be rendered together.
             *
             * @property renderGroups
             * @type Array
             * @default null
             * @since 0.11.10
             */
        },

        initialize: function () {
            let x = 0,
                definition = null;
            const renderGroups = this.owner.renderGroups = this.renderGroups = arrayCache.setUp();

            this.worldContainer = this.worldContainer || new Container();
            this.worldContainer.name = '';
            renderGroups.push(this.worldContainer);

            if (this.groups) {
                for (x = 0; x < this.groups.length; x++) {
                    this.createRenderGroup(this.groups[x]);
                }
            }

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
                'renderGroups', renderGroups
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
                 * @param data.renderGroups {Array of PIXI.Container} Containers to categorize display of groups of entities.
                 */
                this.owner.triggerEvent('render-world', {
                    world: this.worldContainer,
                    renderGroups: this.renderGroups
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
                if (entity.container) {
                    this.setEntityRenderGroup(entity);
                }
                
                /**
                 * Triggered on an entity added to the parent.
                 *
                 * @event 'handle-render-load'
                 * @param data {Object}
                 * @param data.delta {Number} The delta time for this tick.
                 * @param data.container {PIXI.Container} The display Container the entities display objects should be added to.
                 * @param data.renderGroups {Array of PIXI.Container} Containers to categorize display of groups of entities.
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
                        renderGroup = null,
                        renderGroups = this.renderGroups,
                        i = renderGroups.length;

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
                         * @param data.renderGroups {Array of PIXI.Container} Containers to categorize display of groups of entities.
                         */
                        this.owner.triggerEventOnChildren('handle-render', message);
                    }

                    while (i--) {
                        renderGroup = renderGroups[i];
                        if (renderGroup.reorder) {
                            renderGroup.reorder = false;
                            renderGroup.children.sort(sort);
                        }
                    }
                };
            }()),
            "create-render-group": function (groupDef) {
                this.createRenderGroup(groupDef);
            },
            "change-entity-render-group": function (entity, group) {
                this.setEntityRenderGroup(entity, group);
            }

        },
        methods: {
            createRenderGroup: function (groupDef) {
                if (groupDef.name) {
                    const x = groupDef.x || 0,
                        y = groupDef.y || 0,
                        scaleX = groupDef.scale ? groupDef.scale[0] : 1,
                        scaleY = groupDef.scale ? groupDef.scale[1] : 1,
                        rotation = groupDef.angle ? (groupDef.angle / 180) * Math.PI : 0,
                        group = new Container();

                    group.name = groupDef.name;
                    group.z = groupDef.z || 0;
                    group.setTransform(x, y, scaleX, scaleY, rotation, 0, 0, 0, 0);

                    this.renderGroups.push(group);
                    this.worldContainer.addChild(group);
                    this.worldContainer.reorder = true;
                } else {
                    console.warn("Trying to create a renderGroup without a name. RenderGroup was not created.");
                }
            },
            setEntityRenderGroup: function (entity, group) {
                let x = 0;

                if (typeof group === "undefined") {
                    group = entity.renderGroup || '';
                }

                entity.leaveCurrentRenderGroup();

                for (x = 0; x < this.renderGroups.length; x++) {
                    if (group === this.renderGroups[x].name) {
                        entity.addToRenderGroup(this.renderGroups[x]);
                        return;
                    }
                }

                //Didn't find group.
                console.warn("Trying to add to non-existent RenderGroup, added to World instead.");
                entity.addToRenderGroup(this.worldContainer);
                
            },
            destroy: function () {
                this.worldContainer = null;
                arrayCache.recycle(this.renderGroups);
                this.renderGroups = null;
                this.renderMessage.recycle();
                this.renderMessage = null;
            }
        }
    });
}());
