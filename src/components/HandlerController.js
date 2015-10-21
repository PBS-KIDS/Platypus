/**
 * This component handles capturing and relaying input information to the entities that care about it. It takes mouse, keyboard, and custom input messages. State messages are sent immediately to the entities when they are received, the 'HandlerController' message is sent to demarcate ticks.
 * 
 * @namespace platypus.components
 * @class HandlerController
 * @uses platypus.Component
 */
/*global platypus */
/*jslint plusplus:true */
(function () {
    "use strict";

    var keyMap = { //Note: if this list is changed, be sure to update https://github.com/PBS-KIDS/Platypus/wiki/Handler-controller-key-list
            kc0:   'unknown',
            kc8:   'backspace',
            kc9:   'tab',
            kc12:  'numpad-5-shift',
            kc13:  'enter',
            kc16:  'shift',
            kc17:  'ctrl',
            kc18:  'alt',
            kc19:  'pause',
            kc20:  'caps-lock',
            kc27:  'esc',
            kc32:  'space',
            kc33:  'page-up',
            kc34:  'page-down',
            kc35:  'end',
            kc36:  'home',
            kc37:  'left-arrow',
            kc38:  'up-arrow',
            kc39:  'right-arrow',
            kc40:  'down-arrow',
            kc42:  'numpad-multiply',
            kc43:  'numpad-add',
            kc44:  'print-screen',
            kc45:  'insert',
            kc46:  'delete',
            kc47:  'numpad-division',
            kc48:  '0',
            kc49:  '1',
            kc50:  '2',
            kc51:  '3',
            kc52:  '4',
            kc53:  '5',
            kc54:  '6',
            kc55:  '7',
            kc56:  '8',
            kc57:  '9',
            kc59:  'semicolon',
            kc61:  'equals',
            kc65:  'a',
            kc66:  'b',
            kc67:  'c',
            kc68:  'd',
            kc69:  'e',
            kc70:  'f',
            kc71:  'g',
            kc72:  'h',
            kc73:  'i',
            kc74:  'j',
            kc75:  'k',
            kc76:  'l',
            kc77:  'm',
            kc78:  'n',
            kc79:  'o',
            kc80:  'p',
            kc81:  'q',
            kc82:  'r',
            kc83:  's',
            kc84:  't',
            kc85:  'u',
            kc86:  'v',
            kc87:  'w',
            kc88:  'x',
            kc89:  'y',
            kc90:  'z',
            kc91:  'left-windows-start',
            kc92:  'right-windows-start',
            kc93:  'windows-menu',
            kc96:  'back-quote',
            kc106: 'numpad-multiply',
            kc107: 'numpad-add',
            kc109: 'numpad-minus',
            kc110: 'numpad-period',
            kc111: 'numpad-division',
            kc112: 'f1',
            kc113: 'f2',
            kc114: 'f3',
            kc115: 'f4',
            kc116: 'f5',
            kc117: 'f6',
            kc118: 'f7',
            kc119: 'f8',
            kc120: 'f9',
            kc121: 'f10',
            kc122: 'f11',
            kc123: 'f12',
            kc144: 'num-lock',
            kc145: 'scroll-lock',
            kc186: 'semicolon',
            kc187: 'equals',
            kc188: 'comma',
            kc189: 'hyphen',
            kc190: 'period',
            kc191: 'forward-slash',
            kc192: 'back-quote',
            kc219: 'open-bracket',
            kc220: 'back-slash',
            kc221: 'close-bracket',
            kc222: 'quote'
        };

    return platypus.createComponentClass({
        
        id: 'HandlerController',
        
        constructor: function (definition) {
            var self = this;
            
            this.callbackKeyUp   = null;
            this.callbackKeyDown = null;
            
            if (platypus.game.settings.debug) { // If this is a test build, leave in the browser key combinations so debug tools can be opened as expected.
                this.callbackKeyDown = function (event) {
                    self.keyDown(event);
                };
                this.callbackKeyUp = function (event) {
                    self.keyUp(event);
                };
            } else { // Otherwise remove default browser behavior for key inputs so that they do not interfere with game-play.
                this.callbackKeyDown = function (event) {
                    self.keyDown(event);
                    event.preventDefault(); // this may be too aggressive - if problems arise, we may need to limit this to certain key combos that get in the way of game-play. Example: (event.metaKey && event.keyCode == 37) causes an accidental cmd key press to send the browser back a page while playing and hitting the left arrow button.
                };
                this.callbackKeyUp = function (event) {
                    self.keyUp(event);
                    event.preventDefault(); // this may be too aggressive - if problems arise, we may need to limit this to certain key combos that get in the way of game-play. Example: (event.metaKey && event.keyCode == 37) causes an accidental cmd key press to send the browser back a page while playing and hitting the left arrow button.
                };
            }
            
            window.addEventListener('keydown', this.callbackKeyDown, true);
            window.addEventListener('keyup',   this.callbackKeyUp,   true);
        },
        events: {
            /**
             * Sends a 'handle-controller' message to all the entities the component is handling. If an entity does not handle the message, it's removed it from the entity list.
             * 
             * @method 'tick'
             * @param tick {Object} An object containing tick data.
             */
            "tick": function (tick) {

                /**
                 * Sent to entities on each tick to handle whatever they need to regarding controls.
                 * 
                 * @event 'handle-controller'
                 * @param tick {Object} An object containing tick data.
                 */
                if (this.owner.triggerEventOnChildren) {
                    this.owner.triggerEventOnChildren('handle-controller', tick);
                }
            }
        },
        methods: {
            keyDown: function (event) {

                /**
                 *  Message sent to an entity when a key goes from up to down.
                 * 
                 * @event 'key:[keyId]:down'
                 * @param event {DOMEvent} The DOM event that triggered the keydown event.
                 */
                if (this.owner.triggerEventOnChildren) {
                    this.owner.triggerEventOnChildren('key:' + (keyMap['kc' + event.keyCode] || ('key-code-' + event.keyCode)) + ':down', event);
                }
            },
            keyUp: function (event) {

                /**
                 * Message sent to child entities when a key goes from down to up.
                 * 
                 * @event 'key:[keyId]:up'
                 * @param event {DOMEvent} The DOM event that triggered the keyup event.
                 */
                if (this.owner.triggerEventOnChildren) {
                    this.owner.triggerEventOnChildren('key:' + (keyMap['kc' + event.keyCode] || ('key-code-' + event.keyCode)) + ':up', event);
                }
            },
            destroy: function () {
                window.removeEventListener('keydown', this.callbackKeyDown);
                window.removeEventListener('keyup',   this.callbackKeyUp);
            }
        }
    });
}());
