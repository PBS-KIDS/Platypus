/**
 * This component handles capturing and relaying input information to the entities that care about it. It takes mouse, keyboard, and custom input messages. State messages are sent immediately to the entities when they are received, the 'HandlerController' message is sent to demarcate ticks.
 *
 * @namespace platypus.components
 * @class HandlerController
 * @uses platypus.Component
 */
/* global platypus, window */
import {arrayCache, greenSplice} from '../utils/array.js';
import Gamepad from '../Gamepad.js';
import createComponentClass from '../factory.js';

const
    /**
     * Sends a 'handle-controller' message to all the entities the component is handling. If an entity does not handle the message, it's removed it from the entity list.
     *
     * @method 'broadcastHandleController'
     * @param tick {Object} An object containing tick data.
     */
    broadcastHandleController = function (tick) {
        if (hasGamepads) {
            const
                gamepads = [...window.navigator.getGamepads()],
                standards = this.gamepads;

            for (let i = 0; i < gamepads.length; i++) {
                const gamepad = gamepads[i];

                if (gamepad) {
                    const standard = standards[gamepad.index];

                    if (!standard) { // set up initial values so events can be triggered later
                        standards[gamepad.index] = Gamepad.setUp(gamepad, onDown.bind(this, 'gamepad'), onUp.bind(this, 'gamepad'), onChange.bind(this, 'gamepad'));
                    } else {
                        standard.update(gamepad);
                    }
                }
            }
        }
        /**
         * Triggered on owner and child entities on each tick to handle whatever they need to regarding controls.
         *
         * @event 'handle-controller'
         * @param tick {Object} An object containing tick data.
         */
        this.triggerOnAll('handle-controller', tick);
    },
    onDown = function (type, event) {
        /**
         *  Triggered on owner and child entities when a key goes from up to down.
         *
         * @event '[event.code]:down'
         * @param event {DOMEvent} The DOM event that triggered the keydown event.
         */
        this.triggerOnAll(event.code + ':down', event);

        updatePrecedence(type);
    },
    onUp = function (type, event) {
        /**
         * Triggered on owner and child entities when a key goes from down to up.
         *
         * @event '[event.code]:up'
         * @param event {DOMEvent} The DOM event that triggered the keyup event.
         */
        this.triggerOnAll(event.code + ':up', event);

        updatePrecedence(type);
    },
    onChange = function (type, event) {
        /**
         * Triggered on owner and child entities when an axis changes.
         *
         * @event '[event.code]:change'
         * @param event {DOMEvent} The event that triggered the change event.
         */
        this.triggerOnAll(event.code + ':change', event);

        updatePrecedence(type);
    },
    updatePrecedence = (type) => {
        if (type !== inputs[0]) {
            const was = inputs.indexOf(type);

            if (was > 0) {
                greenSplice(inputs, was);
            }

            inputs.unshift(type);

            for (let i = 0; i < notifies.length; i++) {
                notifies[i](inputs);
            }
        }
    },
    inputs = [],
    notifies = [];
let hasGamepads = false;

window.addEventListener("gamepadconnected", () => {
    hasGamepads = true;
    updatePrecedence('gamepad');
});

window.addEventListener('touchstart', () => {
    updatePrecedence('touch');
});

window.addEventListener('mousedown', () => {
    updatePrecedence('mouse');
});

  
//window.addEventListener("gamepaddisconnected", (event) => {});

export default createComponentClass({
    
    id: 'HandlerController',
    properties: {
        /**
         * Whether 'handle-controller' event should fire based on the 'handle-logic' event instead of the 'tick' event.
         *
         * @property alwaysOn
         * @type Boolean
         * @default false
         */
        useHandleLogic: false
    },

    publicProperties: {
        inputPrecedence: inputs
    },
    
    initialize: function () {
        if (platypus.game.settings.debug) { // If this is a test build, leave in the browser key combinations so debug tools can be opened as expected.
            this.callbackKeyDown = onDown.bind(this, 'keyboard');
            this.callbackKeyUp = onUp.bind(this, 'keyboard');
        } else { // Otherwise remove default browser behavior for key inputs so that they do not interfere with game-play.
            this.callbackKeyDown = (event) => {
                onDown.call(this, 'keyboard', event);
                event.preventDefault(); // this may be too aggressive - if problems arise, we may need to limit this to certain key combos that get in the way of game-play. Example: (event.metaKey && event.keyCode == 37) causes an accidental cmd key press to send the browser back a page while playing and hitting the left arrow button.
            };
            this.callbackKeyUp = (event) => {
                onUp.call(this, 'keyboard', event);
                event.preventDefault(); // this may be too aggressive - if problems arise, we may need to limit this to certain key combos that get in the way of game-play. Example: (event.metaKey && event.keyCode == 37) causes an accidental cmd key press to send the browser back a page while playing and hitting the left arrow button.
            };
        }
        
        window.addEventListener('keydown', this.callbackKeyDown, true);
        window.addEventListener('keyup',   this.callbackKeyUp,   true);

        if (this.useHandleLogic) {
            this.addEventListener('handle-logic', broadcastHandleController);
        } else {
            this.addEventListener('tick', broadcastHandleController);
        }

        this.gamepads = arrayCache.setUp();

        this.notifier = (inputs) => {
            /**
             * Triggered on owner and child entities when player uses a new imput method. (For example, going from mouse to keyboard or keyboard to gamepad.)
             *
             * @event 'input-precedence-updated'
             * @param inputs {Array} A list of input methods, ordered by precedence with index 0 being the most recent input method.
             */
            this.triggerOnAll('input-precedence-updated', inputs);
        };
        notifies.push(this.notifier);
    },
    methods: {
        destroy: function () {
            window.removeEventListener('keydown', this.callbackKeyDown);
            window.removeEventListener('keyup',   this.callbackKeyUp);
            for (let i = 0; i < this.gamepads.length; i++) {
                if (this.gamepads[i]) {
                    this.gamepads[i].recycle();
                }
            }
            arrayCache.recycle(this.gamepads);
            greenSplice(notifies, notifies.indexOf(this.notifier));
        },
        triggerOnAll: function (...args) {
            const owner = this.owner;

            owner.triggerEvent(...args);
            if (owner.triggerEventOnChildren) {
                owner.triggerEventOnChildren(...args);
            }
        }
    }
});
