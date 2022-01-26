/* global platypus, window */
import DataMap from './DataMap.js';
import {UserData} from 'springroll';

/**
 * This class is used to create the Platypus storage system accessible at `platypus.storage`. It uses Springroll UserData if available, with a fallback to local storage if not.
 *
 * @memberof platypus
 * @class Storage
 * @param {*} springroll 
 * @param {*} options 
 * @return {Data} Returns the new Storage object.
 */
class Storage {
    constructor (springroll, options) {
        const
            gameId = options.name,
            storageKey = gameId + '-data',
            unconnectedData = window.localStorage.getItem(storageKey),
            keys = options.storageKeys || null,
            handleData = (resp) => {
                const
                    data = resp && resp.data ? resp.data : resp;

                if (data) {
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

        /**
         * The storage key being used to store data.
         *
         * @property storageKey
         * @type String
         * @default options.name+'-data'
         */
        this.storageKey = storageKey;

        /**
         * Whether Springroll is connected to a hosting page.
         *
         * @property connected
         * @type Boolean
         * @default false
         */
        this.connected = false;

        if (keys) {
            for (let i = 0; i < keys.length; i++) {
                this.addKey(keys[i], null);
            }
        }

        try { // May throw if data is not parseable. If so, we'll just ignore it.
            handleData(JSON.parse(unconnectedData));
        } catch (e) {}

        springroll.container.on('connected', () => {
            this.connected = true;
            UserData.read(this.storageKey).then(handleData).catch((e) => {
                platypus.debug.warn('Storage: connected but received an error', e);
            });
        });
    }

    /**
     * Adds a storage key to the game's storage.
     *
     * @param {String} key The key to add.
     * @param {*} value The data to store at this defined key.
     */
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

    /**
     * Gets a value from storage for the provided storage key.
     *
     * @param {String} key The key for the data to return
     * @return {*}
     */
    get (key) {
        if (!this.map.has(key)) {
            this.addKey(key, null);
        }

        return this[key];
    }

    /**
     * Takes the current game storage and saves it to local storage or Springroll UserData
     *
     */
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

    /**
     * Updates a storage key's data. Creates the key if it does not exist.
     *
     * @param {String} key The key to update.
     * @param {*} value The data to store at this key.
     */
    set (key, value) {
        if (!this.map.has(key)) {
            this.addKey(key, value);
            this.save();
        } else {
            this[key] = value;
        }
    }
};

export default Storage;