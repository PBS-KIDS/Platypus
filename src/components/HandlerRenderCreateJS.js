/**
# COMPONENT **HandlerRenderCreateJS**
A component that handles updating rendering for components that are rendering via createjs. Each tick it calls all the entities that accept 'handle-render' messages.

## Dependencies
- **Needs a 'tick' or 'render' call** - This component doesn't need a specific component, but it does require a 'tick' or 'render' call to function. It's usually used as a component of an action-layer.
- [createjs.EaselJS][link1] - This component requires the EaselJS library to be included for canvas functionality.

## Messages

### Listens for:
- **child-entity-added** - Called when a new entity has been added to the parent and should be considered for addition to the handler. If the entity has a 'handle-render' or 'handle-render-load' message id it's added to the list of entities. Entities are sent a reference to the stage that we're rendering to, so they can add their display objects to it. 
  - @param entity (Object) - The entity that is being considered for addition to the handler.
- **tick, render** - Sends a 'handle-render' message to all the entities the component is handling. If an entity does not handle the message, it's removed it from the entity list. This function also sorts the display objects in the stage according to their z value. We detect when new objects are added by keeping track of the first element. If it changes the list gets resorted. Finally the whole stage is updated by CreateJS.
  - @param resp (object) - An object containing delta which is the time passed since the last tick. 
- **camera-update** - Called when the camera moves in the world, or if the window is resized. This function sets the canvas size and the stage transform.
  - @param cameraInfo (object) - An object containing the camera information. 

### Local Broadcasts:
- **mousedown** - This component captures this event on the canvas and triggers it on the entity.
  - @param event (event object) - The event from Javascript.
  - @param over (boolean) - Whether the mouse is over the object or not.
  - @param x (number) - The x-location of the mouse in stage coordinates.
  - @param y (number) - The y-location of the mouse in stage coordinates.
  - @param entity ([[Entity]]) - The entity clicked on.  
- **mouseup** - This component captures this event on the canvas and triggers it on the entity.
  - @param event (event object) - The event from Javascript.
  - @param over (boolean) - Whether the mouse is over the object or not.
  - @param x (number) - The x-location of the mouse in stage coordinates.
  - @param y (number) - The y-location of the mouse in stage coordinates.
  - @param entity ([[Entity]]) - The entity clicked on.  
- **mousemove** - This component captures this event on the canvas and triggers it on the entity.
  - @param event (event object) - The event from Javascript.
  - @param over (boolean) - Whether the mouse is over the object or not.
  - @param x (number) - The x-location of the mouse in stage coordinates.
  - @param y (number) - The y-location of the mouse in stage coordinates.
  - @param entity ([[Entity]]) - The entity clicked on.  

### Child Broadcasts:
- **handle-render** - Sent to entities to run their render for the tick.
  - @param object (object) - An object containing a delta variable that is the time that's passed since the last tick.
- **handle-render-load** - Sent to entities when they are added to the handler. Sends along the stage object so the entity can add its display objects. It also sends the parent DOM element of the canvas.
  - @param object.stage ([createjs.Stage][link2]) - The createjs stage object.
  - @param object.parentElement (object) - The DOM parent element of the canvas. 

## JSON Definition
    {
      "type": "HandlerRenderCreateJS",
      
      "acceptInput": {
          //Optional - What types of input the object should take. This component defaults to not accept any input.
          "click": false, // Whether to listen for mouse events
          "camera": false, // Whether camera movement while the mouse (or touch) is triggered should result in a mousemove event
          "hover": false // Whether to capture mouse movement even when there is no mouse-down.
      },
      "autoClear": false, //By default this is set to false. If true the canvas will be cleared each tick.
      "canvasId": "bob"   //Sets the id of the canvas. The canvas defaults to having no id.
    }
    
[link1]: http://www.createjs.com/Docs/EaselJS/module_EaselJS.html
[link2]: http://createjs.com/Docs/EaselJS/Stage.html
*/
/*global createjs, platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    var dpr = window.devicePixelRatio || 1;
    
    return platypus.createComponentClass({

        id: "HandlerRenderCreateJS",
        
        constructor: function (definition) {
            var self = this;
            this.container = new createjs.Container();
            
            this.camera = {
                x: 0,
                y: 0
            };
            
            // The following appends necessary information to displayed objects to allow them to receive touches and clicks
            if (definition.acceptInput) {
                this.click = definition.acceptInput.click;
                this.cameraMovementMovesMouse = definition.acceptInput.camera;
                this.hover = definition.acceptInput.hover;
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
                 * @param data.world {createjs.Container} Contains entities to be rendered.
                 */
                this.owner.triggerEvent('render-world', {
                    world: this.container
                });
            },
            
            "child-entity-added": function (entity) {
                entity.triggerEvent('handle-render-load', this.renderMessage);
            },
            "pause-render": function (resp) {
                if (resp && resp.time) {
                    this.paused = resp.time;
                } else {
                    this.paused = -1;
                }
            },
            "unpause-render": function () {
                this.paused = 0;
            },
            "tick": (function () {
                var sort = function (a, b) {
                    return a.z - b.z;
                };
                
                return function (resp) {
                    var x = 0,
                        child   = null,
                        message = this.renderMessage;
                    
                    message.delta = resp.delta;

                    if (this.paused > 0) {
                        this.paused -= resp.delta;
                        if (this.paused < 0) {
                            this.paused = 0;
                        }
                    }

                    if (this.owner.triggerEventOnChildren) {
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
                            this.container.sortChildren(sort);
                        }
                        
                    }
                };
            }()),

            "camera-update": function (camera) {
                this.camera.x = camera.viewport.left;
                this.camera.y = camera.viewport.top;

                if (this.moveMouse) {
                    this.moveMouse();
                }
            }

            
