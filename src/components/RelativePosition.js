import AABB from '../AABB.js';
import createComponentClass from '../factory.js';

export default (function () {
    return createComponentClass(/** @lends platypus.components.RelativePosition.prototype */{
        
        id: 'RelativePosition',

        properties: {
            /**
             * This optional array sets varying properties depending on the aspect ratio of the camera. This is useful if the camera aspect ratio varies greatly and entities must be repositioned accordingly.
             *
             * In this example, the entity maintains a particular horizontal location until the camera viewport becomes narrower than 2:1, at which point it maintains a particular `left` value:
             *
             *      "cameraSizes": [{
             *          "minRatio": 2, // This block applies for wide aspect ratios until 2:1 is reached.
             *          "x": -1226
             *      }, {
             *          "minRatio": 0, // This block applies for everything else.
             *          "left": 130
             *      }]
             *
             * @property cameraSizes
             * @type Array
             * @default null
             */
            cameraSizes: null
        },
        
        publicProperties: {
            /**
             * This sets the distance in world units from the bottom of the camera's world viewport. If set, it will override the entity's y coordinate. This property is accessible on the entity as `entity.bottom`.
             *
             * @property bottom
             * @type Number
             * @default null
             */
            bottom: null,

            /**
             * This sets the distance in world units from the left of the camera's world viewport. If set, it will override the entity's x coordinate. This property is accessible on the entity as `entity.left`.
             *
             * @property left
             * @type Number
             * @default null
             */
            left: null,

            /**
             * This sets the distance in world units from the right of the camera's world viewport. If set, it will override the entity's x coordinate. This property is accessible on the entity as `entity.right`.
             *
             * @property right
             * @type Number
             * @default null
             */
            right: null,

            /**
             * This sets the distance in world units from the top of the camera's world viewport. If set, it will override the entity's y coordinate. This property is accessible on the entity as `entity.top`.
             *
             * @property top
             * @type Number
             * @default null
             */
            top: null,

            /**
             * This sets the scale in X of the entity.
             *
             * @property scaleX
             * @type Number
             * @default 1
             */
            scaleX: 1,

            /**
             * This sets the scale in Y of the entity.
             *
             * @property scaleY
             * @type Number
             * @default 1
             */
            scaleY: 1,

            /**
             * This sets the `x` coordinate for the entity. It is overridden by `left` and `right` properties if supplied.
             *
             * @property x
             * @type Number
             * @default 0
             */
            x: 0,

            /**
             * This sets the `y` coordinate for the entity. It is overridden by `top` and `bottom` properties if supplied.
             *
             * @property y
             * @type Number
             * @default 0
             */
            y: 0
        },
        
        /**
         * This component positions an entity relative to the camera viewport, according to `left`, `top`, `right`, and `left` properties.
         *
         * @memberof platypus.components
         * @uses platypus.Component
         * @constructs
         * @listens platypus.Entity#camera-update
         * @listens platypus.Entity#handle-logic
         */
        initialize: function (/*definition, callback*/) {
            this.aabb = AABB.setUp();
            this.lastBottom = null;
            this.lastLeft = null;
            this.lastRight = null;
            this.lastTop = null;
            this.cameraSizesIndex = -1;
        },

        events: {
            "handle-logic": function () {
                var bottom = this.bottom,
                    left = this.left,
                    right = this.right,
                    top = this.top;

                if ((this.lastBottom !== bottom) || (this.lastLeft !== left) || (this.lastRight !== right) || (this.lastTop !== top)) {
                    this.updatePosition(this.aabb);
                    this.lastBottom = bottom;
                    this.lastLeft = left;
                    this.lastRight = right;
                    this.lastTop = top;
                }
            },

            "camera-update": function (camera) {
                this.aabb.set(camera.viewport);
                if (this.cameraSizes) {
                    this.checkCamera(this.aabb);
                }
                this.updatePosition(this.aabb);
            }
        },
        
        methods: {// These are internal methods that are invoked by this component.
            checkCamera: function (aabb) {
                var arr = this.cameraSizes,
                    i = 0,
                    ratio = aabb.width / aabb.height;

                for (i = 0; i < arr.length; i++) {
                    if (ratio > arr[i].minRatio) {
                        if (i !== this.cameraSizesIndex) {
                            this.updateProperties(arr[i]);
                            this.cameraSizesIndex = i;
                        }
                        break;
                    }
                }
            },

            updateProperties: function (props) {
                this.right = (typeof props.right === 'number') ? props.right : null;
                this.left = (typeof props.left === 'number') ? props.left : null;
                this.top = (typeof props.top === 'number') ? props.top : null;
                this.bottom = (typeof props.bottom === 'number') ? props.bottom : null;
                if (typeof props.x === 'number') {
                    this.x = props.x;
                }
                if (typeof props.y === 'number') {
                    this.y = props.y;
                }
                if (typeof props.scaleX === 'number') {
                    this.scaleX = props.scaleX;
                }
                if (typeof props.scaleY === 'number') {
                    this.scaleY = props.scaleY;
                }
            },

            updatePosition: function (vp) {
                var bottom = this.bottom,
                    left = this.left,
                    owner = this.owner,
                    right = this.right,
                    top = this.top;

                if (typeof left === 'number') {
                    owner.x = vp.left + left;
                } else if (typeof right === 'number') {
                    owner.x = vp.right - right;
                }

                if (typeof top === 'number') {
                    owner.y = vp.top + top;
                } else if (typeof bottom === 'number') {
                    owner.y = vp.bottom - bottom;
                }
            },

            destroy: function () {
                this.aabb.recycle();
                this.aabb = null;
            }
        }
    });
}());
