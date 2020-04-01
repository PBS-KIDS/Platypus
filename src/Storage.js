/**
 * This class defines a generic data object to use for messaging. It includes recycle methods to encourage reuse.
 *
 * @namespace platypus
 * @class Data
 * @constructor
 * @return {Data} Returns the new Data object.
 */
/* global platypus, window */
import DataMap from './DataMap.js';
import {UserData} from 'springroll';

export default class Storage {
    constructor (springroll, options) {
        const
            gameId = options.name,
            storageKey = gameId + '-data',
            unconnectedData = window.localStorage.getItem(storageKey),
            keys = options.storageKeys || null,
            handleData = (resp) => {
                if (resp && resp.data) {
                    const data = resp.data;

                    for (const key in data) {
                        if (data.hasOwnProperty(key)) {
                            if (this.map.has(key)) {
                                this.map.set(key, data[key]);
                            } else {
                                this.addKey(key, data[key]);
                            }
                        }
                    }
                }
            };

        this.map = DataMap.setUp();
        this.storageKey = storageKey;
        this.connected = false;

        if (keys) {
            for (let i = 0; i < keys.length; i++) {
                this.addKey(keys[i], null);
            }
        }

        try { // May throw if data is not parseable. If so, we'll just ignore it.
            handleData({
                data: JSON.parse(unconnectedData)
            });
        } catch (e) {}

        springroll.container.on('connected', () => {
            this.connected = true;
            UserData.read(this.storageKey).then(handleData).catch((e) => {
                platypus.debug.warn('Storage: connected but received an error', e);
            });
        });
    }

    addKey (key, value) {
        this.map.set(key, value);
        Object.defineProperty(this, key, {
            get: function () {
                return this.map.get(key);
            },
            set: function (value) {
                this.map.set(key, value);

                this.save();
            },
            enumerable: true
        });
    }

    get (key) {
        if (!this.map.has(key)) {
            this.addKey(key, null);
        }

        return this[key];
    }

    save () {
        const save = this.map.toJSON();
        
        if (this.connected) {
            UserData.write(this.storageKey, save).catch((e) => {
                platypus.debug.warn('Storage: tried to save but received an error', e);
            });
        } else {
            window.localStorage.setItem(this.storageKey, JSON.stringify(save));
        }
    }

    set (key, value) {
        if (!this.map.has(key)) {
            this.addKey(key, value);
            this.save();
        } else {
            this[key] = value;
        }
    }
}