import Data from '../Data.js';
import createComponentClass from '../factory.js';

export default (function () {
    return createComponentClass(/** @lends platypus.components.CameraFollowMe.prototype */{
        id: 'CameraFollowMe',
        
        properties: {
            /**
             * Sets initial camera settings when the entity is being followed. This can be over-written by the "follow-me" call itself. If any of these attributes are not provided, the following are used by default:
             *
                  {
                      "time": 500,
                      // Optional. Time in milliseconds that the camera should focus before returning to the original focus.
                      
                      "mode": "forward",
                      // Optional. Camera mode that the camera should use.
                      
                      "top": 100,
                      // Optional number specifying top of viewport in world coordinates
                      
                      "left": 100,
                      // Optional number specifying left of viewport in world coordinates
                      
                      "width": 100,
                      // Optional number specifying width of viewport in world coordinates
                      
                      "height": 100,
                      // Optional number specifying height of viewport in world coordinates
                      
                      "offsetX": 20,
                      // Optional number setting how far to offset the camera from the entity horizontally.
                      
                      "offsetY": 40
                      // Optional number setting how far to offset the camera from the entity vertically.
                  }
             *
             * @property camera
             * @type Object
             * @default {}
             */
            camera: {},
            
            /**
             * Camera mode that the camera should use.
             *
             * @property mode
             * @type String
             * @default "forward"
             */
            mode: "forward",

            /**
             * Whether to pause the game while the camera is focused.
             *
             * @property pause
             * @type boolean
             * @default false
             */
            pause: false
        },
        
        /**
         * This component can request that the camera focus on this entity.
         *
         * @memberof platypus.components
         * @uses platypus.Component
         * @constructs
         * @listens platypus.Entity#follow-me
         * @fires platypus.Entity#follow
         * @fires platypus.Entity#pause-logic
         * @fires platypus.Entity#pause-render
         */
        initialize: function () {
            this.pauseGame = (this.pause && this.camera.time) ? {
                time: this.camera.time
            } : null;
            
            this.camera = Data.setUp(
                "entity", this.owner,
                "mode", this.camera.mode || this.mode,
                "top", this.camera.top,
                "left", this.camera.left,
                "offsetX", this.camera.offsetX,
                "offsetY", this.camera.offsetY,
                "width", this.camera.width,
                "height", this.camera.height,
                "time", this.camera.time
            );
        },
        
        events: {
            /**
             * On receiving this message, the component will trigger a message requesting that the parent camera begin following this entity.
             *
             * @event platypus.Entity#follow-me
             * @param {Object} [options] A list of key/value paris describing camera options to set.
             * @param {String} [options.mode] Camera following mode.
             * @param {number} [options.top] The top of a bounding box.
             * @param {number} [options.left] The left of a bounding box.
             * @param {number} [options.width] The width of a bounding box.
             * @param {number} [options.height] The height of a bounding box.
             * @param {number} [options.offsetX] How far to offset the camera from the entity horizontally.
             * @param {number} [options.offsetY] How far to offset the camera from the entity vertically.
             * @param {number} [options.time] How many milliseconds to follow the entity.
             */
            "follow-me": function (options) {
                var msg = null;
                
                if (options) {
                    msg = Data.setUp(
                        "entity",  this.owner,
                        "mode",    options.mode    || this.camera.mode,
                        "top",     options.top     || this.camera.top,
                        "left",    options.left    || this.camera.left,
                        "offsetX", options.offsetX || this.camera.offsetX,
                        "offsetY", options.offsetY || this.camera.offsetY,
                        "width",   options.width   || this.camera.width,
                        "height",  options.height  || this.camera.height,
                        "time",    options.time    || this.camera.time
                    );
                } else {
                    msg = Data.setUp(this.camera);
                }

                if (this.pauseGame) {

                    /**
                     * This component fires this message on the parent entity to pause logic if required.
                     *
                     * @event platypus.Entity#pause-logic
                     * @param options {Object}
                     * @param options.time {number} The amount of time to pause before re-enabling logic.
                     */
                    this.owner.parent.triggerEvent('pause-logic',  this.pauseGame);
                    
                    /**
                     * This component fires this message on the parent entity to pause rendering if required.
                     *
                     * @event platypus.Entity#pause-render
                     * @param options {Object}
                     * @param options.time {number} The amount of time to pause before re-enabling render updates.
                     */
                    this.owner.parent.triggerEvent('pause-render', this.pauseGame);
                }
                
                /**
                 * This component fires this message on this entity's parent so the camera will begin following this entity.
                 *
                 * @event platypus.Entity#follow
                 * @param {Object} message
                 * @param {String} message.mode Can be "locked", "forward", "bounding", "anchor-bound", or "static". "static" suspends following, but the other three settings require that the entity parameter be defined. Also set the bounding area parameters if sending "bounding" as the following method and the movement parameters if sending "forward" as the following method.
                 * @param {platypus.Entity} [message.entity] The entity that the camera should commence following.
                 * @param {number} [message.top] The top of a bounding box following an entity.
                 * @param {number} [message.left] The left of a bounding box following an entity.
                 * @param {number} [message.width] The width of a bounding box following an entity.
                 * @param {number} [message.height] The height of a bounding box following an entity.
                 * @param {number} [message.movementX] Movement multiplier for focusing the camera ahead of a moving entity in the horizontal direction.
                 * @param {number} [message.movementY] Movement multiplier for focusing the camera ahead of a moving entity in the vertical direction.
                 * @param {number} [message.offsetX] How far to offset the camera from the entity horizontally.
                 * @param {number} [message.offsetY] How far to offset the camera from the entity vertically.
                 * @param {number} [message.time] How many milliseconds to follow the entity.
                 */
                this.owner.parent.triggerEvent('follow', msg);
                
                msg.recycle();
            }
        },
        
        methods: {
            destroy: function () {
                this.camera.recycle();
            }
        }
    });
}());
