/**
 * A component that handles updating the render components on entities that are rendering via PIXI. Calls 'handle-render on children entities every tick. Also initializes handlers for mouse events on the layer level.
 *
 * @namespace platypus.components
 * @class HandlerRender
 * @uses Component
 */
/*global PIXI, platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    return platypus.createComponentClass({

        id: "HandlerRender",

        properties: {
            /**
             * Indicates the types of input the Container will listen for. Defaults to none.
             *
             *      "acceptInput": {
             *          "click": false, // Whether to listen for mouse/touch events
             *          "camera": false, // Whether camera movement while the mouse (or touch) is triggered should result in a mousemove event
             *          "hover": false // Whether to capture mouse movement even when there is no mouse-down.
             *      }
             *
             * @property acceptInput
             * @type Object
             * @default null
             */
            acceptInput: null

        },

        publicProperties: {

        },

        constructor: function (definition) {
            this.container = new PIXI.Container();

            this.camera = {
                x: 0,
                y: 0
            };

            // The following appends necessary information to displayed objects to allow them to receive touches and clicks
            if (this.acceptInput) {
                this.click = this.acceptInput.click;
                this.cameraMovementMovesMouse = this.acceptInput.camera;
                this.hover = this.acceptInput.hover;
                if (this.click || this.hover) {
                    this.addInputs();
                    this.addEventListener();
                }
            }

            this.renderMessage = {
                delta: 0,
                container: this.container
            };
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
                    world: this.container
                });
            },

            /**
             * Called when a new entity has been added to the parent and should be considered for addition to the handler. Entities are sent a reference the Container that we're rendering to, so they can add their display objects to it and the delta from the lastest tick.
             *
             * @method 'child-entity-added'
             * @param entity {Entity} The entity added to the parent.
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
            },

            /**
             * Unpauses the children of this render Container.
             *
             * @method 'pause-render'
             */
            "unpause-render": function () {
                this.paused = 0;
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
                    var x = 0,
                        child   = null,
                        message = this.renderMessage;

                    message.delta = tick.delta;

                    if (this.paused > 0) {
                        this.paused -= tick.delta;
                        if (this.paused < 0) {
                            this.paused = 0;
                        }
                    }

                    if (this.owner.triggerEventOnChildren) {
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

                    if (this.container) {
                        for (x = this.container.children.length - 1; x > -1; x--) {
                            child = this.container.children[x];

                            if (child.visible) {
                                if (child.paused && !this.paused) {
                                    child.paused = false;
                                } else if (this.paused) {
                                    child.paused = true;
                                }
                            }
                        }

                        if (this.container.reorder) {
                            this.container.reorder = false;
                            this.container.children.sort(sort);
                        }

                    }
                };
            }()),

            /**
             * Triggered every time the camera position or scale updates. This event triggers the 'mousemove' event if camera movement is set to trigger it. It also updates the internal record of the camera position.
             *
             * @method 'camera-update'
             * @param cameraData {Object} A camera data object
             * @param cameraData.viewport {Object | AABB} An AABB describing the location and size of the camera.
             */
            "camera-update": function (cameraData) {
                this.camera.x = cameraData.viewport.left;
                this.camera.y = cameraData.viewport.top;

                if (this.moveMouse) {
                    this.moveMouse();
                }
            }

        },
        methods: {
            addInputs: (function () {
                var createHandler = function (self, eventName) {
                    return function (event) {
                        var stageX = event.stageX,
                            stageY = event.stageY,
                            nativeEvent = event.nativeEvent,
                            x = 0,
                            y = 0;

                        //TML - This is in case we do a scene change using an event and the container is destroyed.
                        if (!self.container) {
                            return;
                        }

                        x = stageX / self.container.scale.x + self.camera.x;
                        y = stageY / self.container.scale.y + self.camera.y;

                        event.target.mouseTarget = true;

                        self.owner.trigger(eventName, {
                            event: nativeEvent,
                            cjsEvent: event,
                            x: x,
                            y: y,
                            entity: self.owner
                        });

                        if (self.cameraMovementMovesMouse) {
                            if (eventName === 'pressup') {
                                event.target.mouseTarget = false;
                                self.moveMouse = null;
                                if (event.target.removeDisplayObject) {
                                    event.target.removeDisplayObject();
                                }
                            } else {
                                // This function is used to trigger a move event when the camera moves and the mouse is still triggered.
                                self.moveMouse = function () {
                                    self.owner.trigger('pressmove', {
                                        event: nativeEvent,
                                        x: stageX / self.container.scale.x + self.camera.x,
                                        y: stageY / self.container.scale.y + self.camera.y,
                                        entity: self.owner
                                    });
                                };
                            }
                        }
                    };
                };

                return function () {
                    var sprite    = this.container,
                        mousedown = null,
                        mouseover = null,
                        mouseout  = null,
                        pressmove = null,
                        pressup   = null,
                        click     = null;

                    // The following appends necessary information to displayed objects to allow them to receive touches and clicks
                    if (this.click) {
                        sprite.interactive = true;
                        
                        /**
                         * Dispatched when the 'mousedown' event occurs on the container.
                         *
                         * @event 'mousedown'
                         * @param eventData {Object}
                         * @param eventData.event {Object | DOM Event} The native DOM event from the canvas.
                         * @param eventData.cjsEvent {Object | easeljs.MouseEvent} The MouseEvent sent by PIXI.
                         * @param eventData.x {Number} The x location of the mouse.
                         * @param eventData.y {Number} The y location of the mouse.
                         * @param eventData.entity {Object} The entity that contains this component.
                         */
                        mousedown = createHandler(this, 'mousedown');
                        /**
                         * Dispatched when the 'pressmove' event occurs on the container.
                         *
                         * @event 'pressmove'
                         * @param eventData {Object}
                         * @param eventData.event {Object | DOM Event} The native DOM event from the canvas.
                         * @param eventData.cjsEvent {Object | easeljs.MouseEvent} The MouseEvent sent by PIXI.
                         * @param eventData.x {Number} The x location of the mouse.
                         * @param eventData.y {Number} The y location of the mouse.
                         * @param eventData.entity {Object} The entity that contains this component.
                         */
                        pressmove = createHandler(this, 'pressmove');
                        /**
                         * Dispatched when the 'pressup' event occurs on the container.
                         *
                         * @event 'pressup'
                         * @param eventData {Object}
                         * @param eventData.event {Object | DOM Event} The native DOM event from the canvas.
                         * @param eventData.cjsEvent {Object | easeljs.MouseEvent} The MouseEvent sent by PIXI.
                         * @param eventData.x {Number} The x location of the mouse.
                         * @param eventData.y {Number} The y location of the mouse.
                         * @param eventData.entity {Object} The entity that contains this component.
                         */
                        pressup   = createHandler(this, 'pressup');
                        /**
                         * Dispatched when the 'click' event occurs on the container.
                         *
                         * @event 'click'
                         * @param eventData {Object}
                         * @param eventData.event {Object | DOM Event} The native DOM event from the canvas.
                         * @param eventData.cjsEvent {Object | easeljs.MouseEvent} The MouseEvent sent by PIXI.
                         * @param eventData.x {Number} The x location of the mouse.
                         * @param eventData.y {Number} The y location of the mouse.
                         * @param eventData.entity {Object} The entity that contains this component.
                         */
                        click     = createHandler(this, 'click');

                        sprite.addListener('mousedown',       mousedown);
                        sprite.addListener('touchstart',      mousedown);
                        sprite.addListener('mouseup',         pressup);
                        sprite.addListener('touchend',        pressup);
                        sprite.addListener('mouseupoutside',  pressup);
                        sprite.addListener('touchendoutside', pressup);
                        sprite.addListener('mousemove',       pressmove);
                        sprite.addListener('touchmove',       pressmove);
                        sprite.addListener('click',           click);
                        sprite.addListener('tap',             click);
                    }
                    if (this.hover) {
                        sprite.interactive = true;
                        
                        /**
                         * Dispatched when the 'mouseover' event occurs on the container.
                         *
                         * @event 'mouseover'
                         * @param eventData {Object}
                         * @param eventData.event {Object | DOM Event} The native DOM event from the canvas.
                         * @param eventData.cjsEvent {Object | easeljs.MouseEvent} The MouseEvent sent by PIXI.
                         * @param eventData.x {Number} The x location of the mouse.
                         * @param eventData.y {Number} The y location of the mouse.
                         * @param eventData.entity {Object} The entity that contains this component.
                         */
                        mouseover = createHandler(this, 'mouseover');
                        /**
                         * Dispatched when the 'mouseout' event occurs on the container.
                         *
                         * @event 'mouseout'
                         * @param eventData {Object}
                         * @param eventData.event {Object | DOM Event} The native DOM event from the canvas.
                         * @param eventData.cjsEvent {Object | easeljs.MouseEvent} The MouseEvent sent by PIXI.
                         * @param eventData.x {Number} The x location of the mouse.
                         * @param eventData.y {Number} The y location of the mouse.
                         * @param eventData.entity {Object} The entity that contains this component.
                         */
                        mouseout  = createHandler(this, 'mouseout');

                        sprite.addListener('mouseover', mouseover);
                        sprite.addListener('mouseout',  mouseout);
                    }

                    this.removeInputListeners = function () {
                        if (this.click) {
                            sprite.removeListener('mousedown',       mousedown);
                            sprite.removeListener('touchstart',      mousedown);
                            sprite.removeListener('mouseup',         pressup);
                            sprite.removeListener('touchend',        pressup);
                            sprite.removeListener('mouseupoutside',  pressup);
                            sprite.removeListener('touchendoutside', pressup);
                            sprite.removeListener('mousemove',       pressmove);
                            sprite.removeListener('touchmove',       pressmove);
                            sprite.removeListener('click',           click);
                            sprite.removeListener('tap',             click);
                        }
                        if (this.hover) {
                            sprite.removeListener('mouseover', mouseover);
                            sprite.removeListener('mouseout',  mouseout);
                        }
                        this.removeInputListeners = null;
                    };
                };
            }()),

            destroy: function () {
                var self = this;
                if (this.container.mouseTarget) {
                    this.container.visible = false;
                    this.container.removeDisplayObject = function () {
                        self.container = null;
                    };
                } else {
                    this.container = null;
                }
            }
        },

        publicMethods: {

        }
    });
}());
