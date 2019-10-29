/**
 * This class defines a generic data object to use for messaging. It includes recycle methods to encourage reuse.
 *
 * @namespace platypus
 * @class Data
 * @constructor
 * @return {Data} Returns the new Data object.
 * @since 0.7.1
 */
import DataMap from './DataMap.js';
import {UserData} from 'springroll';

export default class Storage {
    constructor (springroll, options) {
        const
            gameId = options.name,
            keys = options.storageKeys || null,
            readData = () => {
                UserData.read(this.storageKey).then(handleData).catch(() => {
                    const str = window.localStorage.getItem(this.storageKey);
                    let data = null;
        
                    try {
                        data = JSON.parse(str);
                    } catch (e) {} console.warn('had to use LS');
        
                    handleData(data);
                });
            },
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
        this.storageKey = gameId + '-data';

        if (keys) {
            for (let i = 0; i < keys.length; i++) {
                this.addKey(keys[i], null);
            }
        }

        readData();
        springroll.container.on('connected', readData);
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
        
        UserData.write(this.storageKey, save).catch(() => {
            window.localStorage.setItem(this.storageKey, JSON.stringify(save));
        });
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