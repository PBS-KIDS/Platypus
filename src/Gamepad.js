import Data from './Data.js';
import Vector from './Vector.js';
import {arrayCache} from './utils/array.js';
import config from 'config';
import recycle from 'recycle';

const
    /**
     * This class defines an axis-aligned bounding box (AABB) which is used during the collision process to determine if two objects are colliding. This is used in a few places including [CollisionBasic](platypus.components.CollisionBasic.html) and [[Collision-Shape]].
     *
     * @memberof platypus
     * @class Gamepad
     * @param gamepad {number} The browser's gamepad object.
     * @param id {number} Id of gamepad.
     * @param deadzone {number} distance from axis `0` position to ignore.
     * @param height {number} The height of the AABB.
     * @return {platypus.Gamepad} Returns the new aabb object.
     */
    Gamepad = function (gamepad, onDown, onUp, onChange, id = '', deadzone = 0.1) {
        this.source = gamepad;
        this.deadzone = deadzone;
        this.axes = this.axes || arrayCache.setUp();
        for (let i = 0; i < (gamepad.axes.length >> 1); i++) {
            this.axes.push(clampVector(Vector.setUp(gamepad.axes[i * 2], gamepad.axes[i * 2 + 1]), deadzone));
        }
        this.buttons = this.buttons || arrayCache.setUp();
        for (let i = 0; i < gamepad.buttons.length; i++) {
            this.buttons.push(gamepad.buttons[i].value);
        }
        this.id = id || `${gamepad.id} - ${gamepad.index}`; // Adding index to make it unique.

        this.onDown = onDown;
        this.onUp = onUp;
        this.onChange = onChange;
    },
    playEffectOptions = {
        duration: 500,
        startDelay: 0,
        strongMagnitude: 1.0,
        weakMagnitude: 1.0
    },
    controllers = {
        a0: 'LeftStick',
        a1: 'RightStick',
        b0: 'AButton',
        b1: 'BButton',
        b2: 'XButton',
        b3: 'YButton',
        b4: 'LeftBumper',
        b5: 'RightBumper',
        b6: 'LeftTrigger',
        b7: 'RightTrigger',
        b8: 'BackButton',
        b9: 'StartButton',
        b10: 'LeftStickButton',
        b11: 'RightStickButton',
        b12: 'UpDPad',
        b13: 'DownDPad',
        b14: 'LeftDPad',
        b15: 'RightDPad'
    },
    clampVector = function (v, deadzone) {
        const m = v.magnitude();

        if (m > 1) {
            v.x *= 1 / m;
            v.y *= 1 / m;
        } else if (m < deadzone) {
            v.x = 0;
            v.y = 0;
        } else {
            const span = 1 - deadzone;
            v.x = (v.x - deadzone) / span;
            v.y = (v.y - deadzone) / span;
        }

        return v;
    },
    proto = Gamepad.prototype;

proto.dualRumble = function (duration = 500, delay = 0, strong = 1.0, weak = 1.0) {
    playEffectOptions.duration = duration;
    playEffectOptions.startDelay = delay;
    playEffectOptions.strongMagnitude = strong;
    playEffectOptions.weakMagnitude = weak;
    this.source.vibrationActuator.playEffect('dual-rumble', playEffectOptions);
};

proto.update = function (gamepad) {
    const
        axes = this.axes,
        buttons = this.buttons,
        onDown = this.onDown,
        onUp = this.onUp,
        onChange = this.onChange;

    for (let i = 0; i < axes.length; i++) {
        const
            oldVector = axes[i],
            newVector = clampVector(Vector.setUp(gamepad.axes[i * 2], gamepad.axes[i * 2 + 1]), this.deadzone);

        if (!newVector.equals(oldVector, 2)) {
            const event = Data.setUp(
                    'code', controllers[`a${i}`],
                    'direction', oldVector,
                    'gamepad', this,
                    'id', this.id
                );

            oldVector.set(newVector);
            onChange(event);
            event.recycle();
        }

        newVector.recycle();
    }
    for (let i = 0; i < gamepad.buttons.length; i++) {
        const
            newButton = gamepad.buttons[i],
            newValue = newButton.value,
            oldButton = buttons[i];
        
        if (newValue !== oldButton) {
            const event = Data.setUp(
                    'code', controllers[`b${i}`],
                    'button', newButton,
                    'gamepad', this,
                    'id', this.id
                );

            buttons[i] = newValue;

            if (oldButton === 0) {
                onDown(event);
                onChange(event);
            } else if (newValue === 0) {
                onChange(event);
                onUp(event);
            } else {
                onChange(event);
            }

            event.recycle();
        }
    }
};
    
/**
 * Returns an Gamepad from cache or creates a new one if none are available.
 *
 * @method platypus.Gamepad.setUp
 * @return {platypus.Gamepad} The instantiated Gamepad.
 */
/**
 * Returns a Gamepad back to the cache.
 *
 * @method platypus.Gamepad.recycle
 * @param {platypus.Gamepad} gamepad The Gamepad to be recycled.
 */
/**
 * Relinquishes properties of the Gamepad and recycles it.
 *
 * @method platypus.Gamepad#recycle
 */
recycle.add(Gamepad, 'Gamepad', Gamepad, function () {
    for (let i = 0; i < this.axes.length; i++) {
        this.axes[i].recycle();
    }
    this.axes.length = 0;
    this.buttons.length = 0;
    this.onDown = null;
    this.onUp = null;
    this.onChange = null;
}, true, config.dev);

export default Gamepad;