/*
            "camera-update": function (cameraInfo) {
                var dpr             = (window.devicePixelRatio || 1),
                    viewportCenterX = cameraInfo.viewportLeft + cameraInfo.viewportWidth / 2,
                    viewportCenterY = cameraInfo.viewportTop + cameraInfo.viewportHeight / 2;
                
                this.camera.x = cameraInfo.viewportLeft;
                this.camera.y = cameraInfo.viewportTop;
                this.camera.width = cameraInfo.viewportWidth;
                this.camera.height = cameraInfo.viewportHeight;
                
                this.stage.setTransform((cameraInfo.viewportWidth / 2) * cameraInfo.scaleX * dpr, (cameraInfo.viewportHeight / 2) * cameraInfo.scaleY * dpr, cameraInfo.scaleX * dpr, cameraInfo.scaleY * dpr, (cameraInfo.orientation || 0) * 180 / Math.PI, 0, 0, viewportCenterX, viewportCenterY);

                if (this.moveMouse) {
                    this.moveMouse(cameraInfo);
                }
            }
*/
        },
        methods: {
            addInputs: (function () {
                var createHandler = function (self, eventName) {
                    return function (event) {
                        var stageX = event.stageX,
                            stageY = event.stageY,
                            nativeEvent = event.nativeEvent,
                            x = (stageX * dpr) / self.container.scaleX + self.camera.x,
                            y = (stageY * dpr) / self.container.scaleY + self.camera.y;

                        self.owner.trigger(eventName, {
                            event: nativeEvent,
                            cjsEvent: event,
                            x: x,
                            y: y,
                            entity: self.owner
                        });



                        if (self.cameraMovementMovesMouse) {
                            if (eventName === 'pressup') {
                                self.moveMouse = null;
                                console.log('mouseup');
                            } else {
                                // This function is used to trigger a move event when the camera moves and the mouse is still triggered.
                                self.moveMouse = function () {
                                    self.owner.trigger('pressmove', {
                                        event: nativeEvent,
                                        x: (stageX * dpr) / self.container.scaleX + self.camera.x,
                                        y: (stageY * dpr) / self.container.scaleY + self.camera.y,
                                        entity: self.owner
                                    });
                                    console.log('c-pressmove: ' + x + ', ' + y);
                                };
                                if (eventName === 'pressmove') {
                                    console.log('mousemove: ' + x + ', ' + y);
                                }
                            }
                        }
                    };
                };

                return function () {
                    var mousedown = null,
                        mouseover = null,
                        mouseout  = null,
                        rollover  = null,
                        rollout   = null,
                        pressmove = null,
                        pressup   = null,
                        click     = null,
                        dblclick  = null;

                    // The following appends necessary information to displayed objects to allow them to receive touches and clicks
                    if (this.click) {
                        mousedown = createHandler(this, 'mousedown');
                        pressmove = createHandler(this, 'pressmove');
                        pressup   = createHandler(this, 'pressup');
                        click     = createHandler(this, 'click');
                        dblclick  = createHandler(this, 'dblclick');

                        this.container.addEventListener('mousedown', mousedown);
                        this.container.addEventListener('pressmove', pressmove);
                        this.container.addEventListener('pressup',   pressup);
                        this.container.addEventListener('click',     click);
                        this.container.addEventListener('dblclick',  dblclick);
                    }
                    if (this.hover) {
                        mouseover = createHandler(this, 'mouseover');
                        mouseout  = createHandler(this, 'mouseout');
                        rollover  = createHandler(this, 'rollover');
                        rollout   = createHandler(this, 'rollout');

                        this.container.addEventListener('mouseover', mouseover);
                        this.container.addEventListener('mouseout',  mouseout);
                        this.container.addEventListener('rollover',  rollover);
                        this.container.addEventListener('rollout',   rollout);
                    }

                    this.removeInputListeners = function () {
                        if (this.click) {
                            this.container.removeEventListener('mousedown', mousedown);
                            this.container.removeEventListener('pressmove', pressmove);
                            this.container.removeEventListener('pressup',   pressup);
                            this.container.removeEventListener('click',     click);
                            this.container.removeEventListener('dblclick',  dblclick);
                        }
                        if (this.hover) {
                            this.container.removeEventListener('mouseover', mouseover);
                            this.container.removeEventListener('mouseout',  mouseout);
                            this.container.removeEventListener('rollover',  rollover);
                            this.container.removeEventListener('rollout',   rollout);
                        }
                        this.removeInputListeners = null;
                    };
                };
            }()),

            /*
            setupInput: (function () {
                return function (enableTouch, triggerOnAllMovement, cameraMovementMovesMouse) {

                    var self = this,
                        originalEvent   = null,
                        x        = 0,
                        y        = 0,
                        setXY   = function (event) {
                            originalEvent = event;
                            x  = (event.stageX) / self.stage.scaleX + self.camera.x;
                            y  = (event.stageY) / self.stage.scaleY + self.camera.y;
                        },
                        mousedown = function (event) {
                            setXY(event);
                            self.owner.trigger('mousedown', {
                                event: event.nativeEvent,
                                x: x,
                                y: y,
                                entity: self.owner
                            });

                            // This function is used to trigger a move event when the camera moves and the mouse is still triggered.
                            if (cameraMovementMovesMouse) {
                                self.moveMouse = function () {
                                    setXY(originalEvent);
                                    self.owner.trigger('pressmove', {
                                        event: event.nativeEvent,
                                        x: x,
                                        y: y,
                                        entity: self.owner
                                    });
                                };
                            }
                        },
                        mouseup = function (event) {
                            setXY(event);
                            self.owner.trigger('pressup', {
                                event: event.nativeEvent,
                                x: x,
                                y: y,
                                entity: self.owner
                            });
                            if (cameraMovementMovesMouse) {
                                self.moveMouse = null;
                            }
                        },
                        mousemove = function (event) {
                            setXY(event);
                            if (triggerOnAllMovement || event.nativeEvent.which || event.nativeEvent.touches) {
                                self.owner.trigger('pressmove', {
                                    event: event.nativeEvent,
                                    x: x,
                                    y: y,
                                    entity: self.owner
                                });
                            }
                        };
                    
                    if (enableTouch) {
                        createjs.Touch.enable(this.stage);
                    }

                    this.stage.addEventListener('stagemousedown', mousedown);
                    this.stage.addEventListener('stagemouseup', mouseup);
                    this.stage.addEventListener('stagemousemove', mousemove);
                    
                    this.removeStageListeners = function () {
                        this.stage.removeEventListener('stagemousedown', mousedown);
                        this.stage.removeEventListener('stagemouseup', mouseup);
                        this.stage.removeEventListener('stagemousemove', mousemove);
                    };

                };
            }()),
            */
            
            destroy: function () {
                if (this.removeStageListeners) {
                    this.removeStageListeners();
                }

                this.container = null;
            }
        },
        
        publicMethods: {
            // TODO: Move this to camera
            getWorldPointFromScreen: function (sp) {
                //document.title = ((sp.y * dpr) / this.stage.scaleY + this.camera.y) + ', ' + ((sp.y / dpr) * this.stage.scaleY + this.camera.y) + ', ' + ((sp.y * dpr) * this.stage.scaleY + this.camera.y) + ', ';
                
                return {
                    x: (sp.x * dpr) / this.container.scaleX + this.camera.x,
                    y: (sp.y * dpr) / this.container.scaleY + this.camera.y
                };
            }
        }
    });
}());
