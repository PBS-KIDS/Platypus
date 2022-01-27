import RenderContainer from './RenderContainer.js';
import {Text} from 'pixi.js';
import createComponentClass from '../factory.js';

const
    alignments = {
        horizontal: {
            left: 0,
            middle: 0.5,
            center: 0.5,
            right: 1
        },
        vertical: {
            top: 0,
            middle: 0.5,
            center: 0.5,
            bottom: 1
        }
    };

export default createComponentClass(/** @lends platypus.components.RenderText.prototype */{
    
    id: 'RenderText',
    
    properties: {
        /**
         * The offset of the x-axis position of the text from the entity's x-axis position.
         *
         * @property offsetX
         * @type Number
         * @default 0
         */
        offsetX: 0,

        /**
         * The offset of the y-axis position of the text from the entity's y-axis position.
         *
         * @property offsetY
         * @type Number
         * @default 0
         */
        offsetY: 0,

        /**
         * The z-index relative to other render components on the entity.
         *
         * @property offsetZ
         * @type Number
         * @default 0
         */
        offsetZ: 0,

        /**
         * This is the text to display.
         *
         * @property text
         * @type String
         * @default ""
         */
        text: "",
        
        /**
         * This is the text style to use. Use the following specification to define the style:
         *
         *     {
         *         "fontSize": "64px",
         *         "fill": "#ffffff",
         *         "align": "center", // Can be `left`, `center`, or `right`
         *         "fontFamily": "arial", // Any CSS font that has been loaded by the browser
         *         "verticalAlign": "bottom" // Can be `top`, `center`, or `bottom`
         *     }
         *
         * See [PIXI.TextStyle documentation](http://pixijs.download/dev/docs/PIXI.TextStyle.html) for a full list of available options.
         *
         * @property style
         * @type Object
         * @default null
         */
        style: null
    },
    
    /**
     * This component is attached to entities that should display text.
     *
     * @memberof platypus.components
     * @uses platypus.Component
     * @constructs
     * @listens platypus.Entity#set-text
     */
    initialize: function (definition) {
        var hAlign = alignments.horizontal[this.style.align],
            vAlign = alignments.vertical[this.style.verticalAlign];

        this.sprite = new Text(this.text, this.style);
        
        this.sprite.anchor.x = typeof hAlign === 'number' ? hAlign : 0.5;
        this.sprite.anchor.y = typeof vAlign === 'number' ? vAlign : 1;
        this.sprite.x = this.offsetX;
        this.sprite.y = this.offsetY;
        this.sprite.z = this.offsetZ;

        if (!this.owner.container) {
            this.owner.addComponent(new RenderContainer(this.owner, definition, this.addToContainer.bind(this)));
        } else {
            this.addToContainer();
        }
    },
    
    events: {
        /**
         * Sets the copy of the text.
         *
         * @event platypus.Entity#set-text
         * @param text {String} The text to insert.
         */
        "set-text": function (text) {
            if (typeof text === 'string') {
                this.sprite.text = text;
            } else {
                if (text.style) {
                    const textStyle = this.sprite.style;
                    for (const key in text.style) {
                        if (text.style.hasOwnProperty(key)) {
                            textStyle[key] = text.style[key];
                        }
                    }
                }
                if (typeof text.text === 'string') {
                    this.sprite.text = text.text;
                }
            }
        }
    },
    
    methods: {
        addToContainer: function () {
            var container = this.owner.container;

            container.addChild(this.sprite);
        },
        
        destroy: function () {
            this.owner.container.removeChild(this.sprite);
            this.sprite.destroy();
            this.sprite = null;
        }
    }
});
