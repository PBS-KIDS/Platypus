/**
 * Activates audio on mobile devices. This component should be included on the same entity as the asset loader.
 * 
 * Example "progress-bar" entity that could use this component:

    {
        "id": "progress-bar",
        "components":[{
            "type": "AudioMobile",
            "button": {
                "image": "play-button.png"
            }
        },{
            "type": "AssetLoader"
        },{
            "type": "SceneChanger",
            "scene": "menu",
            "aliases": {"audio-ready": "new-scene"}
        }]
    }

 * 
 * @namespace platypus.components
 * @class AudioMobile
 * @uses Component
 */
/*global console, createjs, platypus */
(function () {
    "use strict";

    return platypus.createComponentClass({
        
        id: 'AudioMobile',
        
        properties: {
            /**
             * Specifies the image or sprite sheet information needed to create the play button for mobile devices.
             * 
             * Set `button.image` to set an image or `button.spriteSheet` to set the sprite sheet.
             * 
             * May also set a position for the button:
             * 
             *     {
             *         "spriteSheet": "buttons",
             *         "x": 0,
             *         "y": 200
             *     }
             * 
             * @property button
             * @type Object
             * @default {}
             */
            button: {}
        },
        
        constructor: function (definition) {
        },

        events: {
            /**
             * On hearing this event, this component will load the next scene or provide a button for mobile devices to allow audio playback.
             * 
             * @method 'complete'
             */
            "complete": function () {
                var self   = this,
                    button = null;
                
                /**
                 * Triggers this event once the audio is ready to play.
                 * 
                 * @event 'audio-ready'
                 */
                if (platypus.supports.mobile) {
                    // Remove the progress bar and show a button!
                    this.owner.removeComponent('RenderSprite');
                    this.owner.removeComponent('RenderProgress');
                    this.owner.addComponent(new platypus.components.RenderSprite(this.owner, {
                        image: this.button.image,
                        spriteSheet: this.button.spriteSheet,
                        acceptInput: {click: true, touch: true}
                    }));
                    if (!isNaN(this.button.x)) {
                        this.owner.x = this.button.x;
                    }
                    if (!isNaN(this.button.y)) {
                        this.owner.y = this.button.y;
                    }
                    this.addEventListener('pressup', function () {
                        self.owner.triggerEvent('audio-ready');
                    });
                    
                    /**
                     * This event notifies the parent entity that this child has been updated.
                     * 
                     * @event 'child-entity-updated'
                     * @param entity {platypus.Entity} This component's owner.
                     */
                    this.owner.parent.triggerEvent("child-entity-updated", this.owner);
                } else {
                    this.owner.triggerEvent('audio-ready');
                }
            }
        }
    });
}());
