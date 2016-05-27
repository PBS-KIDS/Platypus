/**
# COMPONENT **LogicDragDrop**
A component that allows an object to be dragged and dropped. Can use collision to prevent dropping the objects in certain locations.
NOTE: HandlerRender and the RenderSprite used by this entity need to have their 'touch' or 'click' inputs set to true.

## Dependencies
- [[HandlerLogic]] - Listens for the handle-logic and handle-post-collision-logic calls.
- [[RenderSprite]] - Listens for 'mouseup', 'mousedown', and 'pressmove' calls.

## Messages

### Listens for:
- **handle-logic** - Updates the object's location on the handle-logic tick.
  - @param resp (object) - The tick coming from the scene.
- **handle-post-collision-logic** - Resolves whether the object state after we check if there are any collisions. If the object was dropped and can be dropped, it is.
  - @param resp (object) - The tick coming from the scene.
- **mousedown** - The mousedown event passed from the render component. Fired when we're grabbing the object. Starts the drag.
  - @param eventData (object) - The event data.
- **mouseup** - The mouseup event passed from the render component. Fired when we're trying to drop the object.
  - @param eventData (object) - The event data.
- **pressmove** - The pressmove event passed from the render component. Tells us when we're dragging the object.
  - @param eventData (object) - The event data.
- **no-drop** - The message passed from the collision system letting us know the object is currently in a location that it cannot be dropped.
  - @param collisionData (object) - The event data.
  
## JSON Definition
    {
        "type": "LogicDragDrop"
    }
*/
/*global platypus */
(function () {
    'use strict';

    return platypus.createComponentClass({
        id: 'LogicDragDrop',
        
        properties: {
            /**
             * Sets the z-order of the item while being dragged.
             *
             * @property dragZ
             * @type Number
             * @default 10000
             * @since 0.8.3
             */
            dragZ: 10000,
            
            /**
             * Sets whether a click-move should start the dragging behavior in addition to click-drag. This value is ignored for mobile devices.
             *
             * @property stickyClick
             * @type Boolean
             * @default false
             * @since 0.8.3
             */
            stickyClick: false
        },
        
        constructor: function () {
            this.nextX = this.owner.x;
            this.nextY = this.owner.y;
            this.lastZ = this.owner.z;
            this.grabOffsetX = 0;
            this.grabOffsetY = 0;
            this.state = this.owner.state;
            this.state.set('dragging', false);
            this.state.set('noDrop', false);
            this.tryDrop = false;
            this.hitSomething = false;
            this.hasCollision = false;
            
            if (platypus.supports.mobile) {
                this.stickyClick = false;
            }
        },

        events: {// These are messages that this component listens for
            "component-added": function (component) {
                if (component.type === 'CollisionBasic') {
                    this.hasCollision = true;
                }
            },
            
            "handle-logic": function () {
                if (this.state.get('dragging')) {
                    this.owner.x = this.nextX;
                    this.owner.y = this.nextY;
                    this.owner.triggerEvent('hovering');
                }
                
                this.state.set('noDrop', false);
            },

            "handle-post-collision-logic": function () {
                if (this.tryDrop) {
                    this.tryDrop = false;
                    if (this.hitSomething) {
                        this.dropFailed = false;
                        this.state.set('noDrop', true);
                        this.state.set('dragging', true);
                        this.owner.dragMode = true;
                    } else {
                        this.state.set('noDrop', false);
                        this.state.set('dragging', false);
                        this.owner.dragMode = false;
                    }
                } else if (this.hitSomething) {
                    this.state.set('noDrop', true);
                }
                this.hitSomething = false;
            },
            "mousedown": function (eventData) {
                if (this.sticking) {
                    this.sticking = false;
                    this.release();
                } else {
                    this.nextX = this.owner.x;
                    this.nextY = this.owner.y;
                    this.lastZ = this.owner.z;
                    this.grabOffsetX = eventData.x - this.owner.x;
                    this.grabOffsetY = eventData.y - this.owner.y;
                    this.owner.z = this.dragZ;
                    this.state.set('dragging', true);
                    this.owner.dragMode = true;
                    this.sticking = this.stickyClick;
                }
                
                eventData.pixiEvent.stopPropagation();
            },
            "pressup": function (eventData) {
                if (!this.sticking) {
                    this.release();
                }
                
                eventData.pixiEvent.stopPropagation();
            },
            "mousemove": function (eventData) {
                if (this.sticking) {
                    this.nextX = eventData.x - this.grabOffsetX;
                    this.nextY = eventData.y - this.grabOffsetY;
                    
                    eventData.event.preventDefault();
                    eventData.pixiEvent.stopPropagation();
                }
            },
            "pressmove": function (eventData) {
                this.nextX = eventData.x - this.grabOffsetX;
                this.nextY = eventData.y - this.grabOffsetY;
                if (this.nextX !== this.owner.x || this.nextY !== this.owner.y) {
                    this.sticking = false;
                }
                
                eventData.event.preventDefault();
                eventData.pixiEvent.stopPropagation();
            },
            "no-drop": function () {
                this.hitSomething = true;
            }
        },
        
        methods: {// These are methods that are called by this component.
            release: function () {
                if (this.hasCollision) {
                    this.tryDrop = true;
                } else {
                    this.state.set('noDrop', false);
                    this.state.set('dragging', false);
                    this.owner.dragMode = false;
                    this.owner.z = this.lastZ;
                }
            },
            
            destroy: function () {
                this.state.set('dragging', false);
                this.owner.dragMode = false;
                this.state.set('noDrop', false);
                this.state = null;
                this.owner.z = this.lastZ;
            }
        }
    });
}());
