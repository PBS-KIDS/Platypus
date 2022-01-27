/* global platypus */
import AABB from '../AABB.js';
import {Rectangle} from 'pixi.js';
import createComponentClass from '../factory.js';

const
    claimHitArea = new Rectangle(-2000, -2000, 4000, 4000);

export default createComponentClass(/** @lends platypus.components.LogicDragDrop.prototype */{
    id: 'LogicDragDrop',
    
    properties: {
        /**
         * Sets the renderParent while being dragged.
         *
         * @property dragRenderParent
         * @type string
         * @default ''
         */
        dragRenderParent: '',
        
        /**
         * Sets whether a click-move should start the dragging behavior in addition to click-drag. This value is ignored for mobile devices.
         *
         * @property stickyClick
         * @type Boolean
         * @default false
         */
        stickyClick: false
    },
    
    /**
     * A component that allows an object to be dragged and dropped. Can use collision to prevent dropping the objects in certain locations.
     *
     * @memberof platypus.components
     * @uses platypus.Component
     * @constructs
     * @listens platypus.Entity#camera-update
     * @listens platypus.Entity#component-added
     * @listens platypus.Entity#handle-logic
     * @listens platypus.Entity#handle-post-collision-logic
     * @listens platypus.Entity#no-drop
     * @listens platypus.Entity#pointerdown
     * @listens platypus.Entity#pointermove
     * @listens platypus.Entity#prepare-logic
     * @listens platypus.Entity#pressmove
     * @listens platypus.Entity#pressup
     */
    initialize: function () {
        this.aabb = AABB.setUp();
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

    events: {
        "camera-update": function (camera) {
            this.aabb.set(camera.viewport);
            this.checkCamera();
        },

        "component-added": function (component) {
            if (component.type === 'CollisionBasic') {
                this.hasCollision = true;
            }
        },
        
        "prepare-logic": function () {
            this.checkCamera(); // may end dragging
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

        "pointerdown": function (eventData) {
            if (this.sticking) {
                this.sticking = false;
                this.releasePointer();
                this.release();
            } else {
                this.nextX = this.owner.x;
                this.nextY = this.owner.y;
                this.lastZ = this.owner.z;
                this.grabOffsetX = (eventData.x >> 0) - this.owner.x;
                this.grabOffsetY = (eventData.y >> 0) - this.owner.y;
                this.state.set('dragging', true);
                if (this.dragRenderParent !== this.owner.renderParent) {
                    this.originalRenderParent = this.owner.renderParent;

                    /**
                     * Sets the parent render container of an entity to that of the given entity or entity with the given id.
                     *
                     * @method platypus.Entity#set-parent-render-container
                     * @param entity {Object} The entity to relocate.
                     * @param container {Entity|String|PIXI.Container} The entity, id of the entity, or PIXI.Container that will act as the parent container.
                     */
                    this.owner.parent.triggerEvent("set-parent-render-container", this.owner, this.dragRenderParent);
                }
                this.owner.dragMode = true;
                this.sticking = this.stickyClick;
                if (this.sticking) {
                    this.claimPointer();
                }
            }
            
            eventData.pixiEvent.stopPropagation();
        },

        "pressup": function (eventData) {
            if (!this.sticking) {
                this.release();
            }
            
            eventData.pixiEvent.stopPropagation();
        },

        "pointermove": function (eventData) {
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
            if (this.sticking && (this.nextX !== this.owner.x || this.nextY !== this.owner.y)) {
                this.sticking = false;
                this.releasePointer();
            }
            
            eventData.event.preventDefault();
            eventData.pixiEvent.stopPropagation();
        },

        /**
         * This message comes from the collision system letting us know the object is currently in a location that it cannot be dropped.
         *
         * @event platypus.Entity#no-drop
         */
        "no-drop": function () {
            this.hitSomething = true;
        }
    },
    
    methods: {// These are methods that are called by this component.
        checkCamera: function () {
            if (this.state && this.state.get('dragging') && !this.aabb.containsPoint(this.nextX + this.grabOffsetX, this.nextY + this.grabOffsetY)) {
                if (this.sticking) {
                    this.sticking = false;
                    this.releasePointer();
                }
                this.release();
            }
        },

        claimPointer: function () {
            this.lastHitArea = this.owner.container.hitArea;

            this.owner.container.hitArea = claimHitArea; // capture all the clicks!
        },

        releasePointer: function () {
            this.owner.container.hitArea = this.lastHitArea;
        },

        release: function () {
            if (this.hasCollision) {
                this.tryDrop = true;
            } else {
                this.state.set('noDrop', false);
                this.state.set('dragging', false);
                if (this.originalRenderParent) {
                    this.owner.parent.triggerEvent("set-parent-render-container", this.owner, this.originalRenderParent);
                }
                this.owner.dragMode = false;
                this.owner.z = this.lastZ;
            }
            this.owner.triggerEvent('dropped', this.owner);
        },
        
        destroy: function () {
            this.state.set('dragging', false);
            this.owner.dragMode = false;
            this.state.set('noDrop', false);
            this.state = null;
            this.aabb.recycle();
            this.aabb = null;
            this.owner.z = this.lastZ;
        }
    }
});
